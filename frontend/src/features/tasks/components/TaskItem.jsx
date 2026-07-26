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
          <span className={`task-priority task-priority-${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          {showGoalTag && task.goal_title && (
            <span className="task-goal-tag">{task.goal_title}</span>
          )}
          {task.due_date && <span className="task-due-date">{task.due_date}</span>}
        </div>
      </div>

      <div className="task-item-actions">
        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(e.target.value)}
          aria-label="Vazifa holati"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" className="link-button" onClick={onDelete}>
          o'chirish
        </button>
      </div>
    </li>
  );
}
