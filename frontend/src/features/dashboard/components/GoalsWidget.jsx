// Dashboard — Goals moduli xulosasi (8-Qavat).
export function GoalsWidget({ summary, onNavigate }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Maqsadlar</h3>
        <button type="button" className="link-button" onClick={onNavigate}>
          Barchasi →
        </button>
      </div>
      <div className="dash-stat-row">
        <span className="dash-stat">
          <strong>{summary.total}</strong> jami
        </span>
        <span className="dash-stat">
          <strong>{summary.active}</strong> faol
        </span>
        <span className="dash-stat">
          <strong>{summary.completed}</strong> yakunlangan
        </span>
      </div>
      {summary.upcoming.length === 0 ? (
        <p className="muted">Faol maqsad yo'q.</p>
      ) : (
        <ul className="dash-mini-list">
          {summary.upcoming.map((goal) => (
            <li key={goal.id} className="dash-mini-item">
              <span className="dash-mini-title">{goal.title}</span>
              <span className="dash-mini-meta">
                {goal.target_date ? goal.target_date : "muddatsiz"} ·{" "}
                {goal.progress_percent}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
