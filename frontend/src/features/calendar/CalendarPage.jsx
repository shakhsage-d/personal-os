import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { createCalendarApi } from "./api";
import { CalendarDayCell } from "./components/CalendarDayCell";

const WEEKDAY_LABELS = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];
const MONTH_LABELS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

function toIsoDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Berilgan oy uchun to'liq kalendar to'rini (oldingi/keyingi oydan
// "to'ldiruvchi" kunlar bilan, hafta Dushanbadan boshlanadi) hisoblaydi.
function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  // JS'da getDay(): 0=Yakshanba..6=Shanba. Dushanbadan boshlash uchun siljitamiz.
  const leadingOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - leadingOffset);

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

export function CalendarPage() {
  const { authFetch } = useAuth();
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const monthDays = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );

  const rangeFrom = monthDays[0];
  const rangeTo = monthDays[monthDays.length - 1];

  const loadEvents = useCallback(async () => {
    const calendarApi = createCalendarApi(authFetch);
    setIsLoading(true);
    setError(null);
    try {
      const data = await calendarApi.listEvents({
        from: toIsoDate(rangeFrom),
        to: toIsoDate(rangeTo),
      });
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeFrom.getTime(), rangeTo.getTime()]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const event of events) {
      const list = map.get(event.event_date) || [];
      list.push(event);
      map.set(event.event_date, list);
    }
    return map;
  }, [events]);

  function goToPreviousMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }

  function goToToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  const todayIso = toIsoDate(today);

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <button type="button" onClick={goToPreviousMonth}>
          &larr; Oldingi
        </button>
        <h2 className="calendar-month-title">
          {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
        </h2>
        <button type="button" onClick={goToNextMonth}>
          Keyingi &rarr;
        </button>
        <button type="button" onClick={goToToday}>
          Bugun
        </button>
      </div>

      {error && <p className="auth-error">{error}</p>}
      {isLoading && <p className="muted">Yuklanmoqda...</p>}

      <div className="calendar-grid">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="calendar-weekday-label">
            {label}
          </div>
        ))}

        {monthDays.map((day) => {
          const iso = toIsoDate(day);
          return (
            <CalendarDayCell
              key={iso}
              date={day}
              isoDate={iso}
              isCurrentMonth={day.getMonth() === cursor.getMonth()}
              isToday={iso === todayIso}
              events={eventsByDate.get(iso) || []}
            />
          );
        })}
      </div>
    </div>
  );
}
