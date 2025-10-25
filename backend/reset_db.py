"""
Database reset utility script.

This script provides options to:
1. Truncate all tables (clear data but keep structure)
2. Drop and recreate all tables (complete reset)
"""

import sys

from sqlalchemy import text

from app.database import Base, SessionLocal, engine
from app.models import player, team


def truncate_tables():
    """
    Truncate all tables - removes all data but keeps table structure.
    Fast and preserves foreign key relationships.
    """
    db = SessionLocal()
    try:
        print("Truncating all tables...")
        
        # Truncate players first (child table), then teams (parent table)
        # CASCADE handles the foreign key dependencies automatically
        db.execute(text("TRUNCATE TABLE players RESTART IDENTITY CASCADE;"))
        db.execute(text("TRUNCATE TABLE teams RESTART IDENTITY CASCADE;"))
        
        db.commit()
        print("✓ All tables truncated successfully!")
        print("  - All data removed")
        print("  - Table structure preserved")
        print("  - Primary key sequences reset to 1")
        
    except Exception as e:
        print(f"✗ Error truncating tables: {e}")
        db.rollback()
    finally:
        db.close()


def drop_and_recreate_tables():
    """
    Drop all tables and recreate them - complete database reset.
    This removes everything including table structure.
    """
    try:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("✓ All tables dropped")
        
        print("Creating fresh tables...")
        Base.metadata.create_all(bind=engine)
        print("✓ All tables created")
        
        print("✓ Database completely reset!")
        print("  - All tables dropped and recreated")
        print("  - Fresh database structure ready")
        
    except Exception as e:
        print(f"✗ Error resetting database: {e}")


def show_table_counts():
    """Display current row counts for all tables."""
    db = SessionLocal()
    try:
        from app.models.player import Player
        from app.models.team import Team
        
        team_count = db.query(Team).count()
        player_count = db.query(Player).count()
        
        print("\n📊 Current Database Status:")
        print(f"  Teams: {team_count}")
        print(f"  Players: {player_count}")
        print()
        
    except Exception as e:
        print(f"✗ Error getting table counts: {e}")
    finally:
        db.close()


def main():
    """Main function to handle user choice."""
    print("=" * 50)
    print("DATABASE RESET UTILITY")
    print("=" * 50)
    
    # Show current status
    show_table_counts()
    
    print("Choose an option:")
    print("  1. Truncate tables (clear data, keep structure)")
    print("  2. Drop and recreate tables (complete reset)")
    print("  3. Show table counts only")
    print("  4. Exit")
    print()
    
    choice = input("Enter your choice (1-4): ").strip()
    
    if choice == "1":
        confirm = input("\n⚠️  This will DELETE ALL DATA. Continue? (yes/no): ").strip().lower()
        if confirm == "yes":
            truncate_tables()
            show_table_counts()
        else:
            print("Operation cancelled.")
            
    elif choice == "2":
        confirm = input("\n⚠️  This will DROP ALL TABLES. Continue? (yes/no): ").strip().lower()
        if confirm == "yes":
            drop_and_recreate_tables()
            show_table_counts()
        else:
            print("Operation cancelled.")
            
    elif choice == "3":
        show_table_counts()
        
    elif choice == "4":
        print("Exiting...")
        sys.exit(0)
        
    else:
        print("Invalid choice. Please run again and select 1-4.")


if __name__ == "__main__":
    main()