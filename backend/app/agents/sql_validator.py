"""
sql_validator.py — SQL validation layer (NON-NEGOTIABLE).

Every generated SQL statement must pass through this validator before
execution.  The validator performs:

1. **Blocklist check** — rejects DDL / DML that mutates the database:
     DROP, ALTER, TRUNCATE, DELETE, INSERT, UPDATE, CREATE, GRANT, REVOKE
2. **Allowlist check** — only allows safe read operations:
     SELECT, WITH (CTE)
3. **Structural sanity** — basic checks for balanced parentheses, etc.

If validation fails, a ``SQLValidationError`` is raised with a
user-friendly message.  The SQL is NEVER executed.
"""

from __future__ import annotations

import logging
import re

logger = logging.getLogger(__name__)


class SQLValidationError(Exception):
    """Raised when SQL fails safety or structural validation."""

    def __init__(self, message: str, sql: str | None = None):
        self.sql = sql
        super().__init__(message)


# ── Blocked statement patterns ──────────────────────────────────────────
# Each tuple is (compiled regex, human-readable label).

_BLOCKED_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\bDROP\b", re.IGNORECASE), "DROP statements are not allowed"),
    (re.compile(r"\bALTER\b", re.IGNORECASE), "ALTER statements are not allowed"),
    (re.compile(r"\bTRUNCATE\b", re.IGNORECASE), "TRUNCATE statements are not allowed"),
    (re.compile(r"\bDELETE\b", re.IGNORECASE), "DELETE statements are not allowed"),
    (re.compile(r"\bINSERT\b", re.IGNORECASE), "INSERT statements are not allowed"),
    (re.compile(r"\bUPDATE\b", re.IGNORECASE), "UPDATE statements are not allowed"),
    (re.compile(r"\bCREATE\b", re.IGNORECASE), "CREATE statements are not allowed"),
    (re.compile(r"\bGRANT\b", re.IGNORECASE), "GRANT statements are not allowed"),
    (re.compile(r"\bREVOKE\b", re.IGNORECASE), "REVOKE statements are not allowed"),
    (re.compile(r"\bEXECUTE\b", re.IGNORECASE), "EXECUTE statements are not allowed"),
    (re.compile(r"\bCALL\b", re.IGNORECASE), "CALL statements are not allowed"),
    (re.compile(r"--", re.IGNORECASE), "SQL comments (--) are not allowed"),
    (re.compile(r"/\*", re.IGNORECASE), "Block comments (/*) are not allowed"),
    (re.compile(r"\bpg_", re.IGNORECASE), "Access to pg_ system catalogs is not allowed"),
    (re.compile(r"\binformation_schema\b", re.IGNORECASE), "Access to information_schema is not allowed"),
]

# ── Allowed top-level keywords ──────────────────────────────────────────

_ALLOWED_START = re.compile(
    r"^\s*(SELECT|WITH)\b",
    re.IGNORECASE,
)


# ── Public API ──────────────────────────────────────────────────────────


def validate_sql(sql: str) -> str:
    """
    Validate a SQL string for safety and structural integrity.

    Parameters
    ----------
    sql : str
        The SQL statement to validate.

    Returns
    -------
    str
        The same SQL string if validation passes.

    Raises
    ------
    SQLValidationError
        If the SQL contains blocked keywords, doesn't start with an
        allowed keyword, or fails structural checks.
    """
    if not sql or not sql.strip():
        raise SQLValidationError("Empty SQL statement.", sql=sql)

    stripped = sql.strip()

    # 1. Must start with SELECT or WITH
    if not _ALLOWED_START.match(stripped):
        raise SQLValidationError(
            "Only SELECT queries are allowed. Your query must start with SELECT or WITH.",
            sql=sql,
        )

    # 2. Check for blocked patterns
    for pattern, message in _BLOCKED_PATTERNS:
        if pattern.search(stripped):
            raise SQLValidationError(message, sql=sql)

    # 3. Balanced parentheses check
    depth = 0
    for ch in stripped:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if depth < 0:
            raise SQLValidationError("Unbalanced parentheses in SQL.", sql=sql)
    if depth != 0:
        raise SQLValidationError("Unbalanced parentheses in SQL.", sql=sql)

    # 4. Check for multiple statements (;)
    # Remove semicolons at the very end, then check for any remaining
    without_trailing = stripped.rstrip(";").strip()
    if ";" in without_trailing:
        raise SQLValidationError(
            "Multiple SQL statements are not allowed. Only single queries are permitted.",
            sql=sql,
        )

    logger.info("SQL validation passed.")
    return sql
