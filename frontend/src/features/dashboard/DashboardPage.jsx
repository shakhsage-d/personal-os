import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Spinner, ErrorBanner } from "../../shared/ui/Feedback";
import { createDashboardApi } from "./api";
import { GoalsWidget } from "./components/GoalsWidget";
import { TasksWidget } from "./components/TasksWidget";
import { CalendarWidget } from "./components/CalendarWidget";
import { FinanceWidget } from "./components/FinanceWidget";
import { HabitsWidget } from "./components/HabitsWidget";
import { NotificationsWidget } from "./components/NotificationsWidget";

// HabitsPage naqshiga muvofiq — 8-Qavat: Dashboard, barcha modullarning
// umumiy ko'rinishi (bitta so'rov: GET /dashboard/summary).
export function DashboardPage({ onNavigate }) {
  const { authFetch } = useAuth();
  const dashboardApi = useMemo(() => createDashboardApi(authFetch), [authFetch]);

  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardApi]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  function goTo(view) {
    if (onNavigate) onNavigate(view);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-toolbar">
        <h2>Bosh sahifa</h2>
        <button type="button" className="link-button" onClick={loadSummary}>
          Yangilash
        </button>
      </div>

      <ErrorBanner message={error} onRetry={loadSummary} />
      {isLoading && !summary && <Spinner />}

      {summary && (
        <div className="dashboard-grid">
          <GoalsWidget summary={summary.goals} onNavigate={() => goTo("goals")} />
          <TasksWidget summary={summary.tasks} onNavigate={() => goTo("tasks")} />
          <CalendarWidget summary={summary.calendar} onNavigate={() => goTo("calendar")} />
          <FinanceWidget summary={summary.finance} onNavigate={() => goTo("finance")} />
          <HabitsWidget summary={summary.habits} onNavigate={() => goTo("habits")} />
          <NotificationsWidget summary={summary.notifications} />
        </div>
      )}
    </div>
  );
}
