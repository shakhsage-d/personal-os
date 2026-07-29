// 12-Qavat: Profile & Settings — tema (dark/light/system) boshqaruvi.
//
// Ishlash tartibi:
// 1. Ilova ochilganda `localStorage`dagi saqlangan tanlov (`pos_theme`)
//    darhol qo'llanadi — bu login holatidan mustaqil ishlaydi (login
//    qilmagan foydalanuvchi ham tema tanlashi mumkin) va sahifa
//    yangilanganda (F5) tema saqlanib qolishini ta'minlaydi.
//    Eslatma: bu `AuthContext`dagi "token localStorage'da saqlanmaydi"
//    qoidasiga zid emas — tema tanlovi maxfiy/xavfsizlik ma'lumoti emas.
// 2. Foydalanuvchi login qilgach, backend'dagi `UserSettings.theme`
//    o'qiladi va **backend qiymati ustun keladi** (masalan boshqa
//    qurilmada o'zgartirilgan bo'lsa) — shu bilan bir vaqtda localStorage
//    ham shu qiymatga yangilanadi.
// 3. Foydalanuvchi tema tanlaganda: darhol UI'ga qo'llanadi + localStorage'ga
//    yoziladi, va agar login qilingan bo'lsa backend'ga ham (`PUT
//    /profile/settings`) yuboriladi.
//
// `theme` — foydalanuvchi TANLOVI ('light' | 'dark' | 'system').
// `resolvedTheme` — DOM'ga qo'llanadigan HAQIQIY qiymat ('light' | 'dark'),
// 'system' tanlanganda OS afzalligiga qarab hisoblanadi.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../auth/AuthContext";

const STORAGE_KEY = "pos_theme";
const ThemeContext = createContext(null);

function readStoredTheme() {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function resolveTheme(theme) {
  if (theme !== "system") return theme;
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const { isAuthenticated, authFetch } = useAuth();
  const [theme, setThemeState] = useState(readStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(readStoredTheme()));

  // DOM'ga qo'llash — har bir `resolvedTheme` o'zgarishida.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  // `theme === 'system'` bo'lsa, OS afzalligi o'zgarganda (masalan
  // kompyuter kechqurun avtomatik tungi rejimga o'tsa) qayta hisoblaymiz.
  useEffect(() => {
    setResolvedTheme(resolveTheme(theme));
    if (theme !== "system" || typeof window === "undefined" || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setResolvedTheme(resolveTheme("system"));
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const applyTheme = useCallback((nextTheme, { persistRemote = true } = {}) => {
    setThemeState(nextTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    }
    return persistRemote;
  }, []);

  const setTheme = useCallback(
    async (nextTheme) => {
      applyTheme(nextTheme);
      if (!isAuthenticated) return;
      try {
        await authFetch("/profile/settings", {
          method: "PUT",
          body: { theme: nextTheme },
        });
      } catch {
        // Best-effort: tarmoq xatosi bo'lsa ham UI mahalliy holatda darhol
        // yangilangan — foydalanuvchi tajribasi buzilmaydi, keyingi
        // sinxronizatsiyada (login/refresh) qayta urinilishi mumkin.
      }
    },
    [applyTheme, authFetch, isAuthenticated]
  );

  // Login bo'lgach — backend'dagi tema qiymatini yetakchi manba sifatida oling.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const settings = await authFetch("/profile/settings", { method: "GET" });
        if (!cancelled && settings?.theme) {
          applyTheme(settings.theme);
        }
      } catch {
        // Sozlamalarni o'qib bo'lmasa, mahalliy (localStorage) qiymat bilan davom etiladi.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme faqat <ThemeProvider> ichida ishlatilishi kerak");
  }
  return ctx;
}

