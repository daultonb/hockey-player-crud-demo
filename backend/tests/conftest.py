"""
Test configuration and shared fixtures for the hockey CRUD application.

This file provides:
- Database setup and teardown for tests
- Reusable test data generators
- Shared fixtures for teams and players
- In-memory SQLite database for isolated testing
- FastAPI TestClient with database dependency override
- Redis client management for tests
"""

import random
from datetime import date
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.player import Player
from app.models.team import Team

# Test database URL - in-memory SQLite for isolation
TEST_DATABASE_URL = "sqlite:///:memory:"


# Enable foreign key constraints for SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """
    Enable foreign key constraints for SQLite connections.
    This is crucial for testing foreign key constraint violations.
    """
    if "sqlite" in str(dbapi_connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


@pytest.fixture(scope="function")
def test_engine():
    """
    Create a test database engine using in-memory SQLite.
    Uses StaticPool to ensure all connections share the same in-memory database.
    """
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db(test_engine):
    """Create a test database session with automatic cleanup."""
    testing_session_local = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )
    session = testing_session_local()
    try:
        yield session
    finally:
        session.close()


class TestDataGenerator:
    """Utility class for generating realistic test data."""

    POSITIONS = ["C", "LW", "RW", "D", "G"]
    NATIONALITIES = [
        "Canadian",
        "American",
        "Swedish",
        "Finnish",
        "Russian",
        "Czech",
        "Slovak",
        "German",
    ]
    HANDEDNESS = ["L", "R"]
    HEIGHTS = [
        "5'8\"",
        "5'9\"",
        "5'10\"",
        "5'11\"",
        "6'0\"",
        "6'1\"",
        "6'2\"",
        "6'3\"",
        "6'4\"",
        "6'5\"",
    ]

    FIRST_NAMES = [
        "Alex",
        "Sarah",
        "Marcus",
        "Emma",
        "Jake",
        "Olivia",
        "Connor",
        "Sophie",
        "Liam",
        "Isabella",
        "Noah",
        "Mia",
        "Ethan",
        "Charlotte",
        "Lucas",
        "Amelia",
    ]

    LAST_NAMES = [
        "Thunder",
        "Blaze",
        "Stone",
        "Swift",
        "Power",
        "Storm",
        "Frost",
        "Lightning",
        "Steel",
        "Ice",
        "Fire",
        "Wind",
        "Rock",
        "Wave",
        "Star",
        "Moon",
    ]

    @classmethod
    def generate_team_data(cls, count: int = 2) -> list[dict[str, Any]]:
        """Generate realistic team data for testing."""
        teams = []
        cities = [
            "Toronto",
            "Montreal",
            "Vancouver",
            "Calgary",
            "Edmonton",
            "Ottawa",
            "Winnipeg",
            "Boston",
        ]
        conferences = ["Eastern", "Western"]
        divisions = ["Atlantic", "Metropolitan", "Central", "Pacific"]

        for i in range(count):
            teams.append(
                {
                    "name": f"Test Team {i+1}",
                    "city": cities[i % len(cities)],
                    "conference": conferences[i % len(conferences)],
                    "division": divisions[i % len(divisions)],
                    "founded_year": 1960 + (i * 5),
                    "arena": f"Test Arena {i+1}",
                }
            )

        return teams

    @classmethod
    def generate_player_data(cls, team_id: int, count: int = 5) -> list[dict[str, Any]]:
        """Generate realistic player data for testing."""
        players = []
        used_jerseys = set()

        for _ in range(count):
            jersey = random.randint(1, 99)
            while jersey in used_jerseys:
                jersey = random.randint(1, 99)
            used_jerseys.add(jersey)

            position = random.choice(cls.POSITIONS)
            if position == "G":  # Goalie
                goals = random.randint(0, 2)
                assists = random.randint(0, 5)
            elif position == "D":  # Defense
                goals = random.randint(5, 20)
                assists = random.randint(15, 50)
            else:  # Forwards (C, LW, RW)
                goals = random.randint(10, 50)
                assists = random.randint(10, 60)

            birth_year = random.randint(1985, 2000)
            birth_month = random.randint(1, 12)
            birth_day = random.randint(1, 28)

            players.append(
                {
                    "name": f"{random.choice(cls.FIRST_NAMES)} {random.choice(cls.LAST_NAMES)}",
                    "position": position,
                    "nationality": random.choice(cls.NATIONALITIES),
                    "jersey_number": jersey,
                    "birth_date": date(birth_year, birth_month, birth_day),
                    "height": random.choice(cls.HEIGHTS),
                    "weight": random.randint(160, 240),
                    "handedness": random.choice(cls.HANDEDNESS),
                    "goals": goals,
                    "assists": assists,
                    "points": goals + assists,
                    "active_status": random.choice([True, True, True, False]),
                    "team_id": team_id,
                }
            )

        return players


@pytest.fixture
def sample_teams(test_db: Session) -> list[Team]:
    """Create sample teams in the test database."""
    teams_data = TestDataGenerator.generate_team_data(3)
    teams = []

    for team_data in teams_data:
        team = Team(**team_data)
        test_db.add(team)
        teams.append(team)

    test_db.commit()

    for team in teams:
        test_db.refresh(team)

    return teams


@pytest.fixture
def sample_players(test_db: Session, sample_teams: list[Team]) -> list[Player]:
    """Create sample players across all teams in the test database."""
    all_players = []

    for team in sample_teams:
        team_id: int = team.id  # type: ignore
        players_data = TestDataGenerator.generate_player_data(team_id, 8)
        for player_data in players_data:
            player = Player(**player_data)
            test_db.add(player)
            all_players.append(player)

    test_db.commit()

    for player in all_players:
        test_db.refresh(player)

    return all_players


@pytest.fixture
def specific_test_players(test_db: Session, sample_teams: list[Team]) -> list[Player]:
    """Create specific players with known data for predictable testing."""
    team1, team2 = sample_teams[0], sample_teams[1]

    team1_id: int = team1.id  # type: ignore
    team2_id: int = team2.id  # type: ignore

    specific_players_data = [
        {
            "name": "Player Alpha",
            "position": "C",
            "nationality": "Canadian",
            "jersey_number": 87,
            "birth_date": date(1995, 3, 15),
            "height": "6'2\"",
            "weight": 195,
            "handedness": "L",
            "goals": 50,
            "assists": 40,
            "points": 90,
            "active_status": True,
            "team_id": team1_id,
        },
        {
            "name": "Player Beta",
            "position": "D",
            "nationality": "American",
            "jersey_number": 44,
            "birth_date": date(1990, 8, 22),
            "height": "6'4\"",
            "weight": 220,
            "handedness": "R",
            "goals": 10,
            "assists": 30,
            "points": 40,
            "active_status": False,
            "team_id": team2_id,
        },
        {
            "name": "Player Gamma",
            "position": "G",
            "nationality": "Swedish",
            "jersey_number": 1,
            "birth_date": date(1992, 12, 5),
            "height": "6'0\"",
            "weight": 180,
            "handedness": "L",
            "goals": 0,
            "assists": 5,
            "points": 5,
            "active_status": True,
            "team_id": team1_id,
        },
    ]

    players = []
    for player_data in specific_players_data:
        player = Player(**player_data)
        test_db.add(player)
        players.append(player)

    test_db.commit()

    for player in players:
        test_db.refresh(player)

    return players


@pytest.fixture(scope="function")
def client(test_engine):
    """
    Create FastAPI test client for endpoint testing.
    Overrides the database dependency to use the test database.
    """
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function", autouse=True)
def reset_redis_client():
    """
    Reset Redis client between tests to avoid event loop conflicts.
    This runs automatically before each test function.
    """
    # Reset the singleton instance before each test
    from app.redis_client import RedisClient

    # Simply reset the class variables - don't try to close connections
    # as that causes "Event loop is closed" errors
    RedisClient._client = None
    RedisClient._pool = None
    yield
    # Clean up after test
    RedisClient._client = None
    RedisClient._pool = None


@pytest.fixture(scope="function", autouse=False)  # Disabled for now - causing test issues
async def clear_redis_rate_limits():
    """
    Clear rate limit keys from Redis before each test.
    This ensures tests don't interfere with each other.

    NOTE: Currently disabled (autouse=False) due to interaction with TestClient.
    slowapi may use in-memory storage during tests instead of Redis.
    """
    try:
        from app.redis_client import RedisClient

        client = await RedisClient.get_client()
        # slowapi stores rate limit keys with pattern: LIMITER/<ip>:<endpoint>/<window>
        # Clear all rate limit keys
        keys = await client.keys("LIMITER*")
        if keys:
            await client.delete(*keys)
    except Exception:
        # If Redis is not available, skip cleanup
        pass
    yield
