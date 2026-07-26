import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
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
    await habitsApi.habits.create(payload);
    await loadAll();
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
    await habitsApi.habits.update(habit.id, { is_active: !habit.is_active });
    await loadAll();
  }

  async function handleDeleteHabit(habit) {
    await habitsApi.habits.remove(habit.id);
    await loadAll();
  }

  async function handleCreateReadingLog(payload) {
    await habitsApi.readingLogs.create(payload);
    await loadAll();
  }

  async function handleUpdateReadingLogStatus(logId, statusValue) {
    await habitsApi.readingLogs.update(logId, { status: statusValue });
    await loadAll();
  }

  async function handleDeleteReadingLog(logId) {
    await habitsApi.readingLogs.remove(logId);
    await loadAll();
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
    await habitsApi.weeklyReviews.remove(reviewId);
    await loadAll();
  }

  return (
    <div className="habits-page">
      <div className="habits-toolbar">
        <h2>Odatlar</h2>
        <label className="habits-show-inactive">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Arxivlanganlarni ham ko'rsatish
        </label>
      </div>

      {error && <p className="auth-error">{error}</p>}
      {isLoading && <p className="muted">Yuklanmoqda...</p>}

      <HabitForm onSubmit={handleCreateHabit} />

      {!isLoading && habits.length === 0 && (
        <p className="muted">Hali odat qo'shilmagan.</p>
      )}

      <ul className="habit-list">
        {habits.map((habit) => (
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
