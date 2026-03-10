from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_session import UserSession


def get_user_by_login_id(db: Session, login_id: str) -> User | None:
    statement = select(User).where(User.login_id == login_id)
    return db.scalar(statement)


def create_user(db: Session, login_id: str, password_hash: str, name: str) -> User:
    user = User(login_id=login_id, password_hash=password_hash, name=name)
    db.add(user)
    db.flush()
    db.refresh(user)
    return user


def get_session_by_token(db: Session, session_token: str) -> UserSession | None:
    statement = select(UserSession).where(UserSession.session_token == session_token)
    return db.scalar(statement)


def create_session(db: Session, user_id: int, session_token: str, expires_at: datetime) -> UserSession:
    user_session = UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at,
        last_accessed_at=datetime.utcnow(),
    )
    db.add(user_session)
    db.flush()
    db.refresh(user_session)
    return user_session


def delete_session(db: Session, user_session: UserSession) -> None:
    db.delete(user_session)
