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

import json

import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import format_player_response
from app.models.player import Player


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
    def test_get_players_default_params(
        self, client: TestClient, sample_players: list[Player]
    ):
        """
        Test players endpoint with default parameters.
        Should return first page of players sorted by name ascending.
        """
        response = client.get("/players")

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        required_fields = [
            "players",
            "count",
            "total",
            "page",
            "limit",
            "total_pages",
            "search_query",
            "search_field",
            "sort_by",
            "sort_order",
            "filters",
        ]
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
    def test_get_players_with_search(
        self, client: TestClient, specific_test_players: list[Player]
    ):
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
            required_player_fields = [
                "id",
                "name",
                "position",
                "nationality",
                "jersey_number",
                "birth_date",
                "height",
                "weight",
                "handedness",
                "goals",
                "assists",
                "points",
                "active_status",
                "team",
            ]
            for field in required_player_fields:
                assert field in player

            # Verify team data structure
            assert "id" in player["team"]
            assert "name" in player["team"]
            assert "city" in player["team"]

    @pytest.mark.integration
    def test_get_players_with_pagination(
        self, client: TestClient, sample_players: list[Player]
    ):
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
    def test_get_players_with_sorting(
        self, client: TestClient, sample_players: list[Player]
    ):
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
    def test_get_players_with_filters(
        self, client: TestClient, specific_test_players: list[Player]
    ):
        """
        Test players endpoint with JSON filters parameter.
        Should parse filters correctly and apply them to search results.
        """
        filters_json = json.dumps(
            [{"field": "position", "operator": "=", "value": "Center"}]
        )

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
    def test_get_players_combined_operations(
        self, client: TestClient, sample_players: list[Player]
    ):
        """
        Test players endpoint with multiple parameters combined.
        Should handle search + filter + sort + pagination together.
        """
        filters_json = json.dumps(
            [{"field": "active_status", "operator": "=", "value": True}]
        )

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

class TestHelperFunctions:
    """Test utility functions used by endpoints."""

    @pytest.mark.integration
    def test_format_player_response(self, specific_test_players: list[Player]):
        """
        Test player response formatting function.
        Should convert Player model to properly structured dict for API response.
        """
        player = specific_test_players[0]  # Use Alpha player

        formatted = format_player_response(player)

        # Verify all required fields are present
        required_fields = [
            "id",
            "name",
            "position",
            "nationality",
            "jersey_number",
            "birth_date",
            "height",
            "weight",
            "handedness",
            "goals",
            "assists",
            "points",
            "active_status",
            "team",
        ]
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
        invalid_filters = json.dumps(
            [{"field": "position"}]  # Missing operator and value
        )

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
            settings.allowed_origins = (
                " http://localhost:3000 ,  https://example.com  , http://test.com "
            )
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
    def test_player_response_data_types(
        self, client: TestClient, specific_test_players: list[Player]
    ):
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
    def test_birth_date_iso_format(
        self, client: TestClient, specific_test_players: list[Player]
    ):
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
    def test_multiple_filters_and_logic(
        self, client: TestClient, specific_test_players: list[Player]
    ):
        """
        Test multiple filters applied with AND logic.
        Should return players matching all filter criteria.
        """
        filters_json = json.dumps(
            [
                {"field": "active_status", "operator": "=", "value": True},
                {"field": "goals", "operator": ">", "value": 20},
            ]
        )

        response = client.get(f"/players?filters={filters_json}")

        assert response.status_code == 200
        data = response.json()

        assert len(data["filters"]) == 2

        # Verify all returned players match both filters
        for player in data["players"]:
            assert player["active_status"] is True
            assert player["goals"] > 20

    @pytest.mark.integration
    def test_string_filters_case_insensitive(
        self, client: TestClient, specific_test_players: list[Player]
    ):
        """
        Test string filters are case insensitive.
        Should match regardless of input case.
        """
        filters_json = json.dumps(
            [{"field": "position", "operator": "=", "value": "center"}]
        )

        response = client.get(f"/players?filters={filters_json}")

        assert response.status_code == 200
        data = response.json()

        # Should find Center players despite lowercase input
        for player in data["players"]:
            assert player["position"].lower() == "center"

    @pytest.mark.integration
    def test_empty_filters_array(
        self, client: TestClient, sample_players: list[Player]
    ):
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


class TestTeamsEndpoint:
    """Test teams endpoint for retrieving team data."""

    @pytest.mark.integration
    def test_get_teams(self, client: TestClient, sample_teams: list):
        """
        Test teams endpoint returns all teams ordered by name.
        Used for populating team dropdown in player forms.
        """
        response = client.get("/teams")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) > 0

        for team in data:
            assert "id" in team
            assert "name" in team
            assert "city" in team

        # Verify teams are sorted alphabetically by name
        team_names = [team["name"] for team in data]
        assert team_names == sorted(team_names)


