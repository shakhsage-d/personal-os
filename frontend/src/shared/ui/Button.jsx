// 13-Qavat: Design System — umumiy Button komponenti.
// Mavjud global `button { ... }` uslubi (App.css, 9-Qavat) hali ham barcha
// oddiy <button>larga tarqaladi — bu komponent shu ustiga variant/o'lcham
// tanlash imkonini beruvchi qatlam, eski kodni buzmaydi.
export function Button({
  children,
  variant = "secondary", // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = "md", // 'sm' | 'md' | 'lg'
  block = false,
  type = "button",
  className = "",
  ...rest
}) {
  const classes = [
    "ui-btn",
    `ui-btn-${variant}`,
    size !== "md" ? `ui-btn-${size}` : "",
    block ? "ui-btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
