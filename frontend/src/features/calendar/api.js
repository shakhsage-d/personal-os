// Calendar moduli uchun API chaqiruvi (Tasks/Goals moduli naqshiga
// muvofiq, roadmap 2-Qavat izohi). `authFetch` — shared/auth/AuthContext'dan
// keladi.

export function createCalendarApi(authFetch) {
  return {
    // from/to — "YYYY-MM-DD" formatidagi sana satrlari.
    listEvents: ({ from, to }) =>
      authFetch(`/calendar?from=${from}&to=${to}`),
  };
}
