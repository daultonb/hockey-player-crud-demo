#!/usr/bin/env python3
"""
NHL Data Fetcher for 2024-25 Season
Fetches player and team data from NHL official APIs and formats for database import.
Updated to use historical 2024-25 rosters and correct team IDs from teams.json mapping.
"""

import argparse
import json
import os
import time
from datetime import datetime
from typing import Any, Dict, Optional

import requests


class NHLDataFetcher:
    """Fetches NHL data from official APIs and formats for database import."""
    
    def __init__(self, team_code: str):
        self.base_api_url = "https://api-web.nhle.com/v1"
        self.stats_api_url = "https://api.nhle.com/stats/rest/en"
        self.season = "20242025"
        self.team_code = team_code.upper()
        self.team_names = self._get_team_names_map()
        self.team_id_mapping = self._get_team_id_mapping()
    
    def _get_team_names_map(self) -> Dict[str, Dict[str, Any]]:
        """Map team codes to team information."""
        return {
            "ANA": {"name": "Anaheim Ducks", "city": "Anaheim", "conference": "Western", "division": "Pacific", "founded": 1993, "arena": "Honda Center"},
            "BOS": {"name": "Boston Bruins", "city": "Boston", "conference": "Eastern", "division": "Atlantic", "founded": 1924, "arena": "TD Garden"},
            "BUF": {"name": "Buffalo Sabres", "city": "Buffalo", "conference": "Eastern", "division": "Atlantic", "founded": 1970, "arena": "KeyBank Center"},
            "CGY": {"name": "Calgary Flames", "city": "Calgary", "conference": "Western", "division": "Pacific", "founded": 1972, "arena": "Scotiabank Saddledome"},
            "CAR": {"name": "Carolina Hurricanes", "city": "Raleigh", "conference": "Eastern", "division": "Metropolitan", "founded": 1972, "arena": "PNC Arena"},
            "CHI": {"name": "Chicago Blackhawks", "city": "Chicago", "conference": "Western", "division": "Central", "founded": 1926, "arena": "United Center"},
            "COL": {"name": "Colorado Avalanche", "city": "Denver", "conference": "Western", "division": "Central", "founded": 1972, "arena": "Ball Arena"},
            "CBJ": {"name": "Columbus Blue Jackets", "city": "Columbus", "conference": "Eastern", "division": "Metropolitan", "founded": 2000, "arena": "Nationwide Arena"},
            "DAL": {"name": "Dallas Stars", "city": "Dallas", "conference": "Western", "division": "Central", "founded": 1967, "arena": "American Airlines Center"},
            "DET": {"name": "Detroit Red Wings", "city": "Detroit", "conference": "Eastern", "division": "Atlantic", "founded": 1926, "arena": "Little Caesars Arena"},
            "EDM": {"name": "Edmonton Oilers", "city": "Edmonton", "conference": "Western", "division": "Pacific", "founded": 1972, "arena": "Rogers Place"},
            "FLA": {"name": "Florida Panthers", "city": "Sunrise", "conference": "Eastern", "division": "Atlantic", "founded": 1993, "arena": "Amerant Bank Arena"},
            "LAK": {"name": "Los Angeles Kings", "city": "Los Angeles", "conference": "Western", "division": "Pacific", "founded": 1967, "arena": "Crypto.com Arena"},
            "MIN": {"name": "Minnesota Wild", "city": "Saint Paul", "conference": "Western", "division": "Central", "founded": 2000, "arena": "Xcel Energy Center"},
            "MTL": {"name": "Montreal Canadiens", "city": "Montreal", "conference": "Eastern", "division": "Atlantic", "founded": 1909, "arena": "Bell Centre"},
            "NSH": {"name": "Nashville Predators", "city": "Nashville", "conference": "Western", "division": "Central", "founded": 1998, "arena": "Bridgestone Arena"},
            "NJD": {"name": "New Jersey Devils", "city": "Newark", "conference": "Eastern", "division": "Metropolitan", "founded": 1974, "arena": "Prudential Center"},
            "NYI": {"name": "New York Islanders", "city": "Elmont", "conference": "Eastern", "division": "Metropolitan", "founded": 1972, "arena": "UBS Arena"},
            "NYR": {"name": "New York Rangers", "city": "New York", "conference": "Eastern", "division": "Metropolitan", "founded": 1926, "arena": "Madison Square Garden"},
            "OTT": {"name": "Ottawa Senators", "city": "Ottawa", "conference": "Eastern", "division": "Atlantic", "founded": 1992, "arena": "Canadian Tire Centre"},
            "PHI": {"name": "Philadelphia Flyers", "city": "Philadelphia", "conference": "Eastern", "division": "Metropolitan", "founded": 1967, "arena": "Wells Fargo Center"},
            "PIT": {"name": "Pittsburgh Penguins", "city": "Pittsburgh", "conference": "Eastern", "division": "Metropolitan", "founded": 1967, "arena": "PPG Paints Arena"},
            "SJS": {"name": "San Jose Sharks", "city": "San Jose", "conference": "Western", "division": "Pacific", "founded": 1991, "arena": "SAP Center"},
            "SEA": {"name": "Seattle Kraken", "city": "Seattle", "conference": "Western", "division": "Pacific", "founded": 2021, "arena": "Climate Pledge Arena"},
            "STL": {"name": "St. Louis Blues", "city": "St. Louis", "conference": "Western", "division": "Central", "founded": 1967, "arena": "Enterprise Center"},
            "TBL": {"name": "Tampa Bay Lightning", "city": "Tampa", "conference": "Eastern", "division": "Atlantic", "founded": 1992, "arena": "Amalie Arena"},
            "TOR": {"name": "Toronto Maple Leafs", "city": "Toronto", "conference": "Eastern", "division": "Atlantic", "founded": 1917, "arena": "Scotiabank Arena"},
            "UTA": {"name": "Utah Hockey Club", "city": "Salt Lake City", "conference": "Western", "division": "Central", "founded": 1972, "arena": "Delta Center"},
            "VAN": {"name": "Vancouver Canucks", "city": "Vancouver", "conference": "Western", "division": "Pacific", "founded": 1970, "arena": "Rogers Arena"},
            "VGK": {"name": "Vegas Golden Knights", "city": "Las Vegas", "conference": "Western", "division": "Pacific", "founded": 2017, "arena": "T-Mobile Arena"},
            "WSH": {"name": "Washington Capitals", "city": "Washington", "conference": "Eastern", "division": "Metropolitan", "founded": 1974, "arena": "Capital One Arena"},
            "WPG": {"name": "Winnipeg Jets", "city": "Winnipeg", "conference": "Western", "division": "Central", "founded": 1999, "arena": "Canada Life Centre"}
        }
    
    def _get_team_id_mapping(self) -> Dict[str, int]:
        """Map team codes to their database IDs (sorted alphabetically by team name)."""
        return {
            "ANA": 1,   # Anaheim Ducks
            "BOS": 2,   # Boston Bruins
            "BUF": 3,   # Buffalo Sabres
            "CGY": 4,   # Calgary Flames
            "CAR": 5,   # Carolina Hurricanes
            "CHI": 6,   # Chicago Blackhawks
            "COL": 7,   # Colorado Avalanche
            "CBJ": 8,   # Columbus Blue Jackets
            "DAL": 9,   # Dallas Stars
            "DET": 10,  # Detroit Red Wings
            "EDM": 11,  # Edmonton Oilers
            "FLA": 12,  # Florida Panthers
            "LAK": 13,  # Los Angeles Kings
            "MIN": 14,  # Minnesota Wild
            "MTL": 15,  # Montreal Canadiens
            "NSH": 16,  # Nashville Predators
            "NJD": 17,  # New Jersey Devils
            "NYI": 18,  # New York Islanders
            "NYR": 19,  # New York Rangers
            "OTT": 20,  # Ottawa Senators
            "PHI": 21,  # Philadelphia Flyers
            "PIT": 22,  # Pittsburgh Penguins
            "SJS": 23,  # San Jose Sharks
            "SEA": 24,  # Seattle Kraken
            "STL": 25,  # St. Louis Blues
            "TBL": 26,  # Tampa Bay Lightning
            "TOR": 27,  # Toronto Maple Leafs
            "UTA": 28,  # Utah Hockey Club
            "VAN": 29,  # Vancouver Canucks
            "VGK": 30,  # Vegas Golden Knights
            "WSH": 31,  # Washington Capitals
            "WPG": 32   # Winnipeg Jets
        }
        
    def get_team_display_name(self) -> str:
        """Get the full team name for display purposes."""
        team_info = self.team_names.get(self.team_code, {})
        return team_info.get("name", f"Team {self.team_code}")
        
    def make_request(self, url: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request with error handling and rate limiting."""
        try:
            print(f"Fetching: {url}")
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            time.sleep(0.5)  # Be respectful to the API
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def get_team_info(self) -> Dict[str, Any]:
        """Fetch team information based on team code."""
        team_data = self.team_names.get(self.team_code)
        
        if not team_data:
            print(f"❌ Unknown team code: {self.team_code}")
            return {}
            
        # Get historical roster to verify team exists for the season
        roster_url = f"{self.base_api_url}/roster/{self.team_code}/{self.season}"
        roster_data = self.make_request(roster_url)
        
        if not roster_data:
            print(f"❌ Could not fetch 2024-25 roster for {team_data['name']}")
            # Fallback to current roster for validation
            current_roster_url = f"{self.base_api_url}/roster/{self.team_code}/current"
            roster_data = self.make_request(current_roster_url)
            if not roster_data:
                print(f"❌ Could not fetch any roster data for {team_data['name']}")
                return {}
            else:
                print(f"⚠️  Using current roster as fallback - 2024-25 historical data may not be available")
        
        # Get correct team ID from mapping
        team_id = self.team_id_mapping.get(self.team_code, 1)
            
        # Build team info from our mapping
        team_info = {
            "id": team_id,
            "name": team_data["name"],
            "city": team_data["city"], 
            "conference": team_data["conference"],
            "division": team_data["division"],
            "founded_year": team_data["founded"],
            "arena": team_data["arena"]
        }
        
        print(f"✅ Team info collected: {team_info['name']} (ID: {team_id})")
        return team_info
    
    def get_player_stats(self, player_id: int, game_type: int = 2) -> Dict[str, Any]:
        """
        Fetch detailed player statistics.
        game_type: 2 = Regular Season, 3 = Playoffs
        """
        # Get player summary stats
        stats_url = f"{self.stats_api_url}/skater/summary"
        params = {
            "cayenneExp": f"playerId={player_id} and seasonId={self.season} and gameTypeId={game_type}"
        }
        
        stats_data = self.make_request(stats_url, params)
        
        if stats_data and stats_data.get("data"):
            return stats_data["data"][0] if stats_data["data"] else {}
        
        # Try goalie stats if skater stats not found
        goalie_url = f"{self.stats_api_url}/goalie/summary"
        goalie_data = self.make_request(goalie_url, params)
        
        if goalie_data and goalie_data.get("data"):
            goalie_stats = goalie_data["data"][0]
            # Convert goalie stats to match skater format
            return {
                **goalie_stats,
                "goals": 0,
                "assists": goalie_stats.get("assists", 0),
                "points": goalie_stats.get("assists", 0)
            }
            
        return {}
    
    def get_player_bio(self, player_id: int) -> Dict[str, Any]:
        """Fetch detailed player biographical information."""
        bio_url = f"{self.base_api_url}/player/{player_id}/landing"
        bio_data = self.make_request(bio_url)
        
        if not bio_data:
            return {}
            
        return bio_data
    
    def format_height(self, height_input: Any) -> str:
        """Convert height to standard format (e.g., '6\\'2\\"')."""
        if not height_input:
            return "6'0\""
        
        # Handle integer input (height in inches)
        if isinstance(height_input, int):
            total_inches = height_input
            feet = total_inches // 12
            inches = total_inches % 12
            return f"{feet}'{inches}\""
        
        # Handle string input
        height_str = str(height_input)
        
        # Handle formats like "6' 2\"" or "6'2\"" 
        height_clean = height_str.replace("'", "'").replace('"', '"')
        if "'" in height_clean and '"' in height_clean:
            return height_clean
            
        # Handle metric format (e.g., "188 cm")
        if "cm" in height_str:
            try:
                cm = int(height_str.replace("cm", "").strip())
                total_inches = round(cm / 2.54)
                feet = total_inches // 12
                inches = total_inches % 12
                return f"{feet}'{inches}\""
            except:
                return "6'0\""
                
        return height_str or "6'0\""
    
    def format_birth_date(self, birth_date_str: str) -> str:
        """Convert birth date to YYYY-MM-DD format."""
        if not birth_date_str:
            return "1990-01-01"
            
        try:
            # Handle common formats
            for fmt in ["%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S"]:
                try:
                    date_obj = datetime.strptime(birth_date_str.split("T")[0], fmt)
                    return date_obj.strftime("%Y-%m-%d")
                except ValueError:
                    continue
                    
            return birth_date_str
        except:
            return "1990-01-01"
    
    def get_player_name(self, player: Dict) -> str:
        """Extract player name safely from different API formats."""
        # Handle different name formats from the API
        first_name = ""
        last_name = ""
        
        # Check for nested name objects
        if isinstance(player.get('firstName'), dict):
            first_name = player.get('firstName', {}).get('default', '')
        else:
            first_name = player.get('firstName', '')
            
        if isinstance(player.get('lastName'), dict):
            last_name = player.get('lastName', {}).get('default', '')
        else:
            last_name = player.get('lastName', '')
            
        return f"{first_name} {last_name}".strip()
    
    def map_position(self, position: str) -> str:
        """Map API position codes to standard positions."""
        position_map = {
            "C": "Center",
            "L": "Left Wing", 
            "LW": "Left Wing",
            "R": "Right Wing",
            "RW": "Right Wing", 
            "D": "Defense",
            "G": "Goalie"
        }
        
        return position_map.get(position, position)
    
    def get_team_roster_and_stats(self) -> Dict[str, Any]:
        """Fetch complete team data with all players and statistics."""
        team_name = self.get_team_display_name()
        print(f"🏒 Fetching {team_name} ({self.team_code}) 2024-25 historical roster...")
        
        # Get team information
        team_data = self.get_team_info()
        
        if not team_data:
            return {"team": {}, "players": []}
        
        # Get the correct team ID
        team_id = self.team_id_mapping.get(self.team_code, 1)
        
        # Get historical 2024-25 roster (THIS IS THE KEY CHANGE!)
        roster_url = f"{self.base_api_url}/roster/{self.team_code}/{self.season}"
        roster_data = self.make_request(roster_url)
        
        if not roster_data:
            print(f"❌ Failed to fetch 2024-25 roster data for {team_name}")
            print(f"⚠️  Trying current roster as fallback...")
            # Fallback to current roster if historical data not available
            roster_url = f"{self.base_api_url}/roster/{self.team_code}/current"
            roster_data = self.make_request(roster_url)
            
            if not roster_data:
                print(f"❌ Failed to fetch any roster data for {team_name}")
                return {"team": team_data, "players": []}
        else:
            print(f"✅ Successfully fetched 2024-25 historical roster for {team_name}")
        
        players = []
        player_count = 0
        
        # Process all player groups (forwards, defensemen, goalies)
        for group in ["forwards", "defensemen", "goalies"]:
            if group not in roster_data:
                continue
                
            for player in roster_data[group]:
                player_count += 1
                player_id = player.get("id")
                
                if not player_id:
                    continue
                    
                player_name = self.get_player_name(player)
                print(f"Processing {team_name} player {player_count}: {player_name}")
                
                # Get biographical data
                bio_data = self.get_player_bio(player_id)
                
                # Get regular season stats
                regular_stats = self.get_player_stats(player_id, game_type=2)
                
                # Get playoff stats 
                playoff_stats = self.get_player_stats(player_id, game_type=3)
                
                # Combine data from all sources
                player_info = {
                    "id": player_id,
                    "name": player_name,
                    "position": self.map_position(player.get("positionCode", "")),
                    "nationality": bio_data.get("birthCountry", "Unknown"),
                    "jersey_number": player.get("sweaterNumber", 0),
                    "birth_date": self.format_birth_date(bio_data.get("birthDate", "")),
                    "height": self.format_height(bio_data.get("heightInInches", "")),
                    "weight": bio_data.get("weightInPounds", 180),
                    "handedness": bio_data.get("shootsCatches", "Right"),
                    # Use regular season stats as primary
                    "goals": regular_stats.get("goals", 0),
                    "assists": regular_stats.get("assists", 0), 
                    "points": regular_stats.get("points", 0),
                    "active_status": True,  # All roster players are active for the season
                    "team_id": team_id,  # Use correct team ID from mapping
                    # Store additional playoff stats for future use
                    "playoff_stats": {
                        "goals": playoff_stats.get("goals", 0),
                        "assists": playoff_stats.get("assists", 0),
                        "points": playoff_stats.get("points", 0),
                        "games_played": playoff_stats.get("gamesPlayed", 0)
                    },
                    "regular_season_stats": {
                        "goals": regular_stats.get("goals", 0),
                        "assists": regular_stats.get("assists", 0),
                        "points": regular_stats.get("points", 0),
                        "games_played": regular_stats.get("gamesPlayed", 0)
                    }
                }
                
                players.append(player_info)
                
        print(f"✅ Processed {len(players)} {team_name} players from 2024-25 season")
        
        return {
            "team": team_data,
            "players": players,
            "season": "2024-25",
            "team_code": self.team_code,
            "generated_at": datetime.now().isoformat(),
            "data_source": "NHL Official APIs - 2024-25 Historical Roster"
        }
    
    def save_to_json(self, data: Dict, team_code: Optional[str] = None):
        """Save data to JSON file in the nhl_team_data directory."""
        try:
            # Create the nhl_team_data directory if it doesn't exist
            output_dir = "nhl_team_data"
            os.makedirs(output_dir, exist_ok=True)
            
            # Create filename based on team code
            if not team_code:
                team_code = self.team_code
            filename = f"{output_dir}/{team_code.lower()}_2024_25.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            team_name = self.get_team_display_name()
            print(f"✅ {team_name} 2024-25 data saved to {filename}")
            print(f"📊 Summary: {len(data['players'])} players from {data['team']['name']}")
            print(f"🎯 Data source: {data['data_source']}")
        except Exception as e:
            print(f"❌ Error saving to JSON: {e}")

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Fetch NHL team data from official APIs for 2024-25 season (historical rosters)",
        epilog="Example: python nhl_data_fetcher.py --team=EDM"
    )
    parser.add_argument(
        "--team", 
        type=str, 
        required=True,
        help="NHL team code (e.g., EDM, TOR, NYR, BOS, etc.)"
    )
    return parser.parse_args()

def main():
    """Main execution function."""
    args = parse_arguments()
    team_code = args.team.upper()
    
    print(f"🏒 NHL Data Fetcher for {team_code} 2024-25 Historical Season")
    print("=" * 70)
    
    fetcher = NHLDataFetcher(team_code)
    
    # Validate team code
    if team_code not in fetcher.team_names:
        print(f"❌ Invalid team code: {team_code}")
        print("Valid team codes:")
        for code, info in sorted(fetcher.team_names.items()):
            print(f"  {code}: {info['name']}")
        return
    
    # Fetch all data
    team_data = fetcher.get_team_roster_and_stats()
    
    if team_data["players"]:
        # Save to JSON file
        fetcher.save_to_json(team_data, team_code)
        
        team_name = fetcher.get_team_display_name()
        print(f"\n📋 Sample {team_name} player data:")
        print("-" * 40)
        sample_player = team_data["players"][0]
        for key, value in sample_player.items():
            if key not in ["playoff_stats", "regular_season_stats"]:
                print(f"{key}: {value}")
                
        print(f"\n🎯 {team_name} 2024-25 historical data ready to import!")
        print(f"💾 Use this JSON file with your populate_db.py script")
        
    else:
        team_name = fetcher.get_team_display_name()
        print(f"❌ No player data retrieved for {team_name}")

if __name__ == "__main__":
    main()