import { useState } from 'react'
import { AuthProvider, useAuth } from './shared/auth/AuthContext'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import './App.css'

function AuthenticatedHome() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1>Personal OS</h1>
      <p>1-Qavat: Core / Auth — tizimga kirdingiz ✅</p>
      <p>
        Xush kelibsiz, <strong>{user.full_name || user.email}</strong>!
      </p>
      <p className="muted">
        Foydalanuvchi ID: {user.id}
        <br />
        Ro'yxatdan o'tgan sana: {new Date(user.created_at).toLocaleString()}
      </p>
      <button onClick={logout}>Chiqish</button>
    </div>
  )
}

function UnauthenticatedHome() {
  const [mode, setMode] = useState('login') // 'login' | 'register'

  return (
    <div>
      <h1>Personal OS</h1>
      <p>1-Qavat: Core / Auth</p>
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
  return (
    <section id="center">
      {isAuthenticated ? <AuthenticatedHome /> : <UnauthenticatedHome />}
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
