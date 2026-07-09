from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@localhost:5432/scoutit"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Auth
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Nominatim (self-hosted)
    NOMINATIM_URL: str = "http://localhost:8080"

    # Clustering
    CLUSTER_CACHE_TTL: int = 300  # seconds

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # OpenAI / Gemini (Phase 3)
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""


settings = Settings()
