from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://dental_dev:dental_dev_pass@localhost:5432/dental_clinic_dev"
    JWT_SECRET: str = "change-me-to-a-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ADMIN_ACCESS_TOKEN_EXPIRE_DAYS: int = 30
    ADMIN_COOKIE_NAME: str = "admin_session"
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    @property
    def cookie_secure(self) -> bool:
        return not any("localhost" in o for o in self.CORS_ORIGINS)

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

if settings.JWT_SECRET == "change-me-to-a-random-secret-key":
    raise ValueError("JWT_SECRET must be changed from the default value. Set it in .env.")
