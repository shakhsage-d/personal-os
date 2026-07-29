import { Badge, Select, Button } from "../../../shared/ui";

const STATUS_LABELS = {
  todo: "Bajarilmagan",
  in_progress: "Jarayonda",
  done: "Bajarilgan",
};

const PRIORITY_LABELS = {
  low: "Past",
  medium: "O'rtacha",
  high: "Yuqori",
};

const PRIORITY_TONES = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};

// `showGoalTag` — Tasks umumiy sahifasida har bir vazifa qaysi maqsadga
// tegishli ekanini ko'rsatish uchun (goal_title backend'da `selectinload`
// orqali to'ldiriladi). GoalCard ichida ko'rsatilganda esa (allaqachon
// shu goal ostida turgani ma'lum bo'lgani uchun) yashirinadi.
export function TaskItem({ task, onUpdateStatus, onDelete, showGoalTag = true }) {
  return (
    <li className="task-item">
      <div className="task-item-main">
        <label className="task-item-title-row">
          <input
            type="checkbox"
            checked={task.status === "done"}
            onChange={(e) => onUpdateStatus(e.target.checked ? "done" : "todo")}
          />
          <span className={task.status === "done" ? "task-title-done" : ""}>
            {task.title}
          </span>
        </label>
        <div className="task-item-tags">
          <Badge tone={PRIORITY_TONES[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
          {showGoalTag && task.goal_title && <Badge tone="info">{task.goal_title}</Badge>}
          {task.due_date && <Badge tone="neutral">{task.due_date}</Badge>}
        </div>
      </div>

      <div className="task-item-actions">
        <Select
          value={task.status}
          onChange={(e) => onUpdateStatus(e.target.value)}
          aria-label="Vazifa holati"
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <Button variant="ghost" onClick={onDelete}>
          o'chirish
        </Button>
      </div>
    </li>
  );
}
