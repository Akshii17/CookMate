import json

INPUT_FILE = "recipes.jsonl"
OUTPUT_FILE = "recipes_cleaned.jsonl"

# strict non-veg items (safe list based on your dataset)
NON_VEG_WORDS = {
    "chicken", "mutton", "fish", "prawn", "beef", "pork", "lamb", 
    "salmon", "tuna", "sea food", "seafood", "crab", "bacon"
}

# egg handling separately
EGG_WORDS = {"egg", "eggs"}

# words that should NEVER trigger non-veg
FALSE_POSITIVES = {
    "eggplant"
}

def is_non_veg(ingredients):
    for item in ingredients:
        item = item.lower().strip()

        # skip false positives
        if any(fp in item for fp in FALSE_POSITIVES):
            continue

        # strict meat check
        if any(meat in item for meat in NON_VEG_WORDS):
            return True

        # handle egg carefully (whole word match only)
        if item is any(word for word in EGG_WORDS):
            return True
        
        if item in EGG_WORDS:
            return True

    return False


with open(INPUT_FILE, "r") as f_in, open(OUTPUT_FILE, "w") as f_out:
    for line in f_in:
        recipe = json.loads(line)

        ingredients = recipe.get("ingredients", [])

        # fix diet
        if is_non_veg(ingredients):
            recipe["diet"] = "non-vegetarian"
        else:
            recipe["diet"] = "vegetarian"

        f_out.write(json.dumps(recipe) + "\n")

print("✅ Cleaned file saved as recipes_cleaned.jsonl")