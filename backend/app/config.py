import os
import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """
    Application settings loaded from environment variables.
    All values come from .env file - no defaults in code.
    """
    # Application info
    app_name: str = os.getenv("APP_NAME", "Hockey Player CRUD API")
    app_version: str = os.getenv("APP_VERSION", "1.0.0")
    debug_mode: bool = os.getenv("DEBUG_MODE", "true").lower() == "true"
    
    # Database settings
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./hockey_players.db")
    
    # API settings
    api_host: str = os.getenv("API_HOST", "127.0.0.1")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    
    # CORS settings
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    
    def get_allowed_origins_list(self) -> List[str]:
        """Parse allowed origins from comma-separated string to list."""
        if self.allowed_origins:
            return [origin.strip() for origin in self.allowed_origins.split(',')]
        return []

# Create global settings instance
settings = Settings()