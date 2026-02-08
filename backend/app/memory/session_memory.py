"""
session_memory.py — Short-term conversational memory.

Tracks the ongoing conversation within a single session:
  - Recent user queries and assistant responses
  - Clarifications and follow-up intents
  - SQL generated in previous turns

Storage: in-memory dict keyed by session_id (Redis-ready abstraction).
Not persisted long-term.  Automatically evicts old turns when the
configured maximum is reached.

Design Note:
  The ``SessionStore`` protocol can be swapped for a Redis implementation
  later without changing any calling code.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Protocol, runtime_checkable

from app.core.config import get_settings

logger = logging.getLogger(__name__)


# ── Data structures ─────────────────────────────────────────────────────


@dataclass
class ConversationTurn:
    """A single turn in the conversation."""

    role: str  # "user" or "assistant"
    content: str
    sql: str | None = None
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass
class Session:
    """Full session state for one user session."""

    session_id: str
    user_id: str
    turns: list[ConversationTurn] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def add_turn(self, role: str, content: str, sql: str | None = None) -> None:
        """Append a turn, evicting oldest if over limit."""
        settings = get_settings()
        self.turns.append(ConversationTurn(role=role, content=content, sql=sql))
        # Evict oldest turns beyond the configured maximum
        if len(self.turns) > settings.SESSION_MAX_TURNS:
            self.turns = self.turns[-settings.SESSION_MAX_TURNS :]

    def get_context_messages(self, last_n: int = 6) -> list[dict]:
        """
        Return the last *n* turns formatted as OpenAI-style messages
        for injection into the LLM prompt.
        """
        recent = self.turns[-last_n:]
        return [{"role": t.role, "content": t.content} for t in recent]

    def reset(self) -> None:
        """Clear all turns (user can start fresh)."""
        self.turns.clear()


# ── Store abstraction (Redis-ready) ─────────────────────────────────────


@runtime_checkable
class SessionStore(Protocol):
    """Protocol for session storage backends."""

    async def get(self, session_id: str, user_id: str) -> Session: ...
    async def save(self, session: Session) -> None: ...
    async def delete(self, session_id: str) -> None: ...


class InMemorySessionStore:
    """
    Default in-memory implementation.  Drop-in replaceable with a Redis
    store that implements the same ``SessionStore`` protocol.
    """

    def __init__(self) -> None:
        self._store: dict[str, Session] = {}

    async def get(self, session_id: str, user_id: str) -> Session:
        """Retrieve or create a session."""
        if session_id not in self._store:
            session = Session(session_id=session_id, user_id=user_id)
            self._store[session_id] = session
            logger.debug("Created new session: %s", session_id)
        return self._store[session_id]

    async def save(self, session: Session) -> None:
        """Persist session state (no-op for in-memory; write-through for Redis)."""
        self._store[session.session_id] = session

    async def delete(self, session_id: str) -> None:
        """Remove a session."""
        self._store.pop(session_id, None)
        logger.debug("Deleted session: %s", session_id)


# ── Module-level singleton ──────────────────────────────────────────────

_session_store: SessionStore | None = None


def get_session_store() -> SessionStore:
    """Return the module-level session store singleton."""
    global _session_store
    if _session_store is None:
        _session_store = InMemorySessionStore()
    return _session_store
