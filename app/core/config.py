from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "Trading API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    SECRET_KEY: str = "super-secret-default-key-change-in-production"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    HUGGINGFACE_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()