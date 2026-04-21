function formatTime(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 1000 / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins}m`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR')
}

export default function NotificationPanel({ notifications = [], onClose, onNavigate, onDelete }) {
  const unreadCount = notifications.filter((n) => !n.read).length
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  )

  const handleNotificationClick = (notification) => {
    if (notification.action && onNavigate) {
      onNavigate(notification.action)
    }
    if (onDelete) {
      onDelete(notification.id)
    }
    onClose()
  }

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation()
    console.log(`Marked as read: ${id}`)
  }

  const handleClearAll = () => {
    console.log('Clear all notifications')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="notification-panel-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="notification-panel">
        {/* Header */}
        <div className="notification-panel-header">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
          <button
            className="close-button"
            onClick={onClose}
            title="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="notification-panel-content">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <p>Aucune notification</p>
            </div>
          ) : (
            <ul className="notification-list">
              {sortedNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'is-read' : 'is-unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">{notification.icon}</div>

                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {formatTime(notification.timestamp)}
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      className="mark-read-button"
                      onClick={(e) => handleMarkAsRead(e, notification.id)}
                      title="Marquer comme lu"
                    >
                      •
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="notification-panel-footer">
            <button
              className="clear-button"
              onClick={handleClearAll}
            >
              Effacer tout
            </button>
            <a href="#" className="view-all-link">
              Voir tout →
            </a>
          </div>
        )}
      </div>
    </>
  )
}
