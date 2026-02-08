"""
security.py — Authentication & authorization utilities.

Provides JWT creation / verification and a FastAPI dependency to extract
the current user from the Authorization header.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_bearer_scheme = HTTPBearer(auto_error=False)


# ── Token helpers ───────────────────────────────────────────────────────


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a signed JWT containing *data* as claims.

    Parameters
    ----------
    data : dict
        Payload claims (must include ``sub`` for the user identifier).
    expires_delta : timedelta, optional
        Custom expiry; defaults to config JWT_EXPIRY_MINUTES.

    Returns
    -------
    str
        Encoded JWT string.
    """
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    """
    Decode and verify a JWT.  Raises HTTPException on failure.

    Returns
    -------
    dict
        Decoded payload.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError as exc:
        logger.warning("JWT verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


# ── FastAPI dependency ──────────────────────────────────────────────────


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> dict:
    """
    FastAPI dependency that extracts and verifies the JWT from the
    Authorization header.

    Returns the decoded payload dict which includes at minimum:
      - ``sub``  (user_id as string)
      - ``role`` (user role)

    For development convenience, if no token is provided, a default
    anonymous user is returned (disable this in production by setting
    DEBUG=False).
    """
    settings = get_settings()

    if credentials is None or credentials.credentials == "":
        if settings.DEBUG:
            # Allow anonymous access during development
            return {"sub": "1", "role": "analyst", "username": "dev_user"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )

    return verify_token(credentials.credentials)
