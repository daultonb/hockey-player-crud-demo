"""
Migrate NHL data from JSON files to PostgreSQL database.

This script replaces the old SQLite migration and uses the JSON files
created by nhl_data_fetcher.py to populate the PostgreSQL database.

Usage:
    python migrate_json_to_postgres.py              # Migrate all available teams
    python migrate_json_to_postgres.py --team EDM   # Migrate specific team
    python migrate_json_to_postgres.py --reset      # Reset database first
"""

import argparse
import json
import os
from datetime import datetime
from typing import Optional

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
        print(f"Error: Teams file {filepath} not found!")
        print("Make sure nhl_teams.json exists in the backend directory")
        return []
    except json.JSONDecodeError as e:
        print(f"Error parsing teams JSON: {e}")
        return []


def load_players_from_team_file(filepath: str) -> tuple:
    """Load players data from a team JSON file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get("players", []), data.get("team", {})
    except FileNotFoundError:
        print(f"Error: Team file {filepath} not found!")
        return [], {}
    except json.JSONDecodeError as e:
        print(f"Error parsing team JSON: {e}")
        return [], {}


def find_team_files(directory: str = "nhl_team_data") -> list:
    """Find all team JSON files in the nhl_team_data directory."""
    team_files = []
    
    if not os.path.exists(directory):
        print(f"Warning: Directory {directory} does not exist")
        print(f"Run: python nhl_data_fetcher.py --team=EDM to generate team data")
        return team_files
    
    for filename in os.listdir(directory):
        if filename.endswith("_2024_25.json"):
            team_files.append(os.path.join(directory, filename))
    
    return sorted(team_files)


def parse_birth_date(date_string: str):
    """Parse birth date string to Python date object."""
    try:
        return datetime.strptime(date_string, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        # Fallback to a default date
        return datetime(1990, 1, 1).date()


def migrate_teams(db, teams_data: list) -> int:
    """Migrate teams to PostgreSQL database."""
    print("\n" + "="*60)
    print("MIGRATING TEAMS")
    print("="*60)
    
    teams_created = 0
    teams_skipped = 0
    
    for team_data in teams_data:
        # Check if team already exists
        existing_team = db.query(Team).filter(Team.id == team_data["id"]).first()
        
        if existing_team:
            teams_skipped += 1
            print(f"  Skipped: {team_data['name']} (already exists)")
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
        print(f"  Created: {team_data['name']} (ID: {team_data['id']})")
    
    db.commit()
    
    print(f"\nTeams Summary:")
    print(f"  Created: {teams_created}")
    print(f"  Skipped: {teams_skipped}")
    print(f"  Total:   {teams_created + teams_skipped}")
    
    return teams_created


def migrate_players(db, players_data: list, team_info: dict) -> int:
    """Migrate players to PostgreSQL database."""
    team_name = team_info.get('name', 'Unknown Team')
    print(f"\n  Processing {team_name}...")
    
    players_created = 0
    players_skipped = 0
    
    for player_data in players_data:
        # Check if player already exists
        existing_player = db.query(Player).filter(Player.id == player_data["id"]).first()
        
        if existing_player:
            players_skipped += 1
            continue
        
        # Extract stats from nested objects
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
            active_status=player_data.get("active_status", True),
            team_id=player_data["team_id"],
            
            # Regular season stats
            regular_season_goals=regular_stats.get("goals", 0),
            regular_season_assists=regular_stats.get("assists", 0),
            regular_season_points=regular_stats.get("points", 0),
            regular_season_games_played=regular_stats.get("games_played", 0),
            
            # Playoff stats
            playoff_goals=playoff_stats.get("goals", 0),
            playoff_assists=playoff_stats.get("assists", 0),
            playoff_points=playoff_stats.get("points", 0),
            playoff_games_played=playoff_stats.get("games_played", 0),
            
            # Combined stats (legacy compatibility)
            games_played=regular_stats.get("games_played", 0) + playoff_stats.get("games_played", 0),
            goals=regular_stats.get("goals", 0) + playoff_stats.get("goals", 0),
            assists=regular_stats.get("assists", 0) + playoff_stats.get("assists", 0),
            points=regular_stats.get("points", 0) + playoff_stats.get("points", 0),
        )
        
        db.add(player)
        players_created += 1
    
    db.commit()
    
    print(f"    {team_name}: {players_created} created, {players_skipped} skipped")
    return players_created


def migrate_all_teams(team_files: Optional[list] = None, reset_first: bool = False):
    """
    Main migration function - migrates teams and players from JSON to PostgreSQL.
    
    Args:
        team_files: List of specific team files to migrate. If None, migrates all.
        reset_first: If True, drops and recreates all tables before migrating.
    """
    print("\n" + "="*60)
    print("NHL DATA MIGRATION: JSON → PostgreSQL")
    print("="*60)
    
    # Reset database if requested
    if reset_first:
        print("\nResetting database...")
        Base.metadata.drop_all(bind=engine)
        print("  All tables dropped")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Database tables ready")
    
    db = SessionLocal()
    
    try:
        # Step 1: Migrate teams
        teams_data = load_teams_from_json("nhl_teams.json")
        
        if not teams_data:
            print("\nError: No teams data found in nhl_teams.json")
            print("Cannot proceed without teams data")
            return
        
        teams_created = migrate_teams(db, teams_data)
        
        # Step 2: Migrate players
        if team_files is None:
            team_files = find_team_files("nhl_team_data")
        
        if not team_files:
            print("\nWarning: No team player files found in nhl_team_data/")
            print("Run the NHL data fetcher to generate player data:")
            print("  python nhl_data_fetcher.py --team=EDM")
            print("\nTeams have been migrated, but no players added.")
            return
        
        print("\n" + "="*60)
        print("MIGRATING PLAYERS")
        print("="*60)
        
        total_players_created = 0
        total_players_skipped = 0
        teams_processed = 0
        
        for team_file in team_files:
            players_data, team_info = load_players_from_team_file(team_file)
            
            if players_data:
                players_created = migrate_players(db, players_data, team_info)
                total_players_created += players_created
                total_players_skipped += len(players_data) - players_created
                teams_processed += 1
        
        # Final summary
        print("\n" + "="*60)
        print("MIGRATION COMPLETE")
        print("="*60)
        print(f"Teams in database:    {len(teams_data)}")
        print(f"Teams with players:   {teams_processed}")
        print(f"Players created:      {total_players_created}")
        print(f"Players skipped:      {total_players_skipped}")
        print(f"Total players:        {total_players_created + total_players_skipped}")
        print("="*60)
        
        # Show database status
        team_count = db.query(Team).count()
        player_count = db.query(Player).count()
        
        print(f"\nCurrent Database Status:")
        print(f"  Teams:   {team_count}")
        print(f"  Players: {player_count}")
        
    except Exception as e:
        print(f"\nError during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def migrate_specific_teams(*team_codes):
    """
    Migrate specific teams only.
    
    Usage:
        migrate_specific_teams("EDM")  # Edmonton only
        migrate_specific_teams("EDM", "TOR", "BOS")  # Multiple teams
    """
    team_files = []
    
    for team_code in team_codes:
        filename = f"nhl_team_data/{team_code.lower()}_2024_25.json"
        if os.path.exists(filename):
            team_files.append(filename)
        else:
            print(f"Warning: File not found - {filename}")
            print(f"Run: python nhl_data_fetcher.py --team={team_code}")
    
    if team_files:
        migrate_all_teams(team_files)
    else:
        print("Error: No valid team files found")


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Migrate NHL data from JSON files to PostgreSQL database",
        epilog="""
Examples:
  python migrate_json_to_postgres.py                  # Migrate all teams
  python migrate_json_to_postgres.py --team EDM       # Migrate Edmonton only
  python migrate_json_to_postgres.py --team EDM TOR   # Migrate multiple teams
  python migrate_json_to_postgres.py --reset          # Reset DB and migrate all
        """
    )
    
    parser.add_argument(
        '--team',
        nargs='+',
        help='Specific team code(s) to migrate (e.g., EDM TOR BOS)'
    )
    
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Reset database (drop all tables) before migrating'
    )
    
    return parser.parse_args()


def main():
    """Main execution function."""
    args = parse_arguments()
    
    if args.team:
        # Migrate specific teams
        print(f"Migrating specific teams: {', '.join(args.team)}")
        migrate_specific_teams(*args.team)
    else:
        # Migrate all available teams
        migrate_all_teams(reset_first=args.reset)


if __name__ == "__main__":
    main()