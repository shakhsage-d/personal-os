import { useState } from "react";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Past" },
  { value: "medium", label: "O'rtacha" },
  { value: "high", label: "Yuqori" },
];

const RECURRENCE_OPTIONS = [
  { value: "none", label: "Takrorlanmaydi" },
  { value: "daily", label: "Har kuni" },
  { value: "weekly", label: "Har hafta" },
  { value: "monthly", label: "Har oy" },
];

// `goals` — ixtiyoriy ro'yxat: berilsa, foydalanuvchi taskni biror
// maqsadga bog'lashi mumkin (agar goal-fixed berilsa, select ko'rsatilmaydi
// va task to'g'ridan-to'g'ri shu goal'ga bog'lanadi — GoalCard ichidagi
// "vazifa qo'shish" holati uchun).
export function TaskForm({ onSubmit, goals, fixedGoalId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalId, setGoalId] = useState(fixedGoalId || "");
  const [priority, setPriority] = useState("medium");
  const [recurrence, setRecurrence] = useState("none");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description: description || null,
        goal_id: fixedGoalId || goalId || null,
        priority,
        recurrence,
        due_date: dueDate || null,
      });
      setTitle("");
      setDescription("");
      if (!fixedGoalId) setGoalId("");
      setPriority("medium");
      setRecurrence("none");
      setDueDate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form task-form">
      <label>
        Sarlavha
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={255}
          placeholder="Masalan: Hisobotni yakunlash"
        />
      </label>

      <label>
        Tavsif (ixtiyoriy)
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </label>

      {!fixedGoalId && goals && (
        <label>
          Maqsad (ixtiyoriy)
          <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
            <option value="">Maqsadsiz (mustaqil vazifa)</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="task-form-row">
        <label>
          Ustuvorlik
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Takrorlanish
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            {RECURRENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Muddat (ixtiyoriy)
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saqlanmoqda..." : "Vazifani saqlash"}
      </button>
    </form>
  );
}
