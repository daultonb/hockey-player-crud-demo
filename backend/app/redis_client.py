"""
Redis client with connection pooling.

This module provides a singleton Redis client that maintains a connection pool
for efficient Redis operations. Uses the async Redis client for compatibility
with FastAPI's async architecture.
"""

from typing import Optional

import redis.asyncio as redis
from redis.asyncio.connection import ConnectionPool

from app.config import settings


class RedisUnavailableError(Exception):
    """Raised when Redis is not available."""
    pass


class RedisClient:
    """
    Singleton Redis client with connection pooling.

    Industry standard pattern for managing Redis connections:
    - Single connection pool shared across the application
    - Automatic connection recovery
    - Thread-safe operations
    - Proper cleanup on shutdown

    Usage:
        redis_client = await RedisClient.get_client()
        await redis_client.set("key", "value")
        value = await redis_client.get("key")
    """

    _pool: Optional[ConnectionPool] = None
    _client: Optional[redis.Redis] = None
    _is_available: Optional[bool] = None

    @classmethod
    async def check_availability(cls) -> bool:
        """
        Check if Redis is available and cache the result.

        This method should be called once during application startup.
        Uses a fast timeout (0.5s) to quickly detect if Redis is unavailable.

        Returns:
            bool: True if Redis is available, False otherwise
        """
        if not settings.redis_enabled:
            print("Redis: Disabled via configuration (REDIS_ENABLED=false)")
            cls._is_available = False
            return False

        try:
            # Create a temporary connection with fast timeout for checking
            temp_pool = ConnectionPool.from_url(
                settings.redis_url,
                max_connections=1,
                decode_responses=True,
                socket_connect_timeout=0.5,  # Fast timeout for availability check
                socket_timeout=0.5,
                retry_on_timeout=False,
            )
            temp_client = redis.Redis(connection_pool=temp_pool)

            # Try to ping Redis
            await temp_client.ping()

            # Clean up temporary connection
            await temp_client.close()
            await temp_pool.disconnect()

            cls._is_available = True
            print(f"Redis: Available ✓ ({settings.redis_url})")
            return True

        except Exception as e:
            cls._is_available = False
            print(f"Redis: Unavailable - caching disabled ({str(e)})")
            return False

    @classmethod
    async def get_client(cls) -> redis.Redis:
        """
        Get or create Redis client with connection pooling.

        Returns:
            redis.Redis: Configured Redis client instance

        Raises:
            RedisUnavailableError: If Redis is known to be unavailable

        Note:
            This method is idempotent - calling it multiple times
            returns the same client instance.
        """
        # Check if availability has been tested
        if cls._is_available is False:
            raise RedisUnavailableError("Redis is not available")

        if cls._client is None:
            print("Redis: Initializing connection pool...")
            cls._pool = ConnectionPool.from_url(
                settings.redis_url,
                max_connections=10,
                decode_responses=True,  # Automatically decode bytes to strings
                socket_connect_timeout=0.5,  # Reduced from 5s for faster failure
                socket_timeout=0.5,  # Reduced from 5s for faster failure
                retry_on_timeout=False,  # Don't retry on timeout
            )
            cls._client = redis.Redis(connection_pool=cls._pool)
            print(f"Redis: Connected to {settings.redis_url}")

        return cls._client

    @classmethod
    async def close(cls):
        """
        Close Redis connection pool.

        Should be called during application shutdown to ensure
        all connections are properly closed.
        """
        if cls._client:
            await cls._client.close()
            print("Redis: Client connection closed")

        if cls._pool:
            await cls._pool.disconnect()
            print("Redis: Connection pool disconnected")

        cls._client = None
        cls._pool = None

    @classmethod
    async def ping(cls) -> bool:
        """
        Test Redis connectivity.

        Returns:
            bool: True if Redis is reachable, False otherwise
        """
        try:
            client = await cls.get_client()
            response = await client.ping()
            return response is True
        except Exception as e:
            print(f"Redis: Ping failed - {str(e)}")
            return False

    @classmethod
    async def get_info(cls) -> dict:
        """
        Get Redis server information.

        Returns:
            dict: Redis server info including stats, memory usage, etc.
        """
        try:
            client = await cls.get_client()
            info = await client.info()
            return info
        except Exception as e:
            print(f"Redis: Failed to get info - {str(e)}")
            return {}
