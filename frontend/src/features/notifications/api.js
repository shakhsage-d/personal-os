// Notifications moduli uchun API chaqiruvlari (Habits moduli naqshiga
// muvofiq, roadmap 2-Qavat izohi). `authFetch` — `shared/auth/AuthContext.jsx`dan
// keladi.

export function createNotificationsApi(authFetch) {
  return {
    list: ({ unreadOnly } = {}) =>
      authFetch(`/notifications${unreadOnly ? "?unread_only=true" : ""}`),
    unreadCount: () => authFetch("/notifications/unread-count"),
    markRead: (notificationId) =>
      authFetch(`/notifications/${notificationId}/read`, { method: "PUT" }),
    markAllRead: () => authFetch("/notifications/read-all", { method: "PUT" }),
    remove: (notificationId) =>
      authFetch(`/notifications/${notificationId}`, { method: "DELETE" }),
    runChecksNow: () => authFetch("/notifications/run-checks", { method: "POST" }),
  };
}
