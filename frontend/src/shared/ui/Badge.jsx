// 13-Qavat: Design System — Badge. Status/ustuvorlik/teg ko'rsatish uchun
// umumiy komponent (masalan `goal-status`, `task-priority` o'rniga).
export function Badge({ children, tone = "neutral", className = "" }) {
  // tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  const classes = ["ui-badge", `ui-badge-${tone}`, className].filter(Boolean).join(" ");
  return <span className={classes}>{children}</span>;
}
