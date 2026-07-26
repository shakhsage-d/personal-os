// Finance moduli uchun API chaqiruvlari (Goals/Tasks naqshiga muvofiq,
// roadmap 2-Qavat izohi). `authFetch` — `shared/auth/AuthContext.jsx`dan
// keladi.

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

export function createFinanceApi(authFetch) {
  return {
    // --- Categories ---
    categories: {
      list: ({ typeFilter } = {}) =>
        authFetch(`/finance/categories${buildQuery({ type_filter: typeFilter })}`),
      create: (payload) =>
        authFetch("/finance/categories", { method: "POST", body: payload }),
      update: (categoryId, payload) =>
        authFetch(`/finance/categories/${categoryId}`, { method: "PUT", body: payload }),
      remove: (categoryId) =>
        authFetch(`/finance/categories/${categoryId}`, { method: "DELETE" }),
    },

    // --- Transactions ---
    transactions: {
      list: ({ categoryId, typeFilter, dateFrom, dateTo } = {}) =>
        authFetch(
          `/finance/transactions${buildQuery({
            category_id: categoryId,
            type_filter: typeFilter,
            date_from: dateFrom,
            date_to: dateTo,
          })}`
        ),
      create: (payload) =>
        authFetch("/finance/transactions", { method: "POST", body: payload }),
      update: (transactionId, payload) =>
        authFetch(`/finance/transactions/${transactionId}`, { method: "PUT", body: payload }),
      remove: (transactionId) =>
        authFetch(`/finance/transactions/${transactionId}`, { method: "DELETE" }),
    },

    // --- Budgets ---
    budgets: {
      list: ({ year, month } = {}) =>
        authFetch(`/finance/budgets${buildQuery({ year, month })}`),
      create: (payload) => authFetch("/finance/budgets", { method: "POST", body: payload }),
      update: (budgetId, payload) =>
        authFetch(`/finance/budgets/${budgetId}`, { method: "PUT", body: payload }),
      remove: (budgetId) => authFetch(`/finance/budgets/${budgetId}`, { method: "DELETE" }),
    },

    // --- Savings goals ---
    savingsGoals: {
      list: () => authFetch("/finance/savings-goals"),
      create: (payload) =>
        authFetch("/finance/savings-goals", { method: "POST", body: payload }),
      update: (goalId, payload) =>
        authFetch(`/finance/savings-goals/${goalId}`, { method: "PUT", body: payload }),
      remove: (goalId) => authFetch(`/finance/savings-goals/${goalId}`, { method: "DELETE" }),
    },

    // --- Agregatsiya ---
    getSummary: ({ year, month } = {}) =>
      authFetch(`/finance/summary${buildQuery({ year, month })}`),
    getTrend: ({ year } = {}) => authFetch(`/finance/trend${buildQuery({ year })}`),
  };
}
