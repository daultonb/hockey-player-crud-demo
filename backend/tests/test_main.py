"""
Integration tests for FastAPI endpoints in main.py.

This file tests all API endpoints including:
- Root and health check endpoints
- Player search endpoint with various parameter combinations
- Legacy endpoints for backward compatibility
- Error handling for invalid requests
- Helper functions and data formatting
- Configuration settings integration
"""

import pytest
import json
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app, format_player_response
from app.config import settings
from app.models.player import Player
from app.models.team import Team
from typing import List


@pytest.fixture
def client():
    """Create FastAPI test client for endpoint testing."""
    return TestClient(app)


class TestRootEndpoints:
    """Test basic application endpoints for health and status."""
    
    @pytest.mark.integration
    def test_root_endpoint(self, client: TestClient):
        """
        Test root endpoint returns proper welcome message.
        Verifies API is running and returns correct app info from settings.
        """
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "running"
        assert settings.app_name in data["message"]
        assert data["version"] == settings.app_version
    
    @pytest.mark.integration
    def test_health_check_endpoint(self, client: TestClient):
        """
        Test health check endpoint returns healthy status.
        Used by monitoring systems to verify service availability.
        """
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == settings.app_name


class TestPlayersEndpoint:
    """Test main players endpoint with search, filter, sort, and pagination."""
    
    @pytest.mark.integration
    def test_get_players_default_params(self, client: TestClient, sample_players: List[Player]):
        """
        Test players endpoint with default parameters.
        Should return first page of players sorted by name ascending.
        """
        response = client.get("/players")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        required_fields = ["players", "count", "total", "page", "limit", "total_pages", 
                            "search_query", "search_field", "sort_by", "sort_order", "filters"]
        for field in required_fields:
            assert field in data
        
        # Verify default values
        assert data["page"] == 1
        assert data["limit"] == 20
        assert data["search_field"] == "all"
        assert data["sort_by"] == "name"
        assert data["sort_order"] == "asc"
        assert data["filters"] == []
        assert data["search_query"] is None
    
    @pytest.mark.integration
    def test_get_players_with_search(self, client: TestClient, specific_test_players: List[Player]):
        """
        Test players endpoint with search parameter.
        Should return players matching search term with proper response format.
        """
        response = client.get("/players?search=Alpha&field=name")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["search_query"] == "Alpha"
        assert data["search_field"] == "name"
        assert data["count"] >= 0
        
        # Verify player data structure if results exist
        if data["players"]:
            player = data["players"][0]
            required_player_fields = ["id", "name", "position", "nationality", "jersey_number",
                                    "birth_date", "height", "weight", "handedness", "goals",
                                    "assists", "points", "active_status", "team"]
            for field in required_player_fields:
                assert field in player
            
            # Verify team data structure
            assert "id" in player["team"]
            assert "name" in player["team"]
            assert "city" in player["team"]
    
    @pytest.mark.integration
    def test_get_players_with_pagination(self, client: TestClient, sample_players: List[Player]):
        """
        Test players endpoint with pagination parameters.
        Should return correct page with proper total_pages calculation.
        """
        response = client.get("/players?page=1&limit=5")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["limit"] == 5
        assert len(data["players"]) <= 5
        assert data["count"] <= 5
        
        expected_total_pages = (data["total"] + 4) // 5
        assert data["total_pages"] == expected_total_pages
    
    @pytest.mark.integration
    def test_get_players_with_sorting(self, client: TestClient, sample_players: List[Player]):
        """
        Test players endpoint with sorting parameters.
        Should return players sorted by specified field and direction.
        """
        response = client.get("/players?sort_by=goals&sort_order=desc")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["sort_by"] == "goals"
        assert data["sort_order"] == "desc"
        
        # Verify sorting if multiple players returned
        if len(data["players"]) > 1:
            for i in range(len(data["players"]) - 1):
                current_goals = data["players"][i]["goals"]
                next_goals = data["players"][i + 1]["goals"]
                assert current_goals >= next_goals
    
    @pytest.mark.integration
    def test_get_players_with_filters(self, client: TestClient, specific_test_players: List[Player]):
        """
        Test players endpoint with JSON filters parameter.
        Should parse filters correctly and apply them to search results.
        """
        filters_json = json.dumps([
            {"field": "position", "operator": "=", "value": "Center"}
        ])
        
        response = client.get(f"/players?filters={filters_json}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["filters"]) == 1
        assert data["filters"][0]["field"] == "position"
        assert data["filters"][0]["operator"] == "="
        assert data["filters"][0]["value"] == "Center"
        
        # Verify all returned players match filter
        for player in data["players"]:
            assert player["position"] == "Center"
    
    @pytest.mark.integration
    def test_get_players_combined_operations(self, client: TestClient, sample_players: List[Player]):
        """
        Test players endpoint with multiple parameters combined.
        Should handle search + filter + sort + pagination together.
        """
        filters_json = json.dumps([
            {"field": "active_status", "operator": "=", "value": True}
        ])
        
        response = client.get(
            f"/players?search=Test&field=all&page=1&limit=10&sort_by=goals&sort_order=desc&filters={filters_json}"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all parameters were applied
        assert data["search_query"] == "Test"
        assert data["search_field"] == "all"
        assert data["page"] == 1
        assert data["limit"] == 10
        assert data["sort_by"] == "goals"
        assert data["sort_order"] == "desc"
        assert len(data["filters"]) == 1


class TestLegacyEndpoint:
    """Test legacy players endpoint for backward compatibility."""
    
    @pytest.mark.integration
    def test_get_all_players_legacy(self, client: TestClient, sample_players: List[Player]):
        """
        Test legacy endpoint returns all players without pagination.
        Maintains backward compatibility for existing integrations.
        """
        response = client.get("/players/all")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "players" in data
        assert "count" in data
        assert data["count"] == len(data["players"])
        
        # Verify player data structure
        if data["players"]:
            player = data["players"][0]
            assert "id" in player
            assert "name" in player
            assert "team" in player


class TestHelperFunctions:
    """Test utility functions used by endpoints."""
    
    @pytest.mark.integration
    def test_format_player_response(self, specific_test_players: List[Player]):
        """
        Test player response formatting function.
        Should convert Player model to properly structured dict for API response.
        """
        player = specific_test_players[0]  # Use Alpha player
        
        formatted = format_player_response(player)
        
        # Verify all required fields are present
        required_fields = ["id", "name", "position", "nationality", "jersey_number",
                            "birth_date", "height", "weight", "handedness", "goals",
                            "assists", "points", "active_status", "team"]
        for field in required_fields:
            assert field in formatted
        
        # Verify data types and values
        assert isinstance(formatted["id"], int)
        assert isinstance(formatted["name"], str)
        assert isinstance(formatted["goals"], int)
        assert isinstance(formatted["active_status"], bool)
        assert isinstance(formatted["birth_date"], str)
        
        # Verify team structure
        assert isinstance(formatted["team"], dict)
        assert "id" in formatted["team"]
        assert "name" in formatted["team"]
        assert "city" in formatted["team"]
        
        # Verify specific values match model
        assert formatted["name"] == player.name
        assert formatted["goals"] == player.goals
        assert formatted["team"]["name"] == player.team.name


class TestErrorHandling:
    """Test error handling and edge cases for API endpoints."""
    
    @pytest.mark.integration
    def test_invalid_json_filters(self, client: TestClient):
        """
        Test endpoint with malformed JSON in filters parameter.
        Should return 400 error with descriptive message.
        """
        # Test with invalid JSON syntax
        response = client.get("/players?filters={invalid json}")
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "Invalid filters format" in data["detail"]
    
    @pytest.mark.integration
    def test_invalid_filter_structure(self, client: TestClient):
        """
        Test endpoint with valid JSON but invalid filter structure.
        Should return 400 error when filter objects are malformed.
        """
        # Test with missing required fields in filter
        invalid_filters = json.dumps([
            {"field": "position"}  # Missing operator and value
        ])
        
        response = client.get(f"/players?filters={invalid_filters}")
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    @pytest.mark.integration
    def test_pagination_edge_cases(self, client: TestClient):
        """
        Test pagination with edge case values.
        Should handle boundary conditions gracefully.
        """
        # Test with page beyond available data
        response = client.get("/players?page=999&limit=10")
        
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 999
        assert len(data["players"]) == 0
        assert data["count"] == 0
    
    @pytest.mark.integration
    def test_query_parameter_validation(self, client: TestClient):
        """
        Test FastAPI query parameter validation.
        Should enforce constraints like minimum page number and limit ranges.
        """
        # Test invalid page number (less than 1)
        response = client.get("/players?page=0")
        assert response.status_code == 422  # Validation error
        
        # Test invalid limit (greater than 100)
        response = client.get("/players?limit=101")
        assert response.status_code == 422  # Validation error


class TestConfigurationIntegration:
    """Test configuration settings integration with API endpoints."""
    
    @pytest.mark.integration
    def test_settings_integration(self, client: TestClient):
        """
        Test that API endpoints properly use configuration settings.
        Verifies config.py integration and covers get_allowed_origins_list method.
        """
        # Test that root endpoint uses settings correctly
        response = client.get("/")
        data = response.json()
        
        # Verify settings are loaded and used
        assert settings.app_name in data["message"]
        assert data["version"] == settings.app_version
        
        # Test get_allowed_origins_list method directly for config.py coverage
        # Test with comma-separated origins
        original_origins = settings.allowed_origins
        try:
            # Test populated origins
            settings.allowed_origins = "http://localhost:3000, https://example.com"
            origins_list = settings.get_allowed_origins_list()
            assert len(origins_list) == 2
            assert "http://localhost:3000" in origins_list
            assert "https://example.com" in origins_list
            
            # Test empty origins
            settings.allowed_origins = ""
            empty_origins = settings.get_allowed_origins_list()
            assert empty_origins == []
            
        finally:
            # Restore original value
            settings.allowed_origins = original_origins
    
    @pytest.mark.integration
    def test_cors_origins_whitespace_handling(self):
        """
        Test CORS origins parsing handles whitespace correctly.
        Covers edge cases in get_allowed_origins_list method.
        """
        original_origins = settings.allowed_origins
        try:
            # Test whitespace handling
            settings.allowed_origins = " http://localhost:3000 ,  https://example.com  , http://test.com "
            origins_list = settings.get_allowed_origins_list()
            
            assert len(origins_list) == 3
            assert "http://localhost:3000" in origins_list
            assert "https://example.com" in origins_list
            assert "http://test.com" in origins_list
            
            # Verify no whitespace in results
            for origin in origins_list:
                assert origin == origin.strip()
                
        finally:
            settings.allowed_origins = original_origins


class TestDataValidation:
    """Test data validation and response formatting."""
    
    @pytest.mark.integration
    def test_player_response_data_types(self, client: TestClient, specific_test_players: List[Player]):
        """
        Test that API responses have correct data types.
        Ensures frontend receives properly typed data for TypeScript compatibility.
        """
        response = client.get("/players")
        
        assert response.status_code == 200
        data = response.json()
        
        # Test response metadata types
        assert isinstance(data["count"], int)
        assert isinstance(data["total"], int)
        assert isinstance(data["page"], int)
        assert isinstance(data["limit"], int)
        assert isinstance(data["total_pages"], int)
        assert isinstance(data["players"], list)
        
        if data["players"]:
            player = data["players"][0]
            
            # Test player field types
            assert isinstance(player["id"], int)
            assert isinstance(player["name"], str)
            assert isinstance(player["jersey_number"], int)
            assert isinstance(player["goals"], int)
            assert isinstance(player["assists"], int)
            assert isinstance(player["points"], int)
            assert isinstance(player["active_status"], bool)
            assert isinstance(player["birth_date"], str)
            
            # Test team field types
            assert isinstance(player["team"], dict)
            assert isinstance(player["team"]["id"], int)
            assert isinstance(player["team"]["name"], str)
            assert isinstance(player["team"]["city"], str)
    
    @pytest.mark.integration
    def test_birth_date_iso_format(self, client: TestClient, specific_test_players: List[Player]):
        """
        Test that birth_date is returned in ISO format.
        Ensures consistent date formatting for frontend date handling.
        """
        response = client.get("/players")
        
        assert response.status_code == 200
        data = response.json()
        
        if data["players"]:
            player = data["players"][0]
            birth_date = player["birth_date"]
            
            # Verify ISO format (YYYY-MM-DD)
            import datetime
            try:
                parsed_date = datetime.datetime.fromisoformat(birth_date)
                assert isinstance(parsed_date, datetime.datetime)
            except ValueError:
                pytest.fail(f"birth_date '{birth_date}' is not in valid ISO format")


class TestAdvancedFiltering:
    """Test complex filtering scenarios through API endpoints."""
    
    @pytest.mark.integration
    def test_multiple_filters_and_logic(self, client: TestClient, specific_test_players: List[Player]):
        """
        Test multiple filters applied with AND logic.
        Should return players matching all filter criteria.
        """
        filters_json = json.dumps([
            {"field": "active_status", "operator": "=", "value": True},
            {"field": "goals", "operator": ">", "value": 20}
        ])
        
        response = client.get(f"/players?filters={filters_json}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["filters"]) == 2
        
        # Verify all returned players match both filters
        for player in data["players"]:
            assert player["active_status"] is True
            assert player["goals"] > 20
    
    @pytest.mark.integration
    def test_string_filters_case_insensitive(self, client: TestClient, specific_test_players: List[Player]):
        """
        Test string filters are case insensitive.
        Should match regardless of input case.
        """
        filters_json = json.dumps([
            {"field": "position", "operator": "=", "value": "center"}
        ])
        
        response = client.get(f"/players?filters={filters_json}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should find Center players despite lowercase input
        for player in data["players"]:
            assert player["position"].lower() == "center"
    
    @pytest.mark.integration
    def test_empty_filters_array(self, client: TestClient, sample_players: List[Player]):
        """
        Test empty filters array is handled correctly.
        Should return all players when filters array is empty.
        """
        filters_json = json.dumps([])
        
        response = client.get(f"/players?filters={filters_json}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["filters"] == []
        assert data["count"] >= 0