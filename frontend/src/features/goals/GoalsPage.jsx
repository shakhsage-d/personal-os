import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { createGoalsApi } from "./api";
import { GoalForm } from "./components/GoalForm";
import { GoalCard } from "./components/GoalCard";

export function GoalsPage() {
  const { authFetch } = useAuth();
  const [goals, setGoals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadGoals = useCallback(async () => {
    const goalsApi = createGoalsApi(authFetch);
    setIsLoading(true);
    setError(null);
    try {
      const data = await goalsApi.list(statusFilter || undefined);
      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  async function handleCreate(payload) {
    const goalsApi = createGoalsApi(authFetch);
    await goalsApi.create(payload);
    setShowForm(false);
    await loadGoals();
  }

  async function handleUpdateStatus(goalId, newStatus) {
    const goalsApi = createGoalsApi(authFetch);
    await goalsApi.update(goalId, { status: newStatus });
    await loadGoals();
  }

  async function handleDeleteGoal(goalId) {
    const goalsApi = createGoalsApi(authFetch);
    await goalsApi.remove(goalId);
    await loadGoals();
  }

  async function handleAddMilestone(goalId, payload) {
    const goalsApi = createGoalsApi(authFetch);
    await goalsApi.addMilestone(goalId, payload);
    await loadGoals();
  }

  async function handleToggleMilestone(goalId, milestoneId, isCompleted) {
    const goalsApi = createGoalsApi(authFetch);
    await goalsApi.updateMilestone(goalId, milestoneId, { is_completed: isCompleted });
    await loadGoals();
  }

  async function handleDeleteMilestone(goalId, milestoneId) {
    const goalsApi = createGoalsApi(authFetch);
    await goalsApi.removeMilestone(goalId, milestoneId);
    await loadGoals();
  }

  return (
    <div className="goals-page">
      <div className="goals-toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Barchasi</option>
          <option value="active">Faol</option>
          <option value="completed">Bajarilgan</option>
          <option value="archived">Arxivlangan</option>
        </select>
        <button type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Bekor qilish" : "+ Yangi maqsad"}
        </button>
      </div>

      {showForm && <GoalForm onSubmit={handleCreate} />}

      {error && <p className="auth-error">{error}</p>}
      {isLoading && <p className="muted">Yuklanmoqda...</p>}
      {!isLoading && goals.length === 0 && (
        <p className="muted">Hozircha maqsad yo'q. Birinchi maqsadingizni qo'shing.</p>
      )}

      <div className="goals-list">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onUpdateStatus={(newStatus) => handleUpdateStatus(goal.id, newStatus)}
            onDelete={() => handleDeleteGoal(goal.id)}
            onAddMilestone={(payload) => handleAddMilestone(goal.id, payload)}
            onToggleMilestone={(milestoneId, isCompleted) =>
              handleToggleMilestone(goal.id, milestoneId, isCompleted)
            }
            onDeleteMilestone={(milestoneId) => handleDeleteMilestone(goal.id, milestoneId)}
          />
        ))}
      </div>
    </div>
  );
}
