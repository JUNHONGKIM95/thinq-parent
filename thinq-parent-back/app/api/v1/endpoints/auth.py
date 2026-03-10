from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.schemas.auth import AuthSessionResponse, LoginRequest, SignupRequest, UserProfile
from app.services.auth_service import (
    AuthenticationError,
    DuplicateLoginIdError,
    get_user_from_session_token,
    login_user,
    logout_user_session,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def get_session_token(
    authorization: Annotated[str | None, Header()] = None,
    x_session_token: Annotated[str | None, Header()] = None,
) -> str:
    if authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization must use the Bearer scheme.",
            )
        return token.strip()

    if x_session_token:
        return x_session_token.strip()

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="A session token is required.",
    )


@router.post("/signup", response_model=AuthSessionResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db_session)) -> AuthSessionResponse:
    try:
        return register_user(db, payload)
    except DuplicateLoginIdError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/login", response_model=AuthSessionResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db_session)) -> AuthSessionResponse:
    try:
        return login_user(db, payload)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.get("/me", response_model=UserProfile)
def me(
    session_token: str = Depends(get_session_token),
    db: Session = Depends(get_db_session),
) -> UserProfile:
    try:
        return get_user_from_session_token(db, session_token)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    session_token: str = Depends(get_session_token),
    db: Session = Depends(get_db_session),
) -> Response:
    logout_user_session(db, session_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
