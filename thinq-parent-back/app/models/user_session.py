from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Sequence, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

session_id_sequence = Sequence("THP_USER_SESSION_SEQ")


class UserSession(Base):
    __tablename__ = "THP_USER_SESSION"

    id: Mapped[int] = mapped_column(Integer, session_id_sequence, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("THP_USER.id"), nullable=False, index=True)
    session_token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    last_accessed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    user: Mapped["User"] = relationship(back_populates="sessions")
