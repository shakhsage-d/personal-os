// Auth holati va tokenlarni boshqaruvchi umumiy context (mobil versiya).
//
// MUHIM FARQ (web'ga nisbatan, ataylab): `frontend/src/shared/auth/
// AuthContext.jsx`da tokenlar faqat React state (xotira)da saqlanadi —
// chunki brauzerda `localStorage` XSS orqali o'qilishi mumkin. Mobil ilovada
// bu xavf boshqacha: kod tashqi veb-sahifadan yuklanmaydi, shuning uchun
// `expo-secure-store` (iOS Keychain / Android Keystore orqali shifrlangan
// saqlash) ishlatish xavfsiz VA foydalanuvchi tajribasi uchun zarur —
// aks holda ilova har safar yopilganda qayta login talab qilardi (mobil
// ilovada bu odatiy emas). Shu sabab bilan ataylab tanlangan farq.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../api/client";

const AuthContext = createContext(null);

const TOKENS_KEY = "personal_os_tokens";

async function saveTokens(tokens) {
  if (tokens) {
    await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
  } else {
    await SecureStore.deleteItemAsync(TOKENS_KEY);
  }
}

async function loadTokens() {
  const raw = await SecureStore.getItemAsync(TOKENS_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokensState] = useState(null); // { accessToken, refreshToken }
  const [isLoading, setIsLoading] = useState(true); // boshlanishda saqlangan sessiya tekshiriladi
  const [error, setError] = useState(null);

  const setTokens = useCallback(async (next) => {
    setTokensState(next);
    await saveTokens(next);
  }, []);

  const clearSession = useCallback(async () => {
    setUser(null);
    await setTokens(null);
  }, [setTokens]);

  const callApi = useCallback((path, options, accessToken) => {
    const authHeaders = { ...options.headers, Authorization: `Bearer ${accessToken}` };
    const method = (options.method || "GET").toLowerCase();

    if (method === "get" || method === "delete") {
      return apiClient[method](path, { headers: authHeaders });
    }
    return apiClient[method](path, options.body, { headers: authHeaders });
  }, []);

  // Himoyalangan endpointlar uchun: access token bilan so'rov yuboradi,
  // 401 qaytsa refresh tokenni ishlatib bir marta qayta urinadi
  // (`frontend`dagi `authFetch` bilan bir xil naqsh).
  const authFetch = useCallback(
    async (path, options = {}) => {
      if (!tokens) {
        throw new Error("Foydalanuvchi tizimga kirmagan");
      }

      try {
        return await callApi(path, options, tokens.accessToken);
      } catch (err) {
        if (err.status !== 401) throw err;

        try {
          const refreshed = await apiClient.post("/auth/refresh", {
            refresh_token: tokens.refreshToken,
          });
          const nextTokens = {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
          };
          await setTokens(nextTokens);
          return await callApi(path, options, nextTokens.accessToken);
        } catch (refreshErr) {
          await clearSession();
          throw refreshErr;
        }
      }
    },
    [tokens, callApi, setTokens, clearSession]
  );

  // Ilova ochilganda saqlangan sessiyani tiklashga urinish.
  useEffect(() => {
    (async () => {
      try {
        const savedTokens = await loadTokens();
        if (!savedTokens) return;

        const me = await apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${savedTokens.accessToken}` },
        });
        setTokensState(savedTokens);
        setUser(me);
      } catch {
        // Access token muddati o'tgan bo'lishi mumkin — refresh bilan bir
        // marta urinib ko'ramiz, bo'lmasa sessiyani tozalaymiz.
        try {
          const savedTokens = await loadTokens();
          if (!savedTokens) return;
          const refreshed = await apiClient.post("/auth/refresh", {
            refresh_token: savedTokens.refreshToken,
          });
          const nextTokens = {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
          };
          const me = await apiClient.get("/auth/me", {
            headers: { Authorization: `Bearer ${nextTokens.accessToken}` },
          });
          await setTokens(nextTokens);
          setUser(me);
        } catch {
          await clearSession();
        }
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = useCallback(async ({ email, password, fullName }) => {
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
    }
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      setError(null);
      try {
        const tokenPair = await apiClient.post("/auth/login", { email, password });
        const nextTokens = {
          accessToken: tokenPair.access_token,
          refreshToken: tokenPair.refresh_token,
        };
        const me = await apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${nextTokens.accessToken}` },
        });
        await setTokens(nextTokens);
        setUser(me);
        return me;
      } catch (err) {
        setError(err.message);
        await clearSession();
        throw err;
      }
    },
    [setTokens, clearSession]
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

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