class TestCreatePlayerEndpoint:
    """Test player creation endpoint."""

    @pytest.mark.integration
    def test_create_player_success(self, client: TestClient, sample_teams: list):
        """
        Test creating a new player with valid data.
        Should return 201 status with complete player data.
        """
        new_player_data = {
            "name": "Test Player",
            "jersey_number": 99,
            "position": "C",
            "team_id": sample_teams[0].id,
            "nationality": "Canada",
            "birth_date": "1995-05-15",
            "height": "6'1\"",
            "weight": 195,
            "handedness": "R",
            "active_status": True,
            "regular_season_games_played": 50,
            "regular_season_goals": 20,
            "regular_season_assists": 30,
            "playoff_games_played": 10,
            "playoff_goals": 5,
            "playoff_assists": 8,
        }

        response = client.post("/players", json=new_player_data)

        assert response.status_code == 201
        data = response.json()

        assert data["name"] == "Test Player"
        assert data["jersey_number"] == 99
        assert data["position"] == "C"
        assert data["team"]["id"] == sample_teams[0].id
        assert data["nationality"] == "Canada"
        assert data["height"] == "6'1\""
        assert data["weight"] == 195
        assert data["handedness"] == "R"
        assert data["active_status"] is True

        # Verify calculated stats
        assert data["regular_season_points"] == 50
        assert data["playoff_points"] == 13
        assert data["games_played"] == 60
        assert data["goals"] == 25
        assert data["assists"] == 38
        assert data["points"] == 63

    @pytest.mark.integration
    def test_create_player_with_defaults(self, client: TestClient, sample_teams: list):
        """
        Test creating a player with minimal data using default values.
        Playoff and regular season stats should default to 0.
        """
        new_player_data = {
            "name": "Rookie Player",
            "jersey_number": 77,
            "position": "LW",
            "team_id": sample_teams[0].id,
            "nationality": "USA",
            "birth_date": "2000-01-01",
            "height": "5'11\"",
            "weight": 180,
            "handedness": "L",
        }

        response = client.post("/players", json=new_player_data)

        assert response.status_code == 201
        data = response.json()

        assert data["regular_season_games_played"] == 0
        assert data["regular_season_goals"] == 0
        assert data["regular_season_assists"] == 0
        assert data["regular_season_points"] == 0
        assert data["playoff_games_played"] == 0
        assert data["playoff_goals"] == 0
        assert data["playoff_assists"] == 0
        assert data["playoff_points"] == 0
        assert data["games_played"] == 0
        assert data["goals"] == 0
        assert data["assists"] == 0
        assert data["points"] == 0
        assert data["active_status"] is True

    @pytest.mark.integration
    def test_create_player_invalid_team(self, client: TestClient):
        """
        Test creating a player with non-existent team ID.
        Should return 404 error.
        """
        new_player_data = {
            "name": "Test Player",
            "jersey_number": 99,
            "position": "C",
            "team_id": 99999,
            "nationality": "Canada",
            "birth_date": "1995-05-15",
            "height": "6'1\"",
            "weight": 195,
            "handedness": "R",
            "active_status": True,
        }

        response = client.post("/players", json=new_player_data)

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.integration
    def test_create_player_invalid_position(self, client: TestClient, sample_teams: list):
        """
        Test creating a player with invalid position.
        Should return 422 validation error.
        """
        new_player_data = {
            "name": "Test Player",
            "jersey_number": 99,
            "position": "INVALID",
            "team_id": sample_teams[0].id,
            "nationality": "Canada",
            "birth_date": "1995-05-15",
            "height": "6'1\"",
            "weight": 195,
            "handedness": "R",
        }

        response = client.post("/players", json=new_player_data)

        assert response.status_code == 422

    @pytest.mark.integration
    def test_create_player_invalid_handedness(
        self, client: TestClient, sample_teams: list
    ):
        """
        Test creating a player with invalid handedness.
        Should return 422 validation error.
        """
        new_player_data = {
            "name": "Test Player",
            "jersey_number": 99,
            "position": "C",
            "team_id": sample_teams[0].id,
            "nationality": "Canada",
            "birth_date": "1995-05-15",
            "height": "6'1\"",
            "weight": 195,
            "handedness": "BOTH",
        }

        response = client.post("/players", json=new_player_data)

        assert response.status_code == 422

    @pytest.mark.integration
    def test_create_player_negative_stats(
        self, client: TestClient, sample_teams: list
    ):
        """
        Test creating a player with negative stats.
        Should return 422 validation error.
        """
        new_player_data = {
            "name": "Test Player",
            "jersey_number": 99,
            "position": "C",
            "team_id": sample_teams[0].id,
            "nationality": "Canada",
            "birth_date": "1995-05-15",
            "height": "6'1\"",
            "weight": 195,
            "handedness": "R",
            "regular_season_goals": -5,
        }

        response = client.post("/players", json=new_player_data)

        assert response.status_code == 422


