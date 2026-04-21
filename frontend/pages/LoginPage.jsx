import { useState } from 'react'
import { buildApiUrl } from '../config/api.js'
import LoginForm from '../organisms/LoginForm.jsx'
import AuthLayout from '../templates/AuthLayout.jsx'

const ROLE_BY_ID = {
  '9ce2fc51-0c24-4e13-bea3-0a421b2e869c': 'employee',
  'ed8809a1-71e1-4861-a1c8-aa7ac2a25935': 'manager',
  '084abf8d-8b28-44fd-a07c-9f2c257a732d': 'rh',
  'd3ab74d0-5058-438b-8aa5-6b1a258e6a13': 'courier',
}

async function resolveRoleNameById(roleId, token) {
  if (!roleId) return null

  try {
    const response = await fetch(buildApiUrl('/api/roles/'), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    const roles = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
        ? payload.results
        : []

    const match = roles.find((role) => String(role.id) === String(roleId))
    return match?.name || null
  } catch {
    return null
  }
}

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
      const response = await fetch(buildApiUrl('/api/auth/login/'), {
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
      const accessToken = data.access_token || data.access
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const roleId = payload.role_id || data.user?.role_id || null
      const resolvedRole =
        ROLE_BY_ID[roleId]
        || payload.role
        || data.user?.role
        || (await resolveRoleNameById(roleId, accessToken))
        || 'employee'


      onLogin({
        token: accessToken,
        email,
        id: payload.user_id || payload.id || payload.sub || data.user?.id,
        role: resolvedRole,
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
