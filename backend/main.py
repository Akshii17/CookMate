from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag.retrieval_pipeline import (
    run_rag,
    generate_fallback_recipes,
    modify_recipe_llm,
    answer_step_question_llm,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "backend is running"}


class RecipeRequest(BaseModel):
    query: str
    max_prep_time: int | None = None


class ModifyRecipeRequest(BaseModel):
    recipe: dict
    request: str


class AskQuestionRequest(BaseModel):
    recipe: dict
    current_step_text: str
    step_number: int
    total_steps: int
    question: str


def doc_to_dict(doc):
    """Convert a LangChain Document into a plain JSON-friendly dict"""
    return {
        "title": doc.metadata.get("title"),
        "prep_time": doc.metadata.get("prep_time"),
        "diet": doc.metadata.get("diet"),
        "cuisine": doc.metadata.get("cuisine"),
        "ingredients": doc.metadata.get("ingredients"),
        "content": doc.page_content,
    }


@app.post("/get-recipe")
def get_recipe(request: RecipeRequest):
    filtered_docs, all_docs = run_rag(request.query, max_prep_time=request.max_prep_time)

    if filtered_docs:
        return {
            "status": "found",
            "recipes": [doc_to_dict(d) for d in filtered_docs[:5]]
        }

    fallback_recipes = generate_fallback_recipes(request.query, max_prep_time=request.max_prep_time)
    if fallback_recipes:
        return {
            "status": "found",
            "recipes": fallback_recipes
        }

    return {
        "status": "not_found",
        "recipes": []
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