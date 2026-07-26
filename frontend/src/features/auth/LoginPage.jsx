import { useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";

export function LoginPage({ onSwitchToRegister }) {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await login({ email, password });
    } catch {
      // Xato `useAuth().error` orqali ko'rsatiladi — bu yerda alohida ish kerak emas.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1>Kirish</h1>

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
          autoComplete="current-password"
        />
      </label>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Kirilmoqda..." : "Kirish"}
      </button>

      <p className="auth-switch">
        Akkountingiz yo'qmi?{" "}
        <button type="button" className="link-button" onClick={onSwitchToRegister}>
          Ro'yxatdan o'ting
        </button>
      </p>
    </form>
  );
}
