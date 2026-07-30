from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://dental_dev:dental_dev_pass@localhost:5432/dental_clinic_dev"
    JWT_SECRET: str = "change-me-to-a-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
