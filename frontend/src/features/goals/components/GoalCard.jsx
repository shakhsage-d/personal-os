import { useState } from "react";
// MUHIM: bu yagona joy — Goals moduli Tasks modulidan import qiladi.
// Sabab: roadmap 3-Qavat DoD talabi ("goal sahifasida unga tegishli
// tasklar ko'rinishi kerak"). Bog'liqlik faqat UI kompozitsiyasi darajasida
// (bitta import qatori) — Goals'ning backend/model/service qatlami Tasks
// haqida hech narsa bilmaydi, va bog'liqlik yo'nalishi baribir "Tasks ->
// Goals" bilan mos (Tasks Goals'ga bog'liq, aksincha emas).
import { GoalTasksSection } from "../../tasks/components/GoalTasksSection";
import { Card, Badge, Select, Button, Input } from "../../../shared/ui";

const STATUS_LABELS = {
  active: "Faol",
  completed: "Bajarilgan",
  archived: "Arxivlangan",
};

const STATUS_TONES = {
  active: "info",
  completed: "success",
  archived: "neutral",
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
    <Card
      className="goal-card"
      title={goal.title}
      actions={<Badge tone={STATUS_TONES[goal.status]}>{STATUS_LABELS[goal.status]}</Badge>}
      footer={
        <>
          <Select
            value={goal.status}
            onChange={(e) => onUpdateStatus(e.target.value)}
            aria-label="Maqsad holati"
            options={[
              { value: "active", label: "Faol" },
              { value: "completed", label: "Bajarilgan" },
              { value: "archived", label: "Arxivlangan" },
            ]}
          />
          <Button variant="ghost" onClick={onDelete}>
            Maqsadni o'chirish
          </Button>
        </>
      }
    >
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
              <Button variant="ghost" onClick={() => onDeleteMilestone(milestone.id)}>
                o'chirish
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddMilestone} className="milestone-form">
        <Input
          value={milestoneTitle}
          onChange={(e) => setMilestoneTitle(e.target.value)}
          placeholder="Yangi bosqich qo'shish..."
          aria-label="Yangi bosqich"
        />
        <Button type="submit" variant="primary" disabled={isAdding}>
          Qo'shish
        </Button>
      </form>

      <GoalTasksSection goalId={goal.id} />
    </Card>
  );
}
