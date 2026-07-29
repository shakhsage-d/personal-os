// 13-Qavat: Design System — Input/Textarea, label + xato/hint bilan birga.
// `id` berilmasa, `label`dan avtomatik generatsiya qilinadi (a11y uchun
// <label htmlFor> va input `id` bog'lanishi shart).
function useFieldId(id, label) {
  return id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined);
}

export function Input({ label, hint, error, id, className = "", multiline = false, ...rest }) {
  const fieldId = useFieldId(id, label);
  const Control = multiline ? "textarea" : "input";
  const controlClass = multiline ? "ui-textarea" : "ui-input";

  return (
    <div className="ui-field">
      {label && <label htmlFor={fieldId} className="ui-field-label">{label}</label>}
      <Control
        id={fieldId}
        className={[controlClass, error ? `${controlClass}-invalid` : "", className]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? "true" : undefined}
        {...rest}
      />
      {error ? (
        <span className="ui-field-error">{error}</span>
      ) : (
        hint && <span className="ui-field-hint">{hint}</span>
      )}
    </div>
  );
}

export function Textarea(props) {
  return <Input multiline {...props} />;
}
