"""
user_profile.py — Long-term user memory (persistent).

Stores personalisation data per user that survives across sessions:

  - **query_style**: short vs verbose
  - **frequent_filters**: commonly used WHERE-clause values
      (date ranges, departments, salary ranges, statuses ...)
  - **output_preference**: "table" | "summary"
  - **error_patterns**: recurring SQL errors / misunderstandings
  - **domain_focus**: which domain(s) the user queries most
      (HR, Inventory, Production, Sales)

Storage strategy:
  - Structured profile → PostgreSQL table ``user_profiles`` (JSONB column)
  - Behavioral patterns → vector embeddings in ``memory_embeddings``
    (handled by ``vector_store.py`` + ``memory_updater.py``)

This module provides CRUD for the structured JSONB profile only.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

from sqlalchemy import text

from app.db.supabase import get_engine

logger = logging.getLogger(__name__)

# ── Default profile skeleton ────────────────────────────────────────────

DEFAULT_PROFILE: dict[str, Any] = {
    "query_style": "balanced",          # short | balanced | verbose
    "output_preference": "table",       # table | summary
    "frequent_filters": {},             # e.g. {"department": "Stitching", "status": "Active"}
    "error_patterns": [],               # list of recent error descriptions
    "domain_focus": {                   # query-count per domain
        "HR": 0,
        "Inventory": 0,
        "Production": 0,
        "Sales": 0,
    },
    "total_queries": 0,
}

# ── SQL for the user_profiles table ─────────────────────────────────────

_ENSURE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id  TEXT PRIMARY KEY,
    profile  JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);
"""

_UPSERT_SQL = """
INSERT INTO user_profiles (user_id, profile, updated_at)
VALUES (:user_id, :profile, now())
ON CONFLICT (user_id)
DO UPDATE SET profile = :profile, updated_at = now();
"""

_SELECT_SQL = """
SELECT profile FROM user_profiles WHERE user_id = :user_id;
"""


# ── Public API ──────────────────────────────────────────────────────────


async def ensure_profile_table() -> None:
    """Create the ``user_profiles`` table if it does not exist."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.execute(text(_ENSURE_TABLE_SQL))
    logger.info("user_profiles table ensured.")


async def get_user_profile(user_id: str) -> dict[str, Any]:
    """
    Retrieve the long-term profile for *user_id*.

    Returns the stored JSONB profile merged with ``DEFAULT_PROFILE``
    so that new keys added in future versions are always present.
    """
    engine = get_engine()
    async with engine.connect() as conn:
        result = await conn.execute(text(_SELECT_SQL), {"user_id": user_id})
        row = result.fetchone()

    if row is None:
        # First time → create default profile
        await save_user_profile(user_id, DEFAULT_PROFILE)
        return DEFAULT_PROFILE.copy()

    stored = row[0] if isinstance(row[0], dict) else json.loads(row[0])
    # Merge defaults (in case schema evolved)
    merged = {**DEFAULT_PROFILE, **stored}
    return merged


async def save_user_profile(user_id: str, profile: dict[str, Any]) -> None:
    """Upsert the user profile JSONB."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.execute(
            text(_UPSERT_SQL),
            {"user_id": user_id, "profile": json.dumps(profile)},
        )
    logger.debug("Saved profile for user %s", user_id)


def build_user_hints(profile: dict[str, Any]) -> dict[str, Any]:
    """
    Convert the raw profile into a compact hint dict suitable for
    injection into the SQL generation prompt.

    This keeps the prompt lean — we only pass actionable hints.
    """
    hints: dict[str, Any] = {}

    if profile.get("frequent_filters"):
        hints["frequent_filters"] = profile["frequent_filters"]

    if profile.get("output_preference"):
        hints["output_preference"] = profile["output_preference"]

    if profile.get("query_style"):
        hints["query_style"] = profile["query_style"]

    # Determine dominant domain
    domain_focus = profile.get("domain_focus", {})
    if domain_focus:
        top_domain = max(domain_focus, key=domain_focus.get, default=None)
        if top_domain and domain_focus[top_domain] > 0:
            hints["primary_domain"] = top_domain

    return hints
