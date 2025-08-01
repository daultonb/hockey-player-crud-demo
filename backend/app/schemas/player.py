from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date

# Search field options - matches frontend SearchField type
SearchFieldType = Literal["all", "name", "position", "team", "nationality", "jersey_number"]

class PlayerSearchParams(BaseModel):
    """
    Query parameters for player search endpoint.
    """
    search: Optional[str] = Field(None, description="Search query string")
    field: SearchFieldType = Field("all", description="Field to search in")
    page: int = Field(1, ge=1, description="Page number (starts from 1)")
    limit: int = Field(20, ge=1, le=100, description="Number of results per page")

class TeamResponse(BaseModel):
    """
    Team information in API responses.
    """
    id: int
    name: str
    city: str

class PlayerResponse(BaseModel):
    """
    Player information in API responses.
    """
    id: int
    name: str
    position: str
    nationality: str
    jersey_number: int
    birth_date: str
    height: str
    weight: int
    handedness: str
    goals: int
    assists: int
    points: int
    active_status: bool
    team: TeamResponse

class PlayersListResponse(BaseModel):
    """
    Response model for players list endpoint.
    """
    players: list[PlayerResponse]
    count: int
    total: int
    page: int
    limit: int
    total_pages: int

class PlayerSearchResponse(BaseModel):
    """
    Response model for player search results.
    """
    players: list[PlayerResponse]
    count: int
    total: int
    page: int
    limit: int
    total_pages: int
    search_query: Optional[str]
    search_field: SearchFieldType