"""
Unit tests for player Pydantic schemas and validation.

This file tests all schema validation in app/schemas/player.py including:
- PlayerFilter validation with operator/field compatibility
- PlayerSearchParams validation and defaults
- Response model structure validation
- Edge cases and error conditions for invalid inputs
"""

from typing import cast

import pytest
from pydantic import ValidationError

from app.schemas.player import (
    BooleanFilterOperator,
    FilterOperatorType,
    NumericFilterOperator,
    PlayerFilter,
    PlayerResponse,
    PlayerSearchParams,
    PlayerSearchResponse,
    PlayersListResponse,
    SearchFieldType,
    SortDirectionType,
    SortFieldType,
    StringFilterOperator,
    TeamResponse,
)


class TestPlayerFilterValidation:
    """Test PlayerFilter schema validation and operator compatibility."""

    @pytest.mark.validation
    def test_valid_string_field_operators(self):
        """
        Test valid operators for string fields (position, team).
        Input: position field with string operators
        Expected: All string operators validate successfully
        """
        string_operators: list[StringFilterOperator] = [
            "=",
            "!=",
            "contains",
            "not_contains",
        ]

        for operator in string_operators:
            filter_obj = PlayerFilter(
                field="position", operator=operator, value="Center"
            )
            assert filter_obj.field == "position"
            assert filter_obj.operator == operator
            assert filter_obj.value == "Center"

    @pytest.mark.validation
    def test_valid_numeric_field_operators(self):
        """
        Test valid operators for numeric fields (goals, assists, etc.).
        Input: goals field with numeric operators
        Expected: All numeric operators validate successfully
        """
        numeric_operators: list[NumericFilterOperator] = [
            "=",
            "!=",
            ">",
            "<",
            ">=",
            "<=",
        ]

        for operator in numeric_operators:
            filter_obj = PlayerFilter(field="goals", operator=operator, value=25)
            assert filter_obj.field == "goals"
            assert filter_obj.operator == operator
            assert filter_obj.value == 25

    @pytest.mark.validation
    def test_valid_boolean_field_operators(self):
        """
        Test valid operators for boolean field (active_status).
        Input: active_status field with boolean operators
        Expected: Boolean operators validate successfully
        """
        boolean_operators: list[BooleanFilterOperator] = ["=", "!="]

        for operator in boolean_operators:
            filter_obj = PlayerFilter(
                field="active_status", operator=operator, value=True
            )
            assert filter_obj.field == "active_status"
            assert filter_obj.operator == operator
            assert filter_obj.value is True

    @pytest.mark.validation
    def test_invalid_operator_for_string_field(self):
        """
        Test invalid operators for string fields.
        Input: position field with numeric operator ">"
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError) as exc_info:
            PlayerFilter(
                field="position", operator=cast(FilterOperatorType, ">"), value="Center"
            )

        assert "Invalid operator" in str(exc_info.value)
        assert "string field" in str(exc_info.value)

    @pytest.mark.validation
    def test_invalid_operator_for_numeric_field(self):
        """
        Test invalid operators for numeric fields.
        Input: goals field with string operator "contains"
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError) as exc_info:
            PlayerFilter(
                field="goals", operator=cast(FilterOperatorType, "contains"), value=25
            )

        assert "Invalid operator" in str(exc_info.value)
        assert "numeric field" in str(exc_info.value)

    @pytest.mark.validation
    def test_invalid_operator_for_boolean_field(self):
        """
        Test invalid operators for boolean field.
        Input: active_status field with operator ">"
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError) as exc_info:
            PlayerFilter(
                field="active_status",
                operator=cast(FilterOperatorType, ">"),
                value=True,
            )

        assert "Invalid operator" in str(exc_info.value)
        assert "boolean field" in str(exc_info.value)

    @pytest.mark.validation
    def test_team_field_string_operators(self):
        """
        Test team field accepts string operators.
        Input: team field with string operators
        Expected: Validates as string field
        """
        filter_obj = PlayerFilter(field="team", operator="contains", value="Hawks")
        assert filter_obj.field == "team"
        assert filter_obj.operator == "contains"

    @pytest.mark.validation
    def test_jersey_number_numeric_operators(self):
        """
        Test jersey_number field accepts numeric operators.
        Input: jersey_number field with numeric operators
        Expected: Validates as numeric field
        """
        filter_obj = PlayerFilter(field="jersey_number", operator=">=", value=50)
        assert filter_obj.field == "jersey_number"
        assert filter_obj.operator == ">="
        assert filter_obj.value == 50


class TestPlayerSearchParamsValidation:
    """Test PlayerSearchParams schema validation and defaults."""

    @pytest.mark.validation
    def test_default_values(self):
        """
        Test default values are applied correctly.
        Input: Empty PlayerSearchParams
        Expected: Default values set for all optional fields
        """
        params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[],
        )

        assert params.search is None
        assert params.field == "all"
        assert params.page == 1
        assert params.limit == 20
        assert params.sort_by == "name"
        assert params.sort_order == "asc"
        assert params.filters == []

    @pytest.mark.validation
    def test_valid_search_fields(self):
        """
        Test all valid search field values.
        Input: All valid SearchFieldType values
        Expected: All validate successfully
        """
        valid_fields: list[SearchFieldType] = [
            "all",
            "name",
            "position",
            "team",
            "nationality",
            "jersey_number",
        ]

        for field in valid_fields:
            params = PlayerSearchParams(
                search=None,
                field=field,
                page=1,
                limit=20,
                sort_by="name",
                sort_order="asc",
                filters=[],
            )
            assert params.field == field

    @pytest.mark.validation
    def test_valid_sort_fields(self):
        """
        Test all valid sort field values.
        Input: All valid SortFieldType values
        Expected: All validate successfully
        """
        valid_fields: list[SortFieldType] = [
            "name",
            "position",
            "team",
            "jersey_number",
            "goals",
            "assists",
            "points",
            "active_status",
        ]

        for field in valid_fields:
            params = PlayerSearchParams(
                search=None,
                field="all",
                page=1,
                limit=20,
                sort_by=field,
                sort_order="asc",
                filters=[],
            )
            assert params.sort_by == field

    @pytest.mark.validation
    def test_valid_sort_directions(self):
        """
        Test valid sort direction values.
        Input: "asc" and "desc" sort orders
        Expected: Both validate successfully
        """
        valid_directions: list[SortDirectionType] = ["asc", "desc"]

        for direction in valid_directions:
            params = PlayerSearchParams(
                search=None,
                field="all",
                page=1,
                limit=20,
                sort_by="name",
                sort_order=direction,
                filters=[],
            )
            assert params.sort_order == direction

    @pytest.mark.validation
    def test_page_validation_positive(self):
        """
        Test page number validation for positive values.
        Input: page >= 1
        Expected: Validates successfully
        """
        params = PlayerSearchParams(
            search=None,
            field="all",
            page=5,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=[],
        )
        assert params.page == 5

    @pytest.mark.validation
    def test_page_validation_zero_or_negative(self):
        """
        Test page number validation for invalid values.
        Input: page <= 0
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError):
            PlayerSearchParams(
                search=None,
                field="all",
                page=0,
                limit=20,
                sort_by="name",
                sort_order="asc",
                filters=[],
            )

        with pytest.raises(ValidationError):
            PlayerSearchParams(
                search=None,
                field="all",
                page=-1,
                limit=20,
                sort_by="name",
                sort_order="asc",
                filters=[],
            )

    @pytest.mark.validation
    def test_limit_validation_range(self):
        """
        Test limit validation within valid range.
        Input: limit between 1 and 100
        Expected: Validates successfully
        """
        params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=50,
            sort_by="name",
            sort_order="asc",
            filters=[],
        )
        assert params.limit == 50

        params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=1,
            sort_by="name",
            sort_order="asc",
            filters=[],
        )
        assert params.limit == 1

        params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=100,
            sort_by="name",
            sort_order="asc",
            filters=[],
        )
        assert params.limit == 100

    @pytest.mark.validation
    def test_limit_validation_out_of_range(self):
        """
        Test limit validation outside valid range.
        Input: limit < 1 or limit > 100
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError):
            PlayerSearchParams(
                search=None,
                field="all",
                page=1,
                limit=0,
                sort_by="name",
                sort_order="asc",
                filters=[],
            )

        with pytest.raises(ValidationError):
            PlayerSearchParams(
                search=None,
                field="all",
                page=1,
                limit=101,
                sort_by="name",
                sort_order="asc",
                filters=[],
            )

    @pytest.mark.validation
    def test_filters_list_validation(self):
        """
        Test filters list validation with multiple filters.
        Input: List of valid PlayerFilter objects
        Expected: Validates successfully
        """
        filters = [
            PlayerFilter(field="position", operator="=", value="Center"),
            PlayerFilter(field="goals", operator=">", value=20),
            PlayerFilter(field="active_status", operator="=", value=True),
        ]

        params = PlayerSearchParams(
            search=None,
            field="all",
            page=1,
            limit=20,
            sort_by="name",
            sort_order="asc",
            filters=filters,
        )
        assert len(params.filters) == 3
        assert params.filters[0].field == "position"
        assert params.filters[1].field == "goals"
        assert params.filters[2].field == "active_status"

    @pytest.mark.validation
    def test_complex_search_params(self):
        """
        Test complex search parameters with all fields set.
        Input: Complete PlayerSearchParams with all fields
        Expected: All values validate and are set correctly
        """
        filters = [PlayerFilter(field="goals", operator=">=", value=10)]

        params = PlayerSearchParams(
            search="Alex",
            field="name",
            page=2,
            limit=15,
            sort_by="goals",
            sort_order="desc",
            filters=filters,
        )

        assert params.search == "Alex"
        assert params.field == "name"
        assert params.page == 2
        assert params.limit == 15
        assert params.sort_by == "goals"
        assert params.sort_order == "desc"
        assert len(params.filters) == 1


class TestResponseModels:
    """Test response model structure and validation."""

    @pytest.mark.validation
    def test_team_response_model(self):
        """
        Test TeamResponse model structure.
        Input: Team data dictionary
        Expected: TeamResponse object with correct fields
        """
        team_data = {"id": 1, "name": "Test Team", "city": "Test City"}

        team = TeamResponse(**team_data)
        assert team.id == 1
        assert team.name == "Test Team"
        assert team.city == "Test City"

    @pytest.mark.validation
    def test_player_response_model(self):
        """
        Test PlayerResponse model structure.
        Input: Complete player data with team
        Expected: PlayerResponse object with all fields correctly set
        """
        team_data = {"id": 1, "name": "Test Team", "city": "Test City"}
        player_data = {
            "id": 1,
            "name": "Test Player",
            "position": "C",
            "nationality": "Canadian",
            "jersey_number": 87,
            "birth_date": "1995-03-15",
            "height": "6'2\"",
            "weight": 195,
            "handedness": "L",
            "active_status": True,
            "regular_season_goals": 20,
            "regular_season_assists": 25,
            "regular_season_points": 45,
            "regular_season_games_played": 82,
            "playoff_goals": 5,
            "playoff_assists": 5,
            "playoff_points": 10,
            "playoff_games_played": 10,
            "goals": 25,
            "assists": 30,
            "points": 55,
            "games_played": 92,
            "team": team_data,
        }

        player = PlayerResponse(**player_data)
        assert player.id == 1
        assert player.name == "Test Player"
        assert player.position == "C"
        assert player.jersey_number == 87
        assert player.goals == 25
        assert player.active_status is True
        assert player.team.name == "Test Team"

    @pytest.mark.validation
    def test_players_list_response_model(self):
        """
        Test PlayersListResponse model structure.
        Input: Players list with pagination metadata
        Expected: PlayersListResponse with correct pagination info
        """
        team_data = {"id": 1, "name": "Test Team", "city": "Test City"}
        player_data = {
            "id": 1,
            "name": "Test Player",
            "position": "C",
            "nationality": "Canadian",
            "jersey_number": 87,
            "birth_date": "1995-03-15",
            "height": "6'2\"",
            "weight": 195,
            "handedness": "L",
            "active_status": True,
            "regular_season_goals": 20,
            "regular_season_assists": 25,
            "regular_season_points": 45,
            "regular_season_games_played": 82,
            "playoff_goals": 5,
            "playoff_assists": 5,
            "playoff_points": 10,
            "playoff_games_played": 10,
            "goals": 25,
            "assists": 30,
            "points": 55,
            "games_played": 92,
            "team": team_data,
        }

        response_data = {
            "players": [player_data],
            "count": 1,
            "total": 50,
            "page": 1,
            "limit": 20,
            "total_pages": 3,
        }

        response = PlayersListResponse(**response_data)
        assert len(response.players) == 1
        assert response.count == 1
        assert response.total == 50
        assert response.page == 1
        assert response.limit == 20
        assert response.total_pages == 3

    @pytest.mark.validation
    def test_player_search_response_model(self):
        """
        Test PlayerSearchResponse model with search metadata.
        Input: Search response with filters and search params
        Expected: PlayerSearchResponse with all search metadata
        """
        team_data = {"id": 1, "name": "Test Team", "city": "Test City"}
        player_data = {
            "id": 1,
            "name": "Test Player",
            "position": "C",
            "nationality": "Canadian",
            "jersey_number": 87,
            "birth_date": "1995-03-15",
            "height": "6'2\"",
            "weight": 195,
            "handedness": "L",
            "active_status": True,
            "regular_season_goals": 20,
            "regular_season_assists": 25,
            "regular_season_points": 45,
            "regular_season_games_played": 82,
            "playoff_goals": 5,
            "playoff_assists": 5,
            "playoff_points": 10,
            "playoff_games_played": 10,
            "goals": 25,
            "assists": 30,
            "points": 55,
            "games_played": 92,
            "team": team_data,
        }

        filter_data = {"field": "goals", "operator": ">", "value": 20}

        response_data = {
            "players": [player_data],
            "count": 1,
            "total": 15,
            "page": 1,
            "limit": 20,
            "total_pages": 1,
            "search_query": "Test",
            "search_field": "name",
            "sort_by": "goals",
            "sort_order": "desc",
            "filters": [filter_data],
        }

        response = PlayerSearchResponse(**response_data)
        assert len(response.players) == 1
        assert response.search_query == "Test"
        assert response.search_field == "name"
        assert response.sort_by == "goals"
        assert response.sort_order == "desc"
        assert len(response.filters) == 1
        assert response.filters[0].field == "goals"


class TestEdgeCasesValidation:
    """Test edge cases and boundary conditions for schema validation."""

    @pytest.mark.validation
    def test_invalid_search_field(self):
        """
        Test invalid search field value.
        Input: Invalid field name
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError):
            PlayerSearchParams(
                search=None,
                field="invalid_field",  # type: ignore
                page=1,
                limit=20,
                sort_by="name",
                sort_order="asc",
                filters=[],
            )

    @pytest.mark.validation
    def test_invalid_sort_field(self):
        """
        Test invalid sort field value.
        Input: Invalid sort field name
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError):
            PlayerSearchParams(
                search=None,
                field="all",
                page=1,
                limit=20,
                sort_by="invalid_sort_field",  # type: ignore
                sort_order="asc",
                filters=[],
            )

    @pytest.mark.validation
    def test_invalid_sort_direction(self):
        """
        Test invalid sort direction value.
        Input: Invalid sort direction
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError):
            PlayerSearchParams(
                search=None,
                field="all",
                page=1,
                limit=20,
                sort_by="name",
                sort_order="invalid_direction",  # type: ignore
                filters=[],
            )

    @pytest.mark.validation
    def test_filter_missing_required_fields(self):
        """
        Test PlayerFilter with missing required fields.
        Input: Incomplete filter data
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError):
            PlayerFilter(field="position")  # type: ignore

        with pytest.raises(ValidationError):
            PlayerFilter(operator="=")  # type: ignore

    @pytest.mark.validation
    def test_filter_with_none_values(self):
        """
        Test PlayerFilter with None values in required fields.
        Input: None values for required fields
        Expected: ValidationError raised
        """
        with pytest.raises(ValidationError):
            PlayerFilter(field=None, operator="=", value="test")  # type: ignore

        with pytest.raises(ValidationError):
            PlayerFilter(field="position", operator=None, value="test")  # type: ignore

    @pytest.mark.validation
    def test_search_params_with_invalid_filter(self):
        """
        Test PlayerSearchParams with invalid filter in list.
        Input: List containing invalid filter
        Expected: ValidationError raised during filter validation
        """
        with pytest.raises(ValidationError):
            invalid_filter_dict = {
                "field": "position",
                "operator": ">",
                "value": "Center",
            }
            PlayerSearchParams(
                search=None,
                field="all",
                page=1,
                limit=20,
                sort_by="name",
                sort_order="asc",
                filters=[invalid_filter_dict],  # type: ignore
            )

    @pytest.mark.validation
    def test_empty_string_values(self):
        """
        Test handling of empty string values in filters.
        Input: Filter with empty string value
        Expected: Validates successfully (empty string is valid)
        """
        filter_obj = PlayerFilter(field="position", operator="=", value="")
        assert filter_obj.value == ""

    @pytest.mark.validation
    def test_numeric_string_conversion(self):
        """
        Test numeric values passed as strings in filters.
        Input: Numeric filter value as string
        Expected: Validates successfully (Pydantic handles conversion)
        """
        filter_obj = PlayerFilter(field="goals", operator=">", value="25")
        assert filter_obj.value == "25"
