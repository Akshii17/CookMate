from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag.retrieval_pipeline import run_rag

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
    filtered_docs, all_docs = run_rag(request.query)

    if filtered_docs:
        return {
            "status": "found",
            "recipes": [doc_to_dict(d) for d in filtered_docs[:5]]
        }
    else:
        return {
            "status": "not_found",
            "recipes": []
        }