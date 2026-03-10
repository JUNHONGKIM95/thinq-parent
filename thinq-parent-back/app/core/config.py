from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="Thinq Parent API", validation_alias="APP_NAME")
    app_version: str = Field(default="0.1.0", validation_alias="APP_VERSION")
    environment: str = Field(default="local", validation_alias="APP_ENVIRONMENT")
    debug: bool = Field(default=True, validation_alias="APP_DEBUG")
    api_v1_prefix: str = Field(default="/api/v1", validation_alias="APP_API_V1_PREFIX")
    frontend_origins_raw: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        validation_alias="APP_FRONTEND_ORIGINS",
    )

    oracle_host: str = Field(default="localhost", validation_alias="ORACLE_HOST")
    oracle_port: int = Field(default=1521, validation_alias="ORACLE_PORT")
    oracle_service_name: str | None = Field(default="XE", validation_alias="ORACLE_SERVICE_NAME")
    oracle_sid: str | None = Field(default=None, validation_alias="ORACLE_SID")
    oracle_username: str = Field(default="lghr", validation_alias="ORACLE_USERNAME")
    oracle_password: str = Field(default="12345", validation_alias="ORACLE_PASSWORD")
    oracle_use_thick_mode: bool = Field(default=True, validation_alias="ORACLE_USE_THICK_MODE")
    oracle_client_lib_dir: str | None = Field(default=None, validation_alias="ORACLE_CLIENT_LIB_DIR")
    oracle_echo_sql: bool = Field(default=False, validation_alias="ORACLE_ECHO_SQL")
    oracle_max_identifier_length: int = Field(default=30, validation_alias="ORACLE_MAX_IDENTIFIER_LENGTH")
    auth_session_hours: int = Field(default=12, validation_alias="AUTH_SESSION_HOURS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def frontend_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
