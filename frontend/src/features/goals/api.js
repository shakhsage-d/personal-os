// Goals moduli uchun API chaqiruvlari.
// `authFetch` — `shared/auth/AuthContext.jsx`dan keladi: tokenni avtomatik
// qo'shadi va 401 bo'lsa refresh qilib qayta urinadi.

export function createGoalsApi(authFetch) {
  return {
    list: (statusFilter) =>
      authFetch(`/goals${statusFilter ? `?status_filter=${statusFilter}` : ""}`),

    create: (payload) => authFetch("/goals", { method: "POST", body: payload }),

    update: (goalId, payload) =>
      authFetch(`/goals/${goalId}`, { method: "PUT", body: payload }),

    remove: (goalId) => authFetch(`/goals/${goalId}`, { method: "DELETE" }),

    addMilestone: (goalId, payload) =>
      authFetch(`/goals/${goalId}/milestones`, { method: "POST", body: payload }),

    updateMilestone: (goalId, milestoneId, payload) =>
      authFetch(`/goals/${goalId}/milestones/${milestoneId}`, {
        method: "PUT",
        body: payload,
      }),

    removeMilestone: (goalId, milestoneId) =>
      authFetch(`/goals/${goalId}/milestones/${milestoneId}`, { method: "DELETE" }),
  };
}
