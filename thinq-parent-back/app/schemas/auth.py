from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SignupRequest(BaseModel):
    login_id: str = Field(min_length=4, max_length=50)
    password: str = Field(min_length=6, max_length=100)
    name: str = Field(min_length=1, max_length=100)

    @field_validator("login_id", "name")
    @classmethod
    def strip_text(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Value is required.")
        return stripped


class LoginRequest(BaseModel):
    login_id: str = Field(min_length=4, max_length=50)
    password: str = Field(min_length=6, max_length=100)

    @field_validator("login_id")
    @classmethod
    def strip_login_id(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Login ID is required.")
        return stripped


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    login_id: str
    name: str
    created_at: datetime


class AuthSessionResponse(BaseModel):
    session_token: str
    user: UserProfile
