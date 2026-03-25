"""
sql_server.py - SQL Server connectivity helper (pyodbc).
"""

from __future__ import annotations

import pyodbc

from app.core.config import get_settings


def get_sql_server_connection() -> pyodbc.Connection:
    """Create a new SQL Server connection using configured credentials."""
    settings = get_settings()
    return pyodbc.connect(settings.sql_server_connection_string)
