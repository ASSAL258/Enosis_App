import { useEffect, useMemo, useState } from 'react'
import { buildApiUrl } from '../config/api.js'
import Badge from '../atoms/Badge.jsx'
import Button from '../atoms/Button.jsx'
import Icon from '../atoms/Icon.jsx'
import Input from '../atoms/Input.jsx'
import Select from '../atoms/Select.jsx'
import Textarea from '../atoms/Textarea.jsx'
import AlertMessage from '../molecules/AlertMessage.jsx'
import CommentEditor from '../molecules/CommentEditor.jsx'
import EditableNumberCell from '../molecules/EditableNumberCell.jsx'
import FormGroup from '../molecules/FormGroup.jsx'
import FormRow from '../molecules/FormRow.jsx'
import StatusSelect from '../molecules/StatusSelect.jsx'
import DataTable from '../organisms/DataTable.jsx'
import ProcessOverview from '../organisms/ProcessOverview.jsx'
import FormTemplate from '../templates/FormTemplate.jsx'

const SITE_OPTIONS = ['Casablanca', 'Jorf Lasfar']
const ABSENCE_TYPES = ['Normale', 'Maladie']
const HOLIDAYS = ['01-01', '01-11', '05-01', '07-30', '08-14', '08-20', '08-21', '11-06', '11-18']
const STATUS_OPTIONS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'valide', label: 'Validee' },
  { value: 'rejete', label: 'Rejetee' },
]
const STATUS_META = {
  en_attente: { label: 'En attente', tone: 'warning' },
  valide: { label: 'Validee', tone: 'success' },
  rejete: { label: 'Rejetee', tone: 'danger' },
}

function createInitialForm(user) {
  return {
    nom: user.last,
    prenom: user.first,
    matricule: user.matricule || '',
    site: user.site || '',
    type_absence: 'Normale',
    date_debut: '',
    date_fin: '',
    motif: '',
  }
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6
}

function isHoliday(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return HOLIDAYS.includes(`${month}-${day}`)
}

function calcWorkingDays(start, end) {
  if (!start || !end) return 0
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) return 0

  let count = 0
  const current = new Date(startDate)
  while (current <= endDate) {
    if (!isWeekend(current) && !isHoliday(current)) count += 1
    current.setDate(current.getDate() + 1)
  }
  return count
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '—'
}

function getStatusTone(value) {
  return STATUS_META[value]?.tone || 'warning'
}

function renderStatusBadge(value) {
  const meta = STATUS_META[value] || STATUS_META.en_attente
  return <Badge label={meta.label} tone={meta.tone} />
}

