// Tasks moduli uchun API chaqiruvlari (Goals moduli naqshiga muvofiq,
// roadmap 2-Qavat izohi).
// `authFetch` — `shared/auth/AuthContext.jsx`dan keladi.

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

export function createTasksApi(authFetch) {
  return {
    list: ({ goalId, statusFilter, priorityFilter } = {}) =>
      authFetch(
        `/tasks${buildQuery({
          goal_id: goalId,
          status_filter: statusFilter,
          priority_filter: priorityFilter,
        })}`
      ),

    create: (payload) => authFetch("/tasks", { method: "POST", body: payload }),

    update: (taskId, payload) =>
      authFetch(`/tasks/${taskId}`, { method: "PUT", body: payload }),

    remove: (taskId) => authFetch(`/tasks/${taskId}`, { method: "DELETE" }),
  };
}
