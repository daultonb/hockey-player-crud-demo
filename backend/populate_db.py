import json
import os
from datetime import date, datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models.player import Player
from app.models.team import Team


def load_teams_from_json(filepath: str = "nhl_teams.json") -> list:
    """Load teams data from nhl_teams.json file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get("teams", [])
    except FileNotFoundError:
        print(f"❌ Teams file {filepath} not found!")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing teams JSON: {e}")
        return []

def load_players_from_team_file(filepath: str) -> tuple:
    """Load players data from a team JSON file (e.g., edm_2024_25.json)."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get("players", []), data.get("team", {})
    except FileNotFoundError:
        print(f"❌ Team file {filepath} not found!")
        return [], {}
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing team JSON: {e}")
        return [], {}

def find_team_files(directory: str = "nhl_team_data") -> list:
    """Find all team JSON files in the nhl_team_data directory."""
    team_files = []
    if not os.path.exists(directory):
        print(f"⚠️  Directory {directory} does not exist")
        return team_files
    
    for filename in os.listdir(directory):
        if filename.endswith("_2024_25.json"):
            team_files.append(os.path.join(directory, filename))
    
    return team_files

def parse_birth_date(date_string: str) -> date:
    """Parse birth date string to Python date object."""
    try:
        # Handle YYYY-MM-DD format
        return datetime.strptime(date_string, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        # Fallback to a default date
        return date(1990, 1, 1)

def populate_teams(db: Session, teams_data: list):
    """Populate teams table with data from teams.json."""
    print("📊 Populating teams...")
    
    teams_created = 0
    for team_data in teams_data:
        # Check if team already exists
        existing_team = db.query(Team).filter(Team.id == team_data["id"]).first()
        if existing_team:
            print(f"⚠️  Team {team_data['name']} already exists, skipping...")
            continue
        
        team = Team(
            id=team_data["id"],
            name=team_data["name"],
            city=team_data["city"],
            conference=team_data["conference"],
            division=team_data["division"],
            founded_year=team_data["founded_year"],
            arena=team_data["arena"]
        )
        
        db.add(team)
        teams_created += 1
        print(f"✅ Added team: {team_data['name']} (ID: {team_data['id']})")
    
    db.commit()
    print(f"🎯 Created {teams_created} teams")

def populate_players(db: Session, players_data: list, team_info: dict):
    """Populate players table with enhanced data from team JSON files."""
    print(f"🏒 Populating players for {team_info.get('name', 'Unknown Team')}...")
    
    players_created = 0
    for player_data in players_data:
        # Check if player already exists
        existing_player = db.query(Player).filter(Player.id == player_data["id"]).first()
        if existing_player:
            print(f"⚠️  Player {player_data['name']} already exists, skipping...")
            continue
        
        # Extract stats from nested objects or use legacy values
        regular_stats = player_data.get("regular_season_stats", {})
        playoff_stats = player_data.get("playoff_stats", {})
        
        player = Player(
            id=player_data["id"],
            name=player_data["name"],
            position=player_data["position"],
            nationality=player_data["nationality"],
            jersey_number=player_data["jersey_number"],
            birth_date=parse_birth_date(player_data["birth_date"]),
            height=player_data["height"],
            weight=player_data["weight"],
            handedness=player_data["handedness"],
            active_status=player_data["active_status"],
            team_id=player_data["team_id"],
    
            # Regular season statistics
            regular_season_goals=regular_stats.get("goals", player_data.get("goals", 0)),
            regular_season_assists=regular_stats.get("assists", player_data.get("assists", 0)),
            regular_season_points=regular_stats.get("points", player_data.get("points", 0)),
            regular_season_games_played=regular_stats.get("games_played", 0),
            
            # Playoff statistics
            playoff_goals=playoff_stats.get("goals", 0),
            playoff_assists=playoff_stats.get("assists", 0),
            playoff_points=playoff_stats.get("points", 0),
            playoff_games_played=playoff_stats.get("games_played", 0),

            # Combined statistics
            games_played=regular_stats.get("games_played", 0) + playoff_stats.get("games_played", 0),
            goals=regular_stats.get("goals", player_data.get("goals", 0)) + playoff_stats.get("goals", 0),
            assists=regular_stats.get("assists", player_data.get("assists", 0)) + playoff_stats.get("assists", 0),
            points=regular_stats.get("points", player_data.get("points", 0)) + playoff_stats.get("points", 0),
        )
        
        db.add(player)
        players_created += 1
        print(f"✅ Added player: {player_data['name']} (Team ID: {player_data['team_id']}) - RS: {regular_stats.get('games_played', 0)}GP, PO: {playoff_stats.get('games_played', 0)}GP")
    
    db.commit()
    print(f"🎯 Created {players_created} players")

def populate_database_from_files(team_files: Optional[list] = None):
    """
    Populates the database with teams and players from JSON files.
    
    Args:
        team_files: List of specific team files to load. If None, loads all files in nhl_team_data/
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Load and populate teams
        teams_data = load_teams_from_json("nhl_teams.json")
        if teams_data:
            populate_teams(db, teams_data)
        else:
            print("❌ No teams data found, skipping team population")
        
        # Load and populate players
        if team_files is None:
            team_files = find_team_files("nhl_team_data")
        
        if not team_files:
            print("⚠️  No team files found. Run the NHL data fetcher first:")
            print("   python nhl_data_fetcher.py --team=EDM")
            return
        
        total_players = 0
        for team_file in team_files:
            print(f"\n📂 Processing {team_file}...")
            players_data, team_info = load_players_from_team_file(team_file)
            
            if players_data:
                populate_players(db, players_data, team_info)
                total_players += len(players_data)
            else:
                print(f"❌ No player data found in {team_file}")
        
        print(f"\n🎉 Database population completed!")
        print(f"📊 Total teams: {len(teams_data)}")
        print(f"🏒 Total players processed: {total_players}")
        
    except Exception as e:
        print(f"❌ Error populating database: {e}")
        db.rollback()
    finally:
        db.close()

def populate_specific_teams(*team_codes):
    """
    Populate database with specific teams only.
    
    Usage:
        populate_specific_teams("EDM")  # Edmonton only
        populate_specific_teams("EDM", "TOR", "BOS")  # Multiple teams
    """
    team_files = []
    for team_code in team_codes:
        filename = f"nhl_team_data/{team_code.lower()}_2024_25.json"
        if os.path.exists(filename):
            team_files.append(filename)
        else:
            print(f"⚠️  File not found: {filename}")
    
    if team_files:
        populate_database_from_files(team_files)
    else:
        print("❌ No valid team files found")

def reset_database():
    """Reset database by dropping and recreating all tables."""
    print("🔄 Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database reset completed")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "reset":
            reset_database()
        elif sys.argv[1] == "specific":
            # Usage: python populate_db.py specific EDM TOR
            if len(sys.argv) > 2:
                populate_specific_teams(*sys.argv[2:])
            else:
                print("Usage: python populate_db.py specific EDM [TOR] [BOS] ...")
        else:
            print("Usage:")
            print("  python populate_db.py              # Populate all available teams")
            print("  python populate_db.py reset        # Reset database")
            print("  python populate_db.py specific EDM # Populate specific teams")
    else:
        # Default: populate all available teams
        populate_database_from_files()