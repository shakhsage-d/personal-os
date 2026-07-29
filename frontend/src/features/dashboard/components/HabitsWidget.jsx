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

// 14-Qavat: Dashboard v2 — ikkinchi variant (widget_key: "habits_today_checklist").
// E'tibor markazi streak emas, "bugun belgilanganmi" holatida.
export function HabitsTodayWidget({ summary, onNavigate }) {
  const checkedCount = summary.top_streaks.filter((h) => h.checked_today).length;

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Odatlar — bugungi checklist</h3>
        <button type="button" className="link-button" onClick={onNavigate}>
          Barchasi →
        </button>
      </div>
      <div className="dash-stat-row">
        <span className="dash-stat">
          <strong>{checkedCount}</strong>/{summary.top_streaks.length} bugun belgilangan
        </span>
      </div>
      {summary.top_streaks.length === 0 ? (
        <p className="muted">Faol odat yo'q.</p>
      ) : (
        <ul className="dash-checklist">
          {summary.top_streaks.map((habit) => (
            <li key={habit.id} className="dash-checklist-item">
              <span aria-hidden="true">{habit.checked_today ? "✅" : "⬜"}</span>
              <span className="dash-mini-title">{habit.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
