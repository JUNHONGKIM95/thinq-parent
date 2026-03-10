from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, Sequence, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

user_id_sequence = Sequence("THP_USER_SEQ")


class User(Base):
    __tablename__ = "THP_USER"

    id: Mapped[int] = mapped_column(Integer, user_id_sequence, primary_key=True)
    login_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
    sessions: Mapped[list["UserSession"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
