// Dashboard moduli uchun API chaqiruvi (Habits/Finance moduli naqshiga
// muvofiq, roadmap 2-Qavat izohi). `authFetch` — `shared/auth/AuthContext.jsx`dan
// keladi.

export function createDashboardApi(authFetch) {
  return {
    getSummary: () => authFetch("/dashboard/summary"),
  };
}
