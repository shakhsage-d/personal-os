import { useTheme } from "../../../shared/theme/ThemeContext";

const OPTIONS = [
  { value: "light", icon: "☀️", label: "Yorug'" },
  { value: "dark", icon: "🌙", label: "Qorong'u" },
  { value: "system", icon: "🖥️", label: "Tizim afzalligi" },
];

export function ThemeSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="profile-settings-form">
      <p className="muted">Ilova ko'rinishini tanlang. "Tizim afzalligi" — qurilmangizning
        yorug'/qorong'u sozlamasiga avtomatik moslashadi.</p>
      <div className="theme-option-group" role="radiogroup" aria-label="Tema tanlovi">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`theme-option${theme === option.value ? " theme-option-active" : ""}`}
            onClick={() => setTheme(option.value)}
            aria-pressed={theme === option.value}
          >
            <span aria-hidden="true">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
