from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


from rag.retrieval_pipeline import (
    run_rag,
    generate_fallback_recipes,
    modify_recipe_llm,
    answer_step_question_llm,
)
from rag.minute_meals_pipeline import retrieve_minute_meals

from backend.auth import router as auth_router 
from backend.users import router as users_router
from backend.favorites import router as favorites_router

from backend.database import engine, Base
import backend.models

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router) 
app.include_router(users_router)
app.include_router(favorites_router)

@app.get("/")
def health_check():
    return {"status": "backend is running"}

# this enforces that query will be string only, max_prep_time = int / none...default = none.
class RecipeRequest(BaseModel): 
    query: str 
    max_prep_time: int | None = None

# here is class is used to define request structure
class ModifyRecipeRequest(BaseModel):
    recipe: dict
    request: str

class AskQuestionRequest(BaseModel):
    recipe: dict
    current_step_text: str
    step_number: int
    total_steps: int
    question: str


class MinuteMealsRequest(BaseModel):
    query: str


def doc_to_dict(doc):
    """Convert a LangChain Document into a plain JSON-friendly dict"""
    meta = doc.metadata
    return {
        "id": meta.get("id"),
        "title": meta.get("title"),
        "prep_time": meta.get("prep_time"),
        "diet": meta.get("diet"),
        "cuisine": meta.get("cuisine"),
        "ingredients": meta.get("ingredients"),
        "content": doc.page_content,
        "source": "rag",
    }


def llm_recipe_to_dict(recipe: dict) -> dict:
    return {
        **recipe,
        "id": recipe.get("id"),
        "source": "llm",
    }

def recipe_result_to_dict(recipe):
    if hasattr(recipe, "metadata"):
        return doc_to_dict(recipe)
    return llm_recipe_to_dict(recipe)

@app.post("/get-recipe")
def get_recipe(request: RecipeRequest):
    filtered_docs, all_docs = run_rag(request.query, max_prep_time=request.max_prep_time)

    if filtered_docs:
        return {
            "status": "found",
            "recipes": [doc_to_dict(d) for d in filtered_docs[:5]] #list commprehension
        }

    fallback_recipes = generate_fallback_recipes(request.query, max_prep_time=request.max_prep_time)
    if fallback_recipes:
        return {
            "status": "found",
            "recipes": [llm_recipe_to_dict(r) for r in fallback_recipes]
        }

    return {
        "status": "not_found",
        "recipes": []
    }

@app.post("/minute-meals")
def get_minute_meals(request: MinuteMealsRequest):
    try:
        result = retrieve_minute_meals(request.query)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc #actually never send raw error to user, using detail = str(exc)

    recipes = [recipe_result_to_dict(recipe) for recipe in result["recipes"]]

    return {
        "status": "found" if recipes else "not_found",
        "recipes": recipes,
        "time_limit": result["time_limit"], #result.get("time_limit") is safer since if empty, wont throw error
        "semantic_query": result["semantic_query"],
        "source": result["source"],
    }

@app.post("/modify-recipe")
def modify_recipe(req: ModifyRecipeRequest):
    modified = modify_recipe_llm(req.recipe, req.request)
    if modified:
        return {"status": "success", "recipe": modified}
    else:
        return {"status": "error", "recipe": None}

@app.post("/ask-question")
def ask_question(req: AskQuestionRequest):
    answer = answer_step_question_llm(
        req.recipe,
        req.current_step_text,
        req.step_number,
        req.total_steps,
        req.question,
    )
    if answer:
        return {"status": "success", "answer": answer}
    return {"status": "error", "answer": None}
