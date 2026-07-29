import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Spinner, EmptyState, ErrorBanner } from "../../shared/ui/Feedback";
import { Button, Select } from "../../shared/ui";
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
    try {
      const goalsApi = createGoalsApi(authFetch);
      await goalsApi.create(payload);
      setShowForm(false);
      await loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateStatus(goalId, newStatus) {
    try {
      const goalsApi = createGoalsApi(authFetch);
      await goalsApi.update(goalId, { status: newStatus });
      await loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteGoal(goalId) {
    try {
      const goalsApi = createGoalsApi(authFetch);
      await goalsApi.remove(goalId);
      await loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddMilestone(goalId, payload) {
    try {
      const goalsApi = createGoalsApi(authFetch);
      await goalsApi.addMilestone(goalId, payload);
      await loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleMilestone(goalId, milestoneId, isCompleted) {
    try {
      const goalsApi = createGoalsApi(authFetch);
      await goalsApi.updateMilestone(goalId, milestoneId, { is_completed: isCompleted });
      await loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteMilestone(goalId, milestoneId) {
    try {
      const goalsApi = createGoalsApi(authFetch);
      await goalsApi.removeMilestone(goalId, milestoneId);
      await loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="goals-page">
      <div className="goals-toolbar">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Holat bo'yicha filtr"
          options={[
            { value: "", label: "Barchasi" },
            { value: "active", label: "Faol" },
            { value: "completed", label: "Bajarilgan" },
            { value: "archived", label: "Arxivlangan" },
          ]}
        />
        <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Bekor qilish" : "+ Yangi maqsad"}
        </Button>
      </div>

      {showForm && <GoalForm onSubmit={handleCreate} />}

      <ErrorBanner message={error} onRetry={loadGoals} />
      {isLoading && <Spinner />}
      {!isLoading && goals.length === 0 && (
        <EmptyState
          icon="🎯"
          title="Hozircha maqsad yo'q"
          hint="Birinchi maqsadingizni qo'shing."
        />
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
