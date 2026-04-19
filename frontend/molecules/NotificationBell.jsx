import { useState } from 'react'
import NotificationPanel from './NotificationPanel.jsx'

export default function NotificationBell({ notifications = [], onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="notification-bell-wrapper">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title={unreadCount > 0 ? `${unreadCount} nouvelle(s) notification(s)` : 'Notifications'}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}
