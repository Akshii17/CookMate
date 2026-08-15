from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth import get_current_user, get_db
from backend.models import Favorite, User
from backend.schema import FavoriteCreate, FavoriteResponse
from rag.recipe_store import get_recipe_by_id, get_recipes_by_ids, persist_llm_recipe

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.get("/me")
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    #stores the entire selected row
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all() # executes the query and returns a list
    )

    recipe_ids = [favorite.recipe_id for favorite in favorites]
    recipes = get_recipes_by_ids(recipe_ids)

    return {
        "status": "success",
        "recipes": recipes,
    }


@router.post("/me", response_model=FavoriteResponse)
def add_favorite(
    payload: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe_id = payload.recipe_id

    if recipe_id is None:
        if not payload.recipe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provide recipe_id or recipe data",
            )
        recipe_id = persist_llm_recipe(payload.recipe)
    else:
        if get_recipe_by_id(recipe_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipe not found",
            )

    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.recipe_id == recipe_id,
        )
        .first()
    )
    if existing:
        return FavoriteResponse(recipe_id=recipe_id, status="already_saved")

    favorite = Favorite(user_id=current_user.id, recipe_id=recipe_id)
    db.add(favorite)
    db.commit()

    return FavoriteResponse(recipe_id=recipe_id, status="added")


@router.delete("/me/{recipe_id}")
def remove_favorite(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.recipe_id == recipe_id,
        )
        .first()
    )

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )

    db.delete(favorite)
    db.commit()

    return {"status": "removed", "recipe_id": recipe_id}
