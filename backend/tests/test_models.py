"""
Unit tests for database models and relationships.

This file tests the SQLAlchemy models in app/models/ including:
- Player and Team model creation and validation
- Database relationships (one-to-many between teams and players)
- Model field constraints and defaults
- Database integrity and foreign key relationships
"""

from datetime import date

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.player import Player
from app.models.team import Team

# Import Test helper functions for assertions
from tests.test_utils import (
    assert_model_fields,
)


class TestTeamModel:
    """Test Team model creation and validation."""

    @pytest.mark.models
    def test_create_team_with_all_fields(self, test_db: Session):
        """
        Test creating a team with all required fields.
        Input: Complete team data
        Expected: Team created successfully with all fields set
        """
        team_data = {
            "name": "Test Hockey Team",
            "city": "Test City",
            "conference": "Eastern",
            "division": "Atlantic",
            "founded_year": 1975,
            "arena": "Test Arena",
        }

        team = Team(**team_data)
        test_db.add(team)
        test_db.commit()
        test_db.refresh(team)

        assert team.id is not None

        saved_team = test_db.query(Team).filter(Team.id == team.id).first()
        assert saved_team is not None

        assert_model_fields(
            saved_team,
            {
                "name": "Test Hockey Team",
                "city": "Test City",
                "conference": "Eastern",
                "division": "Atlantic",
                "founded_year": 1975,
                "arena": "Test Arena",
            },
        )

    @pytest.mark.models
    def test_team_relationship_with_players(self, test_db: Session):
        """
        Test team-to-players relationship functionality.
        Input: Team with associated players
        Expected: Team.players relationship returns associated players
        """
        # Create team
        team = Team(
            name="Relationship Test Team",
            city="Test City",
            conference="Western",
            division="Pacific",
            founded_year=1980,
            arena="Test Arena",
        )
        test_db.add(team)
        test_db.commit()
        test_db.refresh(team)

        player1 = Player(
            name="Player One",
            position="Center",
            nationality="Canadian",
            jersey_number=1,
            birth_date=date(1990, 1, 1),
            height="6'0\"",
            weight=180,
            handedness="Left",
            team_id=team.id,
        )

        player2 = Player(
            name="Player Two",
            position="Defense",
            nationality="American",
            jersey_number=2,
            birth_date=date(1991, 2, 2),
            height="6'2\"",
            weight=200,
            handedness="Right",
            team_id=team.id,
        )

        test_db.add_all([player1, player2])
        test_db.commit()

        saved_team = test_db.query(Team).filter(Team.id == team.id).first()
        assert saved_team is not None
        assert len(saved_team.players) == 2

        player_names = [p.name for p in saved_team.players]
        assert "Player One" in player_names
        assert "Player Two" in player_names


