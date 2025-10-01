from sqlalchemy import String, asc, cast, desc, func, or_
from sqlalchemy.orm import Session

from app.models.player import Player
from app.models.team import Team
from app.schemas.player import PlayerFilter, PlayerSearchParams, SortFieldType


def get_players_with_search(
    db: Session, search_params: PlayerSearchParams
) -> tuple[list[Player], int]:
    """
    Get players with search, filtering, sorting, and pagination.

    Args:
        db: Database session
        search_params: Search parameters including query, field, pagination, sorting, and filtering

    Returns:
        Tuple of (players_list, total_count)
    """
    query = db.query(Player).join(Team)

    # Apply search
    query = _apply_search_filters(query, search_params)

    # Apply filters
    query = _apply_custom_filters(query, search_params.filters)

    # Apply sorting
    query = _apply_sorting(query, search_params)

    total_count = query.count()
    print(f"CRUD: Found {total_count} total matches after search and filters")

    offset = (search_params.page - 1) * search_params.limit
    players = query.offset(offset).limit(search_params.limit).all()

    print(f"CRUD: Returning {len(players)} players for page {search_params.page}")

    return players, total_count


def _apply_search_filters(query, search_params: PlayerSearchParams):
    """
    Apply search filters to the query.
    """
    if search_params.search and search_params.search.strip():
        search_term = f"%{search_params.search.strip().lower()}%"

        if search_params.field == "all":
            query = query.filter(
                or_(
                    func.lower(Player.name).like(search_term),
                    func.lower(Player.position).like(search_term),
                    func.lower(Player.nationality).like(search_term),
                    func.lower(Team.name).like(search_term),
                    func.lower(cast(Player.jersey_number, String)).like(search_term),
                )
            )
            print(f"CRUD: Searching all fields for '{search_params.search}'")

        elif search_params.field == "name":
            query = query.filter(func.lower(Player.name).like(search_term))
            print(f"CRUD: Searching name field for '{search_params.search}'")

        elif search_params.field == "position":
            query = query.filter(func.lower(Player.position).like(search_term))
            print(f"CRUD: Searching position field for '{search_params.search}'")

        elif search_params.field == "team":
            query = query.filter(func.lower(Team.name).like(search_term))
            print(f"CRUD: Searching team field for '{search_params.search}'")

        elif search_params.field == "nationality":
            query = query.filter(func.lower(Player.nationality).like(search_term))
            print(f"CRUD: Searching nationality field for '{search_params.search}'")

        elif search_params.field == "jersey_number":
            # For jersey number, do exact match if it's a number, otherwise no results
            try:
                jersey_num = int(search_params.search.strip())
                query = query.filter(Player.jersey_number == jersey_num)
                print(f"CRUD: Searching jersey number for {jersey_num}")
            except ValueError:
                # If not a valid number, return no results using a condition that's always false
                query = query.filter(Player.id == -1)  # No player will have ID -1
                print(f"CRUD: Invalid jersey number search '{search_params.search}'")

    return query


def _apply_custom_filters(query, filters: list[PlayerFilter]):
    """
    Apply custom filters to the query.
    """
    if not filters:
        return query

    print(f"CRUD: Applying {len(filters)} custom filters")

    for filter_item in filters:
        field = filter_item.field
        operator = filter_item.operator
        value = filter_item.value

        print(f"CRUD: Applying filter: {field} {operator} {value}")

        if field == "team":
            column = Team.name
        else:
            column = getattr(Player, field)

        # Apply the filter based on operator and field type
        if field in ["position", "team"]:
            # String fields
            if operator == "=":
                query = query.filter(func.lower(column) == str(value).lower())
            elif operator == "!=":
                query = query.filter(func.lower(column) != str(value).lower())
            elif operator == "contains":
                query = query.filter(func.lower(column).like(f"%{str(value).lower()}%"))
            elif operator == "not_contains":
                query = query.filter(
                    ~func.lower(column).like(f"%{str(value).lower()}%")
                )

        elif field in ["jersey_number", "goals", "assists", "points"]:
            # Numeric fields
            numeric_value = int(value) if isinstance(value, str) else value
            if operator == "=":
                query = query.filter(column == numeric_value)
            elif operator == "!=":
                query = query.filter(column != numeric_value)
            elif operator == ">":
                query = query.filter(column > numeric_value)
            elif operator == "<":
                query = query.filter(column < numeric_value)
            elif operator == ">=":
                query = query.filter(column >= numeric_value)
            elif operator == "<=":
                query = query.filter(column <= numeric_value)

        elif field == "active_status":
            if isinstance(value, str):
                bool_value = value.lower() in ("true", "1", "yes", "active")
            else:
                bool_value = bool(value)

            if operator == "=":
                query = query.filter(column == bool_value)
            elif operator == "!=":
                query = query.filter(column != bool_value)

    return query


def _apply_sorting(query, search_params: PlayerSearchParams):
    """
    Apply sorting to the query with special handling for active_status.
    """
    if search_params.sort_by == "active_status":
        # For active_status, reverse the sort logic to match user-friendly display
        # "Active" (True) should come before "Retired" (False) when ascending
        if search_params.sort_order == "desc":
            query = query.order_by(
                asc(Player.active_status)
            )  # Reversed: False first (Retired)
            print(
                f"CRUD: Sorting by {search_params.sort_by} descending (Retired first)"
            )
        else:
            query = query.order_by(
                desc(Player.active_status)
            )  # Reversed: True first (Active)
            print(f"CRUD: Sorting by {search_params.sort_by} ascending (Active first)")
    else:
        sort_column = _get_sort_column(search_params.sort_by)
        if search_params.sort_order == "desc":
            query = query.order_by(desc(sort_column))
            print(f"CRUD: Sorting by {search_params.sort_by} descending")
        else:
            query = query.order_by(asc(sort_column))
            print(f"CRUD: Sorting by {search_params.sort_by} ascending")

    return query


def _get_sort_column(sort_field: SortFieldType):
    """
    Map sort field names to SQLAlchemy column objects.

    Args:
        sort_field: The field to sort by

    Returns:
        SQLAlchemy column object for sorting
    """
    sort_mapping = {
        "name": Player.name,
        "position": Player.position,
        "team": Team.name,
        "jersey_number": Player.jersey_number,
        "active_status": Player.active_status,
        # Regular season stats
        "regular_season_goals": Player.regular_season_goals,
        "regular_season_assists": Player.regular_season_assists,
        "regular_season_points": Player.regular_season_points,
        "regular_season_games_played": Player.regular_season_games_played,
        # Playoff stats
        "playoff_goals": Player.playoff_goals,
        "playoff_assists": Player.playoff_assists,
        "playoff_points": Player.playoff_points,
        "playoff_games_played": Player.playoff_games_played,
        # Combined stats
        "games_played": Player.games_played,
        "goals": Player.goals,
        "assists": Player.assists,
        "points": Player.points,
    }

    return sort_mapping.get(sort_field, Player.name)  # Default to name if invalid field

def get_all_players_paginated(
    db: Session, page: int = 1, limit: int = 20
) -> tuple[list[Player], int]:
    """
    Get all players with pagination (no search).

    Args:
        db: Database session
        page: Page number (starts from 1)
        limit: Number of results per page

    Returns:
        Tuple of (players_list, total_count)
    """
    query = db.query(Player).join(Team).order_by(asc(Player.name))

    total_count = query.count()

    offset = (page - 1) * limit
    players = query.offset(offset).limit(limit).all()

    print(f"CRUD: Retrieved {len(players)} players (page {page}, total {total_count})")

    return players, total_count
