// 14-Qavat: Dashboard v2 — widget registry.
//
// Backend katalogi (`app/modules/dashboard/catalog.py`) qaysi widget_key'lar
// MAVJUDLIGINI biladi (module/label/description bilan birga /dashboard/config
// javobida keladi). Bu fayl esa har bir widget_key qaysi React komponentga
// va `summary` obyektining qaysi bo'limiga (`summaryKey`) mos kelishini
// bog'laydi — frontend-ga xos joylashuv ma'lumoti, shuning uchun backend'da
// emas, shu yerda saqlanadi.
import { GoalsWidget, GoalsProgressWidget } from "./components/GoalsWidget";
import { TasksWidget, TasksPriorityWidget } from "./components/TasksWidget";
import { CalendarWidget, CalendarAgendaWidget } from "./components/CalendarWidget";
import { FinanceWidget, FinanceRecentTransactionsWidget } from "./components/FinanceWidget";
import { HabitsWidget, HabitsTodayWidget } from "./components/HabitsWidget";
import {
  NotificationsWidget,
  NotificationsRecentWidget,
} from "./components/NotificationsWidget";

// widget_key -> { Component, summaryKey, navigateTo }
// `navigateTo` — DashboardPage'dagi `onNavigate(view)`ga uzatiladigan qiymat
// (null bo'lsa, navigatsiya tugmasi ko'rsatilmaydi — Notifications kabi).
export const WIDGET_REGISTRY = {
  goals_overview: { Component: GoalsWidget, summaryKey: "goals", navigateTo: "goals" },
  goals_progress_chart: {
    Component: GoalsProgressWidget,
    summaryKey: "goals",
    navigateTo: "goals",
  },
  tasks_overview: { Component: TasksWidget, summaryKey: "tasks", navigateTo: "tasks" },
  tasks_priority_breakdown: {
    Component: TasksPriorityWidget,
    summaryKey: "tasks",
    navigateTo: "tasks",
  },
  calendar_upcoming: {
    Component: CalendarWidget,
    summaryKey: "calendar",
    navigateTo: "calendar",
  },
  calendar_mini_agenda: {
    Component: CalendarAgendaWidget,
    summaryKey: "calendar",
    navigateTo: "calendar",
  },
  finance_monthly_summary: {
    Component: FinanceWidget,
    summaryKey: "finance",
    navigateTo: "finance",
  },
  finance_recent_transactions: {
    Component: FinanceRecentTransactionsWidget,
    summaryKey: "finance",
    navigateTo: "finance",
  },
  habits_streaks: { Component: HabitsWidget, summaryKey: "habits", navigateTo: "habits" },
  habits_today_checklist: {
    Component: HabitsTodayWidget,
    summaryKey: "habits",
    navigateTo: "habits",
  },
  notifications_summary: {
    Component: NotificationsWidget,
    summaryKey: "notifications",
    navigateTo: null,
  },
  notifications_recent: {
    Component: NotificationsRecentWidget,
    summaryKey: "notifications",
    navigateTo: null,
  },
};
