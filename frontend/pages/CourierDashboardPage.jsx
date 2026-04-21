import { useEffect, useMemo, useState } from 'react'
import { buildApiUrl } from '../config/api.js'
import Button from '../atoms/Button.jsx'
import Icon from '../atoms/Icon.jsx'
import Badge from '../atoms/Badge.jsx'

function formatWeight(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  return `${value} kg`
}

function getStatusLabel(status) {
  const map = {
    termine: 'Terminée',
    en_cours: 'En cours',
    affectee: 'Affectée',
    pas_affectee: 'Disponible',
  }

  return map[status] || status || '—'
}

function getStatusTone(status) {
  const map = {
    termine: 'success',
    en_cours: 'info',
    affectee: 'warning',
    pas_affectee: 'success',
  }
  return map[status] || 'default'
}

function renderStatusBadge(status) {
  return <Badge label={getStatusLabel(status)} tone={getStatusTone(status)} />
}

function renderPhoneLink(phoneNumber) {
  if (!phoneNumber) return '—'
  return (
    <a className="courier-phone-link" href={`tel:${phoneNumber}`} title="Click to call">
      <span className="courier-phone-icon">📞</span>
      {phoneNumber}
    </a>
  )
}

function CourierDashboardPage({ user, onLogout }) {
  const [courses, setCourses] = useState([])
  const [activeTab, setActiveTab] = useState('availability')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState({ id: '', action: '' })
  const [expandedCourseId, setExpandedCourseId] = useState('')
  const [photoFiles, setPhotoFiles] = useState({})
  const [photoUploadingId, setPhotoUploadingId] = useState('')

  const courierId = user.id || user.user_id
  const userName = `${user.first || ''} ${user.last || ''}`.trim() || 'Courier'
  const userInitials = `${user.first?.[0] || ''}${user.last?.[0] || ''}`.toUpperCase() || 'C'

  async function fetchCourses() {
    try {
      const response = await fetch(buildApiUrl('/api/courses/'), {
        headers: { Authorization: `Bearer ${user.token}` },
      })

      if (!response.ok) {
        setError('Impossible de charger les courses.')
        return
      }

      const data = await response.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch {
      setError('Erreur reseau lors du chargement des courses.')
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [user.token])

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      const aMine = String(a.courier_id || '') === String(courierId)
      const bMine = String(b.courier_id || '') === String(courierId)
      if (aMine !== bMine) return aMine ? -1 : 1

      const aDate = new Date(a.created_at || 0).getTime()
      const bDate = new Date(b.created_at || 0).getTime()
      return bDate - aDate
    })
  }, [courses, courierId])

  const myCourses = useMemo(
    () => sortedCourses.filter((item) => String(item.courier_id || '') === String(courierId)),
    [sortedCourses, courierId],
  )

  const availableCourses = useMemo(
    () => sortedCourses.filter((item) => item.status === 'pas_affectee' && !item.courier_id),
    [sortedCourses],
  )

  const completedCourses = useMemo(
    () => myCourses.filter((item) => item.status === 'termine'),
    [myCourses],
  )

  const completion = myCourses.length
    ? Math.round((completedCourses.length / myCourses.length) * 100)
    : 0

  const stats = [
    { title: 'Performance', value: `${completion}%`, hint: 'Completion rate', tone: 'blue' },
    { title: 'Available', value: String(availableCourses.length), hint: 'Ready to pickup', tone: 'green' },
    { title: 'My Courses', value: String(myCourses.length), hint: 'Assigned to me', tone: 'gold' },
    { title: 'Done', value: String(completedCourses.length), hint: 'Completed work', tone: 'purple' },
  ]

  const recentCourse = sortedCourses[0] || null

  function updateCourseInState(updatedCourse) {
    setCourses((current) => current.map((item) => (item.id === updatedCourse.id ? { ...item, ...updatedCourse } : item)))
  }

  async function runCourseAction(courseId, actionPath) {
    setError('')
    setProcessing({ id: courseId, action: actionPath })

    try {
      const targetCourse = courses.find((item) => item.id === courseId)
      if (targetCourse && (actionPath === 'start-delivery' || actionPath === 'complete-delivery')) {
        await syncDeliveredTimeTransition(targetCourse, actionPath)
      }

      const response = await fetch(buildApiUrl(`/api/courses/${courseId}/${actionPath}/`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ courier_id: courierId }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.detail || 'Action impossible sur cette course.')
        return
      }

      const updatedCourse = await response.json().catch(() => null)
      if (updatedCourse?.id) {
        updateCourseInState(updatedCourse)
      } else {
        await fetchCourses()
      }
    } catch (err) {
      setError(err?.message || 'Erreur reseau pendant la mise a jour du statut.')
    } finally {
      setProcessing({ id: '', action: '' })
    }
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = String(reader.result || '')
        const marker = 'base64,'
        const index = result.indexOf(marker)
        resolve(index >= 0 ? result.slice(index + marker.length) : '')
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function ensureDeliveredTimeId(course, nowIso) {
    if (course.delivered_time_id) {
      return course.delivered_time_id
    }

    const createResponse = await fetch(buildApiUrl('/api/delivered-times/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        course_id: course.id,
        courier_id: courierId,
        start_time: nowIso,
        end_time: nowIso,
      }),
    })

    if (!createResponse.ok) {
      throw new Error('Impossible de creer delivered-time')
    }

    const deliveredTime = await createResponse.json()

    const attachResponse = await fetch(buildApiUrl(`/api/courses/${course.id}/attach-delivered-time/`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ delivered_time_id: deliveredTime.id }),
    })

    if (!attachResponse.ok) {
      throw new Error('Impossible de lier delivered-time')
    }

    const updatedCourse = await attachResponse.json()
    if (updatedCourse?.id) {
      updateCourseInState(updatedCourse)
    }

    return deliveredTime.id
  }

  async function syncDeliveredTimeTransition(course, actionPath) {
    const nowIso = new Date().toISOString()
    const deliveredTimeId = await ensureDeliveredTimeId(course, nowIso)

    const endpoint = actionPath === 'start-delivery'
      ? `/api/delivered-times/${deliveredTimeId}/start/`
      : `/api/delivered-times/${deliveredTimeId}/complete/`

    const body = actionPath === 'start-delivery'
      ? { courier_id: courierId, start_time: nowIso }
      : { courier_id: courierId, end_time: nowIso }

    const response = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw new Error(payload?.detail || 'Impossible de synchroniser le suivi de livraison.')
    }
  }

  async function uploadDeliveryPhoto(course) {
    const file = photoFiles[course.id]
    if (!file) {
      setError('Veuillez selectionner une photo.')
      return
    }

    setError('')
    setPhotoUploadingId(course.id)

    try {
      const contentBase64 = await toBase64(file)
      const deliveredTimeId = await ensureDeliveredTimeId(course, new Date().toISOString())

      const response = await fetch(buildApiUrl(`/api/delivered-times/${deliveredTimeId}/image/`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          file_name: file.name,
          content_type: file.type || 'image/jpeg',
          content_base64: contentBase64,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.detail || 'Impossible d envoyer la photo.')
        return
      }

      setPhotoFiles((current) => {
        const next = { ...current }
        delete next[course.id]
        return next
      })
    } catch {
      setError('Erreur reseau pendant l upload photo.')
    } finally {
      setPhotoUploadingId('')
    }
  }

  function getCourseAction(course) {
    const isMine = String(course.courier_id || '') === String(courierId)

    if (course.status === 'pas_affectee' && !course.courier_id) {
      return { type: 'button', label: 'M’affecter', actionPath: 'assign-courier', disabled: false }
    }

    if (!isMine) {
      return { type: 'label', label: 'Assigned', actionPath: '', disabled: true }
    }

    if (course.status === 'affectee') {
      return { type: 'button', label: 'Démarrer la livraison', actionPath: 'start-delivery', disabled: false }
    }

    if (course.status === 'en_cours') {
      return { type: 'button', label: 'Terminer la livraison', actionPath: 'complete-delivery', disabled: false }
    }

    return { type: 'label', label: 'Terminée', actionPath: '', disabled: true }
  }

  return (
    <div className="courier-mobile-shell">
      <header className="courier-header-shell">
        <div className="courier-header-brand">
          <img src="/image_enosisapp.png" alt="EnosisApp logo" className="courier-header-logo" />
          <span className="courier-header-name">ENOSISAPP</span>
        </div>

        <Button
          variant="ghost-danger"
          size="sm"
          onClick={onLogout}
          icon={<Icon name="logout" size={13} />}
          className="courier-header-logout"
          title="Deconnexion"
        >
          <span className="courier-header-logout-text">Logout</span>
        </Button>
      </header>

      <main className="courier-mobile-main courier-mobile-main--with-navbar">
        <section className="courier-hero-card">
          <div className="courier-hero-top">
            <div className="courier-hero-avatar" aria-hidden="true">
              {userInitials}
            </div>
            <div>
              <p className="courier-hero-label">Courier Dashboard</p>
              <h1 className="courier-hero-title">Bon retour, {userName}</h1>
            </div>
          </div>

          <p className="courier-hero-subtitle">Suivez le travail qui vous est assigné, récupérez de nouveaux cours et terminez les livraisons plus rapidement..</p>
        </section>

        {error ? <div className="courier-mobile-error">{error}</div> : null}

        <section className="courier-mobile-stats" aria-label="Statistics">
          {stats.map((stat) => (
            <article key={stat.title} className={`courier-stat-card courier-stat-card--${stat.tone}`}>
              <p className="courier-stat-title">{stat.title}</p>
              <p className="courier-stat-value">{stat.value}</p>
              <p className="courier-stat-hint">{stat.hint}</p>
            </article>
          ))}
        </section>

        {/* <section className="courier-section">
          <div className="courier-section-head">
            <div>
              <p className="courier-section-kicker">Live view</p>
              <h2>Recent Activity</h2>
            </div>
            <button type="button" className="courier-section-link" onClick={() => setActiveTab('courses')}>View all</button>
          </div>

          {recentCourse ? (
            <article className="courier-activity-card">
              <div className="courier-activity-head">
                <span className="courier-activity-badge">{getStatusLabel(recentCourse.status)}</span>
                <span className="courier-activity-route">{recentCourse.city || 'Route'} → {recentCourse.destination || 'Dropoff'}</span>
              </div>

              <h3 className="courier-activity-title">{recentCourse.name || 'Course'}</h3>
              <p className="courier-activity-description">{recentCourse.description || 'Aucune description.'}</p>

              <dl className="courier-detail-grid">
                <div><dt>Type</dt><dd>{recentCourse.type || '—'}</dd></div>
                <div><dt>Phone</dt><dd>{recentCourse.phone_number || '—'}</dd></div>
                <div><dt>Weight</dt><dd>{formatWeight(recentCourse.weight)}</dd></div>
                <div><dt>Status</dt><dd>{getStatusLabel(recentCourse.status)}</dd></div>
              </dl>

              {(() => {
                const action = getCourseAction(recentCourse)
                const isBusy = processing.id === recentCourse.id

                return action.type === 'button' ? (
                  <button
                    type="button"
                    className="courier-primary-action"
                    disabled={action.disabled || isBusy}
                    onClick={() => runCourseAction(recentCourse.id, action.actionPath)}
                  >
                    {isBusy ? 'Processing...' : action.label}
                  </button>
                ) : (
                  <div className="courier-completed-label">{action.label}</div>
                )
              })()}
            </article>
          ) : (
            <article className="courier-activity-card">
              <p className="courier-mobile-empty">No course available yet.</p>
            </article>
          )}
        </section> */}

        <section className="courier-tabs" aria-label="Courier sections">
          <button type="button" className={activeTab === 'availability' ? 'is-active' : ''} onClick={() => setActiveTab('availability')}>Availability</button>
          <button type="button" className={activeTab === 'courses' ? 'is-active' : ''} onClick={() => setActiveTab('courses')}>Courses</button>
          <button type="button" className={activeTab === 'history' ? 'is-active' : ''} onClick={() => setActiveTab('history')}>History</button>
          <button type="button" className={activeTab === 'profile' ? 'is-active' : ''} onClick={() => setActiveTab('profile')}>Profile</button>
        </section>

        {activeTab === 'availability' || activeTab === 'courses' ? (
          <section className="courier-list" aria-label="Courses list">
            {(activeTab === 'Disponibilité' ? availableCourses : myCourses).map((course) => {
              const action = getCourseAction(course)
              const isBusy = processing.id === course.id

              return (
                <article key={course.id} className={`courier-item courier-item--${course.status}`}>
                  <div className="courier-item-main">
                    <div className="courier-item-header">
                      {renderStatusBadge(course.status)}
                      <div className="courier-item-header-content">
                        <p className="courier-item-title">{course.name || 'Course'}</p>
                        <p className="courier-item-sub">{course.city || '—'} → {course.destination || '—'}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`courier-details-toggle${expandedCourseId === course.id ? ' is-open' : ''}`}
                      aria-label={expandedCourseId === course.id ? 'Hide details' : 'Show details'}
                      onClick={() => setExpandedCourseId((current) => (current === course.id ? '' : course.id))}
                    >
                      <Icon name="chevronRight" size={16} />
                    </button>
                  </div>

                  {expandedCourseId === course.id ? (
                    <div className="courier-item-details">
                      <div className="courier-detail-metadata">
                        <dl className="courier-detail-grid">
                          <div><dt>Type</dt><dd>{course.type || '—'}</dd></div>
                          <div><dt>Weight</dt><dd>{formatWeight(course.weight)}</dd></div>
                          <div><dt>Status</dt><dd>{getStatusLabel(course.status)}</dd></div>
                          <div><dt>Phone</dt><dd>{renderPhoneLink(course.phone_number)}</dd></div>
                        </dl>
                      </div>

                      <div className="courier-detail-actions">
                        {course.phone_number ? (
                          <a className="courier-call-link" href={`tel:${course.phone_number}`} title="Call this number">
                            📞 Call
                          </a>
                        ) : null}

                        <label className="courier-upload-label">
                          Add photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null
                              setPhotoFiles((current) => ({ ...current, [course.id]: file }))
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          className="courier-upload-btn"
                          disabled={photoUploadingId === course.id || !photoFiles[course.id]}
                          onClick={() => uploadDeliveryPhoto(course)}
                        >
                          {photoUploadingId === course.id ? 'Uploading...' : 'Upload photo'}
                        </button>
                      </div>

                      <div className="courier-item-action-button">
                        {action.type === 'button' ? (
                          <button
                            type="button"
                            className="courier-primary-action"
                            disabled={action.disabled || isBusy}
                            onClick={() => runCourseAction(course.id, action.actionPath)}
                          >
                            {isBusy ? 'Processing...' : action.label}
                          </button>
                        ) : (
                          <div className="courier-completed-label">{action.label}</div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </section>
        ) : null}

        {activeTab === 'history' ? (
          <section className="courier-list" aria-label="History">
            {completedCourses.length ? completedCourses.map((course) => (
              <article key={course.id} className="courier-item">
                <p className="courier-item-title">{course.name || 'Course'}</p>
                <p className="courier-item-sub">Completed</p>
              </article>
            )) : <article className="courier-item"><p className="courier-mobile-empty">No completed deliveries yet.</p></article>}
          </section>
        ) : null}

        {activeTab === 'profile' ? (
          <section className="courier-profile-card" aria-label="Profile">
            <p><strong>Name:</strong> {userName}</p>
            <p><strong>Email:</strong> {user.email || '—'}</p>
            <p><strong>Role:</strong> Courier</p>
            <button type="button" className="courier-profile-logout" onClick={onLogout}>Log out</button>
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default CourierDashboardPage