import Icon from '../atoms/Icon.jsx'

/**
 * ActionLink — action inline generique avec etats.
 * Props:
 *   disabled      : bloque l'action
 *   loading       : etat de chargement
 *   onClick       : callback utilisateur
 *   label         : libelle normal
 *   loadingLabel  : libelle de chargement
 *   disabledLabel : libelle indisponible
 *   iconName      : nom d'icone
 */
export default function ActionLink({
  disabled = false,
  loading = false,
  onClick,
  label = 'Ouvrir',
  loadingLabel = 'Chargement...',
  disabledLabel = 'Indisponible',
  iconName = null,
}) {
  const classes = [
    'action-link',
    disabled ? 'is-disabled' : '',
    loading ? 'is-loading' : '',
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
    >
      {iconName ? <Icon name={iconName} size={14} /> : null}
      {disabled ? disabledLabel : loading ? loadingLabel : label}
    </button>
  )
}
