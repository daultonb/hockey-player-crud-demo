from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, String, cast
from app.models.player import Player
from app.models.team import Team
from app.schemas.player import PlayerSearchParams, SearchFieldType
from typing import Tuple, List
import math

def get_players_with_search(
    db: Session, 
    search_params: PlayerSearchParams
) -> Tuple[List[Player], int]:
    """
    Get players with search and pagination.
    
    Args:
        db: Database session
        search_params: Search parameters including query, field, pagination
    
    Returns:
        Tuple of (players_list, total_count)
    """
    # Base query with team join
    query = db.query(Player).join(Team)
    
    # Apply search filter if search query provided
    if search_params.search and search_params.search.strip():
        search_term = f"%{search_params.search.strip().lower()}%"
        
        if search_params.field == "all":
            # Search across all searchable fields
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
    
    # Get total count before applying pagination
    total_count = query.count()
    print(f"CRUD: Found {total_count} total matches")
    
    # Apply pagination
    offset = (search_params.page - 1) * search_params.limit
    players = query.offset(offset).limit(search_params.limit).all()
    
    print(f"CRUD: Returning {len(players)} players for page {search_params.page}")
    
    return players, total_count

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
    # Base query with team join
    query = db.query(Player).join(Team)
    
    # Get total count
    total_count = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    players = query.offset(offset).limit(limit).all()
    
    print(f"CRUD: Retrieved {len(players)} players (page {page}, total {total_count})")
    
    return players, total_count