// Dashboard — Goals moduli xulosasi (8-Qavat, widget_key: "goals_overview").
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

// 14-Qavat: Dashboard v2 — ikkinchi variant (widget_key: "goals_progress_chart").
// Xuddi shu ma'lumotdan (`summary.upcoming`), lekin progress-bar ko'rinishida.
export function GoalsProgressWidget({ summary, onNavigate }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Maqsadlar — progress</h3>
        <button type="button" className="link-button" onClick={onNavigate}>
          Barchasi →
        </button>
      </div>
      {summary.upcoming.length === 0 ? (
        <p className="muted">Faol maqsad yo'q.</p>
      ) : (
        <ul className="dash-progress-list">
          {summary.upcoming.map((goal) => (
            <li key={goal.id} className="dash-progress-item">
              <div className="dash-progress-item-header">
                <span className="dash-mini-title">{goal.title}</span>
                <span className="dash-mini-meta">{goal.progress_percent}%</span>
              </div>
              <div className="dash-progress-track">
                <div
                  className="dash-progress-fill"
                  style={{ width: `${Math.min(100, Math.max(0, goal.progress_percent))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
