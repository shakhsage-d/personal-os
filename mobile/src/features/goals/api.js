// `authFetch`ni har bir funksiyaga parametr sifatida beramiz — ekranlar
// `useAuth()`dan olingan `authFetch`ni shu yerga uzatadi. Backend shakli
// `backend/app/modules/goals/schemas.py`ga to'liq mos.

export function listGoals(authFetch) {
  return authFetch("/goals", { method: "GET" });
}

export function getGoal(authFetch, goalId) {
  return authFetch(`/goals/${goalId}`, { method: "GET" });
}

export function createGoal(authFetch, { title, description, targetDate }) {
  return authFetch("/goals", {
    method: "POST",
    body: {
      title,
      description: description || null,
      target_date: targetDate || null,
      milestones: [],
    },
  });
}

export function updateGoal(authFetch, goalId, payload) {
  return authFetch(`/goals/${goalId}`, { method: "PUT", body: payload });
}

export function deleteGoal(authFetch, goalId) {
  return authFetch(`/goals/${goalId}`, { method: "DELETE" });
}

export function addMilestone(authFetch, goalId, { title, targetDate }) {
  return authFetch(`/goals/${goalId}/milestones`, {
    method: "POST",
    body: { title, target_date: targetDate || null, order_index: 0 },
  });
}

export function updateMilestone(authFetch, goalId, milestoneId, payload) {
  return authFetch(`/goals/${goalId}/milestones/${milestoneId}`, {
    method: "PUT",
    body: payload,
  });
}
