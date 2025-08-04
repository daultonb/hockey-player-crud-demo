import json
import math

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.crud.player import get_players_with_search
from app.database import Base, engine, get_db
from app.models.player import Player
from app.models.team import Team
from app.schemas.player import (
    PlayerFilter,
    PlayerSearchParams,
    PlayerSearchResponse,
    SearchFieldType,
    SortDirectionType,
    SortFieldType,
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
        "goals": player.goals,
        "assists": player.assists,
        "points": player.points,
        "active_status": player.active_status,
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


@app.get("/players/all")
async def get_all_players_legacy(db: Session = Depends(get_db)):
    """
    Legacy endpoint: Get all players without pagination (for backward compatibility).
    """
    print("API: Legacy endpoint - fetching all players")

    players = db.query(Player).join(Team).all()
    players_data = [format_player_response(player) for player in players]

    return {"players": players_data, "count": len(players_data)}
