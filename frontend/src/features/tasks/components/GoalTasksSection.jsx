import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../shared/auth/AuthContext";
import { createTasksApi } from "../api";
import { TaskForm } from "./TaskForm";
import { TaskItem } from "./TaskItem";

// Tasks moduli tomonidan taqdim etiladigan, Goal sahifasiga "quyiladigan"
// komponent (roadmap, 3-Qavat DoD: "Frontend'da goal sahifasida unga
// tegishli tasklar ko'rinadi"). Goals moduli Tasks haqida hech narsa
// bilmaydi — GoalCard faqat shu komponentni `goalId` bilan chaqiradi,
// bog'liqlik faqat shu bir yo'nalishda (Tasks -> Goals, xuddi backend'da
// bo'lgani kabi).
export function GoalTasksSection({ goalId }) {
  const { authFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadTasks = useCallback(async () => {
    const tasksApi = createTasksApi(authFetch);
    setIsLoading(true);
    setError(null);
    try {
      setTasks(await tasksApi.list({ goalId }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId]);

  useEffect(() => {
    if (isOpen) loadTasks();
  }, [isOpen, loadTasks]);

  async function handleCreate(payload) {
    const tasksApi = createTasksApi(authFetch);
    await tasksApi.create(payload);
    setShowForm(false);
    await loadTasks();
  }

  async function handleUpdateStatus(taskId, newStatus) {
    const tasksApi = createTasksApi(authFetch);
    await tasksApi.update(taskId, { status: newStatus });
    await loadTasks();
  }

  async function handleDelete(taskId) {
    const tasksApi = createTasksApi(authFetch);
    await tasksApi.remove(taskId);
    await loadTasks();
  }

  return (
    <div className="goal-tasks-section">
      <button
        type="button"
        className="link-button"
        onClick={() => setIsOpen((v) => !v)}
      >
        {isOpen ? "Vazifalarni yashirish" : "Vazifalarni ko'rsatish"}
      </button>

      {isOpen && (
        <div className="goal-tasks-body">
          {error && <p className="auth-error">{error}</p>}
          {isLoading && <p className="muted">Yuklanmoqda...</p>}
          {!isLoading && tasks.length === 0 && (
            <p className="muted">Bu maqsadga bog'langan vazifa yo'q.</p>
          )}

          {tasks.length > 0 && (
            <ul className="task-list task-list-compact">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  showGoalTag={false}
                  onUpdateStatus={(newStatus) => handleUpdateStatus(task.id, newStatus)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </ul>
          )}

          {showForm ? (
            <TaskForm onSubmit={handleCreate} fixedGoalId={goalId} />
          ) : (
            <button type="button" onClick={() => setShowForm(true)}>
              + Vazifa qo'shish
            </button>
          )}
        </div>
      )}
    </div>
  );
}
