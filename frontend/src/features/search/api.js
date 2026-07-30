// Global qidiruv (Command Bar) uchun API chaqiruvi — 16-Qavat.
// `authFetch` — `shared/auth/AuthContext.jsx`dan keladi (Goals moduli
// `api.js` naqshiga muvofiq).

export function createSearchApi(authFetch) {
  return {
    search: (query) => authFetch(`/search?q=${encodeURIComponent(query)}`),
  };
}
