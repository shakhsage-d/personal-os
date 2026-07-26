// Dashboard — Habits moduli xulosasi (8-Qavat).
export function HabitsWidget({ summary, onNavigate }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Odatlar</h3>
        <button type="button" className="link-button" onClick={onNavigate}>
          Barchasi →
        </button>
      </div>
      <div className="dash-stat-row">
        <span className="dash-stat">
          <strong>{summary.active_count}</strong> faol odat
        </span>
      </div>
      {summary.top_streaks.length === 0 ? (
        <p className="muted">Faol odat yo'q.</p>
      ) : (
        <ul className="dash-mini-list">
          {summary.top_streaks.map((habit) => (
            <li key={habit.id} className="dash-mini-item">
              <span className="dash-mini-title">{habit.name}</span>
              <span className="dash-mini-meta">
                {habit.checked_today ? "✅ bugun belgilangan" : "⬜ bugun yo'q"} ·{" "}
                <span className="habit-streak-current">{habit.current_streak} kun</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
