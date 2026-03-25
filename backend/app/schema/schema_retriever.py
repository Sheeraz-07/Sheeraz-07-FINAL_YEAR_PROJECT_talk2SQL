"""
schema_retriever.py — Runtime schema retrieval via direct database introspection.

SIMPLIFIED MODE: Instead of using vector embeddings, this directly queries
the database information_schema to get all table and column definitions.

This approach:
  - Works immediately without needing embeddings
  - Returns all tables (not filtered by relevance)
  - Simpler and more reliable for initial deployment
  
Vector search can be added later for optimization.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any
from sqlalchemy import text

from app.db.sql_server import get_sql_server_connection
from app.db.supabase import get_engine
from app.schema.schema_pipeline import get_llm_schema

logger = logging.getLogger(__name__)


_RAW_SCHEMA_CACHE: dict[str, dict[str, Any]] = {}
_RAW_SCHEMA_LOCKS: dict[str, asyncio.Lock] = {
    "supabase": asyncio.Lock(),
    "sql_server": asyncio.Lock(),
}


def _canonical_database(database: str) -> str:
    key = (database or "supabase").strip().lower()
    if key in {"sql_server", "sqlserver", "mssql"}:
        return "sql_server"
    return "supabase"


async def get_cached_raw_schema(
    database: str = "supabase",
    *,
    force_refresh: bool = False,
) -> tuple[list[str], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    """Return cached schema metadata, refreshing only when requested or missing."""
    db_key = _canonical_database(database)

    if not force_refresh and db_key in _RAW_SCHEMA_CACHE:
        return _RAW_SCHEMA_CACHE[db_key]["raw_data"]

    lock = _RAW_SCHEMA_LOCKS[db_key]
    async with lock:
        if not force_refresh and db_key in _RAW_SCHEMA_CACHE:
            return _RAW_SCHEMA_CACHE[db_key]["raw_data"]

        if db_key == "sql_server":
            raw_data = await asyncio.to_thread(_extract_sql_server_raw_schema_sync)
        else:
            raw_data = await _extract_supabase_raw_schema_with_retry()

        _RAW_SCHEMA_CACHE[db_key] = {
            "raw_data": raw_data,
            "cached_at": time.time(),
        }
        logger.info("Schema cache refreshed for %s", db_key)
        return raw_data


async def get_cached_schema_snapshot(
    database: str = "supabase",
    *,
    force_refresh: bool = False,
) -> dict[str, Any]:
    """
    Return a lightweight schema snapshot for type hinting and visualization analysis.
    """
    raw_tables, raw_columns, _, _ = await get_cached_raw_schema(database, force_refresh=force_refresh)

    column_type_hints: dict[str, list[str]] = {}
    for col in raw_columns:
        column_name = str(col.get("column_name", "")).strip().lower()
        data_type = str(col.get("data_type", "")).strip().lower()
        if not column_name or not data_type:
            continue
        if column_name not in column_type_hints:
            column_type_hints[column_name] = []
        if data_type not in column_type_hints[column_name]:
            column_type_hints[column_name].append(data_type)

    return {
        "database": _canonical_database(database),
        "tables": [str(t).lower() for t in raw_tables],
        "column_type_hints": column_type_hints,
    }


async def refresh_schema_cache(database: str | None = None) -> dict[str, Any]:
    """Force-refresh one database cache entry or both caches."""
    targets = ["supabase", "sql_server"] if not database else [_canonical_database(database)]
    refreshed: dict[str, dict[str, Any]] = {}

    for db_key in targets:
        raw_tables, raw_columns, raw_fks, raw_constraints = await get_cached_raw_schema(
            db_key,
            force_refresh=True,
        )
        refreshed[db_key] = {
            "table_count": len(raw_tables),
            "column_count": len(raw_columns),
            "fk_count": len(raw_fks),
            "constraint_count": len(raw_constraints),
        }

    return {
        "status": "ok",
        "refreshed": refreshed,
    }


async def retrieve_relevant_schema(
    query: str,
    top_k: int = 5,
    min_similarity: float = 0.3,
    database: str = "supabase",
) -> list[dict]:
    """
    Retrieve schema information by directly querying the database.
    
    SIMPLIFIED: Returns the whole compressed schema (all tables) so the LLM
    has complete database context while staying within token limits.

    Parameters
    ----------
    query : str
        The natural-language query from the user (not used in simplified mode).
    top_k : int
        Maximum number of tables to retrieve (not enforced in simplified mode).
    min_similarity : float
        Not used in simplified mode.

    Returns
    -------
    list[dict]
        Each dict contains:
          - table: str
          - description: str (empty in simplified mode)
          - columns: list[str]
          - column_details: dict[str, str]
          - relationships: list[str] (empty in simplified mode)
          - similarity: float (always 1.0 in simplified mode)
    """
    db_key = _canonical_database(database)

    if db_key == "sql_server":
        raw_data = await get_cached_raw_schema(db_key)
        snippets = get_llm_schema(
            db_key="sql_server",
            raw_data=raw_data,
            user_query=query,
            db_type="sql_server",
            top_k=top_k,
            max_cols=8,
        )
        logger.info("Schema pipeline (sql_server): sending %d compressed tables", len(snippets))
        return snippets

    raw_data = await get_cached_raw_schema("supabase")
    snippets = get_llm_schema(
        db_key="supabase",
        raw_data=raw_data,
        user_query=query,
        db_type="supabase",
        top_k=top_k,
        max_cols=8,
    )
    logger.info("Schema pipeline (supabase): sending %d compressed tables", len(snippets))
    return snippets


async def _extract_supabase_raw_schema() -> tuple[list[str], list[dict], list[dict], list[dict]]:
    """Extract full raw schema metadata from Supabase for compression pipeline."""
    engine = get_engine()

    async with engine.connect() as conn:
        tables_result = await conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
              AND table_name != 'vector_embeddings'
            ORDER BY table_name;
        """))
        tables = [str(row[0]) for row in tables_result]

        columns_result = await conn.execute(text("""
            SELECT
                table_name,
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position;
        """))
        columns = [
            {
                "table_name": str(row[0]),
                "column_name": str(row[1]),
                "data_type": str(row[2]),
                "is_nullable": str(row[3]),
                "column_default": row[4],
                "is_pk": False,
            }
            for row in columns_result
        ]

        pks_result = await conn.execute(text("""
            SELECT kcu.table_name, kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema = 'public';
        """))
        pk_set = {(str(row[0]).lower(), str(row[1]).lower()) for row in pks_result}

        for col in columns:
            key = (col["table_name"].lower(), col["column_name"].lower())
            col["is_pk"] = key in pk_set

        fks_result = await conn.execute(text("""
            SELECT
                kcu.table_name,
                kcu.column_name,
                ccu.table_name AS referenced_table,
                ccu.column_name AS referenced_column
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu
              ON ccu.constraint_name = tc.constraint_name
             AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = 'public';
        """))
        fks = [
            {
                "table_name": str(row[0]),
                "column_name": str(row[1]),
                "referenced_table": str(row[2]),
                "referenced_column": str(row[3]),
            }
            for row in fks_result
        ]

        checks_result = await conn.execute(text("""
            SELECT tc.table_name, cc.check_clause
            FROM information_schema.table_constraints tc
            JOIN information_schema.check_constraints cc
              ON tc.constraint_name = cc.constraint_name
            WHERE tc.constraint_type = 'CHECK'
              AND tc.table_schema = 'public';
        """))
        constraints = [
            {"table_name": str(row[0]), "definition": str(row[1])}
            for row in checks_result
        ]

    return tables, columns, fks, constraints


