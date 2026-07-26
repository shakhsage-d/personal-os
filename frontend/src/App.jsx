import { useEffect, useState } from 'react'
import { apiClient } from './shared/api/client'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiClient
      .get('/health')
      .then(setHealth)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <section id="center">
      <div>
        <h1>Personal OS</h1>
        <p>0-Qavat: Loyiha skeletoni</p>

        {health && (
          <p style={{ color: 'green' }}>
            ✅ Backend ulanishi ishlayapti: {health.status} ({health.environment})
          </p>
        )}
        {error && (
          <p style={{ color: 'red' }}>
            ⚠️ Backendga ulanib bo'lmadi: {error}
            <br />
            (Backend `uvicorn app.main:app` orqali ishga tushirilganini tekshiring)
          </p>
        )}
        {!health && !error && <p>Backend bilan bog'lanilmoqda...</p>}
      </div>
    </section>
  )
}

export default App
