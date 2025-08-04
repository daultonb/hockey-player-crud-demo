from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Team(Base):
    """
    Team database model representing NHL teams.
    """

    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False)
    conference = Column(String, nullable=False)
    division = Column(String, nullable=False)
    founded_year = Column(Integer, nullable=False)
    arena = Column(String, nullable=False)

    # One-to-many relationship: one team has many players
    players = relationship("Player", back_populates="team")
