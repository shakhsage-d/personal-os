import { useState } from 'react'
import { AuthProvider, useAuth } from './shared/auth/AuthContext'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { GoalsPage } from './features/goals/GoalsPage'
import { TasksPage } from './features/tasks/TasksPage'
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
        </nav>
        <div className="app-user">
          <span className="muted">{user.full_name || user.email}</span>
          <button onClick={logout}>Chiqish</button>
        </div>
      </header>

      {view === 'home' && (
        <div>
          <p>2-Qavat: Goals & Plans moduli qo'shildi ✅</p>
          <p className="muted">
            Foydalanuvchi ID: {user.id}
            <br />
            Ro'yxatdan o'tgan sana: {new Date(user.created_at).toLocaleString()}
          </p>
        </div>
      )}

      {view === 'goals' && <GoalsPage />}
      {view === 'tasks' && <TasksPage />}
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
  const isWide = isAuthenticated && (view === 'goals' || view === 'tasks')

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
      <AppContent />
    </AuthProvider>
  )
}

export default App
