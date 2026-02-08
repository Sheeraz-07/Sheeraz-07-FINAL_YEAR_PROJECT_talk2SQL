"""
main.py — FastAPI application entry point for the Talk2SQL backend.

Startup tasks:
  1. Configure logging
  2. Mount CORS middleware (for Next.js frontend at localhost:3000)
  3. Include API routers
  
SIMPLIFIED MODE: Uses direct database schema introspection instead of
vector embeddings, allowing the system to work without embedding API.

Shutdown tasks:
  1. Dispose SQLAlchemy engine pool

Usage:
  uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.core.config import get_settings
from app.db.supabase import dispose_engine

# ── Logging ─────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ──────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown."""
    settings = get_settings()
    logger.info("Starting %s v%s (SIMPLIFIED MODE - Direct Schema Retrieval)", settings.APP_TITLE, settings.APP_VERSION)

    # SIMPLIFIED MODE: Skip vector embeddings setup since we're using direct schema retrieval
    # Vector embeddings and schema ingestion can be enabled later for optimization
    logger.info("Using direct database schema retrieval (no embeddings required)")

    yield

    # Shutdown
    logger.info("Shutting down...")
    await dispose_engine()


# ── App factory ─────────────────────────────────────────────────────────


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    application = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description=(
            "Talk2SQL Backend — Simplified for Query Generation. "
            "Converts natural language to safe PostgreSQL queries on Supabase."
        ),
        lifespan=lifespan,
    )

    # CORS — allow the Next.js frontend
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount routers
    application.include_router(chat_router, prefix="/api", tags=["query"])

    # Health check
    @application.get("/health", tags=["ops"])
    async def health_check():
        return {"status": "ok", "version": settings.APP_VERSION}

    # Admin endpoint: force schema re-ingestion
    @application.post("/admin/reingest-schema", tags=["admin"])
    async def reingest_schema():
        """Force re-ingestion of schema embeddings (admin use only)."""
        result = await ingest_schema(force=True)
        return {"status": "ok", "result": result}

    return application


app = create_app()
