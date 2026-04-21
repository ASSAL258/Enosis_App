import { useEffect, useMemo, useState } from 'react'
import { buildApiUrl } from '../config/api.js'
import Badge from '../atoms/Badge.jsx'
import Button from '../atoms/Button.jsx'
import Icon from '../atoms/Icon.jsx'
import Input from '../atoms/Input.jsx'
import Textarea from '../atoms/Textarea.jsx'
import AlertMessage from '../molecules/AlertMessage.jsx'
import ActionLink from '../molecules/ActionLink.jsx'
import CustomSelect from '../molecules/CustomSelect.jsx'
import MultiSelectDropdown from '../molecules/MultiSelectDropdown.jsx'
import FormGroup from '../molecules/FormGroup.jsx'
import FormRow from '../molecules/FormRow.jsx'
import DataTable from '../organisms/DataTable.jsx'
import ProcessOverview from '../organisms/ProcessOverview.jsx'
import FormTemplate from '../templates/FormTemplate.jsx'

const STATUS_FILTER_OPTIONS = [
  { value: 'termine', label: 'Completed (Termine)' },
  { value: 'en_cours', label: 'In Progress (En cours)' },
  { value: 'affectee', label: 'Assigned (Affectee)' },
  { value: 'pas_affectee', label: 'Unassigned (Pas affectee)' },
]

function createInitialForm(user) {
  return {
    nom: user.last || '',
    prenom: user.first || '',
    departement: user.departement_id || '',
    name: '',
    type: 'administrative',
    phone_number: '',
    attachment_file: null,
    attachment_file_name: '',
    dimensions: '',
    weight: '',
    city: '',
    destination: '',
    description: '',
  }
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '—'
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString('fr-FR') : '—'
}

function formatWeight(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return `${value} kg`
}

function renderStatusBadge(value) {
  const statusMap = {
    termine: { label: 'Terminée', tone: 'success' },
    en_cours: { label: 'En cours', tone: 'info' },
    affectee: { label: 'Affectée', tone: 'warning' },
    pas_affectee: { label: 'Pas affectée', tone: 'warning' },
  }
  const status = statusMap[value] || { label: value || '—', tone: 'default' }
  return <Badge label={status.label} tone={status.tone} />
}

function formatUserIdentity(userData, fallbackUser) {
  return {
    nom: userData?.last_name || fallbackUser.last || '—',
    prenom: userData?.first_name || fallbackUser.first || '—',
    departement: userData?.departement_id || fallbackUser.departement_id || '—',
  }
}

