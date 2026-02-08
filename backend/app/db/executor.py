"""
executor.py — SQL execution layer against Supabase.

Responsibilities:
  - Execute validated SQL using SQLAlchemy Core (``text()``)
  - Parameterised / read-only queries only
  - Return structured results: rows (list of dicts), column names,
    row count, execution time
  - Generate a short natural-language explanation of the results
    via LLM

This module NEVER generates SQL — it only executes what has already
passed through ``sql_validator.validate_sql()``.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from sqlalchemy import text

from app.core.longcat_client import chat_completion
from app.db.supabase import get_engine

logger = logging.getLogger(__name__)


async def execute_readonly_query(sql: str) -> dict[str, Any]:
    """
    Execute a read-only SQL query and return structured results.

    Parameters
    ----------
    sql : str
        A validated SELECT query.

    Returns
    -------
    dict
        Keys:
          - ``rows``:      list[dict]  — each row as a dict
          - ``columns``:   list[str]   — column names
          - ``row_count``: int
          - ``execution_time``: float  — seconds
    """
    engine = get_engine()
    start = time.perf_counter()

    async with engine.connect() as conn:
        result = await conn.execute(text(sql))
        columns = list(result.keys())
        raw_rows = result.fetchall()

    elapsed = round(time.perf_counter() - start, 4)

    rows = [dict(zip(columns, row)) for row in raw_rows]

    logger.info(
        "Executed query (%d rows, %.4fs): %s",
        len(rows),
        elapsed,
        sql[:120],
    )

    return {
        "rows": rows,
        "columns": columns,
        "row_count": len(rows),
        "execution_time": elapsed,
    }


async def generate_explanation(
    natural_query: str,
    sql: str,
    row_count: int,
    columns: list[str],
    sample_rows: list[dict] | None = None,
) -> str:
    """
    Generate a short natural-language explanation of the query results.

    Parameters
    ----------
    natural_query : str
        The user's original question.
    sql : str
        The generated SQL.
    row_count : int
        Number of rows returned.
    columns : list[str]
        Column names in the result set.
    sample_rows : list[dict] | None
        First few rows for context (max 3).

    Returns
    -------
    str
        A 1-3 sentence human-readable explanation.
    """
    sample_preview = ""
    if sample_rows:
        sample_preview = f"\nSample data (first {len(sample_rows)} rows): {sample_rows}"

    messages = [
        {
            "role": "system",
            "content": (
                "You are a concise data analyst assistant. Given a user's question, "
                "the SQL query that was run, and the result summary, write a SHORT "
                "(1-3 sentences) natural-language explanation of what the results show. "
                "Do not repeat the SQL. Do not use markdown. Be factual and brief."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Question: {natural_query}\n"
                f"SQL: {sql}\n"
                f"Result: {row_count} rows returned with columns: {', '.join(columns)}"
                f"{sample_preview}"
            ),
        },
    ]

    explanation = await chat_completion(messages=messages, max_tokens=200)
    return explanation
