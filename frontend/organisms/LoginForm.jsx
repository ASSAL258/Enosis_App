import Button from '../atoms/Button.jsx'
import Icon from '../atoms/Icon.jsx'
import AlertMessage from '../molecules/AlertMessage.jsx'
import InputField from '../molecules/InputField.jsx'

/**
 * LoginForm — organisme de connexion controle par la page.
 * Props:
 *   email              : valeur email
 *   password           : valeur mot de passe
 *   loading            : etat de connexion
 *   error              : message d'erreur
 *   showPassword       : booleen
 *   title              : titre affiche
 *   subtitle           : sous-titre affiche
 *   emailLabel         : label email
 *   emailPlaceholder   : placeholder email
 *   passwordLabel      : label mot de passe
 *   passwordPlaceholder: placeholder mot de passe
 *   submitLabel        : texte du bouton
 *   loadingLabel       : texte pendant chargement
 *   supportPrefix      : texte avant le lien
 *   supportLinkLabel   : texte du lien
 *   logoSrc            : source du logo
 *   logoAlt            : alt du logo
 *   onEmailChange      : callback
 *   onPasswordChange   : callback
 *   onTogglePassword   : callback
 *   onSubmit           : callback
 *   onKeyDown          : callback clavier
 */
export default function LoginForm({
  email,
  password,
  loading,
  error,
  showPassword,
  title,
  subtitle,
  emailLabel,
  emailPlaceholder,
  passwordLabel,
  passwordPlaceholder,
  submitLabel,
  loadingLabel,
  supportPrefix,
  supportLinkLabel,
  logoSrc,
  logoAlt,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onKeyDown,
}) {
  return (
    <div className="login-card">
      <div className="login-card-header">
        <div className="brand-logo">
          <img src={logoSrc} alt={logoAlt} />
        </div>
        <h1 className="login-title">{title}</h1>
        <p className="login-subtitle">{subtitle}</p>
      </div>

      <AlertMessage message={error} />

      <InputField
        label={emailLabel}
        leftIcon={<Icon name="mail" size={15} />}
        inputProps={{
          type: 'email',
          value: email,
          onChange: (event) => onEmailChange(event.target.value),
          placeholder: emailPlaceholder,
          onKeyDown,
        }}
      />

      <InputField
        label={passwordLabel}
        leftIcon={<Icon name="lock" size={15} />}
        rightSlot={(
          <button type="button" className="icon-button" onClick={onTogglePassword} aria-label="Afficher ou masquer le mot de passe">
            <Icon name={showPassword ? 'eye' : 'eyeOff'} />
          </button>
        )}
        inputProps={{
          type: showPassword ? 'text' : 'password',
          value: password,
          onChange: (event) => onPasswordChange(event.target.value),
          placeholder: passwordPlaceholder,
          onKeyDown,
        }}
      />

      <Button variant="login" onClick={onSubmit} disabled={loading}>
        {loading ? loadingLabel : submitLabel}
      </Button>

      <p className="support-text">
        {supportPrefix} <a href="#">{supportLinkLabel}</a>
      </p>
    </div>
  )
}
