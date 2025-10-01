from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Player(Base):
    """
    Player database model representing hockey players with comprehensive stats.
    """

    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    position = Column(String, nullable=False)
    nationality = Column(String, nullable=False)
    jersey_number = Column(Integer, nullable=False)
    birth_date = Column(Date, nullable=False)
    height = Column(String, nullable=False)
    weight = Column(Integer, nullable=False)
    handedness = Column(String, nullable=False)
    active_status = Column(Boolean, default=True)

    # Regular season statistics
    regular_season_goals = Column(Integer, default=0)
    regular_season_assists = Column(Integer, default=0)
    regular_season_points = Column(Integer, default=0)
    regular_season_games_played = Column(Integer, default=0)

    # Playoff statistics
    playoff_goals = Column(Integer, default=0)
    playoff_assists = Column(Integer, default=0)
    playoff_points = Column(Integer, default=0)
    playoff_games_played = Column(Integer, default=0)

    # Combined statistics
    games_played = Column(Integer, default=0)
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    points = Column(Integer, default=0)

    # Foreign key relationship to team
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)

    # Many-to-one relationship: many players belong to one team
    team = relationship("Team", back_populates="players")