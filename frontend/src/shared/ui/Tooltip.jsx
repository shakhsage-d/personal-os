// 13-Qavat: Design System — Tooltip. Oddiy hover/focus asosidagi izoh;
// pozitsion kutubxona kerak emas (loyiha ko'lami buni talab qilmaydi).
export function Tooltip({ label, children }) {
  return (
    <span className="ui-tooltip-wrapper" tabIndex={0}>
      {children}
      <span className="ui-tooltip" role="tooltip">
        {label}
      </span>
    </span>
  );
}
