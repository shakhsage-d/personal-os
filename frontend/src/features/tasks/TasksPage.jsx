import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Spinner, EmptyState, ErrorBanner } from "../../shared/ui/Feedback";
import { Button, Select } from "../../shared/ui";
import { createGoalsApi } from "../goals/api";
import { createTasksApi } from "./api";
import { TaskForm } from "./components/TaskForm";
import { TaskItem } from "./components/TaskItem";

export function TasksPage() {
  const { authFetch } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [goalFilter, setGoalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadGoals = useCallback(async () => {
    const goalsApi = createGoalsApi(authFetch);
    const data = await goalsApi.list();
    setGoals(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTasks = useCallback(async () => {
    const tasksApi = createTasksApi(authFetch);
    setIsLoading(true);
    setError(null);
    try {
      const data = await tasksApi.list({
        goalId: goalFilter || undefined,
        statusFilter: statusFilter || undefined,
        priorityFilter: priorityFilter || undefined,
      });
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalFilter, statusFilter, priorityFilter]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleCreate(payload) {
    try {
      const tasksApi = createTasksApi(authFetch);
      await tasksApi.create(payload);
      setShowForm(false);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateStatus(taskId, newStatus) {
    try {
      const tasksApi = createTasksApi(authFetch);
      await tasksApi.update(taskId, { status: newStatus });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(taskId) {
    try {
      const tasksApi = createTasksApi(authFetch);
      await tasksApi.remove(taskId);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="tasks-page">
      <div className="tasks-toolbar">
        <Select
          value={goalFilter}
          onChange={(e) => setGoalFilter(e.target.value)}
          aria-label="Maqsad bo'yicha filtr"
          options={[
            { value: "", label: "Barcha maqsadlar" },
            ...goals.map((goal) => ({ value: goal.id, label: goal.title })),
          ]}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Holat bo'yicha filtr"
          options={[
            { value: "", label: "Barcha holatlar" },
            { value: "todo", label: "Bajarilmagan" },
            { value: "in_progress", label: "Jarayonda" },
            { value: "done", label: "Bajarilgan" },
          ]}
        />
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          aria-label="Ustuvorlik bo'yicha filtr"
          options={[
            { value: "", label: "Barcha ustuvorliklar" },
            { value: "low", label: "Past" },
            { value: "medium", label: "O'rtacha" },
            { value: "high", label: "Yuqori" },
          ]}
        />
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Bekor qilish" : "+ Yangi vazifa"}
        </Button>
      </div>

      {showForm && <TaskForm onSubmit={handleCreate} goals={goals} />}

      <ErrorBanner message={error} onRetry={loadTasks} />
      {isLoading && <Spinner />}
      {!isLoading && tasks.length === 0 && (
        <EmptyState
          icon="✅"
          title="Hozircha vazifa yo'q"
          hint="Birinchi vazifangizni qo'shing."
        />
      )}

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdateStatus={(newStatus) => handleUpdateStatus(task.id, newStatus)}
            onDelete={() => handleDelete(task.id)}
          />
        ))}
      </ul>
    </div>
  );
}
