import { useState } from "react";

const CHANNELS = [
  {
    field: "notify_task_due",
    icon: "📋",
    title: "Vazifa muddati",
    hint: "Vazifa muddati yaqinlashganda bildirishnoma.",
  },
  {
    field: "notify_budget_exceeded",
    icon: "💰",
    title: "Byudjet limiti",
    hint: "Kategoriya byudjeti oshib ketganda bildirishnoma.",
  },
  {
    field: "notify_habit_streak_broken",
    icon: "🔥",
    title: "Odat streak'i uzilishi",
    hint: "Odat ketma-ketligi (streak) uzilganda bildirishnoma.",
  },
];

export function NotificationPrefsForm({ settings, onSubmit }) {
  const [values, setValues] = useState({
    notify_task_due: settings.notify_task_due,
    notify_budget_exceeded: settings.notify_budget_exceeded,
    notify_habit_streak_broken: settings.notify_habit_streak_broken,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleToggle(field) {
    const nextValues = { ...values, [field]: !values[field] };
    setValues(nextValues);
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({ [field]: nextValues[field] });
    } catch (err) {
      // Muvaffaqiyatsiz bo'lsa eski holatga qaytaramiz.
      setValues(values);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="profile-settings-form">
      <p className="muted">
        Har bir bildirishnoma turini alohida yoqish/o'chirish mumkin. O'zgarish darhol saqlanadi.
      </p>
      <ul className="notification-prefs-list">
        {CHANNELS.map((channel) => (
          <li key={channel.field} className="notification-prefs-item">
            <span className="notification-prefs-icon" aria-hidden="true">
              {channel.icon}
            </span>
            <div className="notification-prefs-text">
              <strong>{channel.title}</strong>
              <span className="muted">{channel.hint}</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={values[channel.field]}
                onChange={() => handleToggle(channel.field)}
                disabled={isSaving}
              />
              <span className="switch-track" aria-hidden="true" />
            </label>
          </li>
        ))}
      </ul>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
