import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Find the backend folder
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env (used for local development; Render injects env vars directly)
load_dotenv(BASE_DIR / ".env")

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables or backend/.env")

# Fix postgres:// prefix if needed for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create PostgreSQL engine (pool_pre_ping prevents Neon idle connection errors)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for SQLAlchemy models
Base = declarative_base()


# Database dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
