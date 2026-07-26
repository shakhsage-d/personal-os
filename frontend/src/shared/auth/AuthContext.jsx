// Auth holati va tokenlarni boshqaruvchi umumiy context.
//
// MUHIM (roadmap, 1-Qavat talabi): tokenlar `localStorage`da SAQLANMAYDI —
// faqat React state (xotira)da turadi. Bu XSS orqali token o'g'irlanishi
// xavfini kamaytiradi, lekin sahifa qayta yuklansa (F5) foydalanuvchi
// qayta login qilishi kerak bo'ladi — bu qasddan qilingan trade-off.
// Kelajakda (agar kerak bo'lsa) refresh tokenni httpOnly cookie orqali
// backend'dan yuborish — bu muammoni "eslab qolish" bilan birga hal qiladi,
// lekin bu backend'da qo'shimcha o'zgarish talab qiladi va 1-Qavat
// doirasidan tashqarida.
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiClient } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null); // { accessToken, refreshToken }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    setUser(null);
    setTokens(null);
  }, []);

  const register = useCallback(async ({ email, password, fullName }) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/register", {
        email,
        password,
        full_name: fullName || null,
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokenPair = await apiClient.post("/auth/login", { email, password });
      const nextTokens = {
        accessToken: tokenPair.access_token,
        refreshToken: tokenPair.refresh_token,
      };
      setTokens(nextTokens);

      const me = await apiClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${nextTokens.accessToken}` },
      });
      setUser(me);
      return me;
    } catch (err) {
      setError(err.message);
      clearSession();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const callApi = useCallback((path, options, accessToken) => {
    const authHeaders = { ...options.headers, Authorization: `Bearer ${accessToken}` };
    const method = (options.method || "GET").toLowerCase();

    if (method === "get" || method === "delete") {
      return apiClient[method](path, { headers: authHeaders });
    }
    return apiClient[method](path, options.body, { headers: authHeaders });
  }, []);

  // Himoyalangan endpointlar uchun: access token bilan so'rov yuboradi,
  // 401 qaytsa refresh tokenni ishlatib bir marta qayta urinadi.
  // Kelajakdagi modullar (Goals, Tasks, ...) shu funksiyadan foydalanadi.
  const authFetch = useCallback(
    async (path, options = {}) => {
      if (!tokens) {
        throw new Error("Foydalanuvchi tizimga kirmagan");
      }

      try {
        return await callApi(path, options, tokens.accessToken);
      } catch (err) {
        if (err.status !== 401) throw err;

        // Access token muddati o'tgan bo'lishi mumkin — refresh bilan qayta urinamiz.
        try {
          const refreshed = await apiClient.post("/auth/refresh", {
            refresh_token: tokens.refreshToken,
          });
          const nextTokens = {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
          };
          setTokens(nextTokens);
          return await callApi(path, options, nextTokens.accessToken);
        } catch (refreshErr) {
          clearSession();
          throw refreshErr;
        }
      }
    },
    [tokens, clearSession, callApi]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(tokens && user),
      isLoading,
      error,
      register,
      login,
      logout,
      authFetch,
    }),
    [user, tokens, isLoading, error, register, login, logout, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth faqat <AuthProvider> ichida ishlatilishi kerak");
  }
  return ctx;
}
