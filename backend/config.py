from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    supabase_service_key: str | None = None
    ai_provider: str = "groq"
    groq_api_key: str
    xai_base_url: str = "https://api.x.ai/v1"
    xai_model: str = "grok-3-mini"
    gemini_api_key: str | None = None
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"
    gemini_model: str = "gemini-2.0-flash"
    supabase_redirect: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
