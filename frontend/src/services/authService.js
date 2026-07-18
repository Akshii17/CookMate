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

// -------------------- Signup --------------------

export async function signupUser(name, email, password) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

// -------------------- Login --------------------

export async function loginUser(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

// -------------------- Google Login --------------------

export async function googleLoginUser(token) {
  return apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({
      token,
    }),
  });
}