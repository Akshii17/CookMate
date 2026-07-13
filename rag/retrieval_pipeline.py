import warnings
warnings.filterwarnings("ignore")
import json
import re

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
    cleaned_text = re.sub(r'[^\w\s\-]', ' ', text.lower())
    return [
        word for word in cleaned_text.split()
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


def generate_fallback_recipes(query: str, max_prep_time: int | None = None) -> list[dict]:
    prompt = (
        f"Generate up to 5 distinct, realistic recipes matching the query: \"{query}\".\n"
        "Return ONLY a valid JSON array, with no markdown formatting, no code fences, and no explanation.\n"
        "Each item in the JSON array must be an object with exactly these fields:\n"
        "- \"title\": string\n"
        "- \"prep_time\": integer (minutes)\n"
        "- \"diet\": string (e.g. \"Vegetarian\", \"Non-Vegetarian\", \"Vegan\")\n"
        "- \"cuisine\": string\n"
        "- \"ingredients\": array of strings\n"
        "- \"steps\": array of strings, each a concise 1-2 line step."
    )
    if max_prep_time is not None:
        prompt += f"\nCRITICAL REQUIREMENT: Every generated recipe's preparation time (prep_time) must be less than or equal to {max_prep_time} minutes."
    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            max_output_tokens=1500
        )
        text = response.output_text
        if not text:
            return []
        
        text = text.strip()
        # Strip markdown code fences if LLM includes them
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        data = json.loads(text)
        if not isinstance(data, list):
            return []
            
        recipes = []
        for item in data:
            try:
                title = item.get("title")
                prep_time = item.get("prep_time")
                diet = item.get("diet")
                cuisine = item.get("cuisine")
                ingredients = item.get("ingredients")
                steps = item.get("steps")
                
                if not title or not isinstance(title, str):
                    continue
                if prep_time is None or not isinstance(prep_time, (int, str)):
                    continue
                if not diet or not isinstance(diet, str):
                    continue
                if not cuisine or not isinstance(cuisine, str):
                    continue
                if not isinstance(ingredients, list) or not all(isinstance(x, str) for x in ingredients):
                    continue
                if not isinstance(steps, list) or not all(isinstance(x, str) for x in steps):
                    continue
                
                # Format content string as required: "Instructions:\n" followed by numbered steps.
                formatted_steps = []
                for i, step in enumerate(steps, 1):
                    step_str = step.strip()
                    if not re.match(r'^\d+\.\s*', step_str):
                        step_str = f"{i}. {step_str}"
                    formatted_steps.append(step_str)
                
                content = "Instructions:\n" + "\n".join(formatted_steps)
                
                recipes.append({
                    "title": title.strip(),
                    "prep_time": prep_time,
                    "diet": diet.strip(),
                    "cuisine": cuisine.strip(),
                    "ingredients": [ing.strip() for ing in ingredients if ing.strip()],
                    "content": content
                })
            except Exception:
                continue
                
        return recipes[:5]
    except Exception:
        return []


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
def run_rag(user_query, max_prep_time: int | None = None):

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
        return [], []

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

    if max_prep_time is not None:
        def filter_fn(doc):
            prep_time_val = doc.metadata.get("prep_time")
            if prep_time_val is None:
                return False
            try:
                return float(prep_time_val) <= max_prep_time
            except (ValueError, TypeError):
                return False
        
        filtered_docs = [d for d in filtered_docs if filter_fn(d)]
        docs = [d for d in docs if filter_fn(d)]

    return filtered_docs, docs


