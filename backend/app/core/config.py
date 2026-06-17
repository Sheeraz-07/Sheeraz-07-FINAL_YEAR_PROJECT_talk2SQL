"""
config.py — Central configuration for the Talk2SQL backend.

All secrets and environment variables are loaded here via pydantic-settings.
No secret should ever be hardcoded; every credential is read from .env or
environment variables at startup.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


_BACKEND_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    """Application-wide configuration sourced from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=str(_BACKEND_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── FastAPI ──────────────────────────────────────────────────────────
    APP_TITLE: str = "Talk2SQL Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:3000"  # comma-separated origins

    # ── Supabase / PostgreSQL ────────────────────────────────────────────
    SUPABASE_DB_URL: str
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # ── SQL Server (FurnitureFactoryDB) ──────────────────────────────────
    SQLSERVER_DRIVER: str = "ODBC Driver 18 for SQL Server"
    SQLSERVER_HOST: str
    SQLSERVER_PORT: int = 1433
    SQLSERVER_DB_NAME: str
    SQLSERVER_USER: str
    SQLSERVER_PASSWORD: str
    SQLSERVER_ENCRYPT: str = "yes"
    SQLSERVER_TRUST_SERVER_CERTIFICATE: str = "yes"
    SQLSERVER_CONNECTION_TIMEOUT: int = 5

    # ── LongCat LLM ────────────────────────────────────────────────────
    # TODO: Set your LongCat API base URL and key
    LONGCAT_API_BASE: str = "https://api.longcat.chat/openai/"
    LONGCAT_API_KEY: str = "<LONGCAT_API_KEY>"
    LONGCAT_MODEL: str = "LongCat-2.0-Preview"
    LONGCAT_TEMPERATURE: float = 0.0
    LONGCAT_MAX_TOKENS: int = 1024

    # ── Embedding model (reserved for optional memory features) ─────────
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

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

    @property
    def sql_server_connection_string(self) -> str:
        """Build ODBC connection string for SQL Server."""
        return (
            f"DRIVER={{{self.SQLSERVER_DRIVER}}};"
            f"SERVER={self.SQLSERVER_HOST},{self.SQLSERVER_PORT};"
            f"DATABASE={self.SQLSERVER_DB_NAME};"
            f"UID={self.SQLSERVER_USER};"
            f"PWD={self.SQLSERVER_PASSWORD};"
            f"Encrypt={self.SQLSERVER_ENCRYPT};"
            f"TrustServerCertificate={self.SQLSERVER_TRUST_SERVER_CERTIFICATE};"
            f"Connection Timeout={self.SQLSERVER_CONNECTION_TIMEOUT};"
        )


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton so settings are read once at startup."""
    return Settings()
