import { useState } from "react";
import { Input, Textarea, Button } from "../../../shared/ui";

export function GoalForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
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
        target_date: targetDate || null,
      });
      setTitle("");
      setDescription("");
      setTargetDate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form goal-form">
      <Input
        label="Sarlavha"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={255}
        placeholder="Masalan: Yiliga 12 ta kitob o'qish"
      />

      <Textarea
        label="Tavsif (ixtiyoriy)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <Input
        label="Muddat (ixtiyoriy)"
        type="date"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
      />

      {error && <p className="auth-error">{error}</p>}

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Saqlanmoqda..." : "Maqsadni saqlash"}
      </Button>
    </form>
  );
}
