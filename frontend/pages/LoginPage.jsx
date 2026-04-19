import { useState } from 'react'
import { buildApiUrl } from '../config/api.js'
import LoginForm from '../organisms/LoginForm.jsx'
import AuthLayout from '../templates/AuthLayout.jsx'

/**
 * LoginPage — page de connexion avec appel a l'API JWT.
 * Props:
 *   onLogin : callback utilisateur authentifie
 */
export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin() {
    setError('')

    if (!email) {
      setError('Veuillez saisir votre adresse email.')
      return
    }

    if (!password) {
      setError('Veuillez saisir votre mot de passe.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(buildApiUrl('/api/token/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        setError('Email ou mot de passe incorrect.')
        setLoading(false)
        return
      }

      const data = await response.json()
      const payload = JSON.parse(atob(data.access.split('.')[1]))

      onLogin({
        token: data.access,
        email,
        role: payload.role,
        first: payload.first_name,
        last: payload.last_name,
        matricule: payload.matricule,
        site: payload.site,
      })
    } catch {
      setError('Erreur de connexion.')
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <AuthLayout>
      <LoginForm
        email={email}
        password={password}
        loading={loading}
        error={error}
        showPassword={showPassword}
        title="Connexion"
        subtitle="Connectez-vous a votre espace de travail"
        emailLabel="Adresse email"
        emailPlaceholder="p.nom@enosisapp.ma"
        passwordLabel="Mot de passe"
        passwordPlaceholder="••••••••"
        submitLabel="Se connecter"
        loadingLabel="Connexion..."
        supportPrefix="Probleme de connexion ?"
        supportLinkLabel="Contacter le support"
        logoSrc="/image_enosisapp.png"
        logoAlt="enosisapp Group Logo"
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePassword={() => setShowPassword((value) => !value)}
        onSubmit={handleLogin}
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleLogin()
        }}
      />
    </AuthLayout>
  )
}
