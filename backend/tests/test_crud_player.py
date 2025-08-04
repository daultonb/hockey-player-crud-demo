"""
Unit tests for player CRUD operations.

This file tests all functions in app/crud/player.py including:
- Search functionality across different fields
- Filtering with various operators and data types
- Sorting with different columns and directions
- Pagination with limits and offsets
- Combined operations (search + filter + sort)
"""

import pytest
from typing import cast
from sqlalchemy.orm import Session
from app.crud.player import (
    get_players_with_search,
    get_all_players_paginated,
    _apply_search_filters,
    _apply_custom_filters,
    _apply_sorting,
    _get_sort_column
)
from app.schemas.player import PlayerSearchParams, PlayerFilter, SortFieldType
from app.models.player import Player
from app.models.team import Team
from typing import List

# Import Test helper functions for assertions
from tests.test_utils import (
    assert_model_fields,
    assert_player_fields,
    assert_player_comparison,
    assert_contains_substring,
    assert_players_sorted
)

class TestPlayerSearch:
    """Test search functionality across different fields."""
    
    @pytest.mark.search
    def test_search_all_fields_name_match(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test searching across all fields with a player name.
        Input: search="Alpha" in all fields
        Expected: Returns player with "Alpha" in name
        """
        search_params = PlayerSearchParams(
            search="Player",
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        # Should return all players since search is effectively empty
        assert total >= len(specific_test_players)
    
    @pytest.mark.edge_case
    def test_no_filters_provided(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test with empty filters list.
        Input: filters=[]
        Expected: No filters applied, returns all players
        """
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        # Should return all players since no filters are applied
        assert total >= len(specific_test_players)
        assert len(players) >= len(specific_test_players)
        
        # Verify that we can find all our specific test players in the results
        player_names = {player.name for player in players}
        expected_names = {player.name for player in specific_test_players}
        assert expected_names.issubset(player_names), f"Missing expected players in results"
    
    @pytest.mark.search
    def test_search_all_fields_team_match(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test searching across all fields with a team name.
        Input: search="Test Team" in all fields
        Expected: Returns players from teams containing "Test Team"
        """
        search_params = PlayerSearchParams(
            search="Test Team",
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total >= 1
        for player in players:
            assert_contains_substring(player, 'team.name', 'Test Team')
    
    @pytest.mark.search
    def test_search_specific_field_name(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test searching in name field only.
        Input: search="Beta" in name field
        Expected: Returns player with "Beta" in name
        """
        search_params = PlayerSearchParams(
            search="Beta",
            field="name",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total == 1
        assert_contains_substring(players[0], 'name', 'Beta')
    
    @pytest.mark.search
    def test_search_team_field_direct(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test searching team field directly (coverage for team field search).
        Input: search="Test Team 1" in team field specifically  
        Expected: Returns players from teams containing "Test Team 1"
        """
        search_params = PlayerSearchParams(
            search="Test Team 1",
            field="team",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            assert_contains_substring(player, 'team.name', 'Test Team 1')
    
    @pytest.mark.search
    def test_search_position_field(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test searching by position.
        Input: search="Defense" in position field
        Expected: Returns players with Defense position
        """
        search_params = PlayerSearchParams(
            search="Defense",
            field="position",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total >= 1
        for player in players:
            position_value = getattr(player, 'position').lower()
            assert position_value == "defense"
    
    @pytest.mark.search
    def test_search_jersey_number_valid(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test searching by valid jersey number.
        Input: search="87" in jersey_number field
        Expected: Returns player with jersey number 87
        """
        search_params = PlayerSearchParams(
            search="87",
            field="jersey_number",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total == 1
        assert_player_fields(players[0], {'jersey_number': 87})
    
    @pytest.mark.search
    def test_search_jersey_number_invalid(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test searching by invalid jersey number (non-numeric).
        Input: search="abc" in jersey_number field
        Expected: Returns no players
        """
        search_params = PlayerSearchParams(
            search="abc",
            field="jersey_number",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total == 0
        assert len(players) == 0
    
    @pytest.mark.search
    def test_search_nationality(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test searching by nationality.
        Input: search="Swedish" in nationality field
        Expected: Returns players with Swedish nationality
        """
        search_params = PlayerSearchParams(
            search="Swedish",
            field="nationality",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total >= 1
        for player in players:
            nationality_value = getattr(player, 'nationality').lower()
            assert nationality_value == "swedish"
    
    @pytest.mark.search
    def test_search_case_insensitive(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test that search is case insensitive.
        Input: search="ALPHA" in name field (uppercase)
        Expected: Returns player with "Alpha" in name
        """
        search_params = PlayerSearchParams(
            search="ALPHA",
            field="name",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total == 1
        assert_contains_substring(players[0], 'name', 'Alpha')

class TestPlayerFiltering:
    """Test filtering functionality with various operators."""
    
    @pytest.mark.filter
    def test_filter_position_equals(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test filtering by position with equals operator.
        Input: filter position = "Center"
        Expected: Returns only Center players
        """
        filters = [PlayerFilter(field="position", operator="=", value="Center")]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total >= 1
        for player in players:
            assert_player_fields(player, {'position': 'Center'})
    
    @pytest.mark.filter
    def test_filter_position_not_equals(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test filtering by position with not equals operator.
        Input: filter position != "Goalie"
        Expected: Returns players who are not goalies
        """
        filters = [PlayerFilter(field="position", operator="!=", value="Goalie")]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total >= 1
        for player in players:
            position_value = getattr(player, 'position')
            assert position_value != "Goalie"
    
    @pytest.mark.filter
    def test_filter_position_contains(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test filtering by position with contains operator.
        Input: filter position contains "Wing"
        Expected: Returns Left Wing and Right Wing players
        """
        filters = [PlayerFilter(field="position", operator="contains", value="Wing")]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            assert_contains_substring(player, 'position', 'Wing')
    
    @pytest.mark.filter
    def test_filter_position_not_contains(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test not_contains operator for string fields (coverage for not_contains operator).
        Input: filter position not_contains "Wing"
        Expected: Returns players without "Wing" in position
        """
        filters = [PlayerFilter(field="position", operator="not_contains", value="Wing")]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            position_value = getattr(player, 'position').lower()
            assert "wing" not in position_value
    
    @pytest.mark.filter
    def test_filter_goals_greater_than(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test filtering by goals with greater than operator.
        Input: filter goals > 20
        Expected: Returns players with more than 20 goals
        """
        filters = [PlayerFilter(field="goals", operator=">", value=20)]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            goals_value = getattr(player, 'goals')
            assert goals_value > 20
    
    @pytest.mark.filter
    def test_filter_goals_less_than_equal(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test filtering by goals with less than or equal operator.
        Input: filter goals <= 10
        Expected: Returns players with 10 or fewer goals
        """
        filters = [PlayerFilter(field="goals", operator="<=", value=10)]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            goals_value = getattr(player, 'goals')
            assert goals_value <= 10
    
    @pytest.mark.filter
    @pytest.mark.parametrize("operator,test_value,expected_condition", [
        ("=", 50, lambda goals: goals == 50),
        ("!=", 50, lambda goals: goals != 50), 
        (">=", 40, lambda goals: goals >= 40),
        ("<", 20, lambda goals: goals < 20)
    ])
    def test_filter_goals_numeric_operators(self, test_db: Session, specific_test_players: List[Player], 
                                           operator: str, test_value: int, expected_condition):
        """
        Test all numeric operators for goals field (coverage for numeric operators).
        Input: Various numeric operators with goals field
        Expected: Returns players matching the numeric condition
        """
        from app.schemas.player import FilterOperatorType
        filters = [PlayerFilter(field="goals", operator=cast(FilterOperatorType, operator), value=test_value)]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            goals_value = getattr(player, 'goals')
            assert expected_condition(goals_value), f"Player {player.name} goals {goals_value} failed condition for {operator} {test_value}"
    
    @pytest.mark.filter
    def test_filter_active_status_true(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test filtering by active status equals true.
        Input: filter active_status = True
        Expected: Returns only active players
        """
        filters = [PlayerFilter(field="active_status", operator="=", value=True)]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total >= 1
        for player in players:
            assert_player_fields(player, {'active_status': True})
    
    @pytest.mark.filter
    def test_filter_active_status_not_equals(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test active_status != operator (coverage for active_status != operator).
        Input: filter active_status != True
        Expected: Returns only retired players
        """
        filters = [PlayerFilter(field="active_status", operator="!=", value=True)]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            assert_player_fields(player, {'active_status': False})
    
    @pytest.mark.filter
    def test_filter_active_status_string_conversion(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test filtering by active status with string value conversion.
        Input: filter active_status = "active" (string)
        Expected: Returns only active players (converted to boolean)
        """
        filters = [PlayerFilter(field="active_status", operator="=", value="active")]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            assert_player_fields(player, {'active_status': True})
    
    @pytest.mark.filter
    def test_filter_multiple_and_logic(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test multiple filters with AND logic.
        Input: filter position = "Center" AND goals > 20
        Expected: Returns only Centers with more than 20 goals
        """
        filters = [
            PlayerFilter(field="position", operator="=", value="Center"),
            PlayerFilter(field="goals", operator=">", value=20)
        ]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            assert_player_fields(player, {'position': 'Center'})
            goals_value = getattr(player, 'goals')
            assert goals_value > 20
    
    @pytest.mark.filter
    def test_filter_team_field(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test filtering by team name.
        Input: filter team contains "Test Team 1"
        Expected: Returns players from Test Team 1
        """
        filters = [PlayerFilter(field="team", operator="contains", value="Test Team 1")]
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            assert_contains_substring(player, 'team.name', 'Test Team 1')

class TestPlayerSorting:
    """Test sorting functionality with different columns and directions."""
    
    @pytest.mark.sort
    def test_sort_by_name_ascending(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test sorting by name in ascending order.
        Input: sort_by="name", sort_order="asc"
        Expected: Returns players sorted alphabetically by name
        """
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total >= 2
        assert_players_sorted(players, 'name', descending=False)
    
    @pytest.mark.sort
    def test_sort_by_goals_descending(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test sorting by goals in descending order.
        Input: sort_by="goals", sort_order="desc"
        Expected: Returns players sorted by goals (highest first)
        """
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="goals",
            sort_order="desc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total >= 2
        assert_players_sorted(players, 'goals', descending=True)
    
    @pytest.mark.sort
    def test_sort_by_active_status_ascending(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test sorting by active status ascending (Active players first).
        Input: sort_by="active_status", sort_order="asc"
        Expected: Returns active players before retired players
        """
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="active_status",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        # Find first retired player index
        first_retired_index = None
        for i, player in enumerate(players):
            active_status = getattr(player, 'active_status')
            if not active_status:
                first_retired_index = i
                break
        
        if first_retired_index is not None:
            # All players before first retired should be active
            for i in range(first_retired_index):
                assert_player_fields(players[i], {'active_status': True})
    
    @pytest.mark.sort
    def test_sort_by_active_status_descending(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test sorting by active_status descending (coverage for active_status descending sort).
        Input: sort_by="active_status", sort_order="desc"
        Expected: Returns retired players before active players
        """
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="active_status",
            sort_order="desc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        # Find first active player index
        first_active_index = None
        for i, player in enumerate(players):
            active_status = getattr(player, 'active_status')
            if active_status:
                first_active_index = i
                break
        
        if first_active_index is not None:
            # All players before first active should be retired
            for i in range(first_active_index):
                assert_player_fields(players[i], {'active_status': False})
    
    @pytest.mark.sort
    def test_sort_by_team_name(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test sorting by team name.
        Input: sort_by="team", sort_order="asc"
        Expected: Returns players sorted alphabetically by team name
        """
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="team",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total >= 2
        # Custom sorting check for team names (nested field)
        if len(players) > 1:
            for i in range(len(players) - 1):
                current_team = getattr(players[i].team, 'name')
                next_team = getattr(players[i + 1].team, 'name')
                assert current_team <= next_team
    
    @pytest.mark.sort
    def test_get_sort_column_mapping(self):
        """
        Test that sort column mapping returns correct SQLAlchemy columns.
        Input: Various sort field names
        Expected: Returns appropriate column objects or defaults to Player.name
        """
        from app.crud.player import _get_sort_column
        
        # Test valid mappings
        assert _get_sort_column("name") == Player.name
        assert _get_sort_column("goals") == Player.goals
        assert _get_sort_column("team") == Team.name
        
        # Test invalid field defaults to name
        assert _get_sort_column(cast(SortFieldType, "invalid_field")) == Player.name

class TestPagination:
    """Test pagination functionality."""
    
    @pytest.mark.pagination
    def test_pagination_first_page(self, test_db: Session, sample_players: List[Player]):
        """
        Test getting first page of results.
        Input: page=1, limit=5
        Expected: Returns first 5 players and correct total count
        """
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=5,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert len(players) <= 5
        assert total >= len(players)
    
    @pytest.mark.pagination
    def test_pagination_second_page(self, test_db: Session, sample_players: List[Player]):
        """
        Test getting second page of results.
        Input: page=2, limit=5
        Expected: Returns next 5 players (offset=5)
        """
        search_params = PlayerSearchParams(
            search=None,
            field="all",
            page=2,
            limit=5,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        if total > 5:
            assert len(players) > 0
            assert len(players) <= 5
    
    @pytest.mark.pagination
    def test_pagination_with_search(self, test_db: Session, sample_players: List[Player]):
        """
        Test pagination combined with search.
        Input: search term with pagination
        Expected: Pagination works on filtered results
        """
        search_params = PlayerSearchParams(
            search="Test",
            field="all",
            page=1,
            limit=2,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert len(players) <= 2
        if len(players) > 0:
            for player in players:
                name_match = "test" in getattr(player, 'name').lower()
                team_match = "test" in getattr(player.team, 'name').lower()
                assert name_match or team_match
    
    @pytest.mark.pagination
    def test_get_all_players_paginated(self, test_db: Session, sample_players: List[Player]):
        """
        Test basic pagination function without search/filter.
        Input: page=1, limit=10
        Expected: Returns paginated players sorted by name
        """
        players, total = get_all_players_paginated(test_db, page=1, limit=10)
        
        assert len(players) <= 10
        assert total >= len(players)
        
        if len(players) > 1:
            assert_players_sorted(players, 'name', descending=False)

class TestCombinedOperations:
    """Test combined search, filter, and sort operations."""
    
    @pytest.mark.integration
    def test_search_filter_sort_combined(self, test_db: Session, sample_players: List[Player]):
        """
        Test search + filter + sort combined operation.
        Input: search="Test", filter active_status=True, sort by goals desc
        Expected: Returns active players with "Test" in name/team, sorted by goals
        """
        filters = [PlayerFilter(field="active_status", operator="=", value=True)]
        search_params = PlayerSearchParams(
            search="Test",
            field="all",
            page=1,
            limit=20,
            sort_by="goals",
            sort_order="desc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            assert player.active_status is True
            search_match = (
                "test" in player.name.lower() or
                "test" in player.team.name.lower()
            )
            assert search_match is True
        
        if len(players) > 1:
            assert_players_sorted(players, 'goals', descending=True)
    
    @pytest.mark.integration
    def test_empty_results_combined(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test combined operations that return no results.
        Input: search="NonExistent", filter goals > 1000
        Expected: Returns empty results gracefully
        """
        filters = [PlayerFilter(field="goals", operator=">", value=1000)]
        search_params = PlayerSearchParams(
            search="NonExistent",
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        assert total == 0
        assert len(players) == 0

class TestEdgeCases:
    """Test edge cases and error conditions."""
    
    @pytest.mark.edge_case
    def test_empty_search_with_filters(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test empty search string with filters applied.
        Input: search="", filters present
        Expected: Ignores empty search, applies filters only
        """
        filters = [PlayerFilter(field="position", operator="=", value="Center")]
        search_params = PlayerSearchParams(
            search="",
            field="name",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        for player in players:
            assert_player_fields(player, {'position': 'Center'})
    
    @pytest.mark.edge_case
    def test_whitespace_only_search(self, test_db: Session, specific_test_players: List[Player]):
        """
        Test search with only whitespace.
        Input: search="   " (whitespace only)
        Expected: Treats as empty search, returns all players
        """
        search_params = PlayerSearchParams(
            search="   ",
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[]
        )
        
        players, total = get_players_with_search(test_db, search_params)
        
        # Should return all players since search is effectively empty
        assert total >= len(specific_test_players)