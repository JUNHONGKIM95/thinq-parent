from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_session_token, hash_password, verify_password
from app.models.user import User
from app.models.user_session import UserSession
from app.repositories.auth_repository import (
    create_session,
    create_user,
    delete_session,
    get_session_by_token,
    get_user_by_login_id,
)
from app.schemas.auth import AuthSessionResponse, LoginRequest, SignupRequest, UserProfile

settings = get_settings()


class AuthenticationError(Exception):
    pass


class DuplicateLoginIdError(Exception):
    pass


def build_user_profile(user: User) -> UserProfile:
    return UserProfile(
        user_id=user.id,
        login_id=user.login_id,
        name=user.name,
        created_at=user.created_at,
    )


def build_auth_response(user: User, session_token: str) -> AuthSessionResponse:
    return AuthSessionResponse(session_token=session_token, user=build_user_profile(user))


def _build_session_expiry() -> datetime:
    return datetime.utcnow() + timedelta(hours=settings.auth_session_hours)


def register_user(db: Session, payload: SignupRequest) -> AuthSessionResponse:
    existing_user = get_user_by_login_id(db, payload.login_id)
    if existing_user is not None:
        raise DuplicateLoginIdError("This login ID is already in use.")

    try:
        user = create_user(
            db=db,
            login_id=payload.login_id,
            password_hash=hash_password(payload.password),
            name=payload.name,
        )
        session_token = create_session_token()
        create_session(db, user_id=user.id, session_token=session_token, expires_at=_build_session_expiry())
        db.commit()
    except Exception:
        db.rollback()
        raise

    return build_auth_response(user, session_token)


def login_user(db: Session, payload: LoginRequest) -> AuthSessionResponse:
    user = get_user_by_login_id(db, payload.login_id)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise AuthenticationError("Login ID or password is incorrect.")

    try:
        session_token = create_session_token()
        create_session(db, user_id=user.id, session_token=session_token, expires_at=_build_session_expiry())
        db.commit()
    except Exception:
        db.rollback()
        raise

    return build_auth_response(user, session_token)


def _validate_session(db: Session, session_token: str) -> UserSession:
    user_session = get_session_by_token(db, session_token)
    if user_session is None:
        raise AuthenticationError("A valid session is required.")

    if user_session.expires_at <= datetime.utcnow():
        try:
            delete_session(db, user_session)
            db.commit()
        except Exception:
            db.rollback()
        raise AuthenticationError("Your session has expired. Please log in again.")

    return user_session


def get_user_from_session_token(db: Session, session_token: str) -> UserProfile:
    user_session = _validate_session(db, session_token)

    try:
        user_session.last_accessed_at = datetime.utcnow()
        db.commit()
    except Exception:
        db.rollback()
        raise

    return build_user_profile(user_session.user)


def logout_user_session(db: Session, session_token: str) -> None:
    user_session = get_session_by_token(db, session_token)
    if user_session is None:
        return

    try:
        delete_session(db, user_session)
        db.commit()
    except Exception:
        db.rollback()
        raise
