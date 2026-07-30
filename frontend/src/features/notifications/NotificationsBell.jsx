import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Spinner, EmptyState, ErrorBanner } from "../../shared/ui/Feedback";
import { Select, Button } from "../../shared/ui";
import { createNotificationsApi } from "./api";

// 7-Qavat: Notifications — markazlashtirilgan bildirishnomalar markazi
// (asosiy prompt, 4-bo'lim: "barcha modullardan kelgan eslatmalarni
// markazlashtirib boshqaruvchi tizim"). Header'dagi qo'ng'iroq (bell)
// belgisi + ochiladigan ro'yxat ko'rinishida (roadmap, 7-Qavat DoD).
//
// Backend scheduler (APScheduler) fon rejimida har necha soatda avtomatik
// tekshiradi (qoshimcha-qarorlar.md, 3-bo'lim). Bu komponent qo'shimcha
// ravishda unread-count'ni har 60 soniyada so'raydi, shuning uchun
// foydalanuvchi sahifani qayta yuklamasdan ham yangi bildirishnomalarni
// ko'radi.

const TYPE_LABELS = {
  task_due: "Vazifa",
  budget_exceeded: "Byudjet",
  habit_streak_broken: "Odat",
};

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

export function NotificationsBell() {
  const { authFetch } = useAuth();
  const api = useRef(createNotificationsApi(authFetch)).current;

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const panelRef = useRef(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const result = await api.unreadCount();
      setUnreadCount(result.unread_count);
    } catch {
      // Fon so'rovi — xatoni jim yutamiz, keyingi tsiklda qayta uriniladi.
    }
  }, [api]);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.list();
      setNotifications(result);
      setUnreadCount(result.filter((n) => !n.is_read).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!isOpen) return undefined;
    loadNotifications();

    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loadNotifications]);

  async function handleMarkRead(notificationId) {
    try {
      await api.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(notificationId) {
    try {
      await api.remove(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => {
        const removed = notifications.find((n) => n.id === notificationId);
        return removed && !removed.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleNotifications = notifications.filter((n) => {
    if (typeFilter && n.type !== typeFilter) return false;
    if (readFilter === "unread" && n.is_read) return false;
    if (readFilter === "read" && !n.is_read) return false;
    return true;
  });

  return (
    <div className="notifications-bell" ref={panelRef}>
      <button
        type="button"
        className="notifications-bell-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Bildirishnomalar"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-panel-header">
            <strong>Bildirishnomalar</strong>
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Barchasini o'qilgan deb belgilash
            </Button>
          </div>

          <div className="notifications-filters">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Turi bo'yicha filtr"
              options={[
                { value: "", label: "Barcha turlar" },
                { value: "task_due", label: "Vazifa" },
                { value: "budget_exceeded", label: "Byudjet" },
                { value: "habit_streak_broken", label: "Odat" },
              ]}
            />
            <Select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              aria-label="Holat bo'yicha filtr"
              options={[
                { value: "", label: "Barchasi" },
                { value: "unread", label: "O'qilmagan" },
                { value: "read", label: "O'qilgan" },
              ]}
            />
          </div>

          {isLoading && <Spinner />}
          <ErrorBanner message={error} onRetry={loadNotifications} />

          {!isLoading && notifications.length === 0 && (
            <div className="notifications-empty">
              <EmptyState icon="🔔" title="Hozircha bildirishnoma yo'q" />
            </div>
          )}
          {!isLoading && notifications.length > 0 && visibleNotifications.length === 0 && (
            <div className="notifications-empty">
              <EmptyState icon="🔍" title="Bu filtrga mos bildirishnoma yo'q" />
            </div>
          )}

          <ul className="notifications-list">
            {visibleNotifications.map((notification) => (
              <li
                key={notification.id}
                className={`notification-item${notification.is_read ? "" : " notification-item-unread"}`}
              >
                <div className="notification-item-header">
                  <span className="notification-type-badge">
                    {TYPE_LABELS[notification.type] || notification.type}
                  </span>
                  <span className="muted notification-time">
                    {formatTimestamp(notification.created_at)}
                  </span>
                </div>
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-item-actions">
                  {!notification.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notification.id)}>
                      O'qildi
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(notification.id)}>
                    O'chirish
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
