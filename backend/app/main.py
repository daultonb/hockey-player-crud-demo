from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import settings
from app.database import engine, Base, get_db
from app.models.player import Player
from app.models.team import Team
from app.schemas.player import (
    PlayerSearchParams, 
    PlayerSearchResponse, 
    PlayersListResponse,
    SearchFieldType
)
from app.crud.player import get_players_with_search, get_all_players_paginated
from typing import Optional
import math

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A CRUD API for managing hockey players and teams",
    debug=settings.debug_mode
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
            "city": player.team.city
        }
    }

@app.get("/")
async def root():
    """
    Root endpoint to verify the API is running.
    """
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {"status": "healthy", "service": settings.app_name}

@app.get("/players", response_model=PlayerSearchResponse)
async def get_players(
    search: Optional[str] = Query(None, description="Search query string"),
    field: SearchFieldType = Query("all", description="Field to search in"),
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    db: Session = Depends(get_db)
):
    """
    Get players with optional search and pagination.
    
    - **search**: Optional search query string
    - **field**: Field to search in (all, name, position, team, nationality, jersey_number)
    - **page**: Page number (starts from 1)
    - **limit**: Number of results per page (1-100)
    """
    
    search_params = PlayerSearchParams(
        search=search,
        field=field,
        page=page,
        limit=limit
    )
    
    print(f"API: Processing player request - {search_params}")
    
    # Get players and total count
    players, total_count = get_players_with_search(db, search_params)
    
    # Format players for response
    players_data = [format_player_response(player) for player in players]
    
    # Calculate pagination info
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 0
    
    response = {
        "players": players_data,
        "count": len(players_data),
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "search_query": search,
        "search_field": field
    }
    
    print(f"API: Returning {len(players_data)} players (page {page}/{total_pages})")
    
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