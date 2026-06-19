"""
chat.py — Main API router for the /query endpoint.

This is the orchestrator that ties together every module in the pipeline:

  1. Intent Guard       → reject out-of-domain queries
  2. Schema Retrieval   → direct database schema retrieval
  3. SQL Agent          → LLM-based SQL generation
  4. SQL Validator      → safety checks before execution
  5. Executor           → run validated SQL on Supabase
  6. Explanation         → LLM-generated result summary

The endpoint contract matches what the Next.js frontend expects.
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from typing import Any, Optional

from fastapi import APIRouter
from openai import APIError, RateLimitError
from pydantic import BaseModel, Field

from app.analytics.visualization_engine import build_visualization_payload
from app.agents.intent_guard import check_intent
from app.agents.sql_agent import generate_sql
from app.agents.sql_validator import SQLValidationError, validate_sql
from app.db.executor import execute_readonly_query
from app.schema.schema_retriever import (
    get_cached_schema_snapshot,
    refresh_schema_cache,
    retrieve_relevant_schema,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response models ───────────────────────────────────────────


class QueryRequest(BaseModel):
    """Incoming query payload from the frontend."""

    user_id: str = Field(..., description="Unique user identifier")
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Session ID for conversation tracking")
    query: str = Field(..., min_length=1, max_length=2000, description="Natural language query")
    database: str = Field(default="supabase", description="Target database: supabase or sql_server")


class QueryResponse(BaseModel):
    """
    Response payload aligned with the frontend's QueryResult type.

    Frontend expects:
      id, naturalQuery / generatedSQL, results (data[]),
      columns, rowCount, executionTime, status, error?, explanation
    """

    id: str
    sql: str
    data: list[dict[str, Any]]
    columns: list[str]
    row_count: int
    execution_time: float
    explanation: str
    personalization_used: bool
    database: str
    sql_dialect: str
    visualization: Optional[dict[str, Any]] = None
    status: str = "success"
    error: Optional[str] = None


class ErrorResponse(BaseModel):
    """Structured error returned on failure."""

    id: str
    sql: str = ""
    data: list = []
    columns: list = []
    row_count: int = 0
    execution_time: float = 0.0
    explanation: str = ""
    personalization_used: bool = False
    database: str = "unknown"
    sql_dialect: str = "unknown"
    visualization: Optional[dict[str, Any]] = None
    status: str = "error"
    error: str


class SchemaRefreshRequest(BaseModel):
    """Optional schema refresh payload."""

    database: Optional[str] = Field(default=None, description="Refresh one DB cache or all if omitted")


# ── Main endpoint ───────────────────────────────────────────────────────


@router.post("/query", response_model=QueryResponse | ErrorResponse)
async def handle_query(
    request: QueryRequest,
) -> QueryResponse | ErrorResponse:
    """
    SIMPLIFIED Talk2SQL endpoint — focused on query generation only.

    Pipeline (simplified for now):
      1. Intent Guard → check if query is related to database
      2. Schema Retrieval → find relevant tables
      3. SQL Generation → LLM generates SQL
      4. SQL Validation → safety checks
      5. Execution → run on Supabase
      6. Explanation → simple result summary

    """
    request_id = str(uuid.uuid4())
    overall_start = time.perf_counter()
    query = request.query.strip()
    selected_database = _normalize_database(request.database)

    logger.info("[%s] New query on %s: %s", request_id, selected_database, query[:100])

    # ── Step 1: Intent Guard ────────────────────────────────────────
    intent = await check_intent(query)
    if not intent.is_in_domain:
        logger.info("[%s] Out-of-domain query rejected.", request_id)
        return ErrorResponse(
            id=request_id,
            error=intent.rejection_message or "Query is not related to the system's database.",
            explanation="Please rephrase your query to ask about employees, inventory, production, or sales.",
        )

    # ── Step 2: Retrieve relevant schema via vector search ──────────
    try:
        schema_snippets = await retrieve_relevant_schema(
            query,
            top_k=5,
            database=selected_database,
        )
    except Exception as e:
        logger.exception("[%s] Schema retrieval failed with error: %s", request_id, str(e))
        return ErrorResponse(
            id=request_id,
            error=f"Schema retrieval error: {type(e).__name__}: {str(e)[:200]}",
            database=selected_database,
            sql_dialect=_sql_dialect_for_database(selected_database),
        )

    if not schema_snippets:
        return ErrorResponse(
            id=request_id,
            error="Could not find relevant database tables for your query. Please rephrase.",
            explanation="Try asking about specific topics like employees, attendance, inventory, production, or sales.",
            database=selected_database,
            sql_dialect=_sql_dialect_for_database(selected_database),
        )

    # ── Step 3: Generate SQL via the SQL agent ──────────────────────
    try:
        generated_sql = await _generate_sql_with_retry(
            request_id=request_id,
            query=query,
            schema_snippets=schema_snippets,
            database=selected_database,
        )
    except RateLimitError:
        logger.warning("[%s] LLM rate-limited during SQL generation after retries.", request_id)
        return ErrorResponse(
            id=request_id,
            error="LLM rate limit reached. Please retry after a few seconds.",
            explanation="The AI model is temporarily busy. Try again shortly.",
            database=selected_database,
            sql_dialect=_sql_dialect_for_database(selected_database),
        )
    except APIError as exc:
        logger.error("[%s] LLM API error during SQL generation after retries: %s", request_id, exc)
        return ErrorResponse(
            id=request_id,
            error="LLM service error during SQL generation.",
            explanation="There was an upstream AI service issue. Please try again.",
            database=selected_database,
            sql_dialect=_sql_dialect_for_database(selected_database),
        )
    except ValueError as exc:
        logger.error("[%s] SQL generation failed: %s", request_id, exc)
        return ErrorResponse(
            id=request_id,
            error="SQL generation failed. Please rephrase your question.",
            explanation="Try to be more specific about what data you want to see.",
        )
    except Exception as exc:
        logger.exception("[%s] Unexpected SQL generation failure: %s", request_id, exc)
        return ErrorResponse(
            id=request_id,
            error="Unexpected SQL generation error.",
            explanation="Please try again in a moment.",
            database=selected_database,
            sql_dialect=_sql_dialect_for_database(selected_database),
        )

    # ── Step 4: Validate SQL ────────────────────────────────────────
    try:
        validate_sql(generated_sql, database=selected_database)
    except SQLValidationError as exc:
        logger.warning("[%s] SQL validation failed: %s", request_id, exc)
        return ErrorResponse(
            id=request_id,
            sql=generated_sql,
            error=f"Generated SQL failed safety checks: {exc}",
            database=selected_database,
            sql_dialect=_sql_dialect_for_database(selected_database),
        )

    # ── Step 5: Execute on Supabase ─────────────────────────────────
    try:
        exec_result = await execute_readonly_query(generated_sql, database=selected_database)
    except Exception as exc:
        logger.exception("[%s] SQL execution failed.", request_id)
        return ErrorResponse(
            id=request_id,
            sql=generated_sql,
            error=f"Query execution failed: {str(exc)[:200]}",
            explanation="There was an error executing your query. Please try rephrasing.",
            database=selected_database,
            sql_dialect=_sql_dialect_for_database(selected_database),
        )

    rows = exec_result["rows"]
    columns = exec_result["columns"]
    row_count = exec_result["row_count"]
    execution_time = exec_result["execution_time"]
    connected_database = exec_result.get("connected_database", selected_database)
    sql_dialect = exec_result.get("sql_dialect", _sql_dialect_for_database(selected_database))

    # ── Step 6: Build visualization recommendations ────────────────
    visualization: dict[str, Any] | None = None
    try:
        schema_snapshot = await get_cached_schema_snapshot(connected_database)
        visualization = build_visualization_payload(
            data=rows,
            schema_snapshot=schema_snapshot,
            query=query,
        )
    except Exception as exc:
        # Visualization should never break query execution.
        logger.warning("[%s] Visualization suggestion failed: %s", request_id, exc)

    # ── Step 7: Generate simple explanation ─────────────────────────
    explanation = f"Query returned {row_count} row{'s' if row_count != 1 else ''}"
    if row_count == 0:
        explanation = "No data found matching your query."
    elif row_count == 1:
        explanation = "Found 1 matching result."
    else:
        explanation = f"Found {row_count} matching results."

    overall_time = round(time.perf_counter() - overall_start, 4)

    logger.info(
        "[%s] Query completed: %d rows, %.4fs total",
        request_id, row_count, overall_time,
    )

    return QueryResponse(
        id=request_id,
        sql=generated_sql,
        data=rows,
        columns=columns,
        row_count=row_count,
        execution_time=execution_time,
        explanation=explanation,
        personalization_used=False,
        database=connected_database,
        sql_dialect=sql_dialect,
        visualization=visualization,
    )


@router.post("/schema/refresh")
async def refresh_schema(request: SchemaRefreshRequest) -> dict[str, Any]:
    """Refresh cached schema metadata globally or for a specific database."""
    refreshed = await refresh_schema_cache(request.database)
    return refreshed


# ── Helper functions ────────────────────────────────────────────────────


def _normalize_database(database: str | None) -> str:
    """Normalize frontend/database aliases into canonical backend identifiers."""
    if not database:
        return "supabase"

    key = database.strip().lower()
    aliases = {
        "supabase": "supabase",
        "postgres": "supabase",
        "postgresql": "supabase",
        "textile": "supabase",
        "textile_industry": "supabase",
        "textile_industry_db": "supabase",
        "garment_db": "supabase",
        "sql_server": "sql_server",
        "sqlserver": "sql_server",
        "mssql": "sql_server",
        "furniture": "sql_server",
        "furniturefactorydb": "sql_server",
    }
    return aliases.get(key, "supabase")


def _sql_dialect_for_database(database: str) -> str:
    if database == "sql_server":
        return "tsql"
    return "postgresql"


async def _generate_sql_with_retry(
    request_id: str,
    query: str,
    schema_snippets: list[dict[str, Any]],
    database: str,
) -> str:
    """Retry SQL generation for transient upstream LLM failures."""
    max_attempts = 5
    delay_seconds = 2.0

    for attempt in range(1, max_attempts + 1):
        try:
            return await generate_sql(
                user_query=query,
                schema_snippets=schema_snippets,
                user_hints=None,
                session_context=None,
                database=database,
            )
        except (RateLimitError, APIError):
            if attempt >= max_attempts:
                raise
            logger.warning(
                "[%s] SQL generation transient failure (attempt %d/%d). Retrying in %.1fs",
                request_id,
                attempt,
                max_attempts,
                delay_seconds,
            )
            await asyncio.sleep(delay_seconds)
            delay_seconds *= 2

    raise RuntimeError("SQL generation retry loop exited unexpectedly")
