// Dashboard — Finance moduli xulosasi (8-Qavat): joriy oy.
export function FinanceWidget({ summary, onNavigate }) {
  const isNegative = Number(summary.net) < 0;

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>
          Moliya — {summary.year}-{String(summary.month).padStart(2, "0")}
        </h3>
        <button type="button" className="link-button" onClick={onNavigate}>
          Barchasi →
        </button>
      </div>
      <div className="dash-stat-row">
        <span className="dash-stat dash-stat-positive">
          + {Number(summary.total_income).toLocaleString("uz-UZ")}
        </span>
        <span className="dash-stat dash-stat-warning">
          - {Number(summary.total_expense).toLocaleString("uz-UZ")}
        </span>
        <span className={`dash-stat ${isNegative ? "dash-stat-warning" : "dash-stat-positive"}`}>
          <strong>{Number(summary.net).toLocaleString("uz-UZ")}</strong> sof
        </span>
      </div>
    </div>
  );
}

// 14-Qavat: Dashboard v2 — ikkinchi variant (widget_key: "finance_recent_transactions").
export function FinanceRecentTransactionsWidget({ summary, onNavigate }) {
  const transactions = summary.recent_transactions;

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Moliya — so'nggi tranzaksiyalar</h3>
        <button type="button" className="link-button" onClick={onNavigate}>
          Barchasi →
        </button>
      </div>
      {transactions.length === 0 ? (
        <p className="muted">Hali tranzaksiya yo'q.</p>
      ) : (
        <ul className="dash-mini-list">
          {transactions.map((tx) => (
            <li key={tx.id} className="dash-mini-item">
              <span className="dash-mini-title">
                {tx.description || tx.category_name || "Nomsiz"}
              </span>
              <span
                className={`dash-mini-meta ${
                  tx.type === "expense" ? "dash-stat-warning" : "dash-stat-positive"
                }`}
              >
                {tx.type === "expense" ? "-" : "+"}
                {Number(tx.amount).toLocaleString("uz-UZ")} · {tx.occurred_on}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
