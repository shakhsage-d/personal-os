import { useState } from "react";
// MUHIM: bu yagona joy — Goals moduli Tasks modulidan import qiladi.
// Sabab: roadmap 3-Qavat DoD talabi ("goal sahifasida unga tegishli
// tasklar ko'rinishi kerak"). Bog'liqlik faqat UI kompozitsiyasi darajasida
// (bitta import qatori) — Goals'ning backend/model/service qatlami Tasks
// haqida hech narsa bilmaydi, va bog'liqlik yo'nalishi baribir "Tasks ->
// Goals" bilan mos (Tasks Goals'ga bog'liq, aksincha emas).
import { GoalTasksSection } from "../../tasks/components/GoalTasksSection";

const STATUS_LABELS = {
  active: "Faol",
  completed: "Bajarilgan",
  archived: "Arxivlangan",
};

export function GoalCard({
  goal,
  onUpdateStatus,
  onDelete,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone,
}) {
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddMilestone(event) {
    event.preventDefault();
    if (!milestoneTitle.trim()) return;
    setIsAdding(true);
    try {
      await onAddMilestone({
        title: milestoneTitle.trim(),
        order_index: goal.milestones.length,
      });
      setMilestoneTitle("");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <article className="goal-card">
      <div className="goal-card-header">
        <h3>{goal.title}</h3>
        <span className={`goal-status goal-status-${goal.status}`}>
          {STATUS_LABELS[goal.status]}
        </span>
      </div>

      {goal.description && <p className="muted">{goal.description}</p>}
      {goal.target_date && <p className="muted">Muddat: {goal.target_date}</p>}

      <div className="goal-progress-bar">
        <div
          className="goal-progress-fill"
          style={{ width: `${goal.progress_percent}%` }}
        />
      </div>
      <p className="muted">{goal.progress_percent}% bajarildi</p>

      {goal.milestones.length > 0 && (
        <ul className="milestone-list">
          {goal.milestones.map((milestone) => (
            <li key={milestone.id}>
              <label>
                <input
                  type="checkbox"
                  checked={milestone.is_completed}
                  onChange={(e) => onToggleMilestone(milestone.id, e.target.checked)}
                />
                <span className={milestone.is_completed ? "milestone-done" : ""}>
                  {milestone.title}
                </span>
              </label>
              <button
                type="button"
                className="link-button"
                onClick={() => onDeleteMilestone(milestone.id)}
              >
                o'chirish
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddMilestone} className="milestone-form">
        <input
          value={milestoneTitle}
          onChange={(e) => setMilestoneTitle(e.target.value)}
          placeholder="Yangi bosqich qo'shish..."
        />
        <button type="submit" disabled={isAdding}>
          Qo'shish
        </button>
      </form>

      <GoalTasksSection goalId={goal.id} />

      <div className="goal-card-actions">
        <select value={goal.status} onChange={(e) => onUpdateStatus(e.target.value)}>
          <option value="active">Faol</option>
          <option value="completed">Bajarilgan</option>
          <option value="archived">Arxivlangan</option>
        </select>
        <button type="button" className="link-button" onClick={onDelete}>
          Maqsadni o'chirish
        </button>
      </div>
    </article>
  );
}
