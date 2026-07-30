import { useState } from "react";
import { Input, Button } from "../../../shared/ui";

export function SavingsGoalPanel({ goals, onCreate, onUpdate, onDelete }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !targetAmount || Number(targetAmount) <= 0) return;
    setIsSubmitting(true);
    try {
      await onCreate({ name: name.trim(), target_amount: Number(targetAmount) });
      setName("");
      setTargetAmount("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeposit(goal) {
    const raw = window.prompt(`"${goal.name}" ga qo'shiladigan summa:`, "0");
    if (raw === null) return;
    const delta = Number(raw);
    if (!delta) return;
    const nextAmount = Math.max(0, Number(goal.current_amount) + delta);
    await onUpdate(goal.id, { current_amount: nextAmount });
  }

  return (
    <div className="finance-savings-panel">
      <h3>Jamg'arma maqsadlari</h3>

      <form className="savings-form" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Maqsad nomi (masalan, Mashina)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Jamg'arma maqsadi nomi"
        />
        <Input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Maqsad summasi"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          aria-label="Maqsad summasi"
        />
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          + Qo'shish
        </Button>
      </form>

      {goals.length === 0 ? (
        <p className="muted">Hozircha jamg'arma maqsadi yo'q.</p>
      ) : (
        <ul className="savings-goal-list">
          {goals.map((goal) => (
            <li key={goal.id} className="savings-goal-item">
              <div className="savings-goal-header">
                <span>{goal.name}</span>
                <Button variant="ghost" onClick={() => onDelete(goal.id)}>
                  o'chirish
                </Button>
              </div>
              <div className="goal-progress-bar">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${goal.progress_percent}%` }}
                />
              </div>
              <div className="muted savings-goal-numbers">
                {Number(goal.current_amount).toLocaleString("uz-UZ")} /{" "}
                {Number(goal.target_amount).toLocaleString("uz-UZ")} (
                {goal.progress_percent.toFixed(0)}%)
              </div>
              <Button variant="secondary" onClick={() => handleDeposit(goal)}>
                Summa qo'shish / kamaytirish
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
