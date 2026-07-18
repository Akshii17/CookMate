from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import Generator
from backend.database import SessionLocal
from backend.models import User
from backend.schema import UserSignup, UserLogin, UserResponse, GoogleLogin, Token
from jose import jwt, JWTError

from google.oauth2 import id_token
from google.auth.transport import requests

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

load_dotenv()

#got jwt secret by: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# create the JWT access token
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})


    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None:
        raise credentials_exception

    return user

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        return idinfo

    except Exception:
        return None

# signup the user
@router.post("/signup", response_model=UserResponse)
def signup(user: UserSignup, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = hash_password(user.password)

    # Create new user
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        google_id=None,
        profile_picture=None,
        preferences=[],
        allergens=[]
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Return the created user
    return new_user

# login the user
@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    # User doesn't exist
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # User signed up with Google
    if existing_user.password_hash is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please sign in with Google"
        )

    # Wrong password
    if not verify_password(user.password, existing_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT
    access_token = create_access_token(
        data={"sub": existing_user.email}
    )

    # Return token + user details
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": existing_user
    }

@router.post("/google", response_model=Token)
def google_login(
    request: GoogleLogin,
    db: Session = Depends(get_db)
):
    # Verify Google ID token
    google_user = verify_google_token(request.token)

    if google_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

    email = google_user["email"]
    name = google_user.get("name")
    google_id = google_user["sub"]
    picture = google_user.get("picture")

    # Check if email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:

        # Existing normal account
        if existing_user.google_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already registered. Please log in with your password."
            )

        # Existing Google account → login
        access_token = create_access_token(
            data={"sub": existing_user.email}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": existing_user
        }

    # First-time Google user → create account
    new_user = User(
        name=name,
        email=email,
        password_hash=None,
        google_id=google_id,
        profile_picture=picture,
        preferences=[],
        allergens=[]
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": new_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }