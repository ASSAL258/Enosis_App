import { useEffect, useState } from 'react'
import { mockUser, mockUserRH, mockUserManager } from '../config/mock-data.js'
import DashboardPage from './DashboardPage.jsx'
import LoginPage from './LoginPage.jsx'

/**
 * RootPage — page racine qui choisit entre login et dashboard.
 * En mode DEV: charge directement un utilisateur mock avec sélecteur
 */
export default function RootPage() {
  const [user, setUser] = useState(null)
  const [showUserSelector, setShowUserSelector] = useState(true)

  // Auto-load mock user on mount if in dev
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const autoUser = urlParams.get('user')

    if (autoUser === 'employee') {
      setUser(mockUser)
      setShowUserSelector(false)
    } else if (autoUser === 'rh') {
      setUser(mockUserRH)
      setShowUserSelector(false)
    } else if (autoUser === 'manager') {
      setUser(mockUserManager)
      setShowUserSelector(false)
    }
  }, [])

  if (!user) {
    if (showUserSelector) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: '20px',
          backgroundColor: '#f5f5f5',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1>🚀 ENOSISAPP Frontend Dev</h1>
            <p style={{ color: '#666', marginTop: '10px' }}>
              Sélectionnez un utilisateur pour tester:
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => { setUser(mockUser); setShowUserSelector(false) }}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              👤 Employé
            </button>
            <button
              onClick={() => { setUser(mockUserRH); setShowUserSelector(false) }}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              👨‍💼 RH
            </button>
            <button
              onClick={() => { setUser(mockUserManager); setShowUserSelector(false) }}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              👔 Manager
            </button>
          </div>

          <p style={{ color: '#999', marginTop: '20px', fontSize: '12px' }}>
            💡 Ou accédez directement: /?user=employee, /?user=rh, /?user=manager
          </p>
        </div>
      )
    }
    return <LoginPage onLogin={setUser} />
  }

  return <DashboardPage user={user} onLogout={() => { setUser(null); setShowUserSelector(true) }} />
}
