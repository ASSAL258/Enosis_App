/**
 * Badge — atome d'affichage neutre.
 * Props:
 *   label : texte affiche
 *   tone  : 'warning' | 'success' | 'danger'
 */
export default function Badge({ label, tone = 'warning' }) {
  return <span className={`badge badge--${tone}`}>{label}</span>
}
