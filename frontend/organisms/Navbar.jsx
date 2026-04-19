import NotificationBell from '../molecules/NotificationBell.jsx'

/**
 * Navbar — organisme de structure d'entete.
 * Props:
 *   brand         : contenu gauche
 *   children      : contenu droit
 *   notifications : list de notifications (optionnel)
 *   onNavigate    : callback pour naviguer depuis une notification
 */
export default function Navbar({ brand, children, notifications = [], onNavigate }) {
  return (
    <header className="app-header">
      <div className="app-logo">
        {brand}
      </div>

      <div className="header-right">
        {notifications?.length > 0 && (
          <NotificationBell notifications={notifications} onNavigate={onNavigate} />
        )}
        {children}
      </div>
    </header>
  )
}
