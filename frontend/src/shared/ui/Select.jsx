// 13-Qavat: Design System — Select, label + `options` ro'yxati bilan.
// `options`: [{ value, label }]. `children` orqali ham <option> berish mumkin
// (masalan dinamik ro'yxatlar uchun, Goals/Tasks moduli kabi).
export function Select({ label, hint, error, id, options, children, className = "", ...rest }) {
  const fieldId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined);

  return (
    <div className="ui-field">
      {label && <label htmlFor={fieldId} className="ui-field-label">{label}</label>}
      <select
        id={fieldId}
        className={["ui-select", error ? "ui-select-invalid" : "", className]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? "true" : undefined}
        {...rest}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error ? (
        <span className="ui-field-error">{error}</span>
      ) : (
        hint && <span className="ui-field-hint">{hint}</span>
      )}
    </div>
  );
}
