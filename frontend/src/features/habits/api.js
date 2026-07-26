// Habits moduli uchun API chaqiruvlari (Finance moduli naqshiga
// muvofiq, roadmap 2-Qavat izohi). `authFetch` — `shared/auth/AuthContext.jsx`dan
// keladi.

function buildQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function createHabitsApi(authFetch) {
  return {
    // --- Habits ---
    habits: {
      list: ({ activeOnly } = {}) =>
        authFetch(`/habits${buildQuery({ active_only: activeOnly })}`),
      create: (payload) => authFetch("/habits", { method: "POST", body: payload }),
      update: (habitId, payload) =>
        authFetch(`/habits/${habitId}`, { method: "PUT", body: payload }),
      remove: (habitId) => authFetch(`/habits/${habitId}`, { method: "DELETE" }),
    },

    // --- Checkins ---
    checkins: {
      create: (habitId, payload) =>
        authFetch(`/habits/${habitId}/checkins`, { method: "POST", body: payload }),
      list: (habitId) => authFetch(`/habits/${habitId}/checkins`),
      remove: (habitId, checkedOn) =>
        authFetch(`/habits/${habitId}/checkins/${checkedOn}`, { method: "DELETE" }),
    },

    // --- Reading logs ---
    readingLogs: {
      list: ({ statusFilter } = {}) =>
        authFetch(`/reading-logs${buildQuery({ status_filter: statusFilter })}`),
      create: (payload) => authFetch("/reading-logs", { method: "POST", body: payload }),
      update: (logId, payload) =>
        authFetch(`/reading-logs/${logId}`, { method: "PUT", body: payload }),
      remove: (logId) => authFetch(`/reading-logs/${logId}`, { method: "DELETE" }),
    },

    // --- Weekly reviews ---
    weeklyReviews: {
      list: () => authFetch("/weekly-reviews"),
      create: (payload) => authFetch("/weekly-reviews", { method: "POST", body: payload }),
      update: (reviewId, payload) =>
        authFetch(`/weekly-reviews/${reviewId}`, { method: "PUT", body: payload }),
      remove: (reviewId) => authFetch(`/weekly-reviews/${reviewId}`, { method: "DELETE" }),
    },
  };
}
