"""
intent_guard.py — Domain & intent guard.

This module runs *before* any LLM call.  It determines whether the user's
natural-language query is related to the supported business domains:

  - employees / departments / attendance / leaves
  - inventory / suppliers / raw materials
  - production / products
  - sales

If the query is out-of-domain (e.g. weather, jokes, general chitchat),
the guard short-circuits the pipeline and returns a polite rejection
message — saving LLM tokens and preventing hallucinated SQL.

Two-layer check:
  1. **Fast keyword scan** – cheap regex / keyword check.
  2. **LLM fallback**     – if the keyword scan is inconclusive, a tiny
     classification prompt is sent to LongCat (very low token cost).
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from app.core.longcat_client import chat_completion

logger = logging.getLogger(__name__)

# ── Constants ───────────────────────────────────────────────────────────

REJECTION_MESSAGE = (
    "Please enter a query related to the system's database "
    "(employees, inventory, production, or sales)."
)

# Keywords that strongly indicate in-domain queries.  We combine them into
# a single compiled regex for O(1) matching regardless of keyword count.
_DOMAIN_KEYWORDS: list[str] = [
    # HR / Employees
    r"employee", r"staff", r"worker", r"salary", r"salaries", r"hire",
    r"designation", r"manager", r"department", r"dept",
    # Attendance / Leave
    r"attendance", r"present", r"absent", r"late", r"check.?in",
    r"check.?out", r"leave", r"sick", r"casual", r"annual", r"maternity",
    r"half.?day", r"hours.?worked",
    # Inventory / Suppliers
    r"inventory", r"stock", r"material", r"raw.?material", r"fabric",
    r"supplier", r"reorder", r"quantity", r"cost.?per.?unit",
    # Products / Production
    r"product", r"production", r"manufacturing", r"order",
    r"target.?quantity", r"completed", r"stitching", r"cutting",
    r"product.?code", r"category",
    # Sales
    r"sale", r"sales", r"revenue", r"customer", r"total.?amount",
    r"selling.?price",
    # Generic DB ops (safe)
    r"count", r"average", r"sum", r"total", r"maximum", r"minimum",
    r"highest", r"lowest", r"top", r"bottom", r"list", r"show",
    r"display", r"report", r"how many", r"which",
]

_DOMAIN_PATTERN = re.compile(
    "|".join(_DOMAIN_KEYWORDS),
    re.IGNORECASE,
)


@dataclass
class IntentResult:
    """Result container for intent classification."""

    is_in_domain: bool
    rejection_message: str | None = None


# ── Public API ──────────────────────────────────────────────────────────


async def check_intent(query: str) -> IntentResult:
    """
    Determine whether *query* falls within the application's supported
    business domains.

    Parameters
    ----------
    query : str
        Raw natural-language query from the user.

    Returns
    -------
    IntentResult
        ``is_in_domain=True`` if the query is acceptable.
        Otherwise ``rejection_message`` is set.
    """
    # Layer 1: Fast keyword scan
    if _DOMAIN_PATTERN.search(query):
        logger.debug("Intent guard: PASS (keyword match)")
        return IntentResult(is_in_domain=True)

    # Layer 2: LLM micro-classification (low token cost)
    logger.debug("Intent guard: keyword scan inconclusive — escalating to LLM")
    try:
        is_valid = await _llm_classify(query)
        if is_valid:
            return IntentResult(is_in_domain=True)
    except Exception:
        logger.exception("Intent guard LLM fallback failed; rejecting by default")

    return IntentResult(is_in_domain=False, rejection_message=REJECTION_MESSAGE)


# ── Private helpers ─────────────────────────────────────────────────────

_CLASSIFY_SYSTEM_PROMPT = """\
You are a strict classifier.  Given a user query, decide if it is related
to ANY of the following business database domains:

- employees, departments, salaries, designations, managers
- attendance, check-in/out, hours worked
- leaves (sick, casual, annual, maternity)
- suppliers, raw materials, inventory, stock levels
- products, production orders, manufacturing
- sales orders, revenue, customers

Reply with EXACTLY one word: "yes" or "no".
Do NOT explain.  Do NOT add punctuation.
"""


async def _llm_classify(query: str) -> bool:
    """Ask the LLM for a binary yes/no classification."""
    response = await chat_completion(
        messages=[
            {"role": "system", "content": _CLASSIFY_SYSTEM_PROMPT},
            {"role": "user", "content": query},
        ],
        temperature=0.0,
        max_tokens=4,
    )
    return response.strip().lower().startswith("yes")
