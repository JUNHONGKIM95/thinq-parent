from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import get_session_factory

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def read_health() -> dict[str, str]:
    return {"status": "ok", "service": "thinq-parent-back"}


@router.get("/db")
def read_database_health() -> dict[str, str]:
    try:
        session_factory = get_session_factory()
        with session_factory() as session:
            session.execute(text("SELECT 1 FROM DUAL"))
        return {"status": "ok", "database": "oracle"}
    except (RuntimeError, SQLAlchemyError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
