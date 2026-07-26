from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth import get_current_user, get_db
from backend.models import User
from backend.schema import UserProfileResponse, UserProfileUpdate
from backend.storage import (
    resolve_profile_picture_url,
    upload_avatar_to_supabase,
)

router = APIRouter(prefix="/users", tags=["Users"])


def _normalize_list(values: list[str] | None) -> list[str]:
    if not values:
        return []
    return [value for value in values if isinstance(value, str) and value.strip()]


def _profile_response(user: User) -> UserProfileResponse:
    return UserProfileResponse(
        name=user.name,
        email=user.email,
        profile_picture=resolve_profile_picture_url(user.profile_picture),
        preferences=_normalize_list(user.preferences),
        allergens=_normalize_list(user.allergens),
    )


def _resolve_profile_picture(
    user: User,
    profile_picture: str | None,
) -> str | None:
    if profile_picture is None:
        return user.profile_picture

    trimmed = profile_picture.strip()
    if not trimmed:
        return None

    if trimmed.startswith("data:"):
        storage_path = upload_avatar_to_supabase(user.id, trimmed)
        if not storage_path:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload profile photo. Check Supabase Storage configuration.",
            )
        return storage_path

    if trimmed.startswith("http://") or trimmed.startswith("https://"):
        return trimmed

    return trimmed.lstrip("/")


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return _profile_response(current_user)


@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name cannot be empty",
        )

    current_user.name = name
    current_user.preferences = _normalize_list(payload.preferences)
    current_user.allergens = _normalize_list(payload.allergens)

    if payload.profile_picture is not None:
        current_user.profile_picture = _resolve_profile_picture(
            current_user,
            payload.profile_picture,
        )

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return _profile_response(current_user)
