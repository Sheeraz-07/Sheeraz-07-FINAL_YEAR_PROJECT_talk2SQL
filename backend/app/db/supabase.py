"""
supabase.py — Async SQLAlchemy engine for Supabase (PostgreSQL).

Provides a singleton async engine used by the executor, user_profile,
vector_store, and schema modules.  Uses ``asyncpg`` as the driver.

No ORM models are used anywhere — only SQLAlchemy Core (``text()``).
"""

from __future__ import annotations

import logging
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_engine: Optional[AsyncEngine] = None


def get_engine() -> AsyncEngine:
    """
    Return the singleton async SQLAlchemy engine.

    The engine is created lazily on first call with conservative pool
    settings suitable for Supabase's connection limits.
    """
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.SUPABASE_DB_URL,
            echo=settings.DEBUG,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=300,
        )
        logger.info("Async SQLAlchemy engine created.")
    return _engine


async def dispose_engine() -> None:
    """Gracefully close the engine pool (called at shutdown)."""
    global _engine
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        logger.info("SQLAlchemy engine disposed.")
