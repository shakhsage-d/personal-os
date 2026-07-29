// 13-Qavat: Design System — Card. Modullardagi `.goal-card`/`.task-item`
// kabi qo'lda yozilgan konteynerlar o'rniga umumiy asos.
export function Card({ children, title, actions, footer, padded = "md", className = "", ...rest }) {
  const classes = ["ui-card", padded === "lg" ? "ui-card-padded-lg" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {(title || actions) && (
        <div className="ui-card-header">
          {title && <h3 className="ui-card-title">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
      {footer && <div className="ui-card-footer">{footer}</div>}
    </div>
  );
}