async def _extract_supabase_raw_schema_with_retry(
    max_attempts: int = 3,
    initial_delay_seconds: float = 0.8,
) -> tuple[list[str], list[dict], list[dict], list[dict]]:
    """Retry Supabase schema introspection for transient DNS/network failures."""
    delay_seconds = initial_delay_seconds
    last_error: Exception | None = None

    for attempt in range(1, max_attempts + 1):
        try:
            return await _extract_supabase_raw_schema()
        except Exception as exc:
            last_error = exc
            if attempt >= max_attempts:
                break
            logger.warning(
                "Supabase schema introspection failed (attempt %d/%d): %s. Retrying in %.1fs",
                attempt,
                max_attempts,
                exc,
                delay_seconds,
            )
            await asyncio.sleep(delay_seconds)
            delay_seconds *= 2

    assert last_error is not None
    raise last_error


def _extract_sql_server_raw_schema_sync() -> tuple[list[str], list[dict], list[dict], list[dict]]:
    """Extract full raw schema metadata from SQL Server for compression pipeline."""
    conn = None
    try:
        conn = get_sql_server_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT TABLE_SCHEMA, TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_SCHEMA, TABLE_NAME;
            """
        )
        table_rows = cursor.fetchall()
        tables = [f"{row[0]}.{row[1]}" for row in table_rows]

        cursor.execute(
            """
            SELECT
                TABLE_SCHEMA,
                TABLE_NAME,
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION;
            """
        )
        columns = [
            {
                "table_name": f"{row[0]}.{row[1]}",
                "column_name": str(row[2]),
                "data_type": str(row[3]),
                "is_nullable": str(row[4]),
                "column_default": row[5],
                "is_pk": False,
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT
                KCU.TABLE_SCHEMA,
                KCU.TABLE_NAME,
                KCU.COLUMN_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS TC
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE KCU
              ON TC.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME
             AND TC.TABLE_SCHEMA = KCU.TABLE_SCHEMA
            WHERE TC.CONSTRAINT_TYPE = 'PRIMARY KEY';
            """
        )
        pk_set = {(f"{row[0]}.{row[1]}".lower(), str(row[2]).lower()) for row in cursor.fetchall()}

        for col in columns:
            key = (str(col["table_name"]).lower(), str(col["column_name"]).lower())
            col["is_pk"] = key in pk_set

        cursor.execute(
            """
            SELECT
                sch_parent.name AS table_schema,
                t_parent.name AS table_name,
                c_parent.name AS column_name,
                sch_ref.name AS referenced_schema,
                t_ref.name AS referenced_table,
                c_ref.name AS referenced_column
            FROM sys.foreign_key_columns fkc
            JOIN sys.tables t_parent ON fkc.parent_object_id = t_parent.object_id
            JOIN sys.schemas sch_parent ON t_parent.schema_id = sch_parent.schema_id
            JOIN sys.columns c_parent ON fkc.parent_object_id = c_parent.object_id AND fkc.parent_column_id = c_parent.column_id
            JOIN sys.tables t_ref ON fkc.referenced_object_id = t_ref.object_id
            JOIN sys.schemas sch_ref ON t_ref.schema_id = sch_ref.schema_id
            JOIN sys.columns c_ref ON fkc.referenced_object_id = c_ref.object_id AND fkc.referenced_column_id = c_ref.column_id;
            """
        )
        fks = [
            {
                "table_name": f"{row[0]}.{row[1]}",
                "column_name": str(row[2]),
                "referenced_table": f"{row[3]}.{row[4]}",
                "referenced_column": str(row[5]),
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT
                s.name AS table_schema,
                t.name AS table_name,
                cc.definition
            FROM sys.check_constraints cc
            JOIN sys.tables t ON cc.parent_object_id = t.object_id
            JOIN sys.schemas s ON t.schema_id = s.schema_id;
            """
        )
        constraints = [
            {
                "table_name": f"{row[0]}.{row[1]}",
                "definition": str(row[2]),
            }
            for row in cursor.fetchall()
        ]

        return tables, columns, fks, constraints
    finally:
        if conn is not None:
            conn.close()


async def retrieve_user_memory_context(
    user_id: str,
    query: str,
    top_k: int = 3,
) -> list[dict]:
    """
    Retrieve relevant behavioural memory vectors for a user.
    
    SIMPLIFIED: Returns empty list since we're not using embeddings yet.

    Parameters
    ----------
    user_id : str
        The user whose memory to search.
    query : str
        The current query.
    top_k : int
        Number of memory entries to retrieve.

    Returns
    -------
    list[dict]
        Empty list in simplified mode.
    """
    logger.debug(
        "Memory retrieval skipped (simplified mode) for user %s",
        user_id,
    )
    return []
