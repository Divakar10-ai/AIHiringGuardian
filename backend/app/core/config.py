import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Hiring Guardian API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aihiringguardian.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:8000")

    class Config:
        env_file = ".env"

settings = Settings()
