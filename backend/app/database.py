import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# Find the backend folder

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env
load_dotenv(BASE_DIR / ".env")


# Get database URL

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in backend/.env")


# Create PostgreSQL engine

engine = create_engine(DATABASE_URL)


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