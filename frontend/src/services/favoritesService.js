const BASE_URL = "http://localhost:8000";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const detail = data.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Something went wrong"
    );
  }

  return data;
}

export async function getFavorites() {
  return apiRequest("/favorites/me");
}

export async function addFavorite({ recipeId, recipe }) {
  const body = {};
  if (recipeId != null) {
    body.recipe_id = recipeId;
  }
  if (recipe) {
    body.recipe = recipe;
  }
  return apiRequest("/favorites/me", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function removeFavorite(recipeId) {
  return apiRequest(`/favorites/me/${recipeId}`, {
    method: "DELETE",
  });
}
