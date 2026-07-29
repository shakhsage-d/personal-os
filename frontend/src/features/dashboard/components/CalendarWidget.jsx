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

// 14-Qavat: Dashboard v2 — ikkinchi variant (widget_key: "calendar_mini_agenda").
// Xuddi shu hodisalar, lekin sana bo'yicha guruhlangan holda.
export function CalendarAgendaWidget({ summary, onNavigate }) {
  const groups = [];
  const groupByDate = new Map();
  for (const event of summary.upcoming_events) {
    if (!groupByDate.has(event.event_date)) {
      const group = { date: event.event_date, events: [] };
      groupByDate.set(event.event_date, group);
      groups.push(group);
    }
    groupByDate.get(event.event_date).events.push(event);
  }

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Kalendar — agenda</h3>
        <button type="button" className="link-button" onClick={onNavigate}>
          Barchasi →
        </button>
      </div>
      {groups.length === 0 ? (
        <p className="muted">Yaqin kunlarda hodisa yo'q.</p>
      ) : (
        <div className="dash-agenda">
          {groups.map((group) => (
            <div key={group.date} className="dash-agenda-day">
              <span className="dash-agenda-date">{group.date}</span>
              <ul className="dash-mini-list">
                {group.events.map((event) => (
                  <li key={`${event.type}-${event.id}`} className="dash-mini-item">
                    <span className="dash-mini-title">{event.title}</span>
                    <span className="dash-mini-meta">
                      {TYPE_LABEL[event.type] || event.type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
