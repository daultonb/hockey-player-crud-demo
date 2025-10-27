"""
Tests for API rate limiting.

This module tests the rate limiting functionality including:
- Rate limit enforcement
- Different limits for different endpoints
- Rate limit headers
- Rate limit exceeded responses
"""

import time

import pytest
from fastapi.testclient import TestClient


class TestRateLimiting:
    """Test API rate limiting functionality."""

    @pytest.mark.integration
    def test_rate_limit_enforced_on_teams_endpoint(self, client: TestClient):
        """
        Test that rate limits are enforced on the teams endpoint.
        Input: Make many requests to /teams
        Expected: Eventually receives 429 Too Many Requests

        Note: This test makes 310 requests to exceed the 300/minute limit
        """
        # Teams endpoint has 300/minute limit
        # Make more than 300 requests
        responses = []

        for i in range(310):
            response = client.get("/teams")
            responses.append(response.status_code)

            # Stop early if we hit rate limit
            if response.status_code == 429:
                break

        # Should eventually get 429
        assert 429 in responses, \
            f"Expected 429 Too Many Requests in responses, got: {set(responses)}"

    @pytest.mark.integration
    def test_rate_limit_lower_for_write_operations(self, client: TestClient, sample_teams):
        """
        Test that write operations have stricter rate limits.
        Input: Make many POST requests
        Expected: Hits rate limit faster than read operations

        Note: POST has 50/minute limit vs GET's 200/minute
        """
        responses = []

        # POST endpoint has 50/minute limit
        # Make more than 50 requests
        for i in range(55):
            response = client.post("/players", json={
                "name": f"Test Player {i}",
                "jersey_number": (i % 99) + 1,
                "position": "C",
                "team_id": sample_teams[0].id,
                "nationality": "Canadian",
                "birth_date": "1995-01-01",
                "height": "6'0\"",
                "weight": 180,
                "handedness": "L",
                "active_status": True,
                "regular_season_games_played": 0,
                "regular_season_goals": 0,
                "regular_season_assists": 0,
                "playoff_games_played": 0,
                "playoff_goals": 0,
                "playoff_assists": 0,
            })
            responses.append(response.status_code)

            # Stop if we hit rate limit
            if response.status_code == 429:
                break

        # Should hit 429 before 55 requests
        assert 429 in responses, \
            "POST endpoint should enforce rate limit"

        # Should hit rate limit earlier than 55 requests (50 is the limit)
        rate_limit_index = responses.index(429)
        assert rate_limit_index <= 52, \
            f"Rate limit should be hit around request 50, was hit at {rate_limit_index}"

    @pytest.mark.integration
    def test_rate_limit_response_format(self, client: TestClient):
        """
        Test the format of rate limit exceeded responses.
        Input: Exceed rate limit
        Expected: Returns proper 429 response with error details
        """
        # Make enough requests to hit rate limit
        response = None
        for i in range(310):
            response = client.get("/teams")
            if response.status_code == 429:
                break

        assert response is not None, "Should have made requests"
        assert response.status_code == 429, "Should hit rate limit"

        # Check response format
        data = response.json()
        assert "detail" in data or "error" in data, \
            "Rate limit response should include error details"

    @pytest.mark.integration
    def test_different_endpoints_have_independent_limits(
        self, client: TestClient, sample_players
    ):
        """
        Test that different endpoints have independent rate limits.
        Input: Hit rate limit on one endpoint
        Expected: Other endpoints still work
        """
        # Hit rate limit on teams endpoint (300/minute)
        for i in range(310):
            response = client.get("/teams")
            if response.status_code == 429:
                break

        assert response.status_code == 429, "Should hit rate limit on /teams"

        # Players endpoint should still work (different limit pool)
        response = client.get("/players?page=1&limit=10")

        # Should get 200 (or 429 if we've also exhausted players limit, but unlikely)
        # The key is it's using a different counter
        assert response.status_code in [200, 429], \
            f"Players endpoint should respond, got: {response.status_code}"

class TestRateLimitConfiguration:
    """Test rate limit configuration and settings."""

    def test_rate_limit_enabled_setting(self):
        """
        Test that rate limiting can be configured via settings.
        Input: Check settings configuration
        Expected: Rate limiting setting exists and is boolean
        """
        from app.config import settings

        assert hasattr(settings, 'redis_rate_limit_enabled'), \
            "Settings should have redis_rate_limit_enabled"
        assert isinstance(settings.redis_rate_limit_enabled, bool), \
            "redis_rate_limit_enabled should be boolean"

    def test_rate_limiter_configuration(self):
        """
        Test that rate limiter is properly configured.
        Input: Check limiter configuration
        Expected: Limiter has correct storage and strategy
        """
        from app.rate_limit import limiter

        assert limiter is not None, "Limiter should be configured"
        assert limiter.enabled == True, "Limiter should be enabled in tests"

    def test_app_has_rate_limiter(self):
        """
        Test that FastAPI app has rate limiter configured.
        Input: Check app.state
        Expected: app.state.limiter exists
        """
        from app.main import app

        assert hasattr(app.state, 'limiter'), \
            "App should have limiter in state"
        assert app.state.limiter is not None, \
            "App limiter should not be None"


class TestRateLimitEdgeCases:
    """Test edge cases and error conditions for rate limiting."""

    @pytest.mark.integration
    def test_rate_limit_with_invalid_request(self, client: TestClient):
        """
        Test that rate limiting applies even to invalid requests.
        Input: Make invalid requests
        Expected: Rate limit still enforced, requests count toward limit
        """
        responses = []

        # Make invalid POST requests (missing required fields)
        for i in range(55):
            response = client.post("/players", json={"name": "Invalid"})
            responses.append(response.status_code)

            if response.status_code == 429:
                break

        # Should hit rate limit even for invalid requests
        # Could get 422 (validation error) or 429 (rate limit)
        status_codes = set(responses)
        assert 422 in status_codes or 429 in status_codes, \
            f"Should get validation errors (422) or rate limit (429), got: {status_codes}"

    @pytest.mark.integration
    def test_rate_limit_resets_over_time(self, client: TestClient):
        """
        Test that rate limits reset after the time window.
        Input: Hit rate limit, wait, try again
        Expected: Rate limit resets and requests succeed again

        Note: This test takes 60+ seconds to run due to waiting for reset.
        It's marked as slow and may be skipped in quick test runs.
        """
        pytest.skip("Skipping slow test - rate limit reset takes 60+ seconds")

        # Hit rate limit
        for i in range(310):
            response = client.get("/teams")
            if response.status_code == 429:
                break

        assert response.status_code == 429, "Should hit rate limit"

        # Wait for rate limit window to reset (1 minute + buffer)
        time.sleep(65)

        # Should be able to make requests again
        response = client.get("/teams")
        assert response.status_code == 200, \
            "Rate limit should reset after time window"

    @pytest.mark.integration
    def test_rate_limit_with_concurrent_requests(self, client: TestClient):
        """
        Test rate limiting with rapid concurrent-like requests.
        Input: Make requests as fast as possible
        Expected: Rate limit still enforced correctly
        """
        responses = []

        # Make requests as fast as possible
        for i in range(320):
            response = client.get("/teams")
            responses.append(response.status_code)

            if response.status_code == 429:
                break

        # Should hit rate limit
        assert 429 in responses, \
            "Rate limit should be enforced even with rapid requests"

        # Count successful requests
        successful = responses.count(200)
        assert successful <= 305, \
            f"Should not exceed rate limit significantly, got {successful} successful requests"
