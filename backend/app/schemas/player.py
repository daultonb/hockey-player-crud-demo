from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, validator

# Search field options - matches frontend SearchField type
SearchFieldType = Literal[
    "all", "name", "position", "team", "nationality", "jersey_number"
]

# Sort field options - matches database fields and team join
SortFieldType = Literal[
    "name",
    "position", 
    "team",
    "jersey_number",
    "active_status",
    "regular_season_games_played",
    "regular_season_goals",
    "regular_season_assists",
    "regular_season_points", 
    "playoff_games_played",
    "playoff_goals",
    "playoff_assists",
    "playoff_points",
    "games_played",
    "goals", 
    "assists", 
    "points", 
]

# Sort direction options
SortDirectionType = Literal["asc", "desc"]

# Filter field options - fields that can be filtered
FilterFieldType = Literal[
    "position", 
    "team", 
    "jersey_number", 
    "active_status",
    "regular_season_games_played",
    "regular_season_goals",
    "regular_season_assists", 
    "regular_season_points",
    "playoff_games_played",
    "playoff_goals",
    "playoff_assists",
    "playoff_points", 
    "games_played",
    "goals", 
    "assists", 
    "points", 
]

# Filter operators for different data types
StringFilterOperator = Literal["=", "!=", "contains", "not_contains"]
NumericFilterOperator = Literal["=", "!=", ">", "<", ">=", "<="]
BooleanFilterOperator = Literal["=", "!="]

FilterOperatorType = (
    StringFilterOperator | NumericFilterOperator | BooleanFilterOperator
)


class PlayerFilter(BaseModel):
    """
    Individual filter configuration.
    """

    field: FilterFieldType = Field(..., description="Field to filter on")
    operator: FilterOperatorType = Field(..., description="Filter operator")
    value: str | int | bool = Field(..., description="Filter value")

    @validator("operator")
    def validate_operator_for_field(cls, operator, values):
        """
        Validate that the operator is appropriate for the field type.
        """
        field = values.get("field")

        # String fields: position, team
        if field in ["position", "team"]:
            if operator not in ["=", "!=", "contains", "not_contains"]:
                raise ValueError(
                    f"Invalid operator '{operator}' for string field '{field}'"
                )

        # Numeric fields: jersey_number, all stat fields
        elif field in [
            "jersey_number",
            "regular_season_games_played",
            "regular_season_goals",
            "regular_season_assists", 
            "regular_season_points",
            "playoff_games_played",
            "playoff_goals",
            "playoff_assists",
            "playoff_points",
            "games_played",
            "goals", 
            "assists", 
            "points",
        ]:
            if operator not in ["=", "!=", ">", "<", ">=", "<="]:
                raise ValueError(
                    f"Invalid operator '{operator}' for numeric field '{field}'"
                )

        # Boolean field: active_status
        elif field == "active_status":
            if operator not in ["=", "!="]:
                raise ValueError(
                    f"Invalid operator '{operator}' for boolean field '{field}'"
                )

        return operator


class PlayerSearchParams(BaseModel):
    """
    Query parameters for player search endpoint.
    """

    search: str | None = Field(None, description="Search query string")
    field: SearchFieldType = Field("all", description="Field to search in")
    page: int = Field(1, ge=1, description="Page number (starts from 1)")
    limit: int = Field(20, ge=1, le=100, description="Number of results per page")
    sort_by: SortFieldType = Field("name", description="Field to sort by")
    sort_order: SortDirectionType = Field(
        "asc", description="Sort direction (asc or desc)"
    )
    filters: list[PlayerFilter] = Field([], description="List of filters to apply")


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
    active_status: bool
    
    # Regular season statistics
    regular_season_goals: int
    regular_season_assists: int
    regular_season_points: int
    regular_season_games_played: int
    
    # Playoff statistics
    playoff_goals: int
    playoff_assists: int
    playoff_points: int
    playoff_games_played: int

    # Combined statistics
    games_played: int
    goals: int
    assists: int
    points: int
    
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
    search_query: str | None
    search_field: SearchFieldType
    sort_by: SortFieldType
    sort_order: SortDirectionType
    filters: list[PlayerFilter]


class PlayerCreate(BaseModel):
    """
    Schema for creating a new player.
    """

    name: str = Field(..., min_length=1, max_length=100, description="Player name")
    jersey_number: int = Field(..., ge=0, le=99, description="Jersey number (0-99)")
    position: str = Field(..., description="Playing position")
    team_id: int = Field(..., gt=0, description="Team ID")
    nationality: str = Field(..., min_length=1, description="Player nationality")
    birth_date: date = Field(..., description="Date of birth")
    height: str = Field(..., description="Player height (e.g., 6'2\")")
    weight: int = Field(..., gt=0, description="Player weight in lbs")
    handedness: str = Field(..., description="Left or Right")
    active_status: bool = Field(True, description="Whether player is currently active")

    # Regular season statistics with defaults
    regular_season_games_played: int = Field(0, ge=0, description="Regular season games played")
    regular_season_goals: int = Field(0, ge=0, description="Regular season goals")
    regular_season_assists: int = Field(0, ge=0, description="Regular season assists")

    # Playoff statistics with defaults
    playoff_games_played: int = Field(0, ge=0, description="Playoff games played")
    playoff_goals: int = Field(0, ge=0, description="Playoff goals")
    playoff_assists: int = Field(0, ge=0, description="Playoff assists")

    @validator("position")
    def validate_position(cls, v):
        """Validate position is one of the allowed values."""
        allowed_positions = ["C", "LW", "RW", "D", "G"]
        if v not in allowed_positions:
            raise ValueError(f"Position must be one of {allowed_positions}")
        return v

    @validator("handedness")
    def validate_handedness(cls, v):
        """Validate handedness is Left or Right."""
        if v not in ["L", "R"]:
            raise ValueError("Handedness must be 'L' or 'R'")
        return v


class PlayerUpdate(BaseModel):
    """
    Schema for updating an existing player.
    """

    name: str = Field(..., min_length=1, max_length=100, description="Player name")
    jersey_number: int = Field(..., ge=0, le=99, description="Jersey number (0-99)")
    position: str = Field(..., description="Playing position")
    team_id: int = Field(..., gt=0, description="Team ID")
    nationality: str = Field(..., min_length=1, description="Player nationality")
    birth_date: date = Field(..., description="Date of birth")
    height: str = Field(..., description="Player height (e.g., 6'2\")")
    weight: int = Field(..., gt=0, description="Player weight in lbs")
    handedness: str = Field(..., description="Left or Right")
    active_status: bool = Field(..., description="Whether player is currently active")

    # Regular season statistics
    regular_season_games_played: int = Field(..., ge=0, description="Regular season games played")
    regular_season_goals: int = Field(..., ge=0, description="Regular season goals")
    regular_season_assists: int = Field(..., ge=0, description="Regular season assists")

    # Playoff statistics
    playoff_games_played: int = Field(..., ge=0, description="Playoff games played")
    playoff_goals: int = Field(..., ge=0, description="Playoff goals")
    playoff_assists: int = Field(..., ge=0, description="Playoff assists")

    @validator("position")
    def validate_position(cls, v):
        """Validate position is one of the allowed values."""
        allowed_positions = ["C", "LW", "RW", "D", "G"]
        if v not in allowed_positions:
            raise ValueError(f"Position must be one of {allowed_positions}")
        return v

    @validator("handedness")
    def validate_handedness(cls, v):
        """Validate handedness is Left or Right."""
        if v not in ["L", "R"]:
            raise ValueError("Handedness must be 'L' or 'R'")
        return v