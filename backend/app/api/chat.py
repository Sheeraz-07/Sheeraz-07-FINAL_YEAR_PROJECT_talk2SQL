"""
chat.py — Main API router for the /query endpoint.

This is the orchestrator that ties together every module in the pipeline:

  1. Intent Guard       → reject out-of-domain queries
  2. Session Memory     → load / update conversation context
  3. User Profile       → load long-term personalisation hints
  4. Schema Retrieval   → vector search for relevant tables
  5. SQL Agent          → LLM-based SQL generation
  6. SQL Validator      → safety checks before execution
  7. Executor           → run validated SQL on Supabase
  8. Explanation         → LLM-generated result summary
  9. Memory Updater     → persist learnings for future queries

The endpoint contract matches what the Next.js frontend expects.
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.agents.intent_guard import check_intent
from app.agents.sql_agent import generate_sql
from app.agents.sql_validator import SQLValidationError, validate_sql
from app.core.security import get_current_user
from app.db.executor import execute_readonly_query
from app.schema.schema_retriever import retrieve_relevant_schema

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response models ───────────────────────────────────────────


class QueryRequest(BaseModel):
    """Incoming query payload from the frontend."""

    user_id: str = Field(..., description="Unique user identifier")
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Session ID for conversation tracking")
    query: str = Field(..., min_length=1, max_length=2000, description="Natural language query")


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
    status: str = "error"
    error: str


# ── Main endpoint ───────────────────────────────────────────────────────


@router.post("/query", response_model=QueryResponse | ErrorResponse)
async def handle_query(
    request: QueryRequest,
    current_user: dict = Depends(get_current_user),
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

    Memory and personalization features are disabled for now.
    """
    request_id = str(uuid.uuid4())
    overall_start = time.perf_counter()
    query = request.query.strip()

    logger.info("[%s] New query: %s", request_id, query[:100])

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
        schema_snippets = await retrieve_relevant_schema(query, top_k=5)
    except Exception as e:
        logger.exception("[%s] Schema retrieval failed with error: %s", request_id, str(e))
        return ErrorResponse(
            id=request_id,
            error=f"Schema retrieval error: {type(e).__name__}: {str(e)[:200]}",
        )

    if not schema_snippets:
        return ErrorResponse(
            id=request_id,
            error="Could not find relevant database tables for your query. Please rephrase.",
            explanation="Try asking about specific topics like employees, attendance, inventory, production, or sales.",
        )

    # ── Step 3: Generate SQL via the SQL agent ──────────────────────
    try:
        generated_sql = await generate_sql(
            user_query=query,
            schema_snippets=schema_snippets,
            user_hints=None,  # Disabled for now
            session_context=None,  # Disabled for now
        )
    except ValueError as exc:
        logger.error("[%s] SQL generation failed: %s", request_id, exc)
        return ErrorResponse(
            id=request_id,
            error="SQL generation failed. Please rephrase your question.",
            explanation="Try to be more specific about what data you want to see.",
        )

    # ── Step 4: Validate SQL ────────────────────────────────────────
    try:
        validate_sql(generated_sql)
    except SQLValidationError as exc:
        logger.warning("[%s] SQL validation failed: %s", request_id, exc)
        return ErrorResponse(
            id=request_id,
            sql=generated_sql,
            error=f"Generated SQL failed safety checks: {exc}",
        )

    # ── Step 5: Execute on Supabase ─────────────────────────────────
    try:
        exec_result = await execute_readonly_query(generated_sql)
    except Exception as exc:
        logger.exception("[%s] SQL execution failed.", request_id)
        return ErrorResponse(
            id=request_id,
            sql=generated_sql,
            error=f"Query execution failed: {str(exc)[:200]}",
            explanation="There was an error executing your query. Please try rephrasing.",
        )

    rows = exec_result["rows"]
    columns = exec_result["columns"]
    row_count = exec_result["row_count"]
    execution_time = exec_result["execution_time"]

    # ── Step 6: Generate simple explanation ─────────────────────────
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
        personalization_used=False,  # Disabled for now
    )


# ── Helper functions are removed for simplified version ───────────────
# Memory and session features will be added back in future iterations
