from pydantic import BaseModel, Field, validator
from typing import Optional, Literal, List, Union
from datetime import date

# Search field options - matches frontend SearchField type
SearchFieldType = Literal["all", "name", "position", "team", "nationality", "jersey_number"]

# Sort field options - matches database fields and team join
SortFieldType = Literal["name", "position", "team", "jersey_number", "goals", "assists", "points", "active_status"]

# Sort direction options
SortDirectionType = Literal["asc", "desc"]

# Filter field options - fields that can be filtered
FilterFieldType = Literal["position", "team", "jersey_number", "goals", "assists", "points", "active_status"]

# Filter operators for different data types
StringFilterOperator = Literal["=", "!=", "contains", "not_contains"]
NumericFilterOperator = Literal["=", "!=", ">", "<", ">=", "<="]
BooleanFilterOperator = Literal["=", "!="]

# Union of all filter operators
FilterOperatorType = Union[StringFilterOperator, NumericFilterOperator, BooleanFilterOperator]

class PlayerFilter(BaseModel):
    """
    Individual filter configuration.
    """
    field: FilterFieldType = Field(..., description="Field to filter on")
    operator: FilterOperatorType = Field(..., description="Filter operator")
    value: Union[str, int, bool] = Field(..., description="Filter value")
    
    @validator('operator')
    def validate_operator_for_field(cls, operator, values):
        """
        Validate that the operator is appropriate for the field type.
        """
        field = values.get('field')
        
        # String fields: position, team
        if field in ['position', 'team']:
            if operator not in ['=', '!=', 'contains', 'not_contains']:
                raise ValueError(f"Invalid operator '{operator}' for string field '{field}'")
        
        # Numeric fields: jersey_number, goals, assists, points
        elif field in ['jersey_number', 'goals', 'assists', 'points']:
            if operator not in ['=', '!=', '>', '<', '>=', '<=']:
                raise ValueError(f"Invalid operator '{operator}' for numeric field '{field}'")
        
        # Boolean field: active_status
        elif field == 'active_status':
            if operator not in ['=', '!=']:
                raise ValueError(f"Invalid operator '{operator}' for boolean field '{field}'")
        
        return operator

class PlayerSearchParams(BaseModel):
    """
    Query parameters for player search endpoint.
    """
    search: Optional[str] = Field(None, description="Search query string")
    field: SearchFieldType = Field("all", description="Field to search in")
    page: int = Field(1, ge=1, description="Page number (starts from 1)")
    limit: int = Field(20, ge=1, le=100, description="Number of results per page")
    sort_by: SortFieldType = Field("name", description="Field to sort by")
    sort_order: SortDirectionType = Field("asc", description="Sort direction (asc or desc)")
    filters: List[PlayerFilter] = Field([], description="List of filters to apply")

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
    sort_by: SortFieldType
    sort_order: SortDirectionType
    filters: List[PlayerFilter]