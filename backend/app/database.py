from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Use database URL from environment variables
SQLITE_DATABASE_URL = settings.database_url

# Create engine with SQLite-specific settings
engine = create_engine(
    SQLITE_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Allows SQLite to work with FastAPI's async nature
)

# SessionLocal class - each instance is a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our database models
Base = declarative_base()

# Dependency function to get database session for each request
def get_db():
    """
    Creates a new database session for each request and ensures it's closed after use.
    This function will be used as a FastAPI dependency.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()