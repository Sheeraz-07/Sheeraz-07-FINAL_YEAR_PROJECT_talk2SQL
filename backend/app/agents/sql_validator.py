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
    (re.compile(r"\binformation_schema\b", re.IGNORECASE), "Access to information_schema is not allowed"),
]

# _BLOCKED_PATTERNS.extend([

#     # ---------------------------------------
#     # UNION attacks
#     # ---------------------------------------
#     (re.compile(r"\bUNION\b", re.IGNORECASE), "UNION is not allowed"),
#     (re.compile(r"\bUNION\s+ALL\b", re.IGNORECASE), "UNION ALL is not allowed"),

#     # ---------------------------------------
#     # Boolean Injection
#     # ---------------------------------------
#     (re.compile(r"\bOR\s+\d+\s*=\s*\d+", re.IGNORECASE), "Boolean expressions are not allowed"),
#     (re.compile(r"\bAND\s+\d+\s*=\s*\d+", re.IGNORECASE), "Boolean expressions are not allowed"),
#     (re.compile(r"\bOR\s+TRUE\b", re.IGNORECASE), "Boolean expressions are not allowed"),
#     (re.compile(r"\bAND\s+TRUE\b", re.IGNORECASE), "Boolean expressions are not allowed"),
#     (re.compile(r"\bOR\s+FALSE\b", re.IGNORECASE), "Boolean expressions are not allowed"),

#     # ---------------------------------------
#     # Time-based Injection
#     # ---------------------------------------
#     (re.compile(r"\bSLEEP\s*\(", re.IGNORECASE), "SLEEP() is not allowed"),
#     (re.compile(r"\bPG_SLEEP\s*\(", re.IGNORECASE), "PG_SLEEP() is not allowed"),
#     (re.compile(r"\bBENCHMARK\s*\(", re.IGNORECASE), "BENCHMARK() is not allowed"),
#     (re.compile(r"\bWAITFOR\b", re.IGNORECASE), "WAITFOR is not allowed"),
#     (re.compile(r"\bDELAY\b", re.IGNORECASE), "DELAY is not allowed"),

#     # ---------------------------------------
#     # Conditional execution
#     # ---------------------------------------
#     (re.compile(r"\bCASE\b", re.IGNORECASE), "CASE expressions are not allowed"),
#     (re.compile(r"\bIF\b", re.IGNORECASE), "IF expressions are not allowed"),
#     (re.compile(r"\bIIF\b", re.IGNORECASE), "IIF expressions are not allowed"),

#     # ---------------------------------------
#     # Metadata enumeration
#     # ---------------------------------------
#     (re.compile(r"\bSYSOBJECTS\b", re.IGNORECASE), "System tables are not allowed"),
#     (re.compile(r"\bSYSCOLUMNS\b", re.IGNORECASE), "System tables are not allowed"),
#     (re.compile(r"\bPG_CATALOG\b", re.IGNORECASE), "System catalog access is not allowed"),
#     (re.compile(r"\bMYSQL\b", re.IGNORECASE), "System database access is not allowed"),

#     # ---------------------------------------
#     # Dangerous Functions
#     # ---------------------------------------
#     (re.compile(r"\bLOAD_FILE\b", re.IGNORECASE), "LOAD_FILE() is not allowed"),
#     (re.compile(r"\bINTO\s+OUTFILE\b", re.IGNORECASE), "OUTFILE is not allowed"),
#     (re.compile(r"\bINTO\s+DUMPFILE\b", re.IGNORECASE), "DUMPFILE is not allowed"),
#     (re.compile(r"\bXP_CMDSHELL\b", re.IGNORECASE), "xp_cmdshell is not allowed"),
#     (re.compile(r"\bOPENROWSET\b", re.IGNORECASE), "OPENROWSET is not allowed"),
#     (re.compile(r"\bOPENDATASOURCE\b", re.IGNORECASE), "OPENDATASOURCE is not allowed"),

#     # ---------------------------------------
#     # Encoding tricks
#     # ---------------------------------------
#     (re.compile(r"%27", re.IGNORECASE), "Encoded quotes are not allowed"),
#     (re.compile(r"%22", re.IGNORECASE), "Encoded quotes are not allowed"),
#     (re.compile(r"%3B", re.IGNORECASE), "Encoded semicolons are not allowed"),
#     (re.compile(r"%2D%2D", re.IGNORECASE), "Encoded SQL comments are not allowed"),

#     # ---------------------------------------
#     # Hex strings
#     # ---------------------------------------
#     (re.compile(r"\b0x[0-9a-f]+\b", re.IGNORECASE), "Hex encoded literals are not allowed"),

