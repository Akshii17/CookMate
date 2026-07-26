import re

from langchain_core.documents import Document

from rag.retrieval_pipeline import db

LLM_ID_START = 1_000_000


def _parse_steps_from_content(content: str) -> list[str]:
    if not content:
        return []
    if "Instructions:" in content:
        raw = content.split("Instructions:", 1)[1]
    else:
        raw = content
    steps = []
    for line in raw.split("\n"):
        line = line.strip()
        if not line:
            continue
        steps.append(re.sub(r"^\d+\.\s*", "", line))
    return steps


def _format_page_content(recipe: dict) -> str:
    ingredients = recipe.get("ingredients") or []
    steps = _parse_steps_from_content(recipe.get("content", ""))

    return f"""search_document:
Title: {recipe.get('title', '')}

Cuisine: {recipe.get('cuisine', '')}
Prep Time: {recipe.get('prep_time', '')} minutes
Diet: {recipe.get('diet', '')}

Ingredients:
{chr(10).join('- ' + ing for ing in ingredients)}

Instructions:
{chr(10).join(f"{i + 1}. {step}" for i, step in enumerate(steps))}
"""


def get_next_recipe_id() -> int:
    try:
        data = db._collection.get(include=["metadatas"])
        numeric_ids = []
        for meta in data.get("metadatas") or []:
            if not meta or meta.get("id") is None:
                continue
            try:
                numeric_ids.append(int(meta["id"]))
            except (TypeError, ValueError):
                continue
        if not numeric_ids:
            return LLM_ID_START
        return max(max(numeric_ids) + 1, LLM_ID_START)
    except Exception:
        return LLM_ID_START


def recipe_dict_to_document(recipe: dict, recipe_id: int) -> Document:
    ingredients = [
        ing.lower().strip()
        for ing in (recipe.get("ingredients") or [])
        if isinstance(ing, str) and ing.strip()
    ]

    return Document(
        page_content=_format_page_content(recipe),
        metadata={
            "id": recipe_id,
            "title": recipe.get("title", ""),
            "prep_time": recipe.get("prep_time"),
            "diet": recipe.get("diet", ""),
            "cuisine": recipe.get("cuisine", ""),
            "ingredients": ingredients,
        },
    )


def persist_llm_recipe(recipe: dict) -> int:
    recipe_id = get_next_recipe_id()
    document = recipe_dict_to_document(recipe, recipe_id)
    db.add_documents([document])
    return recipe_id


def metadata_to_recipe_dict(meta: dict, content: str) -> dict:
    return {
        "id": meta.get("id"),
        "title": meta.get("title"),
        "prep_time": meta.get("prep_time"),
        "diet": meta.get("diet"),
        "cuisine": meta.get("cuisine"),
        "ingredients": meta.get("ingredients") or [],
        "content": content,
        "source": "rag",
    }


def get_recipe_by_id(recipe_id: int) -> dict | None:
    try:
        data = db._collection.get(
            where={"id": recipe_id},
            include=["metadatas", "documents"],
        )
    except Exception:
        return None

    if not data or not data.get("ids"):
        return None

    meta = data["metadatas"][0]
    content = data["documents"][0]
    if not meta:
        return None

    return metadata_to_recipe_dict(meta, content)


def get_recipes_by_ids(recipe_ids: list[int]) -> list[dict]:
    recipes = []
    for recipe_id in recipe_ids:
        recipe = get_recipe_by_id(recipe_id)
        if recipe:
            recipes.append(recipe)
    return recipes
