// Umumiy API client — barcha features/ shundan foydalanadi.
// Auth headerlari uchun `authorizedRequest` (pastda) yoki
// `src/shared/auth/AuthContext.jsx`dagi `authFetch`dan foydalaning.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.detail || `Request failed: ${response.status}`);
    error.status = response.status;
    error.code = errorBody.code;
    throw error;
  }

  return response.status === 204 ? null : response.json();
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
