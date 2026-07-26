// 9-Qavat: UX polish — barcha modullar bir xil "yuklanmoqda / bo'sh /
// xatolik" ko'rinishidan foydalanishi uchun umumiy komponentlar.
// Oldin har bir modul o'zining <p className="muted">Yuklanmoqda...</p>
// qatorini nusxa ko'chirgan edi — endi shu uchta komponent orqali
// markazlashtiriladi, dizayn bir joyda o'zgartiriladi.

export function Spinner({ label = "Yuklanmoqda..." }) {
  return (
    <div className="feedback-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon = "🗂️", title, hint }) {
  return (
    <div className="feedback-empty">
      <span className="feedback-empty-icon" aria-hidden="true">
        {icon}
      </span>
      {title && <p className="feedback-empty-title">{title}</p>}
      {hint && <p className="feedback-empty-hint">{hint}</p>}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="feedback-error" role="alert">
      <span className="feedback-error-icon" aria-hidden="true">
        ⚠️
      </span>
      <span className="feedback-error-message">{message}</span>
      {onRetry && (
        <button type="button" className="feedback-error-retry" onClick={onRetry}>
          Qayta urinish
        </button>
      )}
    </div>
  );
}
