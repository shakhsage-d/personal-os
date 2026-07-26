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
