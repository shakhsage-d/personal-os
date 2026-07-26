import { useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";

export function RegisterPage({ onSwitchToLogin }) {
  const { register, login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [justRegistered, setJustRegistered] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await register({ email, password, fullName });
      setJustRegistered(true);
      // Ro'yxatdan o'tgach avtomatik kirish — foydalanuvchi qayta forma
      // to'ldirmasin.
      await login({ email, password });
    } catch {
      // Xato `useAuth().error` orqali ko'rsatiladi.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1>Ro'yxatdan o'tish</h1>

      <label>
        To'liq ism (ixtiyoriy)
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>

      <label>
        Parol
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <small>Kamida 8 ta belgi, kamida bitta raqam</small>
      </label>

      {error && <p className="auth-error">{error}</p>}
      {justRegistered && !error && <p className="auth-success">Ro'yxatdan o'tdingiz, kirilmoqda...</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
      </button>

      <p className="auth-switch">
        Akkountingiz bormi?{" "}
        <button type="button" className="link-button" onClick={onSwitchToLogin}>
          Kiring
        </button>
      </p>
    </form>
  );
}