export default function CoursePage({ user, isValidationView = false }) {
  const isRH = user.role === 'rh' && isValidationView
  const isParkAuto = user.role === 'parkauto'
  const [courses, setCourses] = useState([])
  const [usersById, setUsersById] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [form, setForm] = useState(createInitialForm(user))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedDeliveredTime, setSelectedDeliveredTime] = useState(null)
  const [selectedDeliveredImage, setSelectedDeliveredImage] = useState(null)
  const [filters, setFilters] = useState({
    cities: [],
    courierId: '',
    courierSearch: '',
    startDate: '',
    endDate: '',
    statuses: [],
    department: '',
  })
  const [attachmentLoading, setAttachmentLoading] = useState({})

  async function openAttachment(courseId, fileName) {
    try {
      setAttachmentLoading((current) => ({ ...current, [courseId]: true }))
      const response = await fetch(buildApiUrl(`/api/courses/${courseId}/attachment/`), {
        headers: { Authorization: `Bearer ${user.token}` },
      })

      if (!response.ok) {
        setError('Impossible d' + "'" + 'ouvrir le PDF.')
        setAttachmentLoading((current) => ({ ...current, [courseId]: false }))
        return
      }

      const attachment = await response.json()
      const pdfUrl = `data:application/pdf;base64,${attachment.content_base64}`
      const popup = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

      if (!popup) {
        setError('Le navigateur a bloque l' + "'" + 'ouverture du PDF.')
      }
    } catch {
      setError('Erreur reseau lors de l' + "'" + 'ouverture du PDF.')
    }
    setAttachmentLoading((current) => ({ ...current, [courseId]: false }))
  }

  async function openCourseDetails(course) {
    setSelectedCourse(course)
    setSelectedDeliveredTime(null)
    setSelectedDeliveredImage(null)
    setDetailsError('')
    setDetailsLoading(true)
    setShowDetailsModal(true)

    try {
      if (!course.delivered_time_id) {
        return
      }

      const deliveredTimeResponse = await fetch(buildApiUrl(`/api/delivered-times/${course.delivered_time_id}/`), {
        headers: { Authorization: `Bearer ${user.token}` },
      })

      if (!deliveredTimeResponse.ok) {
        setDetailsError('Aucun suivi de livraison disponible pour cette course.')
        return
      }

      const deliveredTime = await deliveredTimeResponse.json()
      setSelectedDeliveredTime(deliveredTime)

      if (!deliveredTime.image_id) {
        return
      }

      const deliveredImageResponse = await fetch(buildApiUrl(`/api/delivered-times/${deliveredTime.id}/image/`), {
        headers: { Authorization: `Bearer ${user.token}` },
      })

      if (!deliveredImageResponse.ok) {
        setDetailsError('La photo de livraison est indisponible.')
        return
      }

      const deliveredImage = await deliveredImageResponse.json()
      setSelectedDeliveredImage(deliveredImage)
    } catch {
      setDetailsError('Erreur reseau lors du chargement des details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  async function fetchCourses() {
    try {
      const query = new URLSearchParams()

      if (!isParkAuto) {
        const currentUserId = user.id || user.user_id
        if (currentUserId) {
          query.append('user_id', currentUserId)
        }
      }

      if (isParkAuto) {
        filters.cities.forEach((city) => query.append('city', city))
        filters.statuses.forEach((status) => query.append('status', status))
        if (filters.courierId) query.append('courier_id', filters.courierId)
        if (filters.startDate) query.append('start_date', filters.startDate)
        if (filters.endDate) query.append('end_date', filters.endDate)
        if (filters.department) query.append('department', filters.department)
      }

      const endpoint = `/api/courses/${query.toString() ? `?${query.toString()}` : ''}`
      const response = await fetch(buildApiUrl(endpoint), {
        headers: { Authorization: `Bearer ${user.token}` },
      })

      if (!response.ok) {
        setError('Impossible de charger les courses.')
        setCourses([])
        return
      }

      const data = await response.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch {
      setCourses([])
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [
    user.token,
    user.id,
    user.user_id,
    isParkAuto,
    filters.cities,
    filters.courierId,
    filters.startDate,
    filters.endDate,
    filters.statuses,
    filters.department,
  ])

  useEffect(() => {
    const uniqueUserIds = [...new Set(courses.flatMap((item) => [item.user_id, item.courier_id]).filter(Boolean))]
    const missingUserIds = uniqueUserIds.filter((userId) => !usersById[userId])

    if (!missingUserIds.length) {
      return
    }

    let isActive = true

    Promise.all(
      missingUserIds.map(async (userId) => {
        try {
          const response = await fetch(buildApiUrl(`/api/users/${userId}/`), {
            headers: { Authorization: `Bearer ${user.token}` },
          })

          if (!response.ok) {
            return [userId, null]
          }

          const data = await response.json()
          return [userId, data]
        } catch {
          return [userId, null]
        }
      }),
    ).then((entries) => {
      if (!isActive) return

      setUsersById((current) => {
        const next = { ...current }

        for (const [userId, data] of entries) {
          if (data) {
            next[userId] = data
          }
        }

        return next
      })
    })

    return () => {
      isActive = false
    }
  }, [courses, user.token, usersById])

  useEffect(() => {
    if (showModal) {
      setForm(createInitialForm(user))
    }
  }, [showModal, user])

  const metrics = useMemo(() => {
    const terminedCount = courses.filter((item) => item.status === 'termine').length
    const affectedCount = courses.filter((item) => item.status === 'affectee').length
    return [
      { label: 'Total courses', value: courses.length, tone: 'blue' },
      { label: 'Terminées', value: terminedCount, tone: 'green' },
      { label: 'Affectées', value: affectedCount, tone: 'orange' },
      { label: 'RH', value: isRH ? affectedCount : 0, tone: 'purple' },
    ]
  }, [courses, isRH])

  const cityOptions = useMemo(() => {
    return [...new Set(courses.map((course) => course.city).filter(Boolean))]
  }, [courses])

  const courierOptions = useMemo(() => {
    const courierIds = [...new Set(courses.map((course) => course.courier_id).filter(Boolean))]

    return courierIds.map((courierId) => {
      const courier = usersById[courierId]
      const fullName = `${courier?.first_name || ''} ${courier?.last_name || ''}`.trim()

      return {
        id: courierId,
        label: fullName || String(courierId),
      }
    })
  }, [courses, usersById])

  const departmentOptions = useMemo(() => {
    return [...new Set(Object.values(usersById).map((entry) => entry?.departement_id).filter(Boolean))]
  }, [usersById])

  function toggleMultiFilter(key, value) {
    setFilters((current) => {
      const exists = current[key].includes(value)
      return {
        ...current,
        [key]: exists ? current[key].filter((item) => item !== value) : [...current[key], value],
      }
    })
  }

  function resetFilters() {
    setFilters({
      cities: [],
      courierId: '',
      courierSearch: '',
      startDate: '',
      endDate: '',
      statuses: [],
      department: '',
    })
  }

  function openModal() {
    setForm(createInitialForm(user))
    setError('')
    setShowModal(true)
  }

  async function submitForm() {
    setError('')

    if (!form.name || form.name.trim() === '') {
      setError('Veuillez saisir le nom du course.')
      return
    }

    if (!form.attachment_file) {
      setError('Veuillez joindre un fichier PDF.')
      return
    }

    if (!form.phone_number || form.phone_number.trim() === '') {
      setError('Veuillez saisir un numero de telephone.')
      return
    }

    setLoading(true)

    try {
      const payload = new FormData()
      payload.append('name', form.name)
      payload.append('type', form.type)
      payload.append('phone_number', form.phone_number)
      payload.append('description', form.description)
      payload.append('user_id', user.id || user.user_id)

      if (form.city) payload.append('city', form.city)
      if (form.destination) payload.append('destination', form.destination)
      if (form.dimensions) payload.append('dimensions', form.dimensions)
      if (form.weight !== '') payload.append('weight', form.weight)
      if (form.attachment_file) payload.append('attachment_file', form.attachment_file)

      const response = await fetch(buildApiUrl('/api/courses/create/'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: payload,
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        setError(errorPayload?.detail || 'Erreur lors de la soumission.')
        setLoading(false)
        return
      }

      setShowModal(false)
      setForm(createInitialForm(user))
      fetchCourses()
    } catch {
      setError('Erreur reseau.')
    }

    setLoading(false)
  }

  const headers = ['Nom', 'Prenom', 'Departement', 'Cours', 'Type', 'Telephone', 'Attachment', 'Affectée à', 'Ville', 'Destination', 'Statut', 'Date de creation', 'Details']

  const rows = courses.map((item) => {
    const identity = formatUserIdentity(usersById[item.user_id], user)

    return {
      key: item.id,
      className: item.status === 'termine' ? 'is-complete' : 'is-pending',
      cells: [
        { content: <span className="cell-strong">{identity.nom}</span> },
        { content: identity.prenom },
        { content: <span className="cell-muted">{identity.departement}</span> },
        { content: <span className="cell-strong">{item.name || <span className="comment-editor__placeholder">—</span>}</span> },
        { content: item.type || <span className="comment-editor__placeholder">—</span> },
        { content: item.phone_number || <span className="comment-editor__placeholder">—</span> },
        { content: item.attachment_id ? (
          <button
            type="button"
            className="pdf-badge"
            onClick={() => openAttachment(item.id, item.attachment_file_name)}
            disabled={!!attachmentLoading[item.id]}
            title={item.attachment_file_name || 'Open PDF'}
          >
            <Icon name="pdf" size={16} />
            <span>PDF</span>
          </button>
        ) : (
          <span className="comment-editor__placeholder">—</span>
        ) },
        { content: <span className="cell-strong">{usersById[item.courier_id] ? `${usersById[item.courier_id].first_name || ''} ${usersById[item.courier_id].last_name || ''}`.trim() || 'pas affectée' : 'pas affectée'}</span> },
        { content: <span className="cell-muted">{item.city || <span className="comment-editor__placeholder">—</span>}</span> },
        { content: item.destination || <span className="comment-editor__placeholder">—</span> },
        { content: renderStatusBadge(item.status) },
        { content: <span className="cell-muted">{formatDate(item.created_at)}</span> },
        { content: (
          <Button variant="secondary" size="sm" onClick={() => openCourseDetails(item)}>
            Details
          </Button>
        ) },
      ],
    }
  })

  return (
    <>
      {isParkAuto ? (
        <section className="course-filters-panel" aria-label="Filters">
          <div className="course-filters-head">
            <div>
              <p className="course-filters-kicker">Coordinator filters</p>
              <h3>Find and monitor deliveries faster</h3>
            </div>
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>

          <div className="course-filters-grid">
            <FormGroup label="City Filter">
              <MultiSelectDropdown
                value={filters.cities}
                options={cityOptions.length ? cityOptions.map((city) => ({ value: city, label: city })) : []}
                onChange={(selected) => setFilters((current) => ({ ...current, cities: selected }))}
                placeholder="Select cities..."
              />
            </FormGroup>

            <FormGroup label="Courier Filter">
              <CustomSelect
                value={filters.courierId}
                options={courierOptions}
                onChange={(selected) => setFilters((current) => ({ ...current, courierId: selected }))}
                multiple={false}
                placeholder="Search courier..."
              />
            </FormGroup>

            <FormGroup label="Date Range Filter">
              <div className="course-filter-date-range">
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
                />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
                />
              </div>
            </FormGroup>

            <FormGroup label="Status Filter">
              <MultiSelectDropdown
                value={filters.statuses}
                options={STATUS_FILTER_OPTIONS}
                onChange={(selected) => setFilters((current) => ({ ...current, statuses: selected }))}
                placeholder="Select statuses..."
              />
            </FormGroup>

            <FormGroup label="Department Filter">
              <select
                className="select-base"
                value={filters.department}
                onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))}
              >
                <option value="">All departments</option>
                {departmentOptions.map((departmentId) => (
                  <option key={departmentId} value={departmentId}>{departmentId}</option>
                ))}
              </select>
            </FormGroup>
          </div>
        </section>
      ) : null}

      <ProcessOverview
        title={isParkAuto ? 'Courses' : isValidationView ? 'Workflow des Courses' : isRH ? 'Gestion des Courses' : 'Courses'}
        breadcrumb={isParkAuto ? 'Process Interne › Courses' : isValidationView ? 'Process Interne RH › Courses › Workflow' : isRH ? 'Process Interne RH › Courses › Vue RH' : 'Process Interne RH › Courses'}
        metrics={metrics}
        cardIcon="🎓"
        cardTitle={isParkAuto ? 'Gestion des Courses' : isValidationView ? 'Consultation du workflow' : isRH ? 'Toutes les courses' : 'Mes courses'}
        action={!isValidationView && !isParkAuto ? (
          <Button variant="primary" onClick={openModal} icon={<Icon name="plus" size={14} />}>
            Nouvelle demande
          </Button>
        ) : null}
      >
        <DataTable
          headers={headers}
          rows={rows}
          emptyState={{
            icon: '📚',
            title: 'Aucun course',
            text: isValidationView ? 'Aucune course disponible pour le moment.' : 'Cliquez sur « Nouvelle demande » pour ajouter votre premier cours.',
          }}
        />
      </ProcessOverview>

      {showModal ? (
        <FormTemplate
          title="Nouvelle Demande de Course"
          onClose={() => setShowModal(false)}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={submitForm} disabled={loading} icon={<Icon name="check" size={14} />}>
                {loading ? 'Envoi...' : 'Soumettre la demande'}
              </Button>
            </>
          )}
        >
          <AlertMessage message={error} />

          <FormRow>
            <FormGroup label="Nom" required>
              <Input value={form.nom} readOnly />
            </FormGroup>
            <FormGroup label="Prenom" required>
              <Input value={form.prenom} readOnly />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Departement" required>
              <Input value={form.departement} readOnly />
            </FormGroup>
            <FormGroup label="Nom du Course" required>
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex: Formation Python"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Type" required>
              <select
                className="input-base"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="administrative">Administrative</option>
                <option value="material">Matériel</option>
              </select>
            </FormGroup>
            <FormGroup label="Telephone" required>
              <Input
                value={form.phone_number}
                onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))}
                placeholder="Ex: 0612345678"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Attachment PDF" required>
              <Input
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={(event) => {
                  const file = event.target.files?.[0] || null
                  setForm((current) => ({
                    ...current,
                    attachment_file: file,
                    attachment_file_name: file ? file.name : '',
                  }))
                }}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Dimensions">
              <Input
                value={form.dimensions}
                onChange={(event) => setForm((current) => ({ ...current, dimensions: event.target.value }))}
                placeholder="Ex: 30 x 20 x 10 cm"
              />
            </FormGroup>
            <FormGroup label="Weight">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.weight}
                onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
                placeholder="Ex: 12.5"
              />
            </FormGroup>
          </FormRow>

          {form.attachment_file_name ? (
            <FormGroup label="Fichier selectionne">
              <Input value={form.attachment_file_name} readOnly />
            </FormGroup>
          ) : null}

          <FormGroup label="Ville">
            <Input
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              placeholder="Ex: Casablanca"
            />
          </FormGroup>

          <FormGroup label="Destination">
            <Input
              value={form.destination}
              onChange={(event) => setForm((current) => ({ ...current, destination: event.target.value }))}
              placeholder="Ex: Destination finale"
            />
          </FormGroup>

          <FormGroup label="Description">
            <Textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Decrivez le course..."
            />
          </FormGroup>
        </FormTemplate>
      ) : null}

      {showDetailsModal ? (
        <div className="modal-overlay" role="presentation" onClick={() => setShowDetailsModal(false)}>
          <div className="modal course-details-modal" role="dialog" aria-modal="true" aria-labelledby="course-details-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title" id="course-details-title">
                <Icon name="eye" size={16} />
                <span>Course details</span>
              </div>
              <button type="button" className="modal__close-button" onClick={() => setShowDetailsModal(false)} aria-label="Close details">
                ×
              </button>
            </div>

            <div className="modal__body course-details-modal__body">
              {detailsLoading ? <AlertMessage message="Chargement des details..." /> : null}
              {detailsError ? <AlertMessage message={detailsError} /> : null}

              {selectedCourse ? (
                <div className="course-details-stack">
                  <div className="course-details-summary">
                    <div>
                      <p className="course-details-kicker">Workflow</p>
                      <h3>{selectedCourse.name || 'Course'}</h3>
                      <p className="course-details-route">{selectedCourse.city || '—'} → {selectedCourse.destination || '—'}</p>
                    </div>
                    {renderStatusBadge(selectedCourse.status)}
                  </div>

                  <div className="course-details-timeline">
                    <article className="course-details-timeline-card">
                      <span>Début de livraison</span>
                      <strong>{selectedDeliveredTime ? formatDateTime(selectedDeliveredTime.start_time) : '—'}</strong>
                    </article>
                    <article className="course-details-timeline-card">
                      <span>Fin de livraison</span>
                      <strong>{selectedDeliveredTime ? formatDateTime(selectedDeliveredTime.end_time) : '—'}</strong>
                    </article>
                  </div>

                  <div className="course-details-grid">
                    <div>
                      <span>Employee</span>
                      <strong>{`${formatUserIdentity(usersById[selectedCourse.user_id], user).nom} ${formatUserIdentity(usersById[selectedCourse.user_id], user).prenom}`.trim()}</strong>
                    </div>
                    <div>
                      <span>Department</span>
                      <strong>{formatUserIdentity(usersById[selectedCourse.user_id], user).departement}</strong>
                    </div>
                    <div>
                      <span>Courier</span>
                      <strong>{usersById[selectedCourse.courier_id] ? `${usersById[selectedCourse.courier_id].first_name || ''} ${usersById[selectedCourse.courier_id].last_name || ''}`.trim() || '—' : '—'}</strong>
                    </div>
                    <div>
                      <span>Phone</span>
                      <strong>
                        {selectedCourse.phone_number ? (
                          <a className="course-details-phone" href={`tel:${selectedCourse.phone_number}`}>
                            {selectedCourse.phone_number}
                          </a>
                        ) : (
                          '—'
                        )}
                      </strong>
                    </div>
                    <div>
                      <span>Created</span>
                      <strong>{formatDateTime(selectedCourse.created_at)}</strong>
                    </div>
                    <div>
                      <span>Updated</span>
                      <strong>{formatDateTime(selectedCourse.updated_at)}</strong>
                    </div>
                  </div>

                  <div className="course-details-grid">
                    <div>
                      <span>Type</span>
                      <strong>{selectedCourse.type || '—'}</strong>
                    </div>
                    <div>
                      <span>Size</span>
                      <strong>{selectedCourse.dimensions || '—'}</strong>
                    </div>
                    <div>
                      <span>Weight</span>
                      <strong>{formatWeight(selectedCourse.weight)}</strong>
                    </div>
                    <div>
                      <span>Attachment</span>
                      <strong>{selectedCourse.attachment_id ? selectedCourse.attachment_file_name || 'PDF attached' : '—'}</strong>
                    </div>
                  </div>

                  {selectedCourse.attachment_id ? (
                    <div className="course-details-actions course-details-actions--attachment">
                      <span className="course-details-actions__label">Attachment</span>
                      <button
                        type="button"
                        className="pdf-badge"
                        onClick={() => openAttachment(selectedCourse.id, selectedCourse.attachment_file_name)}
                        disabled={!!attachmentLoading[selectedCourse.id]}
                        title={selectedCourse.attachment_file_name || 'Open PDF'}
                      >
                        <Icon name="pdf" size={16} />
                        <span>PDF</span>
                      </button>
                    </div>
                  ) : null}

                  {selectedDeliveredImage ? (
                    <div className="course-details-photo">
                      <div className="course-details-photo__header">
                        <span>Delivery photo</span>
                        <small>{selectedDeliveredImage.file_name}</small>
                      </div>
                      <img
                        src={`data:${selectedDeliveredImage.content_type};base64,${selectedDeliveredImage.content_base64}`}
                        alt="Delivery proof"
                      />
                    </div>
                  ) : selectedDeliveredTime ? (
                    <div className="course-details-empty">No photo uploaded for this delivery.</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
