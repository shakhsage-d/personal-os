import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Spinner, EmptyState, ErrorBanner } from "../../shared/ui/Feedback";
import { Button, Select, Input } from "../../shared/ui";
import { createGoalsApi } from "./api";
import { GoalForm } from "./components/GoalForm";
import { GoalCard } from "./components/GoalCard";

const SORT_OPTIONS = [
  { value: "created_desc", label: "Yangi qo'shilgan" },
  { value: "target_date_asc", label: "Muddat (yaqin avval)" },
  { value: "progress_desc", label: "Progress (yuqori avval)" },
  { value: "title_asc", label: "Nomi (A-Z)" },
];

function sortGoals(goals, sortBy) {
  const list = [...goals];
  switch (sortBy) {
    case "target_date_asc":
      return list.sort((a, b) => {
        if (!a.target_date && !b.target_date) return 0;
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;
        return a.target_date.localeCompare(b.target_date);
      });
    case "progress_desc":
      return list.sort((a, b) => (b.progress_percent || 0) - (a.progress_percent || 0));
    case "title_asc":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return list;
  }
}

export function GoalsPage() {
  const { authFetch } = useAuth();
  const [goals, setGoals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_desc");
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

  const visibleGoals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? goals.filter(
          (goal) =>
            goal.title.toLowerCase().includes(query) ||
            (goal.description || "").toLowerCase().includes(query)
        )
      : goals;
    return sortGoals(filtered, sortBy);
  }, [goals, searchQuery, sortBy]);

  return (
    <div className="goals-page">
      <div className="goals-toolbar">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Maqsadlarni qidirish..."
          aria-label="Maqsadlarni qidirish"
          className="goals-search-input"
        />
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
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Saralash"
          options={SORT_OPTIONS}
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
      {!isLoading && goals.length > 0 && visibleGoals.length === 0 && (
        <EmptyState
          icon="🔍"
          title="Hech narsa topilmadi"
          hint="Qidiruv so'zini o'zgartirib ko'ring."
        />
      )}

      <div className="goals-list">
        {visibleGoals.map((goal) => (
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
