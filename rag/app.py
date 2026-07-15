from retrieval_pipeline import run_rag, show_options_and_select, show_options_and_select2, print_recipe, generate_recipe_llm, contains_allergens

last_recipe = None
user_allergies = ["chicken"]

while True:
    user_query = input("\nYou: ")

    if user_query.lower() == "exit":
        break

    if user_query.lower() == "start over":
        last_recipe = None
        print("\n--- Session reset ---\n")
        continue

    # -----------------------------
    # 🔍 SEARCH MODE
    # -----------------------------

    if last_recipe is None:

        filtered_docs, all_docs = run_rag(user_query)

        # 🥇 CASE 1: SAFE RECIPES FOUND
        if filtered_docs:
            selected_doc = show_options_and_select(filtered_docs)

            if contains_allergens(selected_doc, user_allergies):
            
                print("\n--- Adjusting recipe to match your preferences ---\n")

                prompt = f"""
    Modify this recipe to remove allergens.

    Allergens: {user_allergies}
    Request: {user_query}

    Recipe:
    {selected_doc.page_content}

    Rules:
    - Remove or replace ALL allergens
    - Keep same dish
    - Do not introduce new allergens
    - No explanation
    - Keep steps concise (1–2 lines each)

    Format:

    Recipe Name: <name>

    Preparation Time: <time in minutes>

    Ingredients:
    - item

    Steps:
    1. step
    """

                result = generate_recipe_llm(prompt)
                if not result or not result.strip():
                    print("Error: Empty response, try again")
                    continue
                last_recipe = result
                print(result)

            else:
                last_recipe = selected_doc.page_content

                print("\n--- Recipe ---\n")
                print_recipe(selected_doc)

        # 🤖 CASE 2: NOTHING USEFUL → GENERATE FROM SIMILAR DOCUMENTS
        elif all_docs:
            print("\n--- No match → showing options ---\n")

            context = "\n\n".join([doc.page_content[:500] for doc in all_docs[:2]])

            prompt1 = f"""
Suggest up to 5 recipe names for the given request.

Request: {user_query}

Rules:
- Only suggest relevant recipes
- Keep names realistic and specific
- Do NOT include ingredients or steps
- Do NOT explain anything
- Prefer recipes closely matching the request
- Return at most 5 options

Format:
1. Recipe name
2. Recipe name
3. Recipe name
4. Recipe name
5. Recipe name
"""
            res = generate_recipe_llm(prompt1)
            if not res or not res.strip():
                print("Error: Empty response, try again")
                continue
            selected_rec = show_options_and_select2(res)

            prompt2 = f"""
Generate a recipe.

Dish: {selected_rec}

Context:
{context}

Allergies: {user_allergies}

Rules:
- Match the dish
- Use context only as guidance (do NOT copy)
- Keep it realistic and complete
- do not include allergen ingredients
- No explanation
- Keep steps concise (1–2 lines each)

Format:

Recipe Name: <name>

Preparation Time: <time in minutes>

Ingredients:
- item

Steps:
1. step
"""
            
            result = generate_recipe_llm(prompt2)
            if not result or not result.strip():
                print("Error: Empty response, try again")
                continue
            last_recipe = result
            print(result)

        # NO DOCS FOUND THROUGH RAG -> FALLBACK DIRECT LLM CALL
        else:
            print("\n--- No documents retrieved → generating options ---\n")

            prompt1 = f"""
Suggest up to 5 recipe names for the given request.

Request: {user_query}

Rules:
- Only suggest relevant recipes
- Keep names realistic and specific
- Do NOT include ingredients or steps
- Do NOT explain anything
- Prefer recipes closely matching the request
- Return at most 5 options

Format:
1. Recipe name
2. Recipe name
3. Recipe name
4. Recipe name
5. Recipe name
"""
            res = generate_recipe_llm(prompt1)
            if not res or not res.strip():
                print("Error: Empty response, try again")
                continue
            selected_rec = show_options_and_select2(res)

            prompt2 = f"""
Generate a complete recipe.

Dish: {selected_rec}
Avoid allergies: {user_allergies}

Rules:
- Full realistic recipe
- Avoid all listed allergens
- Replace unsafe ingredients if needed
- No explanation
- Keep steps concise (1–2 lines each)

Format:

Recipe Name: <name>

Preparation Time: <time in minutes>

Ingredients:
- item

Steps:
1. step
"""

            result = generate_recipe_llm(prompt2)
            if not result or not result.strip():
                print("Error: Empty response, try again")
                continue
            last_recipe = result
            print(result)


    # -----------------------------
    # 🤖 MODIFY MODE
    # -----------------------------
    else:
        print("\n--- Modifying recipe ---\n")
        prompt = f"""
Modify this recipe.

Request: {user_query}

Recipe:
{last_recipe}

Rules:
- Keep same dish
- Only change what is required
- Keep structure same
- No explanation
- Keep steps concise (1–2 lines each)

Format:

Recipe Name: <name>

Preparation Time: <time in minutes>

Ingredients:
- item

Steps:
1. step
"""
        result = generate_recipe_llm(prompt)
        if not result or not result.strip():
            print("Error: Empty response, try again")
            continue
        last_recipe = result
        print(result)