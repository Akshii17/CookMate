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
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}

export async function getProfile() {
  return apiRequest("/users/me");
}

export async function updateProfile(data) {
  return apiRequest("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
