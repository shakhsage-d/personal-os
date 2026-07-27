// Umumiy API client — barcha features/ shundan foydalanadi.
// `frontend/src/shared/api/client.js` bilan bir xil naqsh — faqat baza URL
// manbai farq qiladi: web'da Vite env (`import.meta.env`), bu yerda Expo
// public env (`process.env.EXPO_PUBLIC_*`, .env faylidan avtomatik o'qiladi).

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.detail || `So'rov muvaffaqiyatsiz: ${response.status}`);
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

export { API_BASE_URL };
