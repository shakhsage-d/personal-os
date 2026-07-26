const TYPE_LABELS = {
  task: "Vazifa",
  goal: "Maqsad",
  milestone: "Bosqich",
};

export function CalendarDayCell({ date, isCurrentMonth, isToday, events }) {
  const cellClassNames = [
    "calendar-day-cell",
    isCurrentMonth ? "" : "calendar-day-cell-muted",
    isToday ? "calendar-day-cell-today" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cellClassNames}>
      <div className="calendar-day-number">{date.getDate()}</div>
      <ul className="calendar-day-events">
        {events.map((event) => (
          <li
            key={`${event.type}-${event.id}`}
            className={`calendar-event calendar-event-${event.type}`}
            title={`${TYPE_LABELS[event.type]}: ${event.title} (${event.status_label})`}
          >
            <span className="calendar-event-type">{TYPE_LABELS[event.type]}</span>
            <span className="calendar-event-title">{event.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
