from pydantic import BaseModel, EmailStr
from typing import Optional


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleLogin(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class UserProfileResponse(BaseModel):
    name: str
    email: EmailStr
    profile_picture: Optional[str] = None
    preferences: list[str] = []
    allergens: list[str] = []


class UserProfileUpdate(BaseModel):
    name: str
    preferences: list[str] = []
    allergens: list[str] = []
    profile_picture: Optional[str] = None


class FavoriteCreate(BaseModel):
    recipe_id: int | None = None
    recipe: dict | None = None


class FavoriteResponse(BaseModel):
    recipe_id: int
    status: str = "added"

