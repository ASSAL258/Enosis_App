import { useEffect, useState } from 'react'
import DashboardPage from './DashboardPage.jsx'
import LoginPage from './LoginPage.jsx'

const SESSION_KEY = 'enosisapp.user.session'

function readStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function RootPage() {
  const [user, setUser] = useState(() => readStoredSession())

  useEffect(() => {
    if (!user) {
      localStorage.removeItem(SESSION_KEY)
      return
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  }, [user])

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  return <DashboardPage user={user} onLogout={() => setUser(null)} />
}