#     # ---------------------------------------
#     # Multiple statements
#     # ---------------------------------------
#     (re.compile(r";", re.IGNORECASE), "Multiple statements are not allowed"),

#     # ---------------------------------------
#     # Comments
#     # ---------------------------------------
#     (re.compile(r"#", re.IGNORECASE), "SQL comments are not allowed"),

#     # ---------------------------------------
#     # EXEC variants
#     # ---------------------------------------
#     (re.compile(r"\bEXEC\b", re.IGNORECASE), "EXEC is not allowed"),
#     (re.compile(r"\bSP_EXECUTESQL\b", re.IGNORECASE), "sp_executesql is not allowed"),

#     # ---------------------------------------
#     # File/System access
#     # ---------------------------------------
#     (re.compile(r"\bCOPY\b", re.IGNORECASE), "COPY is not allowed"),
#     (re.compile(r"\bPROGRAM\b", re.IGNORECASE), "PROGRAM is not allowed"),

#     # ---------------------------------------
#     # XML / JSON abuse
#     # ---------------------------------------
#     (re.compile(r"\bEXTRACTVALUE\b", re.IGNORECASE), "EXTRACTVALUE is not allowed"),
#     (re.compile(r"\bUPDATEXML\b", re.IGNORECASE), "UPDATEXML is not allowed"),

#     # ---------------------------------------
#     # Locking
#     # ---------------------------------------
#     (re.compile(r"\bLOCK\b", re.IGNORECASE), "LOCK is not allowed"),
#     (re.compile(r"\bUNLOCK\b", re.IGNORECASE), "UNLOCK is not allowed"),

#     # ---------------------------------------
#     # Cursor abuse
#     # ---------------------------------------
#     (re.compile(r"\bDECLARE\b", re.IGNORECASE), "DECLARE is not allowed"),
#     (re.compile(r"\bCURSOR\b", re.IGNORECASE), "CURSOR is not allowed"),
#     (re.compile(r"\bFETCH\b", re.IGNORECASE), "FETCH is not allowed"),

#     # ---------------------------------------
#     # Transactions
#     # ---------------------------------------
#     (re.compile(r"\bBEGIN\b", re.IGNORECASE), "BEGIN is not allowed"),
#     (re.compile(r"\bCOMMIT\b", re.IGNORECASE), "COMMIT is not allowed"),
#     (re.compile(r"\bROLLBACK\b", re.IGNORECASE), "ROLLBACK is not allowed"),

#     # ---------------------------------------
#     # User / Version enumeration
#     # ---------------------------------------
#     (re.compile(r"\bVERSION\s*\(", re.IGNORECASE), "VERSION() is not allowed"),
#     (re.compile(r"\bUSER\s*\(", re.IGNORECASE), "USER() is not allowed"),
#     (re.compile(r"\bCURRENT_USER\b", re.IGNORECASE), "CURRENT_USER is not allowed"),
#     (re.compile(r"\bSESSION_USER\b", re.IGNORECASE), "SESSION_USER is not allowed"),
#     (re.compile(r"\bSYSTEM_USER\b", re.IGNORECASE), "SYSTEM_USER is not allowed"),
#     (re.compile(r"\bDATABASE\s*\(", re.IGNORECASE), "DATABASE() is not allowed"),

#     # ---------------------------------------
#     # Dangerous operators
#     # ---------------------------------------
#     (re.compile(r"\|\|", re.IGNORECASE), "Concatenation operator is not allowed"),

#     # ---------------------------------------
#     # Information gathering
#     # ---------------------------------------
#     (re.compile(r"\bSCHEMA_NAME\b", re.IGNORECASE), "Schema access is not allowed"),
#     (re.compile(r"\bTABLE_NAME\b", re.IGNORECASE), "Table enumeration is not allowed"),
#     (re.compile(r"\bCOLUMN_NAME\b", re.IGNORECASE), "Column enumeration is not allowed"),

# ])

_BLOCKED_PATTERNS_SUPABASE: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\bpg_", re.IGNORECASE), "Access to pg_ system catalogs is not allowed"),
]

# ── Allowed top-level keywords ──────────────────────────────────────────

_ALLOWED_START = re.compile(
    r"^\s*(SELECT|WITH)\b",
    re.IGNORECASE,
)


# ── Public API ──────────────────────────────────────────────────────────


def validate_sql(sql: str, database: str = "supabase") -> str:
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

    if database == "supabase":
        for pattern, message in _BLOCKED_PATTERNS_SUPABASE:
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
