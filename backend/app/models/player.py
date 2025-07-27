from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Player(Base):
    """
    Player database model representing hockey players.
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
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    points = Column(Integer, default=0)
    active_status = Column(Boolean, default=True)
    
    # Foreign key relationship to team
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    # Many-to-one relationship: many players belong to one team
    team = relationship("Team", back_populates="players")