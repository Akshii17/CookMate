import json
INPUT_FILE = "recipes.jsonl"
OUTPUT_FILE = "ingredients.csv"

with open(INPUT_FILE, "r") as f_in, open(OUTPUT_FILE, "w") as f_out:
    for line in f_in:
        recipe = json.loads(line)

        ingredients = recipe.get("ingredients", [])

        f_out.write(json.dumps(ingredients) + "\n")