import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "DI Companion Chat API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Server config
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS config
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:1337",
        "https://di.sce.de"
    ]
    
    # Gemini config
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
    GEMINI_TEMPERATURE: float = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
    GEMINI_MAX_TOKENS: int = int(os.getenv("GEMINI_MAX_TOKENS", "1000"))
    
    # Add more CORS origins from environment
    additional_origins = os.getenv("ADDITIONAL_CORS_ORIGINS", "")
    if additional_origins:
        BACKEND_CORS_ORIGINS.extend(additional_origins.split(","))

settings = Settings()