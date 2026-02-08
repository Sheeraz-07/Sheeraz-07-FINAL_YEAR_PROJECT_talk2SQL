"""
sql_agent.py — Dedicated SQL generation agent.

This agent receives:
  - The user's natural-language query
  - Retrieved schema snippets (from vector similarity search)
  - Long-term user memory hints (preferences, frequent filters)
  - Strict SQL generation rules

And returns:
  - Pure PostgreSQL SQL — no markdown, no explanation, no fences.
  - Explicit JOINs only (no implicit comma-joins)
  - Only references tables and columns present in the retrieved schema

The agent wraps a single LLM call whose system prompt is assembled by
``prompt_builder.build_sql_prompt``.
"""

from __future__ import annotations

import logging
import re

from app.core.longcat_client import chat_completion
from app.utils.prompt_builder import build_sql_prompt

logger = logging.getLogger(__name__)


async def generate_sql(
    user_query: str,
    schema_snippets: list[dict],
    user_hints: dict | None = None,
    session_context: list[dict] | None = None,
) -> str:
    """
    Generate a PostgreSQL SQL query from a natural-language question.

    Parameters
    ----------
    user_query : str
        The end-user's natural-language query.
    schema_snippets : list[dict]
        Relevant schema information retrieved from the vector store.
        Each dict has keys: ``table``, ``description``, ``columns``,
        ``column_details``, ``relationships``.
    user_hints : dict | None
        Personalization hints from long-term user memory
        (e.g. preferred filters, date ranges, etc.).
    session_context : list[dict] | None
        Recent conversation turns for follow-up resolution.

    Returns
    -------
    str
        A valid PostgreSQL SELECT statement (no markdown fences).

    Raises
    ------
    ValueError
        If the LLM returns an empty or obviously invalid response.
    """
    messages = build_sql_prompt(
        user_query=user_query,
        schema_snippets=schema_snippets,
        user_hints=user_hints,
        session_context=session_context,
    )

    raw = await chat_completion(messages=messages, temperature=0.0)

    sql = _clean_sql(raw)

    if not sql:
        logger.error("SQL agent returned empty output for query: %s", user_query)
        raise ValueError("SQL generation failed — LLM returned empty response.")

    logger.info("Generated SQL: %s", sql)
    return sql


def _clean_sql(raw: str) -> str:
    """
    Strip markdown fences, trailing semicolons, and whitespace from
    LLM output so we get a clean SQL string.
    """
    # Remove markdown code fences (```sql ... ``` or ``` ... ```)
    cleaned = re.sub(r"^```(?:sql)?\s*", "", raw, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    # Strip leading/trailing whitespace
    cleaned = cleaned.strip()
    # Remove trailing semicolons (we add our own when executing)
    cleaned = cleaned.rstrip(";").strip()
    return cleaned
