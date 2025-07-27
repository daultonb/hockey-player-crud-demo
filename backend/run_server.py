import uvicorn
from app.config import settings

if __name__ == "__main__":
    """
    Production-ready server runner that uses environment variables.
    """
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug_mode,
        log_level="debug" if settings.debug_mode else "info"
    )