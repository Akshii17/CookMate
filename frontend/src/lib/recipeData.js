/** Dummy recipe — replace with backend response when wired up */
export function getDummyRecipe(query, prepTime = 50) {
  const name = query.trim() || "Tandoori Chicken Momo";
  return {
    name: name.includes("Recipe") ? name : `${name} Recipe`,
    prepTime,
    ingredients: [
      "salt",
      "water (for kneading)",
      "cumin powder (jeera)",
      "tandoori masala",
      "maida (all-purpose flour)",
      "chicken (minced)",
      "ginger-garlic paste",
      "onion (finely chopped)",
    ],
    steps: [
      "To begin making the Tandoori Chicken Momos, first let's make the dough.",
      "In a mixing bowl, add maida and add water slowly; knead to form a medium stiff dough.",
      "The dough should be non-sticky, smooth and firm.",
      "Keep the momo dough covered for 2 hours before making the filling.",
      "For the filling: mix minced chicken with tandoori masala, cumin, ginger-garlic paste, and onion.",
      "Roll small portions of dough into thin circles and place a spoonful of filling in the centre.",
      "Fold and pleat the edges to seal each momo tightly.",
      "Steam the momos for 12–15 minutes until cooked through. Serve hot with chutney.",
    ],
  };
}
