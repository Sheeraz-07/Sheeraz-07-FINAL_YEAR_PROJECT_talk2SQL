"""
prompt_builder.py — Assembles LLM prompts for SQL generation.

This module is the ONLY place where the SQL-generation system prompt is
defined.  It combines:

  1. A strict system prompt with SQL rules
  2. Retrieved schema snippets (from vector search)
  3. User personalisation hints (from long-term memory)
  4. Session conversation context (for follow-ups)
  5. The user's current natural-language query

The output is a list of OpenAI-style messages ready for
``longcat_client.chat_completion()``.
"""

from __future__ import annotations

from typing import Any

from app.utils.sql_rules import SQL_RULES_BLOCK


def build_sql_prompt(
    user_query: str,
    schema_snippets: list[dict],
    user_hints: dict[str, Any] | None = None,
    session_context: list[dict] | None = None,
) -> list[dict]:
    """
    Build the complete message list for the SQL generation LLM call.

    Parameters
    ----------
    user_query : str
        The user's natural-language question.
    schema_snippets : list[dict]
        Relevant table metadata from vector search.
    user_hints : dict | None
        Personalisation hints from user profile.
    session_context : list[dict] | None
        Recent conversation turns for follow-up resolution.

    Returns
    -------
    list[dict]
        OpenAI-style messages: system, optional context, user.
    """
    # ── Build schema section ────────────────────────────────────────
    schema_text = _format_schema_snippets(schema_snippets)

    # ── Build personalisation section ───────────────────────────────
    hints_text = _format_user_hints(user_hints) if user_hints else ""

    # ── System prompt ───────────────────────────────────────────────
    system_content = f"""\
You are an expert PostgreSQL SQL generator for a garment manufacturing ERP system
running on Supabase.

{SQL_RULES_BLOCK}

=== AVAILABLE SCHEMA (retrieve via similarity — ONLY these tables/columns exist) ===
{schema_text}
=== END SCHEMA ===

{hints_text}

TASK:
Given the user's natural-language question, generate a SINGLE valid PostgreSQL
SELECT query.  Your response must contain ONLY the SQL — no markdown fences,
no explanations, no comments, no semicolons at the end.
"""

    messages: list[dict] = [{"role": "system", "content": system_content.strip()}]

    # ── Inject session context for follow-ups ───────────────────────
    if session_context:
        for turn in session_context:
            messages.append(turn)

    # ── User query ──────────────────────────────────────────────────
    messages.append({"role": "user", "content": user_query})

    return messages


def _format_schema_snippets(snippets: list[dict]) -> str:
    """Format schema snippets into a compact text block for the prompt."""
    if not snippets:
        return "(No schema context available.)"

    parts: list[str] = []
    for s in snippets:
        table = s.get("table", "unknown")
        desc = s.get("description", "")
        cols = s.get("columns", [])
        col_details = s.get("column_details", {})
        rels = s.get("relationships", [])

        section = f"TABLE: {table}\n  Description: {desc}\n  Columns: {', '.join(cols)}"

        if col_details:
            detail_lines = [f"    - {c}: {d}" for c, d in col_details.items()]
            section += "\n  Column Details:\n" + "\n".join(detail_lines)

        if rels:
            section += f"\n  Joins: {'; '.join(rels)}"

        parts.append(section)

    return "\n\n".join(parts)


def _format_user_hints(hints: dict[str, Any]) -> str:
    """Format user personalisation hints into the system prompt."""
    if not hints:
        return ""

    lines = ["=== USER PREFERENCES (use as soft guidance) ==="]

    if hints.get("frequent_filters"):
        filters = hints["frequent_filters"]
        lines.append(f"  Frequently used filters: {filters}")

    if hints.get("primary_domain"):
        lines.append(f"  Primary domain of interest: {hints['primary_domain']}")

    if hints.get("output_preference"):
        lines.append(f"  Preferred output style: {hints['output_preference']}")

    if hints.get("query_style"):
        lines.append(f"  Query style: {hints['query_style']}")

    lines.append("=== END USER PREFERENCES ===")
    return "\n".join(lines)
