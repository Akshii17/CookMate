from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Basic Details
    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False, index=True)

    # Authentication
    password_hash = Column(String, nullable=True)   # NULL for Google users
    google_id = Column(String, unique=True, nullable=True)

    # Google Profile
    profile_picture = Column(String, nullable=True)

    # User Preferences
    preferences = Column(JSON, nullable=True)

    # Food Allergies
    allergens = Column(JSON, nullable=True)

    # Account Creation Time
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )