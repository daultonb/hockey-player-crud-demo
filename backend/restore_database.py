"""
Automated database restoration script.

This script resets the database to fresh NHL player data by:
1. Dropping all existing tables
2. Recreating the schema
3. Populating with fresh data from NHL team data files

Can be run manually or scheduled to run periodically.
"""

import sys
from pathlib import Path

from app.database import Base, engine
from populate_db import main as populate_main


def restore_database():
    """
    Restore the database to fresh state with NHL player data.
    """
    print("=" * 60)
    print("DATABASE RESTORATION STARTED")
    print("=" * 60)

    try:
        print("\nStep 1: Dropping all existing tables...")
        Base.metadata.drop_all(bind=engine)
        print("✓ All tables dropped successfully")

        print("\nStep 2: Creating fresh schema...")
        Base.metadata.create_all(bind=engine)
        print("✓ Schema created successfully")

        print("\nStep 3: Populating database with fresh NHL data...")
        populate_main()
        print("✓ Database populated successfully")

        print("\n" + "=" * 60)
        print("DATABASE RESTORATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"\n❌ ERROR: Database restoration failed: {str(e)}")
        print("=" * 60)
        return False


if __name__ == "__main__":
    success = restore_database()
    sys.exit(0 if success else 1)
