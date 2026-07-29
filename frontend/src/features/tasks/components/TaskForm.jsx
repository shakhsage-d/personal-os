import { useState } from "react";
import { Input, Textarea, Select, Button } from "../../../shared/ui";

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
      <Input
        label="Sarlavha"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={255}
        placeholder="Masalan: Hisobotni yakunlash"
      />

      <Textarea
        label="Tavsif (ixtiyoriy)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />

      {!fixedGoalId && goals && (
        <Select
          label="Maqsad (ixtiyoriy)"
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          options={[
            { value: "", label: "Maqsadsiz (mustaqil vazifa)" },
            ...goals.map((goal) => ({ value: goal.id, label: goal.title })),
          ]}
        />
      )}

      <div className="task-form-row">
        <Select
          label="Ustuvorlik"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={PRIORITY_OPTIONS}
        />

        <Select
          label="Takrorlanish"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          options={RECURRENCE_OPTIONS}
        />

        <Input
          label="Muddat (ixtiyoriy)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {error && <p className="auth-error">{error}</p>}

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Saqlanmoqda..." : "Vazifani saqlash"}
      </Button>
    </form>
  );
}