class TestPlayerModel:
    """Test Player model creation, validation, and relationships."""

    @pytest.mark.models
    def test_create_player_with_required_fields(self, test_db: Session, sample_teams):
        """
        Test creating a player with all required fields.
        Input: Complete player data with valid team_id
        Expected: Player created successfully with all fields set
        """
        team = sample_teams[0]

        player_data = {
            "name": "Test Player",
            "position": "Center",
            "nationality": "Canadian",
            "jersey_number": 99,
            "birth_date": date(1995, 6, 15),
            "height": "6'1\"",
            "weight": 190,
            "handedness": "Left",
            "goals": 25,
            "assists": 35,
            "points": 60,
            "active_status": True,
            "team_id": team.id,
        }

        player = Player(**player_data)
        test_db.add(player)
        test_db.commit()
        test_db.refresh(player)

        saved_player = test_db.query(Player).filter(Player.id == player.id).first()
        assert saved_player is not None

        assert_model_fields(
            saved_player,
            {
                "name": "Test Player",
                "position": "Center",
                "nationality": "Canadian",
                "jersey_number": 99,
                "birth_date": date(1995, 6, 15),
                "height": "6'1\"",
                "weight": 190,
                "handedness": "Left",
                "goals": 25,
                "assists": 35,
                "points": 60,
                "active_status": True,
                "team_id": team.id,
            },
        )

    @pytest.mark.models
    def test_player_default_values(self, test_db: Session, sample_teams):
        """
        Test player model default values for optional fields.
        Input: Player data without goals, assists, points, active_status
        Expected: Default values applied (0 for stats, True for active_status)
        """
        team = sample_teams[0]

        player = Player(
            name="Default Values Player",
            position="Right Wing",
            nationality="Swedish",
            jersey_number=88,
            birth_date=date(1993, 8, 20),
            height="5'11\"",
            weight=175,
            handedness="Right",
            team_id=team.id,
        )

        test_db.add(player)
        test_db.commit()
        test_db.refresh(player)

        saved_player = test_db.query(Player).filter(Player.id == player.id).first()
        assert saved_player is not None

        assert_model_fields(
            saved_player, {"goals": 0, "assists": 0, "points": 0, "active_status": True}
        )

    @pytest.mark.models
    def test_player_team_relationship(self, test_db: Session, sample_teams):
        """
        Test player-to-team relationship functionality.
        Input: Player with team_id
        Expected: Player.team relationship returns associated team
        """
        team = sample_teams[0]

        player = Player(
            name="Relationship Test Player",
            position="Goalie",
            nationality="Finnish",
            jersey_number=1,
            birth_date=date(1992, 3, 10),
            height="6'3\"",
            weight=190,
            handedness="Left",
            team_id=team.id,
        )

        test_db.add(player)
        test_db.commit()
        test_db.refresh(player)

        saved_player = test_db.query(Player).filter(Player.id == player.id).first()
        assert saved_player is not None
        assert saved_player.team is not None
        assert saved_player.team.id == team.id
        assert saved_player.team.name == team.name

    @pytest.mark.models
    def test_player_foreign_key_constraint(self, test_db: Session):
        """
        Test foreign key constraint on team_id.
        Input: Player with invalid team_id
        Expected: IntegrityError raised
        """
        player = Player(
            name="Invalid Team Player",
            position="Center",
            nationality="Canadian",
            jersey_number=77,
            birth_date=date(1994, 7, 7),
            height="6'0\"",
            weight=185,
            handedness="Left",
            team_id=99999,
        )

        test_db.add(player)

        with pytest.raises(IntegrityError):
            test_db.commit()

    @pytest.mark.models
    def test_player_name_index(self, test_db: Session, sample_teams):
        """
        Test that player name field is indexed for performance.
        Input: Player with name field
        Expected: Name column should have index (verified through model definition)
        """
        from app.models.player import Player

        name_column = Player.__table__.columns["name"]
        assert name_column.index is True

    @pytest.mark.models
    def test_multiple_players_same_team(self, test_db: Session, sample_teams):
        """
        Test multiple players can belong to the same team.
        Input: Multiple players with same team_id
        Expected: All players created successfully, team relationship works
        """
        team = sample_teams[0]

        players_data = [
            {
                "name": "Multi Player One",
                "position": "Left Wing",
                "nationality": "Canadian",
                "jersey_number": 10,
                "birth_date": date(1990, 1, 1),
                "height": "5'10\"",
                "weight": 170,
                "handedness": "Left",
                "team_id": team.id,
            },
            {
                "name": "Multi Player Two",
                "position": "Defense",
                "nationality": "American",
                "jersey_number": 20,
                "birth_date": date(1991, 2, 2),
                "height": "6'2\"",
                "weight": 200,
                "handedness": "Right",
                "team_id": team.id,
            },
            {
                "name": "Multi Player Three",
                "position": "Center",
                "nationality": "Swedish",
                "jersey_number": 30,
                "birth_date": date(1992, 3, 3),
                "height": "6'1\"",
                "weight": 185,
                "handedness": "Left",
                "team_id": team.id,
            },
        ]

        players = []
        for player_data in players_data:
            player = Player(**player_data)
            test_db.add(player)
            players.append(player)

        test_db.commit()

        saved_players = (
            test_db.query(Player)
            .filter(
                Player.name.in_(
                    ["Multi Player One", "Multi Player Two", "Multi Player Three"]
                )
            )
            .all()
        )

        assert len(saved_players) == 3

        for player in saved_players:
            assert player.team_id == team.id
            assert player.team.name == team.name

        saved_team = test_db.query(Team).filter(Team.id == team.id).first()
        assert saved_team is not None
        team_player_names = [p.name for p in saved_team.players]
        assert "Multi Player One" in team_player_names
        assert "Multi Player Two" in team_player_names
        assert "Multi Player Three" in team_player_names


class TestModelConstraints:
    """Test database constraints and data integrity."""

    @pytest.mark.models
    def test_player_nullable_constraints(self, test_db: Session, sample_teams):
        """
        Test that required fields cannot be null.
        Input: Player missing required fields (name)
        Expected: IntegrityError raised for nullable=False fields
        """
        team = sample_teams[0]

        with pytest.raises(IntegrityError):
            player = Player(
                position="Center",
                nationality="Canadian",
                jersey_number=50,
                birth_date=date(1995, 1, 1),
                height="6'0\"",
                weight=180,
                handedness="Left",
                team_id=team.id,
            )
            test_db.add(player)
            test_db.commit()

        test_db.rollback()

    @pytest.mark.models
    def test_team_nullable_constraints(self, test_db: Session):
        """
        Test that required team fields cannot be null.
        Input: Team missing required fields (name)
        Expected: IntegrityError raised for nullable=False fields
        """
        with pytest.raises(IntegrityError):
            team = Team(
                city="Test City",
                conference="Eastern",
                division="Atlantic",
                founded_year=1980,
                arena="Test Arena",
            )
            test_db.add(team)
            test_db.commit()

        test_db.rollback()


class TestModelMethods:
    """Test any custom methods or properties on models."""

    @pytest.mark.models
    def test_model_string_representation(self, test_db: Session, sample_teams):
        """
        Test model string representations.
        Input: Created model instances
        Expected: Reasonable string representation
        """
        team = sample_teams[0]

        player = Player(
            name="String Test Player",
            position="Center",
            nationality="Canadian",
            jersey_number=77,
            birth_date=date(1995, 5, 5),
            height="6'0\"",
            weight=180,
            handedness="Left",
            team_id=team.id,
        )

        test_db.add(player)
        test_db.commit()
        test_db.refresh(player)

        player_str = str(player)
        team_str = str(team)

        assert isinstance(player_str, str)
        assert isinstance(team_str, str)
        assert len(player_str) > 0
        assert len(team_str) > 0
