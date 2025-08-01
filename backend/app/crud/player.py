from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, String, cast, asc, desc
from app.models.player import Player
from app.models.team import Team
from app.schemas.player import PlayerSearchParams, SearchFieldType, SortFieldType, SortDirectionType
from typing import Tuple, List

def get_players_with_search(
    db: Session, 
    search_params: PlayerSearchParams
) -> Tuple[List[Player], int]:
    """
    Get players with search, sorting, and pagination.
    
    Args:
        db: Database session
        search_params: Search parameters including query, field, pagination, and sorting
    
    Returns:
        Tuple of (players_list, total_count)
    """
    query = db.query(Player).join(Team)
    
    # Apply search filter if search query provided
    if search_params.search and search_params.search.strip():
        search_term = f"%{search_params.search.strip().lower()}%"
        
        if search_params.field == "all":
            query = query.filter(
                or_(
                    func.lower(Player.name).like(search_term),
                    func.lower(Player.position).like(search_term),
                    func.lower(Player.nationality).like(search_term),
                    func.lower(Team.name).like(search_term),
                    func.lower(cast(Player.jersey_number, String)).like(search_term)
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
    
    # Apply sorting with special handling for active_status
    if search_params.sort_by == "active_status":
        # For active_status, reverse the sort logic to match user-friendly display
        # "Active" (True) should come before "Retired" (False) when ascending
        if search_params.sort_order == "desc":
            query = query.order_by(asc(Player.active_status))  # Reversed: False first (Retired)
            print(f"CRUD: Sorting by {search_params.sort_by} descending (Retired first)")
        else:
            query = query.order_by(desc(Player.active_status))  # Reversed: True first (Active)
            print(f"CRUD: Sorting by {search_params.sort_by} ascending (Active first)")
    else:
        # Normal sorting for all other fields
        sort_column = _get_sort_column(search_params.sort_by)
        if search_params.sort_order == "desc":
            query = query.order_by(desc(sort_column))
            print(f"CRUD: Sorting by {search_params.sort_by} descending")
        else:
            query = query.order_by(asc(sort_column))
            print(f"CRUD: Sorting by {search_params.sort_by} ascending")
    
    total_count = query.count()
    print(f"CRUD: Found {total_count} total matches")
    
    # Apply pagination
    offset = (search_params.page - 1) * search_params.limit
    players = query.offset(offset).limit(search_params.limit).all()
    
    print(f"CRUD: Returning {len(players)} players for page {search_params.page}")
    
    return players, total_count

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
        "goals": Player.goals,
        "assists": Player.assists,
        "points": Player.points,
        "active_status": Player.active_status
    }
    
    return sort_mapping.get(sort_field, Player.name)  # Default to name if invalid field

def get_all_players_paginated(
    db: Session, 
    page: int = 1, 
    limit: int = 20
) -> Tuple[List[Player], int]:
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
    
    # Apply pagination
    offset = (page - 1) * limit
    players = query.offset(offset).limit(limit).all()
    
    print(f"CRUD: Retrieved {len(players)} players (page {page}, total {total_count})")
    
    return players, total_count