from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import settings
from app.database import engine, Base, get_db
from app.models.player import Player
from app.models.team import Team

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

@app.get("/players")
async def get_all_players(db: Session = Depends(get_db)):
    """
    Get all players with their team information.
    """
    players = db.query(Player).join(Team).all()
    
    players_data = []
    for player in players:
        player_dict = {
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
        players_data.append(player_dict)
    
    return {"players": players_data, "count": len(players_data)}