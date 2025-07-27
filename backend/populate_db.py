from datetime import date
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.team import Team
from app.models.player import Player

def populate_database():
    """
    Populates the database with sample teams and players for development.
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Team).first():
            print("Database already populated!")
            return
        
        # Create sample teams
        teams_data = [
            {
                "name": "Ice Hawks",
                "city": "Toronto", 
                "conference": "Eastern",
                "division": "Atlantic",
                "founded_year": 1967,
                "arena": "Ice Palace Arena"
            },
            {
                "name": "Thunder Bolts", 
                "city": "Calgary",
                "conference": "Western", 
                "division": "Pacific",
                "founded_year": 1972,
                "arena": "Thunder Dome"
            }
        ]
        
        # Create team objects
        teams = []
        for team_data in teams_data:
            team = Team(**team_data)
            db.add(team)
            teams.append(team)
        
        # Commit teams first to get their IDs
        db.commit()
        
        # Refresh to get the generated IDs
        for team in teams:
            db.refresh(team)
        
        # Create sample players
        players_data = [
            {
                "name": "Alex Thunder",
                "position": "Center",
                "nationality": "Canadian",
                "jersey_number": 87,
                "birth_date": date(1995, 3, 15),
                "height": "6'2\"",
                "weight": 195,
                "handedness": "Left",
                "goals": 45,
                "assists": 32,
                "points": 77,
                "active_status": True,
                "team_id": teams[0].id
            },
            {
                "name": "Sarah Blaze",
                "position": "Right Wing", 
                "nationality": "American",
                "jersey_number": 91,
                "birth_date": date(1993, 8, 22),
                "height": "5'8\"",
                "weight": 165,
                "handedness": "Right",
                "goals": 38,
                "assists": 41,
                "points": 79,
                "active_status": True,
                "team_id": teams[0].id
            },
            {
                "name": "Marcus Stone",
                "position": "Defense",
                "nationality": "Swedish",
                "jersey_number": 44,
                "birth_date": date(1991, 12, 5),
                "height": "6'4\"",
                "weight": 220,
                "handedness": "Left",
                "goals": 12,
                "assists": 28,
                "points": 40,
                "active_status": True,
                "team_id": teams[1].id
            },
            {
                "name": "Emma Swift",
                "position": "Goalie",
                "nationality": "Finnish",
                "jersey_number": 1,
                "birth_date": date(1994, 6, 18),
                "height": "5'10\"",
                "weight": 175,
                "handedness": "Left",
                "goals": 0,
                "assists": 2,
                "points": 2,
                "active_status": True,
                "team_id": teams[1].id
            },
            {
                "name": "Jake Power",
                "position": "Left Wing",
                "nationality": "Russian",
                "jersey_number": 13,
                "birth_date": date(1996, 1, 30),
                "height": "6'0\"",
                "weight": 185,
                "handedness": "Right",
                "goals": 28,
                "assists": 25,
                "points": 53,
                "active_status": False,  # Injured/inactive
                "team_id": teams[0].id
            }
        ]
        
        # Create player objects
        for player_data in players_data:
            player = Player(**player_data)
            db.add(player)
        
        # Commit all players
        db.commit()
        
        print("✅ Database populated successfully!")
        print(f"Created {len(teams_data)} teams and {len(players_data)} players")
        
    except Exception as e:
        print(f"❌ Error populating database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()