class TestGetPlayerByIdEndpoint:
    """Test individual player retrieval endpoint."""

    @pytest.mark.integration
    def test_get_player_by_id_success(
        self, client: TestClient, sample_players: list[Player]
    ):
        """
        Test retrieving a single player by ID.
        Should return complete player data with team information.
        """
        player = sample_players[0]
        response = client.get(f"/players/{player.id}")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == player.id
        assert data["name"] == player.name
        assert data["position"] == player.position
        assert data["jersey_number"] == player.jersey_number
        assert "team" in data
        assert data["team"]["id"] == player.team_id

    @pytest.mark.integration
    def test_get_player_by_id_not_found(self, client: TestClient):
        """
        Test retrieving a player with non-existent ID.
        Should return 404 error.
        """
        response = client.get("/players/99999")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestUpdatePlayerEndpoint:
    """Test player update endpoint."""

    @pytest.mark.integration
    def test_update_player_success(
        self, client: TestClient, sample_players: list[Player]
    ):
        """
        Test updating a player with valid data.
        Should return updated player data with recalculated stats.
        """
        player = sample_players[0]
        update_data = {
            "name": "Updated Name",
            "jersey_number": 88,
            "position": "RW",
            "team_id": player.team_id,
            "nationality": "Finland",
            "birth_date": "1993-03-20",
            "height": "6'3\"",
            "weight": 210,
            "handedness": "L",
            "active_status": False,
            "regular_season_games_played": 100,
            "regular_season_goals": 40,
            "regular_season_assists": 60,
            "playoff_games_played": 20,
            "playoff_goals": 10,
            "playoff_assists": 15,
        }

        response = client.put(f"/players/{player.id}", json=update_data)

        assert response.status_code == 200
        data = response.json()

        assert data["name"] == "Updated Name"
        assert data["jersey_number"] == 88
        assert data["position"] == "RW"
        assert data["nationality"] == "Finland"
        assert data["height"] == "6'3\""
        assert data["weight"] == 210
        assert data["handedness"] == "L"
        assert data["active_status"] is False

        # Verify recalculated stats
        assert data["regular_season_points"] == 100
        assert data["playoff_points"] == 25
        assert data["games_played"] == 120
        assert data["goals"] == 50
        assert data["assists"] == 75
        assert data["points"] == 125

    @pytest.mark.integration
    def test_update_player_not_found(self, client: TestClient, sample_teams: list):
        """
        Test updating a player with non-existent ID.
        Should return 404 error.
        """
        update_data = {
            "name": "Test",
            "jersey_number": 1,
            "position": "C",
            "team_id": sample_teams[0].id,
            "nationality": "Canada",
            "birth_date": "1995-01-01",
            "height": "6'0\"",
            "weight": 180,
            "handedness": "R",
            "active_status": True,
            "regular_season_games_played": 0,
            "regular_season_goals": 0,
            "regular_season_assists": 0,
            "playoff_games_played": 0,
            "playoff_goals": 0,
            "playoff_assists": 0,
        }

        response = client.put("/players/99999", json=update_data)

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.integration
    def test_update_player_invalid_team(
        self, client: TestClient, sample_players: list[Player]
    ):
        """
        Test updating a player with non-existent team ID.
        Should return 404 error.
        """
        player = sample_players[0]
        update_data = {
            "name": player.name,
            "jersey_number": player.jersey_number,
            "position": player.position,
            "team_id": 99999,
            "nationality": player.nationality,
            "birth_date": player.birth_date.isoformat(),
            "height": player.height,
            "weight": player.weight,
            "handedness": player.handedness,
            "active_status": player.active_status,
            "regular_season_games_played": player.regular_season_games_played,
            "regular_season_goals": player.regular_season_goals,
            "regular_season_assists": player.regular_season_assists,
            "playoff_games_played": player.playoff_games_played,
            "playoff_goals": player.playoff_goals,
            "playoff_assists": player.playoff_assists,
        }

        response = client.put(f"/players/{player.id}", json=update_data)

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestDeletePlayerEndpoint:
    """Test player deletion endpoint."""

    @pytest.mark.integration
    def test_delete_player_success(
        self, client: TestClient, sample_players: list[Player]
    ):
        """
        Test deleting a player by ID.
        Should return 204 status and player should no longer exist.
        """
        player = sample_players[0]
        player_id = player.id

        response = client.delete(f"/players/{player_id}")

        assert response.status_code == 204

        # Verify player is deleted
        get_response = client.get(f"/players/{player_id}")
        assert get_response.status_code == 404

    @pytest.mark.integration
    def test_delete_player_not_found(self, client: TestClient):
        """
        Test deleting a player with non-existent ID.
        Should return 404 error.
        """
        response = client.delete("/players/99999")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.integration
    def test_delete_player_verify_cascading(
        self, client: TestClient, sample_players: list[Player]
    ):
        """
        Test deleting a player doesn't affect team.
        Team should still exist after player deletion.
        """
        player = sample_players[0]
        team_id = player.team_id

        response = client.delete(f"/players/{player.id}")

        assert response.status_code == 204

        # Verify team still exists
        teams_response = client.get("/teams")
        assert teams_response.status_code == 200
        teams = teams_response.json()
        assert any(team["id"] == team_id for team in teams)
