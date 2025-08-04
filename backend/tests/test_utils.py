"""
Testing utilities for SQLAlchemy models.

This module provides industry-standard helper functions to avoid type checking
issues when testing SQLAlchemy ORM models and relationships.
"""

from typing import Any, Dict
from app.models.player import Player
from app.models.team import Team


def assert_model_fields(obj: Any, expected_values: Dict[str, Any]) -> None:
    """
    Helper for asserting SQLAlchemy model field values.
    This approach is used to avoid type checking issues.
    
    Args:
        obj: SQLAlchemy model instance
        expected_values: Dictionary of field_name -> expected_value pairs
        
    Raises:
        AssertionError: If any field doesn't match expected value
    """
    for field, expected_value in expected_values.items():
        actual_value = getattr(obj, field)
        assert actual_value == expected_value, f"Field {field}: expected {expected_value}, got {actual_value}"


def assert_player_fields(player: Player, expected_values: Dict[str, Any]) -> None:
    """
    Type-safe helper for asserting Player model field values.
    
    Args:
        player: Player model instance
        expected_values: Dictionary of field_name -> expected_value pairs
    """
    assert_model_fields(player, expected_values)


def assert_team_fields(team: Team, expected_values: Dict[str, Any]) -> None:
    """
    Type-safe helper for asserting Team model field values.
    
    Args:
        team: Team model instance  
        expected_values: Dictionary of field_name -> expected_value pairs
    """
    assert_model_fields(team, expected_values)


def assert_player_comparison(player1: Player, player2: Player, field: str, comparison: str) -> None:
    """
    Helper for comparing SQLAlchemy model field values.
    
    Args:
        player1: First player to compare
        player2: Second player to compare
        field: Field name to compare
        comparison: Comparison operator as string ('=', '!=', '<', '<=', '>', '>=')
    """
    value1 = getattr(player1, field)
    value2 = getattr(player2, field)
    
    if comparison == '=':
        assert value1 == value2, f"{field}: {value1} != {value2}"
    elif comparison == '!=':
        assert value1 != value2, f"{field}: {value1} == {value2}"
    elif comparison == '<':
        assert value1 < value2, f"{field}: {value1} >= {value2}"
    elif comparison == '<=':
        assert value1 <= value2, f"{field}: {value1} > {value2}"
    elif comparison == '>':
        assert value1 > value2, f"{field}: {value1} <= {value2}"
    elif comparison == '>=':
        assert value1 >= value2, f"{field}: {value1} < {value2}"
    else:
        raise ValueError(f"Invalid comparison operator: {comparison}")


def assert_contains_substring(obj: Any, field_path: str, substring: str) -> None:
    """
    Helper for substring assertions on SQLAlchemy model fields.
    Supports nested field paths like 'team.name'.
    
    Args:
        obj: SQLAlchemy model instance
        field_path: Field path (supports nested like 'team.name')
        substring: Substring to search for
    """
    # Handle nested field paths
    current_obj = obj
    for field_part in field_path.split('.'):
        current_obj = getattr(current_obj, field_part)
    
    field_value = str(current_obj)
    assert substring in field_value, f"'{substring}' not found in {field_path}: '{field_value}'"


def assert_players_sorted(players: list[Player], sort_field: str, descending: bool = False) -> None:
    """
    Helper for asserting player list is sorted correctly.
    
    Args:
        players: List of Player instances
        sort_field: Field name to check sorting on
        descending: True for descending order, False for ascending
    """
    if len(players) < 2:
        return  # Can't verify sorting with less than 2 items
        
    for i in range(len(players) - 1):
        # Use getattr to safely extract values from SQLAlchemy ORM instances
        current_value = getattr(players[i], sort_field)
        next_value = getattr(players[i + 1], sort_field)
        
        if descending:
            assert current_value >= next_value, f"Sort order violation at index {i}: {current_value} < {next_value}"
        else:
            assert current_value <= next_value, f"Sort order violation at index {i}: {current_value} > {next_value}"