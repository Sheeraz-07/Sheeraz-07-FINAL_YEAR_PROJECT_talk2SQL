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

import logging
from sqlalchemy import text

from app.db.supabase import get_engine

logger = logging.getLogger(__name__)


async def retrieve_relevant_schema(
    query: str,
    top_k: int = 5,
    min_similarity: float = 0.3,
) -> list[dict]:
    """
    Retrieve schema information by directly querying the database.
    
    SIMPLIFIED: Returns all tables with their columns instead of using
    vector similarity search. This works without needing embeddings.

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
    engine = get_engine()
    snippets: list[dict] = []
    
    try:
        async with engine.connect() as conn:
            # Get all tables
            tables_result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                  AND table_type = 'BASE TABLE'
                  AND table_name != 'vector_embeddings'
                ORDER BY table_name;
            """))
            
            tables = [row[0] for row in tables_result]
            
            # For each table, get its columns
            for table_name in tables:
                # Using string formatting instead of bind parameters for session pooler compatibility
                columns_result = await conn.execute(text(f"""
                    SELECT 
                        column_name,
                        data_type,
                        is_nullable,
                        column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public' 
                      AND table_name = '{table_name}'
                    ORDER BY ordinal_position;
                """))
                
                columns = []
                column_details = {}
                
                for row in columns_result:
                    col_name = row[0]
                    col_type = row[1]
                    is_nullable = row[2]
                    col_default = row[3]
                    
                    columns.append(col_name)
                    
                    # Build column detail string
                    detail_parts = [col_type]
                    if is_nullable == 'NO':
                        detail_parts.append('NOT NULL')
                    if col_default:
                        detail_parts.append(f'DEFAULT {col_default}')
                    
                    column_details[col_name] = ' '.join(detail_parts)
                
                snippets.append({
                    "table": table_name,
                    "description": f"Table: {table_name}",
                    "columns": columns,
                    "column_details": column_details,
                    "relationships": [],
                    "similarity": 1.0,
                })
        
        logger.info(
            "Schema retrieval (direct mode): %d tables retrieved",
            len(snippets),
        )
        
    except Exception as e:
        logger.error(f"Failed to retrieve schema: {e}")
        raise
    
    return snippets


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
