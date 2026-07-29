import { useState } from "react";

export function PasswordForm({ onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
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
        Joriy parol
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>

      <label>
        Yangi parol
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <small>Kamida 8 ta belgi, kamida bitta raqam</small>
      </label>

      {error && <p className="auth-error">{error}</p>}
      {savedAt && !error && <p className="auth-success">Parol muvaffaqiyatli o'zgartirildi.</p>}

      <button type="submit" disabled={isSaving}>
        {isSaving ? "Yuborilmoqda..." : "Parolni o'zgartirish"}
      </button>
    </form>
  );
}

export function DeleteAccountSection({ onConfirmDelete }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirmDelete();
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  }

  return (
    <div className="profile-danger-zone">
      <h3>Hisobni o'chirish</h3>
      <p className="muted">
        Hisobingiz o'chirilsa, tizimga kira olmaysiz. Ma'lumotlaringiz (Maqsadlar, Vazifalar,
        Moliya va h.k.) darhol butunlay o'chirilmaydi, lekin hisob faolsizlantiriladi.
      </p>

      {!isConfirming ? (
        <button type="button" className="danger-button" onClick={() => setIsConfirming(true)}>
          Hisobni o'chirish
        </button>
      ) : (
        <div className="profile-danger-confirm">
          <p>Rostdan ham hisobingizni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi.</p>
          {error && <p className="auth-error">{error}</p>}
          <div className="profile-danger-actions">
            <button
              type="button"
              className="danger-button"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
            </button>
            <button type="button" onClick={() => setIsConfirming(false)} disabled={isDeleting}>
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
