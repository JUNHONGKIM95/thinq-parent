from __future__ import annotations

import base64
import hashlib
import hmac
import os
import secrets

PBKDF2_ITERATIONS = 600_000


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii")


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value.encode("ascii"))


def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password is required.")

    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${_b64encode(salt)}${_b64encode(digest)}"


def verify_password(password: str, encoded_password: str) -> bool:
    try:
        _, iteration_value, salt_value, digest_value = encoded_password.split("$", maxsplit=3)
        iterations = int(iteration_value)
        salt = _b64decode(salt_value)
        expected_digest = _b64decode(digest_value)
    except (TypeError, ValueError):
        return False

    candidate_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
    )
    return hmac.compare_digest(candidate_digest, expected_digest)


def create_session_token() -> str:
    return secrets.token_urlsafe(48)
