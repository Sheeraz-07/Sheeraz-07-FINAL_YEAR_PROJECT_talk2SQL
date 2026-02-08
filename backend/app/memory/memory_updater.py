"""
memory_updater.py — Post-query memory update logic.

After every successful query execution this module:

1. Updates the **structured user profile** (JSONB in PostgreSQL):
   - Increments total_queries
   - Tracks domain focus (HR / Inventory / Production / Sales)
   - Records frequent filter values
   - Records error patterns (on failure)

2. Updates **behavioural pattern embeddings** in the vector store:
   - Embeds a compact summary of the query + result
   - Stored in the ``memory`` collection keyed by user_id

This ensures the system "learns" per user over time.
"""

from __future__ import annotations

import logging
from typing import Any

from app.core.longcat_client import generate_embedding
from app.memory.user_profile import get_user_profile, save_user_profile
from app.memory.vector_store import get_vector_store

logger = logging.getLogger(__name__)

# ── Domain detection keywords ───────────────────────────────────────────

_DOMAIN_KEYWORDS: dict[str, list[str]] = {
    "HR": [
        "employee", "staff", "salary", "department", "designation",
        "manager", "hire", "attendance", "leave", "check_in", "check_out",
        "hours_worked", "absent", "present", "late",
    ],
    "Inventory": [
        "inventory", "stock", "material", "raw_material", "supplier",
        "reorder", "quantity", "cost_per_unit", "fabric",
    ],
    "Production": [
        "production", "product", "manufacturing", "order", "target",
        "completed", "stitching", "cutting", "product_code",
    ],
    "Sales": [
        "sale", "sales", "revenue", "customer", "total_amount",
        "selling_price",
    ],
}


def _detect_domains(query: str, sql: str) -> list[str]:
    """Determine which business domains a query touches."""
    combined = f"{query} {sql}".lower()
    matched = []
    for domain, keywords in _DOMAIN_KEYWORDS.items():
        if any(kw in combined for kw in keywords):
            matched.append(domain)
    return matched or ["HR"]  # default fallback


def _extract_filters(sql: str) -> dict[str, str]:
    """
    Rudimentary extraction of common WHERE-clause filter values
    from generated SQL.  Returns a dict of recognised filter hints.
    """
    import re

    filters: dict[str, str] = {}

    # Department filter
    dept_match = re.search(r"dept_name\s*=\s*'([^']+)'", sql, re.IGNORECASE)
    if dept_match:
        filters["department"] = dept_match.group(1)

    # Status filter
    status_match = re.search(r"status\s*=\s*'([^']+)'", sql, re.IGNORECASE)
    if status_match:
        filters["status"] = status_match.group(1)

    # Category filter
    cat_match = re.search(r"category\s*=\s*'([^']+)'", sql, re.IGNORECASE)
    if cat_match:
        filters["category"] = cat_match.group(1)

    return filters


# ── Public API ──────────────────────────────────────────────────────────


async def update_memory_after_query(
    user_id: str,
    natural_query: str,
    generated_sql: str,
    row_count: int,
    success: bool = True,
    error_message: str | None = None,
) -> None:
    """
    Update both the structured profile and vector memory after a query.

    Parameters
    ----------
    user_id : str
        The user who issued the query.
    natural_query : str
        The original natural-language query.
    generated_sql : str
        The SQL that was generated.
    row_count : int
        Number of rows returned.
    success : bool
        Whether execution succeeded.
    error_message : str | None
        Error description if the query failed.
    """
    # ── 1. Update structured profile ────────────────────────────────
    try:
        profile = await get_user_profile(user_id)

        profile["total_queries"] = profile.get("total_queries", 0) + 1

        # Domain focus
        domains = _detect_domains(natural_query, generated_sql)
        domain_focus = profile.get("domain_focus", {})
        for d in domains:
            domain_focus[d] = domain_focus.get(d, 0) + 1
        profile["domain_focus"] = domain_focus

        # Frequent filters
        if success:
            new_filters = _extract_filters(generated_sql)
            existing = profile.get("frequent_filters", {})
            existing.update(new_filters)
            profile["frequent_filters"] = existing

        # Error patterns
        if not success and error_message:
            errors = profile.get("error_patterns", [])
            errors.append(error_message[:200])
            profile["error_patterns"] = errors[-10:]  # keep last 10

        # Infer query style based on length
        if len(natural_query.split()) <= 5:
            profile["query_style"] = "short"
        elif len(natural_query.split()) >= 15:
            profile["query_style"] = "verbose"
        else:
            profile["query_style"] = "balanced"

        await save_user_profile(user_id, profile)
        logger.debug("Structured profile updated for user %s", user_id)

    except Exception:
        logger.exception("Failed to update structured profile for user %s", user_id)

    # ── 2. Update behavioural vector embedding ──────────────────────
    try:
        if success:
            summary = (
                f"User asked: {natural_query}\n"
                f"SQL generated: {generated_sql}\n"
                f"Rows returned: {row_count}\n"
                f"Domains: {', '.join(domains)}"
            )
            embedding = await generate_embedding(summary)
            store = get_vector_store()
            await store.upsert(
                collection="memory",
                content=summary,
                metadata={
                    "user_id": user_id,
                    "type": "query_pattern",
                    "domains": domains,
                },
                embedding=embedding,
            )
            logger.debug("Behavioural embedding stored for user %s", user_id)

    except Exception:
        logger.exception("Failed to update vector memory for user %s", user_id)
