import { lazy, Suspense, useState } from 'react'
import { AuthProvider, useAuth } from './shared/auth/AuthContext'
import { ThemeProvider } from './shared/theme/ThemeContext'
import { Spinner } from './shared/ui/Feedback'
import { NotificationsBell } from './features/notifications/NotificationsBell'
import { CommandBar } from './features/search/CommandBar'
import './App.css'

// 17-Qavat (Performance & Accessibility audit): route-based code splitting.
//
// Loyihada react-router yo'q (App.jsx'dagi `view` state o'zi navigatsiyani
// boshqaradi, `roadmap.md` git-workflow qoidasiga muvofiq mavjud tuzilma
// buzilmaydi) — shu sababli "route-based" bo'lish uchun har bir "sahifa"
// komponenti alohida `React.lazy()` chunkiga ajratiladi. Natijada:
//   - Login/Register ekranida boshqa 7 ta modulning kodi yuklanmaydi;
//   - Finance sahifasiga (va u orqali og'ir `echarts` kutubxonasiga)
//     faqat foydalanuvchi "Moliya"ga o'tganda so'rov yuboriladi
//     (vite.config.js'dagi `vendor-charts` chunki bilan birga ishlaydi).
// Har doim ochiladigan header elementlari (NotificationsBell, CommandBar)
// va Auth oqimi asosiy bosh sahifa uchun zarur bo'lgani sababli eager
// (oddiy import) qoldirilgan — ularni lazy qilish faqat kechikish
// qo'shardi, bundle tejamaydi (ular baribir birinchi render'da kerak).
const LoginPage = lazy(() =>
  import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import('./features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
)
const DashboardPage = lazy(() =>
  import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
const GoalsPage = lazy(() =>
  import('./features/goals/GoalsPage').then((m) => ({ default: m.GoalsPage }))
)
const TasksPage = lazy(() =>
  import('./features/tasks/TasksPage').then((m) => ({ default: m.TasksPage }))
)
const CalendarPage = lazy(() =>
  import('./features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage }))
)
const FinancePage = lazy(() =>
  import('./features/finance/FinancePage').then((m) => ({ default: m.FinancePage }))
)
const HabitsPage = lazy(() =>
  import('./features/habits/HabitsPage').then((m) => ({ default: m.HabitsPage }))
)
const ProfilePage = lazy(() =>
  import('./features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
)

// Sahifa chunk'i tarmoqdan yuklanayotganda ko'rsatiladigan holat — mavjud
// `Spinner` (9/13-Qavat UI-kit) qayta ishlatiladi, yangi UI ixtiro qilinmaydi.
function PageFallback() {
  return <Spinner label="Sahifa yuklanmoqda..." />
}

function AuthenticatedHome({ view, setView }) {
  const { user, logout } = useAuth()

  return (
    <div>
      <header className="app-header">
        <h1>Personal OS</h1>
        <nav className="app-nav">
          <button
            type="button"
            className="link-button"
            onClick={() => setView('home')}
          >
            Bosh sahifa
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setView('goals')}
          >
            Maqsadlar
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setView('tasks')}
          >
            Vazifalar
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setView('calendar')}
          >
            Kalendar
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setView('finance')}
          >
            Moliya
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setView('habits')}
          >
            Odatlar
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setView('profile')}
          >
            Profil
          </button>
        </nav>
        <div className="app-user">
          <CommandBar onNavigate={setView} />
          <NotificationsBell />
          <span className="muted">{user.full_name || user.email}</span>
          <button onClick={logout}>Chiqish</button>
        </div>
      </header>

      <Suspense fallback={<PageFallback />}>
        {view === 'home' && <DashboardPage onNavigate={setView} />}

        {view === 'goals' && <GoalsPage />}
        {view === 'tasks' && <TasksPage />}
        {view === 'calendar' && <CalendarPage />}
        {view === 'finance' && <FinancePage />}
        {view === 'habits' && <HabitsPage />}
        {view === 'profile' && <ProfilePage />}
      </Suspense>
    </div>
  )
}

function UnauthenticatedHome() {
  const [mode, setMode] = useState('login') // 'login' | 'register'

  return (
    <div>
      <h1>Personal OS</h1>
      <Suspense fallback={<PageFallback />}>
        {mode === 'login' ? (
          <LoginPage onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setMode('login')} />
        )}
      </Suspense>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()
  const [view, setView] = useState('goals') // 'home' | 'goals'
  const isWide = isAuthenticated && (view === 'home' || view === 'goals' || view === 'tasks' || view === 'calendar' || view === 'finance' || view === 'habits' || view === 'profile')

  return (
    <section id="center" className={isWide ? 'wide' : ''}>
      {isAuthenticated ? (
        <AuthenticatedHome view={view} setView={setView} />
      ) : (
        <UnauthenticatedHome />
      )}
    </section>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
