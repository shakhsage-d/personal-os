import { useState } from 'react'
import { AuthProvider, useAuth } from './shared/auth/AuthContext'
import { ThemeProvider } from './shared/theme/ThemeContext'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { GoalsPage } from './features/goals/GoalsPage'
import { TasksPage } from './features/tasks/TasksPage'
import { CalendarPage } from './features/calendar/CalendarPage'
import { FinancePage } from './features/finance/FinancePage'
import { HabitsPage } from './features/habits/HabitsPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { NotificationsBell } from './features/notifications/NotificationsBell'
import './App.css'

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
          <NotificationsBell />
          <span className="muted">{user.full_name || user.email}</span>
          <button onClick={logout}>Chiqish</button>
        </div>
      </header>

      {view === 'home' && <DashboardPage onNavigate={setView} />}

      {view === 'goals' && <GoalsPage />}
      {view === 'tasks' && <TasksPage />}
      {view === 'calendar' && <CalendarPage />}
      {view === 'finance' && <FinancePage />}
      {view === 'habits' && <HabitsPage />}
      {view === 'profile' && <ProfilePage />}
    </div>
  )
}

function UnauthenticatedHome() {
  const [mode, setMode] = useState('login') // 'login' | 'register'

  return (
    <div>
      <h1>Personal OS</h1>
      {mode === 'login' ? (
        <LoginPage onSwitchToRegister={() => setMode('register')} />
      ) : (
        <RegisterPage onSwitchToLogin={() => setMode('login')} />
      )}
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
