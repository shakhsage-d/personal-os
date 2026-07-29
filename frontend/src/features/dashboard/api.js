// Dashboard moduli uchun API chaqiruvi (Habits/Finance moduli naqshiga
// muvofiq, roadmap 2-Qavat izohi). `authFetch` — `shared/auth/AuthContext.jsx`dan
// keladi.

export function createDashboardApi(authFetch) {
  return {
    getSummary: () => authFetch("/dashboard/summary"),
    // 14-Qavat: Dashboard v2 — widget konfiguratsiyasi.
    getConfig: () => authFetch("/dashboard/config"),
    updateConfig: (widgets) =>
      authFetch("/dashboard/config", { method: "PUT", body: { widgets } }),
  };
}