def modify_recipe_llm(recipe: dict, modification_request: str) -> dict | None:
    title = recipe.get("title", "")
    prep_time = recipe.get("prep_time", "")
    diet = recipe.get("diet", "")
    cuisine = recipe.get("cuisine", "")
    ingredients = recipe.get("ingredients", [])
    content = recipe.get("content", "")

    current_recipe_str = (
        f"Title: {title}\n"
        f"Cuisine: {cuisine}\n"
        f"Prep Time: {prep_time} minutes\n"
        f"Diet: {diet}\n"
        f"Ingredients:\n" + "\n".join(f"- {ing}" for ing in ingredients) + "\n"
        f"Instructions:\n{content}"
    )

    prompt = (
        "Modify the following recipe based on the user's request.\n"
        "Rules:\n"
        "- Keep same dish\n"
        "- Only change what is required based on the request (e.g. substitute or remove an ingredient)\n"
        "- No explanation or extra text\n"
        "- Keep steps concise (1-2 lines each)\n\n"
        f"Current Recipe:\n{current_recipe_str}\n\n"
        f"Modification Request: \"{modification_request}\"\n\n"
        "Return ONLY a valid JSON object (no markdown formatting, no code fences, and no explanation) with exactly these fields:\n"
        "- \"title\": string\n"
        "- \"prep_time\": integer (minutes)\n"
        "- \"diet\": string (e.g. \"Vegetarian\", \"Non-Vegetarian\", \"Vegan\")\n"
        "- \"cuisine\": string\n"
        "- \"ingredients\": array of strings\n"
        "- \"steps\": array of strings, each a concise 1-2 line step."
    )

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            max_output_tokens=1500
        )
        text = response.output_text
        if not text:
            return None
        
        text = text.strip()
        # Strip markdown code fences if LLM includes them
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        data = json.loads(text)
        if not isinstance(data, dict):
            return None
            
        title = data.get("title")
        prep_time = data.get("prep_time")
        diet = data.get("diet")
        cuisine = data.get("cuisine")
        ingredients = data.get("ingredients")
        steps = data.get("steps")
        
        if not title or not isinstance(title, str):
            return None
        if prep_time is None or not isinstance(prep_time, (int, str)):
            return None
        if not diet or not isinstance(diet, str):
            return None
        if not cuisine or not isinstance(cuisine, str):
            return None
        if not isinstance(ingredients, list) or not all(isinstance(x, str) for x in ingredients):
            return None
        if not isinstance(steps, list) or not all(isinstance(x, str) for x in steps):
            return None
            
        # Format content string as required: "Instructions:\n" followed by numbered steps.
        formatted_steps = []
        for i, step in enumerate(steps, 1):
            step_str = step.strip()
            if not re.match(r'^\d+\.\s*', step_str):
                step_str = f"{i}. {step_str}"
            formatted_steps.append(step_str)
        
        content = "Instructions:\n" + "\n".join(formatted_steps)
        
        return {
            "title": title.strip(),
            "prep_time": prep_time,
            "diet": diet.strip(),
            "cuisine": cuisine.strip(),
            "ingredients": [ing.strip() for ing in ingredients if ing.strip()],
            "content": content
        }
    except Exception:
        return None


def answer_step_question_llm(
    recipe: dict,
    current_step_text: str,
    step_number: int,
    total_steps: int,
    question: str,
) -> str | None:
    title = recipe.get("title", "")
    ingredients = recipe.get("ingredients", [])
    steps = recipe.get("steps", [])

    if not steps and recipe.get("content"):
        content = recipe["content"]
        if "Instructions:" in content:
            raw = content.split("Instructions:")[1]
            steps = [
                re.sub(r"^\d+\.\s*", "", s.strip())
                for s in raw.split("\n")
                if s.strip()
            ]

    ingredients_str = "\n".join(f"- {ing}" for ing in ingredients)
    steps_str = "\n".join(f"{i}. {step}" for i, step in enumerate(steps, 1))

    prompt = (
        f"You are helping a user cook: {title}\n\n"
        f"Ingredients:\n{ingredients_str}\n\n"
        f"All steps:\n{steps_str}\n\n"
        f"The user is currently on step {step_number} of {total_steps}:\n"
        f"\"{current_step_text}\"\n\n"
        f"Question: {question}\n\n"
        "Answer in 2-4 concise sentences. Plain text only, no preamble, no JSON."
    )

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            max_output_tokens=300,
        )
        text = response.output_text
        if not text or not text.strip():
            return None
        return text.strip()
    except Exception:
        return None


def answer_step_question_llm(
    recipe: dict,
    current_step_text: str,
    step_number: int,
    total_steps: int,
    question: str,
) -> str | None:
    title = recipe.get("title", "")
    ingredients = recipe.get("ingredients", [])
    steps = recipe.get("steps", [])

    if not steps and recipe.get("content"):
        content = recipe["content"]
        if "Instructions:" in content:
            raw = content.split("Instructions:")[1]
            steps = [
                re.sub(r"^\d+\.\s*", "", s.strip())
                for s in raw.split("\n")
                if s.strip()
            ]

    ingredients_str = "\n".join(f"- {ing}" for ing in ingredients)
    steps_str = "\n".join(f"{i}. {step}" for i, step in enumerate(steps, 1))

    prompt = (
        f"You are helping a user cook: {title}\n\n"
        f"Ingredients:\n{ingredients_str}\n\n"
        f"All steps:\n{steps_str}\n\n"
        f"The user is currently on step {step_number} of {total_steps}:\n"
        f"\"{current_step_text}\"\n\n"
        f"Question: {question}\n\n"
        "Answer in 2-4 concise sentences. Plain text only, no preamble, no JSON."
    )

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            max_output_tokens=300,
        )
        text = response.output_text
        if not text or not text.strip():
            return None
        return text.strip()
    except Exception:
        return None

