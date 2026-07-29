// Dashboard — Notifications moduli xulosasi (8-Qavat). Alohida sahifasi
// yo'q (7-Qavatda faqat header'dagi bell dropdown qurilgan) — shu sababli
// bu yerda navigatsiya tugmasi yo'q, faqat qisqacha holat ko'rsatiladi.
export function NotificationsWidget({ summary }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Bildirishnomalar</h3>
        <span className="muted dash-header-hint">Header'dagi 🔔 orqali</span>
      </div>
      <div className="dash-stat-row">
        {summary.unread_count === 0 ? (
          <p className="muted">O'qilmagan bildirishnoma yo'q.</p>
        ) : (
          <span className="dash-stat dash-stat-warning">
            <strong>{summary.unread_count}</strong> o'qilmagan
          </span>
        )}
      </div>
    </div>
  );
}

// 14-Qavat: Dashboard v2 — ikkinchi variant (widget_key: "notifications_recent").
export function NotificationsRecentWidget({ summary }) {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>Bildirishnomalar — so'nggilari</h3>
        <span className="muted dash-header-hint">Header'dagi 🔔 orqali</span>
      </div>
      {summary.recent.length === 0 ? (
        <p className="muted">Hali bildirishnoma yo'q.</p>
      ) : (
        <ul className="dash-mini-list">
          {summary.recent.map((n) => (
            <li key={n.id} className="dash-mini-item">
              <span className="dash-mini-title">
                {n.is_read ? "" : "🔵 "}
                {n.title}
              </span>
              <span className="dash-mini-meta">{n.created_at.slice(0, 10)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
