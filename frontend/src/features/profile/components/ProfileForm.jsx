import { useState } from "react";

const LOCALES = [
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

export function ProfileForm({ user, onSubmit }) {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [locale, setLocale] = useState(user.locale || "uz");
  const [timezone, setTimezone] = useState(user.timezone || "Asia/Tashkent");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        locale,
        timezone,
      });
      setSavedAt(Date.now());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form profile-settings-form">
      <label>
        Avatar
        <div className="profile-avatar-row">
          <img
            className="profile-avatar-preview"
            src={avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(user.email)}
            alt="Avatar oldindan ko'rinishi"
          />
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://... (rasm havolasi)"
          />
        </div>
      </label>

      <label>
        To'liq ism
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </label>

      <label>
        Email
        <input type="email" value={user.email} disabled />
        <small>Email o'zgartirib bo'lmaydi.</small>
      </label>

      <label>
        Til
        <select value={locale} onChange={(e) => setLocale(e.target.value)}>
          {LOCALES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Vaqt zonasi
        <input
          type="text"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="masalan: Asia/Tashkent"
        />
        <small>IANA vaqt zonasi nomi (masalan: Asia/Tashkent, Europe/Moscow).</small>
      </label>

      {error && <p className="auth-error">{error}</p>}
      {savedAt && !error && <p className="auth-success">Profil yangilandi.</p>}

      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}
