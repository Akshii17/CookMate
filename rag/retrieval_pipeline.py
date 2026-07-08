import warnings
warnings.filterwarnings("ignore")

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI
client = OpenAI()



import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
persist_directory = os.path.join(BASE_DIR, "db", "chroma_db")

# ✅ SAME MODEL AS INGESTION
embedding_model = HuggingFaceEmbeddings(
    model_name="BAAI/bge-small-en-v1.5"
)

# Load DB
db = Chroma(
    persist_directory=persist_directory,
    embedding_function=embedding_model
)


# -----------------------------
# 🧠 HELPERS
# -----------------------------

STOPWORDS = {
    "recipe", "dish", "make", "give", "me", "a", "an", "the",
    "with", "using", "for", "and", "or", "ingredients", "cook", "what", "I", "start", "recipes", "dishes"
}

def extract_keywords(text):
    return [
        word for word in text.lower().split()
        if word not in STOPWORDS and len(word) > 2
    ]

def is_title_match(title, query):
    return set(extract_keywords(query)).issubset(set(title.lower().split()))

def ingredient_match_score(doc, query_ingredients):
    recipe_ings = doc.metadata.get("ingredients", [])
    return sum(1 for q in query_ingredients if any(q in ing for ing in recipe_ings))

def is_strict_ingredient_match(doc, query_ingredients):
    recipe_ings = doc.metadata.get("ingredients", [])
    return all(any(q in ing for ing in recipe_ings) for q in query_ingredients)

def contains_allergens(doc, allergies):
    ingredients = doc.metadata.get("ingredients", [])

    return any(
        allergy.lower() in ing.lower() for allergy in allergies for ing in ingredients
    )

def print_recipe(doc):
    print(f"Recipe Name: {doc.metadata['title']}\n")

    print(f"Preparation Time: {doc.metadata['prep_time']}\n")

    print("Ingredients:")
    for ing in doc.metadata["ingredients"]:
        print(f"- {ing}")

    print("\nSteps:\n")
    if "Instructions:" in doc.page_content:
        steps = doc.page_content.split("Instructions:")[1]
        steps_list = [s.strip() for s in steps.split("\n") if s.strip()]
        for step in (steps_list):
            print(f"{step}")
    else:
        print(doc.page_content)

def generate_recipe_llm(prompt):
    response = client.responses.create(
        model="gpt-4o-mini",
        input=prompt,
        max_output_tokens=700
    )
    return response.output_text


# -----------------------------
# 🧠 SHOW OPTIONS
# -----------------------------

def show_options_and_select(docs):
    print("\n--- Choose a recipe ---\n")

    for i, doc in enumerate(docs[:5], 1):
        print(f"{i}. {doc.metadata['title']}")

    while True:
        try:
            choice = int(input("\nEnter choice (1-5): "))
            if 1 <= choice <= min(5, len(docs)):
                return docs[choice - 1]
        except:
            pass
        print("Invalid choice, try again.")

def show_options_and_select2(text):
    lines = text.strip().split("\n")
    names = []

    for line in lines:
        if "." in line:
            name = line.split(".", 1)[1].strip()
            names.append(name)

    print("\n--- Choose a recipe ---\n")

    for i, name in enumerate(names, 1):
        print(f"{i}. {name}")

    while True:
        try:
            choice = int(input("\nEnter choice: "))
            if 1 <= choice <= len(names):
                return names[choice - 1]
        except:
            pass
        print("Invalid choice")

# -----------------------------
# 🧠 RECIPE RETRIEVAL FUNCTION
# -----------------------------
def run_rag(user_query):

    raw_query = user_query
    query = f"search_query: {raw_query}"

    retriever = db.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "k": 20,
            "score_threshold": 0.4
        }
    )

    docs = retriever.invoke(query)

    # 🚨 No docs
    if not docs:
        #direct call to LLM done in app.py
        return [],[],[]

    query_keywords = extract_keywords(raw_query)
    query_ingredients = query_keywords

    

    # -----------------------------
    # 🧠 FILTER DOCS
    # -----------------------------

    filtered_docs = []

    # 🥇 Title match
    for doc in docs:
        if is_title_match(doc.metadata.get("title", ""), raw_query):
            filtered_docs.append(doc)

    # 🥕 Ingredient match
    if len(filtered_docs) < 5:
        ranked_docs = sorted(
            docs,
            key=lambda d: ingredient_match_score(d, query_ingredients),
            reverse=True
        )

        for doc in ranked_docs:
            if is_strict_ingredient_match(doc, query_ingredients):
                if doc not in filtered_docs:   
                    filtered_docs.append(doc)

    return filtered_docs, docs

