"""
Tests for Redis infrastructure.

This module tests the Redis client functionality including:
- Connection pooling
- Ping/health checks
- Error handling
"""

import pytest

from app.redis_client import RedisClient


class TestRedisClient:
    """Test Redis client functionality."""

    @pytest.mark.asyncio
    async def test_redis_client_singleton(self):
        """
        Test that RedisClient returns the same instance.
        Input: Multiple get_client() calls
        Expected: Same client instance returned
        """
        client1 = await RedisClient.get_client()
        client2 = await RedisClient.get_client()

        assert client1 is client2, "RedisClient should be a singleton"

    @pytest.mark.asyncio
    async def test_redis_ping(self):
        """
        Test Redis connectivity with ping.
        Input: Ping command
        Expected: Returns True when Redis is available
        """
        result = await RedisClient.ping()

        assert result is True, "Redis ping should return True"

    @pytest.mark.asyncio
    async def test_redis_get_client_creates_pool(self):
        """
        Test that get_client creates a connection pool.
        Input: First get_client() call
        Expected: Connection pool is created
        """
        # Get client (should already exist from other tests)
        client = await RedisClient.get_client()

        assert client is not None, "Client should be created"
        assert RedisClient._pool is not None, "Connection pool should be created"

    @pytest.mark.asyncio
    async def test_redis_basic_operations(self):
        """
        Test basic Redis SET/GET operations.
        Input: Set key-value pair, then retrieve it
        Expected: Value is correctly stored and retrieved
        """
        client = await RedisClient.get_client()

        # Set a test value
        test_key = "test_redis_key"
        test_value = "test_redis_value"

        await client.set(test_key, test_value)

        # Get the value back
        result = await client.get(test_key)

        assert result == test_value, f"Expected {test_value}, got {result}"

        # Clean up
        await client.delete(test_key)

    @pytest.mark.asyncio
    async def test_redis_key_with_ttl(self):
        """
        Test Redis key with TTL (Time To Live).
        Input: Set key with TTL
        Expected: Key is set with TTL successfully
        """
        client = await RedisClient.get_client()

        test_key = "test_ttl_key"
        test_value = "test_value"

        # Set key with 60 second TTL
        await client.setex(test_key, 60, test_value)

        # Verify key exists
        result = await client.get(test_key)
        assert result == test_value, "Key should exist"

        # Verify TTL is set
        ttl = await client.ttl(test_key)
        assert ttl > 0 and ttl <= 60, f"TTL should be set, got {ttl}"

        # Clean up
        await client.delete(test_key)

    @pytest.mark.asyncio
    async def test_redis_get_info(self):
        """
        Test getting Redis server information.
        Input: get_info() call
        Expected: Returns dictionary with server info
        """
        info = await RedisClient.get_info()

        assert isinstance(info, dict), "Info should be a dictionary"
        assert len(info) > 0, "Info should contain data"
        # Check for common Redis info keys
        assert "redis_version" in info or "server" in str(info).lower()


class TestRedisHealthCheck:
    """Test Redis health check integration."""

    @pytest.mark.integration
    def test_health_endpoint_includes_redis_status(self, client):
        """
        Test that health endpoint reports Redis status.
        Input: GET /health
        Expected: Response includes redis status
        """
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()

        assert "redis" in data, "Health check should include Redis status"
        assert data["redis"] in ["connected", "disconnected", "unknown"], \
            f"Redis status should be valid, got: {data['redis']}"

    @pytest.mark.integration
    def test_health_endpoint_redis_connected(self, client):
        """
        Test that Redis shows as connected when available.
        Input: GET /health with Redis running
        Expected: redis status is "connected"
        """
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()

        # Redis should be connected if containers are running
        assert data["redis"] == "connected", \
            "Redis should be connected (ensure Docker containers are running)"
        assert data["status"] == "healthy", \
            "Overall status should be healthy when Redis is connected"
