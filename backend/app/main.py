import json
import math
import re
from typing import get_args

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.crud.player import (
    create_player,
    delete_player,
    get_player_by_id,
    get_players_with_search,
    update_player,
)
from app.database import Base, engine, get_db
from app.models.player import Player
from app.models.team import Team
from app.schemas.player import (
    FilterFieldType,
    PlayerCreate,
    PlayerFilter,
    PlayerResponse,
    PlayerSearchParams,
    PlayerSearchResponse,
    PlayerUpdate,
    SearchFieldType,
    SortDirectionType,
    SortFieldType,
    TeamResponse,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A CRUD API for managing hockey players and teams",
    debug=settings.debug_mode,
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


def format_player_response(player: Player) -> dict:
    """
    Format a player object for API response.
    """
    return {
        "id": player.id,
        "name": player.name,
        "position": player.position,
        "nationality": player.nationality,
        "jersey_number": player.jersey_number,
        "birth_date": player.birth_date.isoformat(),
        "height": player.height,
        "weight": player.weight,
        "handedness": player.handedness,
        "active_status": player.active_status,
        
        # Regular season statistics
        "regular_season_goals": player.regular_season_goals,
        "regular_season_assists": player.regular_season_assists,
        "regular_season_points": player.regular_season_points,
        "regular_season_games_played": player.regular_season_games_played,
        
        # Playoff statistics
        "playoff_goals": player.playoff_goals,
        "playoff_assists": player.playoff_assists,
        "playoff_points": player.playoff_points,
        "playoff_games_played": player.playoff_games_played,
        # Combined statistics
        "games_played": player.games_played,
        "goals": player.goals,
        "assists": player.assists,
        "points": player.points,
        
        "team": {
            "id": player.team.id,
            "name": player.team.name,
            "city": player.team.city,
        },
    }


@app.get("/")
async def root():
    """
    Root endpoint to verify the API is running.
    """
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {"status": "healthy", "service": settings.app_name}


@app.get("/players", response_model=PlayerSearchResponse)
async def get_players(
    search: str | None = Query(None, description="Search query string"),
    field: SearchFieldType = Query("all", description="Field to search in"),
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    sort_by: SortFieldType = Query("name", description="Field to sort by"),
    sort_order: SortDirectionType = Query(
        "asc", description="Sort direction (asc or desc)"
    ),
    filters: str | None = Query(None, description="JSON string of filters array"),
    db: Session = Depends(get_db),
):
    """
    Get players with optional search, filtering, sorting, and pagination.

    - **search**: Optional search query string
    - **field**: Field to search in (all, name, position, team, nationality, jersey_number)
    - **page**: Page number (starts from 1)
    - **limit**: Number of results per page (1-100)
    - **sort_by**: Field to sort by (name, position, team, jersey_number, goals, assists, points, active_status)
    - **sort_order**: Sort direction (asc or desc)
    - **filters**: JSON string containing array of filter objects
    """

    parsed_filters = []
    if filters:
        try:
            filter_data = json.loads(filters)
            parsed_filters = [PlayerFilter(**f) for f in filter_data]
            print(f"API: Parsed {len(parsed_filters)} filters")
        except (json.JSONDecodeError, ValueError) as e:
            print(f"API: Error parsing filters: {e}")
            raise HTTPException(
                status_code=400, detail=f"Invalid filters format: {str(e)}"
            ) from e
    search_params = PlayerSearchParams(
        search=search,
        field=field,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
        filters=parsed_filters,
    )

    print(f"API: Processing player request - {search_params}")

    players, total_count = get_players_with_search(db, search_params)

    players_data = [format_player_response(player) for player in players]

    total_pages = math.ceil(total_count / limit) if total_count > 0 else 0

    response = {
        "players": players_data,
        "count": len(players_data),
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "search_query": search,
        "search_field": field,
        "sort_by": sort_by,
        "sort_order": sort_order,
        "filters": parsed_filters,
    }

    filter_info = f" with {len(parsed_filters)} filters" if parsed_filters else ""
    print(
        f"API: Returning {len(players_data)} players (page {page}/{total_pages}) sorted by {sort_by} {sort_order}{filter_info}"
    )

    return response

def _field_name_to_label(field_name: str) -> str:
    """
    Convert field name to human-readable label.
    Examples: jersey_number -> Jersey Number, active_status -> Status
    """
    # Special cases for better labeling
    special_cases = {
        "jersey_number": "Number",
        "active_status": "Status", 
        "birth_date": "Birth Date"
    }
    
    if field_name in special_cases:
        return special_cases[field_name]
    
    # Convert snake_case to Title Case
    return re.sub(r'_', ' ', field_name).title()

@app.get("/column-metadata")
async def get_column_metadata():
    """
    Get metadata about column capabilities for table management.
    Returns information about which columns support search, sort, and filter operations
    based on the schema definitions. Column names and types are extracted directly
    from the PlayerResponse model.
    """
    # Get the actual field lists from the schema type definitions
    searchable_fields = set(get_args(SearchFieldType)) - {"all"}  # Remove "all" as it's not a real field
    sortable_fields = set(get_args(SortFieldType))
    filterable_fields = set(get_args(FilterFieldType))
    
    # Define the desired display order for unselected columns (for easy discovery)
    desired_order = [
        'jersey_number',
        'name',
        'position',
        'team',
        'regular_season_games_played',
        'regular_season_goals',
        'regular_season_assists',
        'regular_season_points',
        'playoff_games_played',
        'playoff_goals',
        'playoff_assists',
        'playoff_points',
        'games_played',
        'goals',
        'assists',
        'points',
        'height',
        'weight',
        'birth_date',
        'nationality',
        'handedness',
        'active_status',
    ]

    # Define default visible columns (in selection order for initial load)
    default_visible_columns = [
        'name',
        'jersey_number',
        'position',
        'team',
        'games_played',
        'goals',
        'assists',
        'points',
        'active_status',
    ]
    
    # Get all fields from PlayerResponse model, excluding nested objects and metadata
    player_fields = PlayerResponse.model_fields
    excluded_fields = {"id", "team"}  # Exclude ID (not user-manageable) and team (nested object)
    
    # Build column metadata dynamically from PlayerResponse schema
    columns_metadata = []
    
    for field_name, field_info in player_fields.items():
        if field_name in excluded_fields:
            continue
            
        # Determine capabilities based on schema type definitions
        capabilities = []
        if field_name in searchable_fields:
            capabilities.append("searchable")
        if field_name in sortable_fields:
            capabilities.append("sortable") 
        if field_name in filterable_fields:
            capabilities.append("filterable")
            
        columns_metadata.append({
            "key": field_name,
            "label": _field_name_to_label(field_name),
            "required": field_name == "name",  # Only name is required for display
            "capabilities": capabilities,
            "field_type": str(field_info.annotation).replace("typing.", "").replace("<class '", "").replace("'>", "")
        })
    
    # Sort columns by the desired order
    def get_order_index(column):
        try:
            return desired_order.index(column["key"])
        except ValueError:
            # If not in desired_order, put at the end
            return len(desired_order)
    
    columns_metadata.sort(key=get_order_index)

    return {
        "columns": columns_metadata,
        "count": len(columns_metadata),
        "default_visible_columns": default_visible_columns
    }


@app.get("/teams", response_model=list[TeamResponse])
async def get_teams(db: Session = Depends(get_db)):
    """
    Get all teams for dropdown selection.
    Returns a list of all teams with their ID, name, and city.
    """
    teams = db.query(Team).order_by(Team.name).all()
    print(f"API: Returning {len(teams)} teams")

    return [
        {
            "id": team.id,
            "name": team.name,
            "city": team.city
        }
        for team in teams
    ]


@app.post("/players", response_model=PlayerResponse, status_code=201)
async def create_new_player(
    player_data: PlayerCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new player.

    - **name**: Player's full name (required)
    - **jersey_number**: Jersey number 0-99 (required)
    - **position**: Playing position - C, LW, RW, D, or G (required)
    - **team_id**: ID of the team the player belongs to (required)
    - **nationality**: Player's nationality (required)
    - **birth_date**: Date of birth (required)
    - **height**: Height as a string (e.g., "6'2\"") (required)
    - **weight**: Weight in lbs (required)
    - **handedness**: L or R (required)
    - **active_status**: Whether player is currently active (default: True)
    - **regular_season_games_played**: Regular season games played (default: 0)
    - **regular_season_goals**: Regular season goals (default: 0)
    - **regular_season_assists**: Regular season assists (default: 0)
    - **playoff_games_played**: Playoff games played (default: 0)
    - **playoff_goals**: Playoff goals (default: 0)
    - **playoff_assists**: Playoff assists (default: 0)
    """
    # Verify team exists
    team = db.query(Team).filter(Team.id == player_data.team_id).first()
    if not team:
        print(f"API: Team with ID {player_data.team_id} not found")
        raise HTTPException(status_code=404, detail=f"Team with ID {player_data.team_id} not found")

    print(f"API: Creating player {player_data.name} for team {team.name}")

    new_player = create_player(db, player_data)

    return format_player_response(new_player)


@app.get("/players/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: int, db: Session = Depends(get_db)):
    """
    Get a single player by ID.

    - **player_id**: The ID of the player to retrieve
    """
    print(f"API: Fetching player with ID {player_id}")

    player = get_player_by_id(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail=f"Player with ID {player_id} not found")

    return format_player_response(player)


@app.put("/players/{player_id}", response_model=PlayerResponse)
async def update_existing_player(
    player_id: int,
    player_data: PlayerUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing player.

    - **player_id**: The ID of the player to update
    - All player fields are required in the request body
    """
    # Verify team exists
    team = db.query(Team).filter(Team.id == player_data.team_id).first()
    if not team:
        print(f"API: Team with ID {player_data.team_id} not found")
        raise HTTPException(status_code=404, detail=f"Team with ID {player_data.team_id} not found")

    print(f"API: Updating player ID {player_id}")

    updated_player = update_player(db, player_id, player_data)
    if not updated_player:
        raise HTTPException(status_code=404, detail=f"Player with ID {player_id} not found")

    return format_player_response(updated_player)


@app.delete("/players/{player_id}", status_code=204)
async def delete_existing_player(player_id: int, db: Session = Depends(get_db)):
    """
    Delete a player from the database.

    - **player_id**: The ID of the player to delete
    """
    print(f"API: Deleting player ID {player_id}")

    success = delete_player(db, player_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Player with ID {player_id} not found")

    return None
