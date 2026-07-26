from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, UniqueConstraint
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


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="uq_user_recipe_favorite"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipe_id = Column(Integer, nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )