/**
 * TableCard — carte de tableau avec actions.
 * Props:
 *   icon    : node ou string
 *   title   : string
 *   actions : node optionnel
 *   children: contenu
 */
export default function TableCard({ icon, title, actions, children }) {
  return (
    <section className="table-card">
      <div className="table-card__header">
        <div className="table-card__title">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        {actions ? <div className="table-card__actions">{actions}</div> : null}
      </div>
      <div className="table-card__body">{children}</div>
    </section>
  )
}