export default function CongePage({ user, isValidationView = false }) {
  const isRH = user.role === 'rh' && isValidationView
  // TODO: le projet source contenait un composant legacy `ManagerConges.jsx` non branche; la vue manager reste consolidee dans cette page.
  const isManager = user.role === 'manager' && isValidationView
  const [conges, setConges] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(createInitialForm(user))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchConges() {
    try {
      const url = isValidationView ? buildApiUrl('/api/conges/?mode=validation') : buildApiUrl('/api/conges/')
      const response = await fetch(url, { headers: { Authorization: `Bearer ${user.token}` } })
      const data = await response.json()
      setConges(Array.isArray(data) ? data : [])
    } catch {
      setConges([])
    }
  }

  useEffect(() => {
    fetchConges()
  }, [user.token, isValidationView])

  useEffect(() => {
    if (form.date_fin && form.date_debut && form.date_fin < form.date_debut) {
      setForm((current) => ({ ...current, date_fin: '' }))
    }
  }, [form.date_debut, form.date_fin])

  const workingDays = useMemo(() => calcWorkingDays(form.date_debut, form.date_fin), [form.date_debut, form.date_fin])
  const metrics = useMemo(() => {
    const statusField = isRH ? 'statut_rh' : 'statut_manager'
    return [
      { label: 'Total demandes', value: conges.length, tone: 'blue' },
      { label: 'En attente', value: conges.filter((item) => item[statusField] === 'en_attente').length, tone: 'orange' },
      { label: 'Validees', value: conges.filter((item) => item[statusField] === 'valide').length, tone: 'green' },
      { label: 'Rejetees', value: conges.filter((item) => item[statusField] === 'rejete').length, tone: 'red' },
    ]
  }, [conges, isRH])

  async function updateRequest(id, payload) {
    await fetch(buildApiUrl(`/api/conges/${id}/`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(payload),
    })
    fetchConges()
  }

  function openModal() {
    setForm(createInitialForm(user))
    setError('')
    setShowModal(true)
  }

  async function submitForm() {
    setError('')
    if (!form.date_debut || !form.date_fin) {
      setError('Veuillez selectionner les dates.')
      return
    }
    if (workingDays <= 0) {
      setError("La periode selectionnee ne contient aucun jour ouvrable.")
      return
    }
    setLoading(true)
    try {
      const response = await fetch(buildApiUrl('/api/conges/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          nom: user.last,
          prenom: user.first,
          matricule: form.matricule,
          site: form.site,
          type_absence: form.type_absence,
          date_debut: form.date_debut,
          date_fin: form.date_fin,
          nombre_jours: workingDays,
          motif: form.motif,
        }),
      })
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        setError(errorPayload ? JSON.stringify(errorPayload) : 'Erreur lors de la soumission.')
        setLoading(false)
        return
      }
      setShowModal(false)
      setForm(createInitialForm(user))
      fetchConges()
    } catch {
      setError('Erreur reseau.')
    }
    setLoading(false)
  }

  const headers = isRH
    ? ['Email', 'Nom', 'Prenom', 'Matricule', 'Site', 'Type', 'Debut', 'Fin', 'Jours', 'Motif', 'Statut Manager', 'Commentaire Manager', 'Solde Avant', 'Solde Accorde', 'Solde Apres', 'Statut RH', 'Commentaire RH', 'Date']
    : isManager
      ? ['Email', 'Nom', 'Prenom', 'Matricule', 'Site', 'Type', 'Debut', 'Fin', 'Jours', 'Motif', 'Statut Manager', 'Commentaire Manager', 'Solde Avant', 'Solde Accorde', 'Solde Apres', 'Statut RH', 'Commentaire RH', 'Date']
      : ['Nom', 'Prenom', 'Matricule', 'Site', 'Type', 'Debut', 'Fin', 'Jours', 'Motif', 'Statut Mgr', 'Comm. Mgr', 'Solde Initial', 'Solde Accorde', 'Solde Restant', 'Statut RH', 'Comm. RH', 'Date']

  const rows = conges.map((item) => {
    const managerRejected = item.statut_manager === 'rejete'
    const rhDisabled = item.statut_manager !== 'valide'

    if (isRH) {
      return {
        key: item.id,
        className: item.statut_rh === 'en_attente' ? 'is-pending' : '',
        cells: [
          { content: <span className="cell-email">{item.userEmail || '—'}</span> },
          { content: <span className="cell-strong">{item.nom}</span> },
          { content: item.prenom },
          { content: <span className="cell-muted">{item.matricule}</span> },
          { content: item.site },
          { content: item.type_absence },
          { content: <span className="cell-muted">{formatDate(item.date_debut)}</span> },
          { content: <span className="cell-muted">{formatDate(item.date_fin)}</span> },
          { content: <span className="cell-count">{item.nombre_jours}</span> },
          { content: <span className="cell-wrap">{item.motif || '—'}</span> },
          { content: renderStatusBadge(item.statut_manager) },
          { content: item.commentaire_manager || <span className="comment-editor__placeholder">—</span> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <EditableNumberCell value={item.solde_avant} onSave={(value) => updateRequest(item.id, { solde_avant: value })} /> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <EditableNumberCell value={item.solde_accorde} onSave={(value) => updateRequest(item.id, { solde_accorde: value })} /> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <EditableNumberCell value={item.solde_apres} onSave={(value) => updateRequest(item.id, { solde_apres: value })} /> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <StatusSelect value={item.statut_rh} options={STATUS_OPTIONS} toneByValue={getStatusTone} onChange={(value) => updateRequest(item.id, { statut_rh: value })} /> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <CommentEditor value={item.commentaire_rh} onSave={(value) => updateRequest(item.id, { commentaire_rh: value })} /> },
          { content: <span className="cell-muted">{formatDate(item.date)}</span> },
        ],
      }
    }

    if (isManager) {
      return {
        key: item.id,
        className: item.statut_manager === 'en_attente' ? 'is-pending' : '',
        cells: [
          { content: <span className="cell-email">{item.userEmail || '—'}</span> },
          { content: <span className="cell-strong">{item.nom}</span> },
          { content: item.prenom },
          { content: <span className="cell-muted">{item.matricule}</span> },
          { content: item.site },
          { content: item.type_absence },
          { content: <span className="cell-muted">{formatDate(item.date_debut)}</span> },
          { content: <span className="cell-muted">{formatDate(item.date_fin)}</span> },
          { content: <span className="cell-count">{item.nombre_jours}</span> },
          { content: item.motif },
          { content: <StatusSelect value={item.statut_manager} options={STATUS_OPTIONS} toneByValue={getStatusTone} onChange={(value) => updateRequest(item.id, { statut_manager: value })} /> },
          { content: <CommentEditor value={item.commentaire_manager} onSave={(value) => updateRequest(item.id, { commentaire_manager: value })} /> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <span className="cell-accent">{item.solde_avant ?? '—'}</span> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <span className="cell-accent cell-accent--orange">{item.solde_accorde ?? '—'}</span> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <span className="cell-accent cell-accent--green">{item.solde_apres ?? '—'}</span> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : renderStatusBadge(item.statut_rh) },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : item.commentaire_rh ? <span className="cell-note">{item.commentaire_rh}</span> : <span className="comment-editor__placeholder">—</span> },
          { content: <span className="cell-muted">{formatDate(item.date)}</span> },
        ],
      }
    }

    return {
      key: item.id,
      className: item.statut_rh === 'en_attente' ? 'is-pending' : '',
      cells: [
        { content: <span className="cell-strong">{item.nom}</span> },
        { content: item.prenom },
        { content: <span className="cell-muted">{item.matricule}</span> },
        { content: item.site },
        { content: item.type_absence },
        { content: <span className="cell-muted">{formatDate(item.date_debut)}</span> },
        { content: <span className="cell-muted">{formatDate(item.date_fin)}</span> },
        { content: <span className="cell-count">{item.nombre_jours}</span> },
        { content: item.motif },
        { content: renderStatusBadge(item.statut_manager) },
        { content: item.commentaire_manager ? <span className="cell-note">{item.commentaire_manager}</span> : <span className="comment-editor__placeholder">—</span> },
        { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : item.solde_avant ?? '—' },
        { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : item.solde_accorde ?? '—' },
        { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : item.solde_apres ?? '—' },
        { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : renderStatusBadge(item.statut_rh) },
        { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : item.commentaire_rh ? <span className="cell-note">{item.commentaire_rh}</span> : <span className="comment-editor__placeholder">—</span> },
        { content: <span className="cell-muted">{formatDate(item.date)}</span> },
      ],
    }
  })

  const cardTitle = isRH ? 'Toutes les Demandes de Conge' : isManager ? 'Demandes de Conge a valider' : 'Mes Demandes de Conge'

  return (
    <>
      <ProcessOverview
        title="Demande de Conge"
        breadcrumb="Process Interne RH › Demande de Conge"
        metrics={isRH || isManager ? metrics : null}
        cardIcon="🌴"
        cardTitle={cardTitle}
        action={!isRH && !isManager ? (
          <Button variant="primary" onClick={openModal} icon={<Icon name="plus" size={14} />}>
            Nouvelle demande
          </Button>
        ) : null}
      >
        <DataTable
          headers={headers}
          rows={rows}
          emptyState={{
            icon: '🌴',
            title: 'Aucune demande',
            text: isRH || isManager ? 'Aucune demande de conge a valider.' : 'Cliquez sur « Nouvelle demande » pour soumettre votre premiere demande de conge.',
          }}
        />
      </ProcessOverview>

      {showModal ? (
        <FormTemplate
          title="Demande de Conge"
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
            <FormGroup label="Nom">
              <Input value={form.nom} readOnly />
            </FormGroup>
            <FormGroup label="Prenom">
              <Input value={form.prenom} readOnly />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Matricule" required>
              <Input value={form.matricule} onChange={(event) => setForm((current) => ({ ...current, matricule: event.target.value }))} placeholder="Saisissez le matricule" />
            </FormGroup>
            <FormGroup label="Site de rattachement" required>
              <Select value={form.site} onChange={(event) => setForm((current) => ({ ...current, site: event.target.value }))}>
                <option value="">Selectionner un site</option>
                {SITE_OPTIONS.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          <FormGroup label="Type d'absence" required>
            <Select value={form.type_absence} onChange={(event) => setForm((current) => ({ ...current, type_absence: event.target.value }))}>
              {ABSENCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormRow>
            <FormGroup
              label="Date de debut"
              required
              hint={form.date_debut ? <span className="field-hint">Date selectionnee : <strong>{new Date(`${form.date_debut}T00:00:00`).toLocaleDateString('fr-FR')}</strong></span> : null}
            >
              <Input type="date" min={todayString()} value={form.date_debut} onChange={(event) => setForm((current) => ({ ...current, date_debut: event.target.value }))} />
            </FormGroup>
            <FormGroup
              label="Date de fin"
              required
              hint={form.date_fin ? <span className="field-hint">Date selectionnee : <strong>{new Date(`${form.date_fin}T00:00:00`).toLocaleDateString('fr-FR')}</strong></span> : null}
            >
              <Input type="date" min={form.date_debut || todayString()} disabled={!form.date_debut} value={form.date_fin} onChange={(event) => setForm((current) => ({ ...current, date_fin: event.target.value }))} />
            </FormGroup>
          </FormRow>

          {form.date_debut && form.date_fin ? (
            <div className="days-preview">
              <span className="days-preview__value">
                {workingDays} jour{workingDays > 1 ? 's' : ''}
              </span>
            </div>
          ) : null}

          <FormGroup label="Motif">
            <Textarea rows={3} value={form.motif} onChange={(event) => setForm((current) => ({ ...current, motif: event.target.value }))} placeholder="Saisissez un motif..." />
          </FormGroup>
        </FormTemplate>
      ) : null}
    </>
  )
}

