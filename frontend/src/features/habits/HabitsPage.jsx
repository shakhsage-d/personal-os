import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Spinner, EmptyState, ErrorBanner } from "../../shared/ui/Feedback";
import { Input } from "../../shared/ui";
import { createHabitsApi } from "./api";
import { HabitForm } from "./components/HabitForm";
import { HabitCard } from "./components/HabitCard";
import { ReadingLogPanel } from "./components/ReadingLogPanel";
import { WeeklyReviewPanel } from "./components/WeeklyReviewPanel";

// FinancePage naqshiga muvofiq — 6-Qavat: Personal Growth / Habits moduli.
export function HabitsPage() {
  const { authFetch } = useAuth();
  const habitsApi = useMemo(() => createHabitsApi(authFetch), [authFetch]);

  const [habits, setHabits] = useState([]);
  const [readingLogs, setReadingLogs] = useState([]);
  const [weeklyReviews, setWeeklyReviews] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [habitsData, readingData, reviewsData] = await Promise.all([
        habitsApi.habits.list({ activeOnly: !showInactive }),
        habitsApi.readingLogs.list(),
        habitsApi.weeklyReviews.list(),
      ]);
      setHabits(habitsData);
      setReadingLogs(readingData);
      setWeeklyReviews(reviewsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitsApi, showInactive]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreateHabit(payload) {
    try {
      await habitsApi.habits.create(payload);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleToday(habit, todayIso) {
    try {
      if (habit.checked_today) {
        await habitsApi.checkins.remove(habit.id, todayIso);
      } else {
        await habitsApi.checkins.create(habit.id, { checked_on: todayIso });
      }
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleArchiveToggle(habit) {
    try {
      await habitsApi.habits.update(habit.id, { is_active: !habit.is_active });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteHabit(habit) {
    try {
      await habitsApi.habits.remove(habit.id);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateReadingLog(payload) {
    try {
      await habitsApi.readingLogs.create(payload);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateReadingLogStatus(logId, statusValue) {
    try {
      await habitsApi.readingLogs.update(logId, { status: statusValue });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteReadingLog(logId) {
    try {
      await habitsApi.readingLogs.remove(logId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateWeeklyReview(payload) {
    try {
      await habitsApi.weeklyReviews.create(payload);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteWeeklyReview(reviewId) {
    try {
      await habitsApi.weeklyReviews.remove(reviewId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleHabits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return habits;
    return habits.filter((habit) => habit.name.toLowerCase().includes(query));
  }, [habits, searchQuery]);

  return (
    <div className="habits-page">
      <div className="habits-toolbar">
        <h2>Odatlar</h2>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Odatlarni qidirish..."
          aria-label="Odatlarni qidirish"
          className="habits-search-input"
        />
        <label className="habits-show-inactive">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Arxivlanganlarni ham ko'rsatish
        </label>
      </div>

      <ErrorBanner message={error} onRetry={loadAll} />
      {isLoading && <Spinner />}

      <HabitForm onSubmit={handleCreateHabit} />

      {!isLoading && habits.length === 0 && (
        <EmptyState icon="🔁" title="Hali odat qo'shilmagan" />
      )}
      {!isLoading && habits.length > 0 && visibleHabits.length === 0 && (
        <EmptyState icon="🔍" title="Hech narsa topilmadi" hint="Qidiruv so'zini o'zgartirib ko'ring." />
      )}

      <ul className="habit-list">
        {visibleHabits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggleToday={handleToggleToday}
            onArchiveToggle={handleArchiveToggle}
            onDelete={handleDeleteHabit}
          />
        ))}
      </ul>

      <div className="habits-side-grid">
        <ReadingLogPanel
          logs={readingLogs}
          onCreate={handleCreateReadingLog}
          onUpdateStatus={handleUpdateReadingLogStatus}
          onDelete={handleDeleteReadingLog}
        />
        <WeeklyReviewPanel
          reviews={weeklyReviews}
          onCreate={handleCreateWeeklyReview}
          onDelete={handleDeleteWeeklyReview}
        />
      </div>
    </div>
  );
}
