"""
config.py — Central configuration for the Talk2SQL backend.

All secrets and environment variables are loaded here via pydantic-settings.
No secret should ever be hardcoded; every credential is read from .env or
environment variables at startup.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide configuration sourced from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── FastAPI ──────────────────────────────────────────────────────────
    APP_TITLE: str = "Talk2SQL Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:3000"  # comma-separated origins

    # ── Supabase / PostgreSQL ────────────────────────────────────────────
    # TODO: Replace with your Supabase database URL
    SUPABASE_DB_URL: str = "postgresql+asyncpg://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres"
    SUPABASE_URL: str = "https://<PROJECT_REF>.supabase.co"
    SUPABASE_ANON_KEY: str = "<ANON_KEY>"
    SUPABASE_SERVICE_ROLE_KEY: str = "<SERVICE_ROLE_KEY>"

    # ── LongCat LLM ────────────────────────────────────────────────────
    # TODO: Set your LongCat API base URL and key
    LONGCAT_API_BASE: str = "https://api.longcat.chat/openai/"
    LONGCAT_API_KEY: str = "<LONGCAT_API_KEY>"
    LONGCAT_MODEL: str = "longcat-flash-chat"
    LONGCAT_TEMPERATURE: float = 0.0
    LONGCAT_MAX_TOKENS: int = 1024

    # ── Embedding model (used for schema + memory vectors) ──────────────
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # ── pgvector ─────────────────────────────────────────────────────────
    VECTOR_TABLE_SCHEMA: str = "schema_embeddings"
    VECTOR_TABLE_MEMORY: str = "memory_embeddings"

    # ── JWT / Auth ──────────────────────────────────────────────────────
    JWT_SECRET: str = "super-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60 * 24  # 24 hours

    # ── Session memory ──────────────────────────────────────────────────
    SESSION_MAX_TURNS: int = 20

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton so settings are read once at startup."""
    return Settings()
