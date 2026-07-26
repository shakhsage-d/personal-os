// Dashboard — Tasks moduli xulosasi (8-Qavat).
const PRIORITY_LABEL = { low: "Past", medium: "O'rta", high: "Yuqori" };

export function TasksWidget({ summary, onNavigate }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Vazifalar</h3>
        <button type="button" className="link-button" onClick={onNavigate}>
          Barchasi →
        </button>
      </div>
      <div className="dash-stat-row">
        <span className="dash-stat">
          <strong>{summary.open_count}</strong> ochiq
        </span>
        <span className={`dash-stat ${summary.overdue_count > 0 ? "dash-stat-warning" : ""}`}>
          <strong>{summary.overdue_count}</strong> kechikkan
        </span>
        <span className="dash-stat">
          <strong>{summary.due_today_count}</strong> bugun
        </span>
      </div>
      {summary.upcoming.length === 0 ? (
        <p className="muted">Ochiq vazifa yo'q.</p>
      ) : (
        <ul className="dash-mini-list">
          {summary.upcoming.map((task) => (
            <li key={task.id} className="dash-mini-item">
              <span className="dash-mini-title">{task.title}</span>
              <span className="dash-mini-meta">
                {task.due_date || "muddatsiz"} · {PRIORITY_LABEL[task.priority]}
                {task.goal_title ? ` · ${task.goal_title}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
