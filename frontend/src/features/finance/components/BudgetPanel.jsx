import { useState } from "react";

// Byudjet holatini (limit vs sarflangan) ko'rsatadigan va yangi byudjet
// qo'shish uchun ixcham forma — GoalCard progress-bar naqshiga muvofiq.
export function BudgetPanel({ budgets, expenseCategories, year, month, onCreate, onDelete }) {
  const [categoryId, setCategoryId] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!categoryId || !limitAmount || Number(limitAmount) <= 0) return;
    setIsSubmitting(true);
    try {
      await onCreate({
        category_id: categoryId,
        period_year: year,
        period_month: month,
        limit_amount: Number(limitAmount),
      });
      setCategoryId("");
      setLimitAmount("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="finance-budget-panel">
      <h3>
        Byudjet — {year}-{String(month).padStart(2, "0")}
      </h3>

      <form className="budget-form" onSubmit={handleSubmit}>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Kategoriya tanlang</option>
          {expenseCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Limit"
          value={limitAmount}
          onChange={(e) => setLimitAmount(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          + Byudjet
        </button>
      </form>

      {budgets.length === 0 ? (
        <p className="muted">Shu oy uchun byudjet belgilanmagan.</p>
      ) : (
        <ul className="budget-list">
          {budgets.map((budget) => {
            const spentRatio =
              budget.limit_amount > 0
                ? Math.min(100, (Number(budget.spent_amount) / Number(budget.limit_amount)) * 100)
                : 0;
            const isOver = Number(budget.remaining_amount) < 0;
            return (
              <li key={budget.id} className="budget-item">
                <div className="budget-item-header">
                  <span>{budget.category_name}</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => onDelete(budget.id)}
                  >
                    o'chirish
                  </button>
                </div>
                <div className="budget-progress-bar">
                  <div
                    className={`budget-progress-fill ${isOver ? "budget-progress-over" : ""}`}
                    style={{ width: `${spentRatio}%` }}
                  />
                </div>
                <div className="muted budget-item-numbers">
                  {Number(budget.spent_amount).toLocaleString("uz-UZ")} /{" "}
                  {Number(budget.limit_amount).toLocaleString("uz-UZ")}
                  {isOver && (
                    <span className="budget-over-label">
                      {" "}
                      ({Math.abs(Number(budget.remaining_amount)).toLocaleString("uz-UZ")} ga
                      oshib ketgan)
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
