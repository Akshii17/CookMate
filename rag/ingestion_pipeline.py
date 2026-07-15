import json
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def format_recipe(r):
    """Convert structured recipe → text for embedding"""

    return f"""search_document:
Title: {r['title']}

Cuisine: {r['cuisine']}
Prep Time: {r['prep_time']} minutes
Diet: {r['diet']}

Ingredients:
{chr(10).join('- ' + i for i in r['ingredients'])}

Instructions:
{chr(10).join(f"{i+1}. {step}" for i, step in enumerate(r['instructions']))}
"""
# list comprehension -> one liner for this:
# for i in r['ingredients']:
#     list_item = "- " + i

def load_jsonl(file_path=None):
    """Load JSONL and convert to LangChain Documents"""

    if file_path is None:
        file_path = os.path.join(BASE_DIR, "recipes.jsonl")

    print(f"Loading recipes from {file_path}...")

    documents = []

    # always use with keyword to open a file so that it auto-closes when out of scope
    with open(file_path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            r = json.loads(line)

            ingredients = [ing.lower().strip() for ing in r["ingredients"]]
            r["ingredients"] = ingredients

            doc = Document(
                page_content=format_recipe(r),  # 👈 embedded text
                metadata={
                    "id": i,
                    "title": r["title"],
                    "prep_time": r["prep_time"],
                    "diet": r["diet"],
                    "cuisine": r["cuisine"],
                    "ingredients": r["ingredients"]  # to remove allergies
                }
            )

            documents.append(doc)

    print(f"Loaded {len(documents)} recipes")
    return documents


def create_vector_store(documents, persist_directory=None):
    """Create and persist ChromaDB vector store"""

    if persist_directory is None:
        persist_directory = os.path.join(BASE_DIR, "db", "chroma_db")

    print("Creating embeddings and storing in ChromaDB...")

    embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=persist_directory,
        collection_metadata={"hnsw:space": "cosine"}
    )

    print(f"Vector store saved to {persist_directory}")
    return vectorstore

def main():
    docs = load_jsonl()
    vectorstore = create_vector_store(docs)


if __name__ == "__main__":
    main()