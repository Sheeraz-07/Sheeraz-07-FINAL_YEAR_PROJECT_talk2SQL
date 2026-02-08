"""
longcat_client.py — Encapsulated LLM client for LongCat (OpenAI-compatible).

All LLM interactions go through this module.  Nothing else in the codebase
should import openai directly.

Features:
  - Custom base_url pointing to LongCat
  - Controlled temperature and max_tokens
  - No streaming — single chat-completion call
  - Async for FastAPI compatibility
"""

from __future__ import annotations

import logging
from typing import Optional

from openai import AsyncOpenAI

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ── Singleton client ────────────────────────────────────────────────────

_client: Optional[AsyncOpenAI] = None


def _get_client() -> AsyncOpenAI:
    """Lazy-init the AsyncOpenAI client pointed at LongCat."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = AsyncOpenAI(
            api_key=settings.LONGCAT_API_KEY,
            base_url=settings.LONGCAT_API_BASE,
        )
    return _client


# ── Public helpers ──────────────────────────────────────────────────────


async def chat_completion(
    messages: list[dict],
    *,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    model: Optional[str] = None,
) -> str:
    """
    Send a chat-completion request to LongCat and return the assistant
    message content as a plain string.

    Parameters
    ----------
    messages : list[dict]
        OpenAI-style message list, e.g.
        [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}]
    temperature : float, optional
        Override the default temperature from config.
    max_tokens : int, optional
        Override the default max_tokens from config.
    model : str, optional
        Override the default model from config.

    Returns
    -------
    str
        The assistant's response text (stripped).
    """
    settings = get_settings()
    client = _get_client()

    response = await client.chat.completions.create(
        model=model or settings.LONGCAT_MODEL,
        messages=messages,
        temperature=temperature if temperature is not None else settings.LONGCAT_TEMPERATURE,
        max_tokens=max_tokens or settings.LONGCAT_MAX_TOKENS,
        stream=False,
    )

    content = response.choices[0].message.content or ""
    logger.debug("LLM response tokens: %s", response.usage)
    return content.strip()


async def generate_embedding(text: str) -> list[float]:
    """
    Generate a vector embedding for the given text using the configured
    embedding model.

    Parameters
    ----------
    text : str
        The text to embed.

    Returns
    -------
    list[float]
        The embedding vector.
    """
    settings = get_settings()
    client = _get_client()

    response = await client.embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=text,
        dimensions=settings.EMBEDDING_DIMENSIONS,
    )

    return response.data[0].embedding
