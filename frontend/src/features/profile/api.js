// Profile & Settings moduli uchun API chaqiruvlari.
// `authFetch` — `shared/auth/AuthContext.jsx`dan keladi (boshqa
// features/*/api.js fayllari naqshiga muvofiq).

export function createProfileApi(authFetch) {
  return {
    updateProfile: (payload) => authFetch("/auth/me", { method: "PATCH", body: payload }),

    changePassword: (payload) =>
      authFetch("/auth/change-password", { method: "POST", body: payload }),

    deleteAccount: () => authFetch("/auth/me", { method: "DELETE" }),

    getSettings: () => authFetch("/profile/settings", { method: "GET" }),

    updateSettings: (payload) =>
      authFetch("/profile/settings", { method: "PUT", body: payload }),
  };
}
