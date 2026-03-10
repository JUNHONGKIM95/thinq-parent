from collections.abc import Generator

import oracledb
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None


class Base(DeclarativeBase):
    pass


def _initialize_oracle_client() -> None:
    if not settings.oracle_use_thick_mode:
        return

    lib_dir = settings.oracle_client_lib_dir or None
    try:
        if lib_dir:
            oracledb.init_oracle_client(lib_dir=lib_dir)
        else:
            oracledb.init_oracle_client()
    except Exception as exc:
        message = str(exc)
        if "init_oracle_client() has already been called" in message or "DPY-2017" in message:
            return
        raise RuntimeError(
            "Oracle thick mode initialization failed. Set ORACLE_CLIENT_LIB_DIR or add Oracle Instant Client to PATH."
        ) from exc


def _build_database_url() -> URL:
    query: dict[str, str] = {}
    if settings.oracle_sid:
        query["sid"] = settings.oracle_sid
    elif settings.oracle_service_name:
        query["service_name"] = settings.oracle_service_name
    else:
        raise RuntimeError("Set ORACLE_SERVICE_NAME or ORACLE_SID in the environment.")

    return URL.create(
        drivername="oracle+oracledb",
        username=settings.oracle_username,
        password=settings.oracle_password,
        host=settings.oracle_host,
        port=settings.oracle_port,
        query=query,
    )


def get_engine() -> Engine:
    global _engine

    if _engine is None:
        _initialize_oracle_client()
        _engine = create_engine(
            _build_database_url(),
            echo=settings.oracle_echo_sql,
            pool_pre_ping=True,
            max_identifier_length=settings.oracle_max_identifier_length,
        )
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    global _session_factory

    if _session_factory is None:
        _session_factory = sessionmaker(
            bind=get_engine(),
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
            class_=Session,
        )
    return _session_factory


def get_db_session() -> Generator[Session, None, None]:
    session = get_session_factory()()
    try:
        yield session
    finally:
        session.close()
