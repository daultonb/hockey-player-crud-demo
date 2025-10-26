"""
Redis caching service for API responses.

This module provides caching functionality for common queries:
- Player listings with search/filter parameters
- Individual player details
- Team listings
- Automatic cache invalidation on data updates

Industry Best Practices:
- Short TTL for frequently changing data (5 minutes)
- Cache key namespacing for easy invalidation
- JSON serialization for complex objects
- Graceful degradation if Redis is unavailable
"""

import json
from typing import Any, Optional

from app.config import settings
from app.redis_client import RedisClient


class CacheService:
    """Service for managing Redis cache operations."""

    @staticmethod
    def _generate_key(namespace: str, identifier: str) -> str:
        """
        Generate a consistent cache key.

        Args:
            namespace: The cache namespace (e.g., 'players', 'teams')
            identifier: Unique identifier for this cache entry

        Returns:
            str: Formatted cache key
        """
        return f"cache:{namespace}:{identifier}"

    @staticmethod
    async def get(namespace: str, identifier: str) -> Optional[Any]:
        """
        Get a value from cache.

        Args:
            namespace: The cache namespace
            identifier: Unique identifier for this cache entry

        Returns:
            The cached value (deserialized from JSON), or None if not found
        """
        try:
            client = await RedisClient.get_client()
            key = CacheService._generate_key(namespace, identifier)
            value = await client.get(key)

            if value:
                print(f"Cache: HIT for {key}")
                return json.loads(value)
            else:
                print(f"Cache: MISS for {key}")
                return None

        except Exception as e:
            print(f"Cache: Failed to get {namespace}:{identifier} - {e}")
            # Graceful degradation - return None if cache fails
            return None

    @staticmethod
    async def set(
        namespace: str,
        identifier: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Set a value in cache with optional TTL.

        Args:
            namespace: The cache namespace
            identifier: Unique identifier for this cache entry
            value: The value to cache (will be JSON serialized)
            ttl: Time to live in seconds (defaults to config setting)

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            client = await RedisClient.get_client()
            key = CacheService._generate_key(namespace, identifier)
            serialized = json.dumps(value)

            # Use configured TTL if not specified
            cache_ttl = ttl if ttl is not None else settings.redis_cache_ttl

            await client.setex(key, cache_ttl, serialized)
            print(f"Cache: SET {key} (TTL: {cache_ttl}s)")
            return True

        except Exception as e:
            print(f"Cache: Failed to set {namespace}:{identifier} - {e}")
            # Graceful degradation - continue without caching
            return False

    @staticmethod
    async def delete(namespace: str, identifier: str) -> bool:
        """
        Delete a specific cache entry.

        Args:
            namespace: The cache namespace
            identifier: Unique identifier for this cache entry

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            client = await RedisClient.get_client()
            key = CacheService._generate_key(namespace, identifier)
            await client.delete(key)
            print(f"Cache: DELETED {key}")
            return True

        except Exception as e:
            print(f"Cache: Failed to delete {namespace}:{identifier} - {e}")
            return False

    @staticmethod
    async def delete_pattern(pattern: str) -> int:
        """
        Delete all cache entries matching a pattern.

        Useful for invalidating groups of related cache entries.

        Args:
            pattern: Redis key pattern (e.g., 'cache:players:*')

        Returns:
            int: Number of keys deleted
        """
        try:
            client = await RedisClient.get_client()
            keys = await client.keys(pattern)

            if keys:
                deleted = await client.delete(*keys)
                print(f"Cache: DELETED {deleted} keys matching {pattern}")
                return deleted
            else:
                print(f"Cache: No keys found matching {pattern}")
                return 0

        except Exception as e:
            print(f"Cache: Failed to delete pattern {pattern} - {e}")
            return 0

    @staticmethod
    async def invalidate_players() -> None:
        """
        Invalidate all player-related cache entries.

        Called when player data is created, updated, or deleted.
        """
        # Invalidate all player listings (various query combinations)
        await CacheService.delete_pattern("cache:players:list:*")
        # Invalidate all individual player caches
        await CacheService.delete_pattern("cache:players:detail:*")
        print("Cache: Invalidated all player caches")

    @staticmethod
    async def invalidate_player(player_id: int) -> None:
        """
        Invalidate cache for a specific player.

        Args:
            player_id: The ID of the player to invalidate
        """
        # Invalidate the specific player detail
        await CacheService.delete("players:detail", str(player_id))
        # Also invalidate all player listings since they might include this player
        await CacheService.delete_pattern("cache:players:list:*")
        print(f"Cache: Invalidated player {player_id}")

    @staticmethod
    def generate_query_key(base: str, **params) -> str:
        """
        Generate a consistent cache key for query parameters.

        Args:
            base: Base identifier (e.g., 'all' for all players)
            **params: Query parameters to include in the key

        Returns:
            str: Cache key identifier including sorted params
        """
        # Sort params for consistency
        sorted_params = sorted(params.items())
        param_str = "&".join(f"{k}={v}" for k, v in sorted_params if v is not None)

        if param_str:
            return f"{base}?{param_str}"
        return base
