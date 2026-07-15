import pandas as pd
import json

# load dataset
df = pd.read_csv("dataset.csv")

non_veg_keywords = ["chicken", "mutton", "fish", "egg", "prawn", "pork", "beef"]

def detect_diet(ingredients):
    for item in ingredients:
        if any(word in item.lower() for word in non_veg_keywords):
            return "non-vegetarian"
    return "vegetarian"

def clean_ingredients(ing_str):
    return [i.strip().lower() for i in ing_str.split(",")]

def split_instructions(text):
    steps = [s.strip() for s in text.split(".") if s.strip()]
    return steps

with open("recipes.jsonl", "w") as f:
    for _, row in df.iterrows():
        ingredients = clean_ingredients(row["Cleaned-Ingredients"])
        instructions = split_instructions(row["TranslatedInstructions"])

        recipe = {
            "title": row["TranslatedRecipeName"],
            "ingredients": ingredients,
            "instructions": instructions,
            "prep_time": row["TotalTimeInMins"],
            "cuisine": row["Cuisine"],
            "diet": detect_diet(ingredients)
        }

        f.write(json.dumps(recipe) + "\n")