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
    app_name: str = os.getenv("APP_NAME", "")
    app_version: str = os.getenv("APP_VERSION", "")
    debug_mode: bool = os.getenv("DEBUG_MODE", "true").lower() == "true"
    
    # Database settings
    database_url: str = os.getenv("DATABASE_URL", "")
    
    # API settings
    api_host: str = os.getenv("API_HOST", "")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    
    # CORS settings
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "")
    
    def get_allowed_origins_list(self) -> List[str]:
        """Parse allowed origins from comma-separated string to list."""
        if self.allowed_origins:
            return [origin.strip() for origin in self.allowed_origins.split(',')]
        return []

# Create global settings instance
settings = Settings()