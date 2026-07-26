// Dashboard — Calendar moduli xulosasi (8-Qavat): keyingi 7 kunlik hodisalar.
const TYPE_LABEL = { task: "Vazifa", goal: "Maqsad", milestone: "Bosqich" };

export function CalendarWidget({ summary, onNavigate }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Kalendar — keyingi 7 kun</h3>
        <button type="button" className="link-button" onClick={onNavigate}>
          Barchasi →
        </button>
      </div>
      {summary.upcoming_events.length === 0 ? (
        <p className="muted">Yaqin kunlarda hodisa yo'q.</p>
      ) : (
        <ul className="dash-mini-list">
          {summary.upcoming_events.map((event) => (
            <li key={`${event.type}-${event.id}`} className="dash-mini-item">
              <span className="dash-mini-title">{event.title}</span>
              <span className="dash-mini-meta">
                {event.event_date} · {TYPE_LABEL[event.type] || event.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
