"""
vector_store.py — Abstracted vector storage layer.

Default implementation uses **pgvector** inside Supabase.
The interface is designed so that a Qdrant (or other) backend can be
swapped in later by implementing the same ``VectorStore`` protocol.

Two logical collections are managed:
  1. **schema_embeddings** — semantic embeddings of table metadata
     (ingested once; used at query-time for schema retrieval).
  2. **memory_embeddings** — behavioural pattern embeddings per user
     (updated after every successful query).

Each embedding row stores:
  - id (UUID)
  - collection  (schema | memory)
  - content     (the original text that was embedded)
  - metadata    (JSONB — table name, user_id, etc.)
  - embedding   (vector)
"""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any, Protocol, runtime_checkable

from sqlalchemy import text

from app.core.config import get_settings
from app.core.longcat_client import generate_embedding
from app.db.supabase import get_engine

logger = logging.getLogger(__name__)

# ── SQL templates ───────────────────────────────────────────────────────

_ENSURE_EXTENSION_SQL = "CREATE EXTENSION IF NOT EXISTS vector;"

_ENSURE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS vector_embeddings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection  TEXT NOT NULL,
    content     TEXT NOT NULL,
    metadata    JSONB DEFAULT '{{}}'::jsonb,
    embedding   vector({dimensions})
);
"""

_CREATE_INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_collection
    ON vector_embeddings (collection);
"""

_INSERT_SQL = """
INSERT INTO vector_embeddings (id, collection, content, metadata, embedding)
VALUES (:id, :collection, :content, :metadata, :embedding)
ON CONFLICT (id) DO UPDATE
    SET content = :content, metadata = :metadata, embedding = :embedding;
"""

_SEARCH_SQL = """
SELECT id, content, metadata,
       1 - (embedding <=> :query_embedding::vector) AS similarity
FROM vector_embeddings
WHERE collection = :collection
ORDER BY embedding <=> :query_embedding::vector
LIMIT :top_k;
"""

_DELETE_BY_META_SQL = """
DELETE FROM vector_embeddings
WHERE collection = :collection
  AND metadata @> CAST(:meta_filter AS jsonb);
"""

_EXISTS_SQL = """
SELECT EXISTS(
    SELECT 1 FROM vector_embeddings
    WHERE collection = :collection
      AND metadata @> CAST(:meta_filter AS jsonb)
);
"""


# ── Protocol (for future Qdrant swap) ──────────────────────────────────


@runtime_checkable
class VectorStore(Protocol):
    async def ensure_collection(self) -> None: ...
    async def upsert(self, collection: str, content: str, metadata: dict, embedding: list[float], doc_id: str | None = None) -> str: ...
    async def search(self, collection: str, query_embedding: list[float], top_k: int = 5) -> list[dict]: ...
    async def delete_by_metadata(self, collection: str, meta_filter: dict) -> None: ...
    async def exists(self, collection: str, meta_filter: dict) -> bool: ...


# ── pgvector implementation ─────────────────────────────────────────────


class PgVectorStore:
    """Vector store backed by pgvector inside Supabase."""

    async def ensure_collection(self) -> None:
        """Create the extension, table, and index if they don't exist."""
        settings = get_settings()
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.execute(text(_ENSURE_EXTENSION_SQL))
            await conn.execute(
                text(_ENSURE_TABLE_SQL.format(dimensions=settings.EMBEDDING_DIMENSIONS))
            )
            await conn.execute(text(_CREATE_INDEX_SQL))
        logger.info("vector_embeddings table ensured (dim=%d).", settings.EMBEDDING_DIMENSIONS)

    async def upsert(
        self,
        collection: str,
        content: str,
        metadata: dict,
        embedding: list[float],
        doc_id: str | None = None,
    ) -> str:
        """Insert or update a vector embedding row."""
        doc_id = doc_id or str(uuid.uuid4())
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.execute(
                text(_INSERT_SQL),
                {
                    "id": doc_id,
                    "collection": collection,
                    "content": content,
                    "metadata": json.dumps(metadata),
                    "embedding": str(embedding),
                },
            )
        logger.debug("Upserted vector %s in collection '%s'", doc_id, collection)
        return doc_id

    async def search(
        self,
        collection: str,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[dict]:
        """
        Perform cosine-similarity search and return the top-k results.

        Returns a list of dicts with keys:
          id, content, metadata, similarity
        """
        engine = get_engine()
        async with engine.connect() as conn:
            result = await conn.execute(
                text(_SEARCH_SQL),
                {
                    "collection": collection,
                    "query_embedding": str(query_embedding),
                    "top_k": top_k,
                },
            )
            rows = result.fetchall()

        results = []
        for row in rows:
            meta = row[2] if isinstance(row[2], dict) else json.loads(row[2])
            results.append(
                {
                    "id": str(row[0]),
                    "content": row[1],
                    "metadata": meta,
                    "similarity": float(row[3]),
                }
            )
        return results

    async def delete_by_metadata(self, collection: str, meta_filter: dict) -> None:
        """Delete all rows matching the JSONB metadata filter."""
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.execute(
                text(_DELETE_BY_META_SQL),
                {
                    "collection": collection,
                    "meta_filter": json.dumps(meta_filter),
                },
            )

    async def exists(self, collection: str, meta_filter: dict) -> bool:
        """Check whether any row matches the metadata filter."""
        engine = get_engine()
        async with engine.connect() as conn:
            result = await conn.execute(
                text(_EXISTS_SQL),
                {
                    "collection": collection,
                    "meta_filter": json.dumps(meta_filter),
                },
            )
            row = result.fetchone()
        return bool(row and row[0])


# ── Module singleton ────────────────────────────────────────────────────

_store: VectorStore | None = None


def get_vector_store() -> VectorStore:
    """Return the module-level PgVectorStore singleton."""
    global _store
    if _store is None:
        _store = PgVectorStore()
    return _store
