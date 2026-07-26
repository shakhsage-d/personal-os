// TaskItem/TransactionItem naqshiga muvofiq — bitta odat kartasi:
// streak ko'rsatkichi, bugungi belgilash tugmasi, o'chirish.
const todayIso = () => new Date().toISOString().slice(0, 10);

export function HabitCard({ habit, onToggleToday, onDelete, onArchiveToggle }) {
  const frequencyLabel = habit.frequency === "weekly" ? "Haftalik" : "Kunlik";

  return (
    <li className={`habit-card ${habit.is_active ? "" : "habit-card-inactive"}`}>
      <div className="habit-card-main">
        <div className="habit-card-title-row">
          <span className="habit-card-name">{habit.name}</span>
          <span className="habit-frequency-tag">
            {frequencyLabel} · {habit.target_per_period}x
          </span>
        </div>
        <div className="habit-card-stats">
          <span className="habit-streak habit-streak-current">
            🔥 {habit.current_streak} joriy
          </span>
          <span className="habit-streak habit-streak-longest">
            🏆 {habit.longest_streak} eng uzun
          </span>
          <span className="muted habit-total-checkins">
            jami: {habit.total_checkins}
          </span>
        </div>
      </div>

      <div className="habit-card-actions">
        <button
          type="button"
          className={habit.checked_today ? "habit-checkin-done" : ""}
          onClick={() => onToggleToday(habit, todayIso())}
        >
          {habit.checked_today ? "✓ Bugun bajarildi" : "Bugun belgilash"}
        </button>
        <button type="button" className="link-button" onClick={() => onArchiveToggle(habit)}>
          {habit.is_active ? "arxivlash" : "faollashtirish"}
        </button>
        <button type="button" className="link-button" onClick={() => onDelete(habit)}>
          o'chirish
        </button>
      </div>
    </li>
  );
}
