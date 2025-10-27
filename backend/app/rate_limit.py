"""
API Rate Limiting using slowapi with Redis backend.

This module provides rate limiting functionality to prevent API abuse:
- Default limits for all endpoints
- Custom limits for specific endpoints
- Redis-backed storage for distributed rate limiting
- Automatic cleanup of expired keys

Industry Best Practices:
- Read operations: Higher limits (200/min)
- Write operations: Lower limits (50/min)
- Delete operations: Strictest limits (20/min)
- Static data: Highest limits (300/min)
"""

from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings


def get_rate_limit_key(request):
    """
    Generate rate limit key based on client identifier.

    Currently uses IP address. In the future with authentication,
    this can be enhanced to use user ID for authenticated users.

    Args:
        request: FastAPI Request object

    Returns:
        str: Rate limit key (IP address)
    """
    # Get remote address
    client_ip = get_remote_address(request)

    # Future enhancement: Use user ID for authenticated users
    # if hasattr(request.state, "user") and request.state.user:
    #     return f"user:{request.state.user.id}"

    return f"ip:{client_ip}"


# Create limiter instance with Redis backend or memory backend
# If Redis is unavailable or disabled, falls back to in-memory storage
try:
    if settings.redis_rate_limit_enabled:
        limiter = Limiter(
            key_func=get_rate_limit_key,
            storage_uri=settings.redis_url,
            default_limits=["100/minute", "1000/hour"],  # Conservative defaults
            strategy="fixed-window",  # Simple and efficient
            enabled=True,
        )
        print("Rate Limiting: Using Redis backend")
    else:
        # Use memory backend when Redis is disabled
        limiter = Limiter(
            key_func=get_rate_limit_key,
            default_limits=["100/minute", "1000/hour"],
            strategy="fixed-window",
            enabled=True,
        )
        print("Rate Limiting: Using in-memory backend (Redis disabled)")
except Exception as e:
    print(f"Rate Limiting: Failed to connect to Redis - {e}")
    print("Rate Limiting: Falling back to in-memory backend")
    # Fallback to memory backend if Redis connection fails
    limiter = Limiter(
        key_func=get_rate_limit_key,
        default_limits=["100/minute", "1000/hour"],
        strategy="fixed-window",
        enabled=True,
    )


def get_rate_limit_exceeded_handler():
    """
    Custom rate limit exceeded handler.

    Returns detailed error message when rate limit is exceeded.
    """

    async def _handler(request, exc: RateLimitExceeded):
        """Handle rate limit exceeded errors."""
        return {
            "error": "Rate limit exceeded",
            "detail": str(exc.detail),
            "limit": exc.detail,
        }

    return _handler
