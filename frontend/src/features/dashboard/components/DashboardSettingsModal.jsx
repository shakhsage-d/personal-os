import { useState } from "react";
import { Modal } from "../../../shared/ui/Modal";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Spinner, ErrorBanner } from "../../../shared/ui/Feedback";

// 14-Qavat: Dashboard v2 — "murakkablik oshirilmasin" tamoyiliga muvofiq
// (roadmap-qoshimcha, 15-band ruhida): drag-and-drop o'rniga oddiy
// checkbox (yoqish/o'chirish) + tartib-raqam inputi (`position`).
const MODULE_LABELS = {
  goals: "Maqsadlar",
  tasks: "Vazifalar",
  calendar: "Kalendar",
  finance: "Moliya",
  habits: "Odatlar",
  notifications: "Bildirishnomalar",
};

function groupByModule(widgets) {
  const groups = new Map();
  for (const widget of widgets) {
    if (!groups.has(widget.module)) groups.set(widget.module, []);
    groups.get(widget.module).push(widget);
  }
  return Array.from(groups.entries());
}

export function DashboardSettingsModal({ config, onClose, onSave }) {
  const [draft, setDraft] = useState(() =>
    config.widgets.map((w) => ({ ...w }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  function updateWidget(widgetKey, changes) {
    setDraft((prev) =>
      prev.map((w) => (w.widget_key === widgetKey ? { ...w, ...changes } : w))
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const payload = draft.map((w) => ({
        widget_key: w.widget_key,
        enabled: w.enabled,
        position: Number(w.position) || 0,
      }));
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  const grouped = groupByModule([...draft].sort((a, b) => a.position - b.position));

  return (
    <Modal
      title="Dashboard'ni sozlash"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Bekor qilish
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </>
      }
    >
      <p className="muted dash-settings-hint">
        Qaysi widget'lar ko'rinishini va qanday tartibda joylashishini shu
        yerdan boshqaring. Tartib-raqam kichikroq bo'lgan widget birinchi
        chiqadi.
      </p>
      <ErrorBanner message={error} />
      {isSaving && <Spinner label="Saqlanmoqda..." />}
      <div className="dash-settings-groups">
        {grouped.map(([module, widgets]) => (
          <div key={module} className="dash-settings-group">
            <h4 className="dash-settings-group-title">
              {MODULE_LABELS[module] || module}
            </h4>
            {widgets.map((widget) => (
              <div key={widget.widget_key} className="dash-settings-row">
                <label className="dash-settings-checkbox">
                  <input
                    type="checkbox"
                    checked={widget.enabled}
                    onChange={(e) =>
                      updateWidget(widget.widget_key, { enabled: e.target.checked })
                    }
                  />
                  <span>
                    {widget.label}
                    <span className="dash-settings-description"> — {widget.description}</span>
                  </span>
                </label>
                <Input
                  aria-label={`${widget.label} tartib raqami`}
                  type="number"
                  min={0}
                  value={widget.position}
                  onChange={(e) =>
                    updateWidget(widget.widget_key, { position: e.target.value })
                  }
                  className="dash-settings-position-input"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}
