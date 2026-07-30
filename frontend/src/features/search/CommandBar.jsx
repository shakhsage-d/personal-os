// 16-Qavat: Global qidiruv va tezkor amallar (Command Bar).
//
// `Ctrl+K` / `Cmd+K` orqali istalgan sahifada ochiladi (App.jsx ichida
// bir marta render qilinadi). Ikki narsani birlashtiradi:
//   1. Modullar bo'ylab qidiruv natijalari (`/search?q=`, debounced).
//   2. Statik "tezkor amallar" ro'yxati (tegishli sahifaga o'tish).
// Ikkalasi ham bitta ro'yxatga birlashtirilib, yuqori/pastga strelka +
// Enter orqali klaviatura yordamida tanlanadi (13-Qavat UI-kit'ga muvofiq,
// `Modal` komponentining o'zi Escape/tashqariga bosishni allaqachon
// boshqaradi — bu yerda qayta yozilmaydi).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Modal, Input, Spinner, EmptyState, ErrorBanner } from "../../shared/ui";
import { createSearchApi } from "./api";

const MODULE_LABELS = {
  goals: "Maqsad",
  tasks: "Vazifa",
  finance: "Tranzaksiya",
  habits: "Odat",
};

// `view` qiymatlari App.jsx'dagi `setView(...)` bilan bir xil bo'lishi
// shart — shunda navigatsiya uchun qo'shimcha xarita kerak emas.
const QUICK_ACTIONS = [
  { id: "qa-goal", label: "Yangi maqsad yaratish", view: "goals" },
  { id: "qa-task", label: "Yangi vazifa yaratish", view: "tasks" },
  { id: "qa-transaction", label: "Yangi tranzaksiya qo'shish", view: "finance" },
  { id: "qa-habit", label: "Odatlarni belgilash", view: "habits" },
  { id: "qa-calendar", label: "Kalendarni ochish", view: "calendar" },
  { id: "qa-dashboard", label: "Dashboardga o'tish", view: "home" },
];

const SEARCH_DEBOUNCE_MS = 300;

export function CommandBar({ onNavigate }) {
  const { authFetch } = useAuth();
  const api = useMemo(() => createSearchApi(authFetch), [authFetch]);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setError(null);
    setActiveIndex(0);
  }, []);

  // Global Ctrl+K / Cmd+K — sahifadan qat'i nazar modalni ochadi/yopadi.
  useEffect(() => {
    function handleKeyDown(event) {
      const isCommandK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isCommandK) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced qidiruv — matn bo'sh bo'lsa so'rov yuborilmaydi, faqat
  // tezkor amallar ko'rsatiladi.
  useEffect(() => {
    if (!isOpen) return undefined;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await api.search(trimmed);
        setResults(response.results || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query, isOpen, api]);

  const filteredQuickActions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length === 0) return QUICK_ACTIONS;
    return QUICK_ACTIONS.filter((action) => action.label.toLowerCase().includes(trimmed));
  }, [query]);

  // Natijalar + tezkor amallar — yagona ro'yxat, klaviatura orqali bir xil
  // tarzda harakatlanish uchun.
  const combinedItems = useMemo(() => {
    const resultItems = results.map((item) => ({
      kind: "result",
      key: `result-${item.module}-${item.id}`,
      view: item.module,
      title: item.title,
      subtitle: item.subtitle,
      moduleLabel: MODULE_LABELS[item.module] || item.module,
    }));
    const actionItems = filteredQuickActions.map((action) => ({
      kind: "action",
      key: action.id,
      view: action.view,
      title: action.label,
    }));
    return [...resultItems, ...actionItems];
  }, [results, filteredQuickActions]);

  useEffect(() => {
    setActiveIndex(0);
  }, [combinedItems.length]);

  const handleSelect = useCallback(
    (item) => {
      if (!item) return;
      onNavigate(item.view);
      close();
    },
    [onNavigate, close]
  );

  function handleInputKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, combinedItems.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleSelect(combinedItems[activeIndex]);
    }
  }

  return (
    <>
      <button
        type="button"
        className="command-bar-trigger"
        onClick={() => setIsOpen(true)}
        title="Global qidiruv (Ctrl+K)"
      >
        <span aria-hidden="true">🔎</span>
        <span>Qidirish</span>
        <kbd className="command-bar-kbd">Ctrl+K</kbd>
      </button>

      {isOpen && (
        <Modal title="Global qidiruv" onClose={close}>
          <div className="command-bar">
            <Input
              autoFocus
              placeholder="Maqsad, vazifa, tranzaksiya, odat qidirish..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
            />

            {isLoading && <Spinner label="Qidirilmoqda..." />}
            {error && <ErrorBanner message={error} />}

            {!isLoading && !error && combinedItems.length === 0 && (
              <EmptyState
                icon="🔎"
                title="Natija topilmadi"
                hint="Boshqa kalit so'z bilan urinib ko'ring."
              />
            )}

            {!isLoading && combinedItems.length > 0 && (
              <ul className="command-bar-results">
                {combinedItems.map((item, index) => {
                  const showSectionLabel =
                    index === 0 || combinedItems[index - 1].kind !== item.kind;
                  return (
                    <li key={item.key}>
                      {showSectionLabel && (
                        <div className="command-section-label">
                          {item.kind === "result" ? "Natijalar" : "Tezkor amallar"}
                        </div>
                      )}
                      <button
                        type="button"
                        className={`command-result-item${index === activeIndex ? " active" : ""}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handleSelect(item)}
                      >
                        <span className="command-result-title">{item.title}</span>
                        <span className="command-result-meta">
                          {item.kind === "result"
                            ? [item.moduleLabel, item.subtitle].filter(Boolean).join(" · ")
                            : "Tezkor amal"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
