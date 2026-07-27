// Backend shakli `backend/app/modules/tasks/schemas.py`ga to'liq mos.

export function listTasks(authFetch, { goalId, statusFilter } = {}) {
  const params = new URLSearchParams();
  if (goalId) params.set("goal_id", goalId);
  if (statusFilter) params.set("status_filter", statusFilter);
  const query = params.toString();
  return authFetch(`/tasks${query ? `?${query}` : ""}`, { method: "GET" });
}

export function createTask(authFetch, { title, description, goalId, priority, dueDate }) {
  return authFetch("/tasks", {
    method: "POST",
    body: {
      title,
      description: description || null,
      goal_id: goalId || null,
      priority: priority || "medium",
      recurrence: "none",
      due_date: dueDate || null,
    },
  });
}

export function updateTask(authFetch, taskId, payload) {
  return authFetch(`/tasks/${taskId}`, { method: "PUT", body: payload });
}

export function deleteTask(authFetch, taskId) {
  return authFetch(`/tasks/${taskId}`, { method: "DELETE" });
}

export function toggleTaskDone(authFetch, task) {
  return updateTask(authFetch, task.id, {
    status: task.status === "done" ? "todo" : "done",
  });
}
