import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Spinner, ErrorBanner, EmptyState } from "../../shared/ui/Feedback";
import { Button } from "../../shared/ui/Button";
import { createDashboardApi } from "./api";
import { WIDGET_REGISTRY } from "./widgetRegistry";
import { DashboardSettingsModal } from "./components/DashboardSettingsModal";

// 8-Qavat naqshiga muvofiq (bitta so'rov: GET /dashboard/summary), 14-Qavat
// (Dashboard v2) bilan kengaytirilgan: endi qaysi widget ko'rinishi va
// qanday tartibda ekani `GET /dashboard/config` orqali boshqariladi.
export function DashboardPage({ onNavigate }) {
  const { authFetch } = useAuth();
  const dashboardApi = useMemo(() => createDashboardApi(authFetch), [authFetch]);

  const [summary, setSummary] = useState(null);
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, configData] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getConfig(),
      ]);
      setSummary(summaryData);
      setConfig(configData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardApi]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function goTo(view) {
    if (view && onNavigate) onNavigate(view);
  }

  async function handleSaveConfig(widgets) {
    const updated = await dashboardApi.updateConfig(widgets);
    setConfig(updated);
  }

  const activeWidgets = useMemo(() => {
    if (!config) return [];
    return config.widgets
      .filter((w) => w.enabled && WIDGET_REGISTRY[w.widget_key])
      .sort((a, b) => a.position - b.position);
  }, [config]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-toolbar">
        <h2>Bosh sahifa</h2>
        <div className="dashboard-toolbar-actions">
          <button type="button" className="link-button" onClick={loadAll}>
            Yangilash
          </button>
          <Button variant="secondary" size="sm" onClick={() => setIsSettingsOpen(true)}>
            ⚙️ Sozlash
          </Button>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={loadAll} />
      {isLoading && !summary && <Spinner />}

      {summary && config && (
        <>
          {activeWidgets.length === 0 ? (
            <EmptyState
              icon="🗂️"
              title="Hech qanday widget yoqilmagan"
              hint="'Sozlash' tugmasi orqali kamida bitta widgetni yoqing."
            />
          ) : (
            <div className="dashboard-grid">
              {activeWidgets.map(({ widget_key: widgetKey }) => {
                const { Component, summaryKey, navigateTo } = WIDGET_REGISTRY[widgetKey];
                return (
                  <Component
                    key={widgetKey}
                    summary={summary[summaryKey]}
                    onNavigate={navigateTo ? () => goTo(navigateTo) : undefined}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {isSettingsOpen && config && (
        <DashboardSettingsModal
          config={config}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
}
