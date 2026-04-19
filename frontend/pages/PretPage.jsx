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
import FormGroup from '../molecules/FormGroup.jsx'
import FormRow from '../molecules/FormRow.jsx'
import StatusSelect from '../molecules/StatusSelect.jsx'
import DataTable from '../organisms/DataTable.jsx'
import ProcessOverview from '../organisms/ProcessOverview.jsx'
import FormTemplate from '../templates/FormTemplate.jsx'

const SITE_OPTIONS = ['Casablanca', 'Jorf Lasfar']
const DURATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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
    fonction: '',
    montant: '',
    duree: 1,
    motif: '',
  }
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

export default function PretPage({ user, isValidationView = false }) {
  const isRH = user.role === 'rh' && isValidationView
  const isManager = user.role === 'manager' && isValidationView
  const [prets, setPrets] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(createInitialForm(user))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchPrets() {
    try {
      const url = isValidationView ? buildApiUrl('/api/prets/?mode=validation') : buildApiUrl('/api/prets/')
      const response = await fetch(url, { headers: { Authorization: `Bearer ${user.token}` } })
      const data = await response.json()
      setPrets(Array.isArray(data) ? data : [])
    } catch {
      setPrets([])
    }
  }

  useEffect(() => {
    fetchPrets()
  }, [user.token, isValidationView])

  const metrics = useMemo(() => {
    const statusField = isRH ? 'statut_rh' : 'statut_manager'
    return [
      { label: 'Total demandes', value: prets.length, tone: 'blue' },
      { label: 'En attente', value: prets.filter((item) => item[statusField] === 'en_attente').length, tone: 'orange' },
      { label: 'Validees', value: prets.filter((item) => item[statusField] === 'valide').length, tone: 'green' },
      { label: 'Rejetees', value: prets.filter((item) => item[statusField] === 'rejete').length, tone: 'red' },
    ]
  }, [prets, isRH])

  async function updateRequest(id, payload) {
    await fetch(buildApiUrl(`/api/prets/${id}/`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(payload),
    })
    fetchPrets()
  }

  function openModal() {
    setForm(createInitialForm(user))
    setError('')
    setShowModal(true)
  }

  async function submitForm() {
    setError('')
    if (!form.fonction || !form.montant || !form.duree) {
      setError('Veuillez remplir la fonction, le montant et la duree.')
      return
    }
    if (Number(form.montant) <= 0) {
      setError('Le montant doit etre superieur a zero.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(buildApiUrl('/api/prets/'), {
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
          fonction: form.fonction,
          montant: parseFloat(form.montant),
          duree: parseInt(form.duree, 10),
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
      fetchPrets()
    } catch {
      setError('Erreur reseau.')
    }
    setLoading(false)
  }

  const headers = ['Email', 'Nom', 'Prenom', 'Matricule', 'Site', 'Fonction', 'Montant', 'Duree', 'Motif', 'Statut Manager', 'Commentaire Manager', 'Statut RH', 'Commentaire RH', 'Date Demande']
  const employeeHeaders = ['Nom', 'Prenom', 'Matricule', 'Site', 'Fonction', 'Montant', 'Duree', 'Motif', 'Statut Mgr', 'Comm. Mgr', 'Statut RH', 'Comm. RH', 'Date Demande']

  const rows = prets.map((item) => {
    const rhDisabled = item.statut_manager !== 'valide'
    const managerRejected = item.statut_manager === 'rejete'

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
          { content: item.fonction },
          { content: <span className="cell-money">{item.montant} DH</span> },
          { content: `${item.duree} mois` },
          { content: item.motif || <span className="comment-editor__placeholder">—</span> },
          { content: renderStatusBadge(item.statut_manager) },
          { content: item.commentaire_manager ? <span className="cell-note">{item.commentaire_manager}</span> : <span className="comment-editor__placeholder">—</span> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <StatusSelect value={item.statut_rh} options={STATUS_OPTIONS} toneByValue={getStatusTone} disabled={rhDisabled} onChange={(value) => updateRequest(item.id, { statut_rh: value })} /> },
          { content: managerRejected ? <span className="comment-editor__placeholder">—</span> : <CommentEditor value={item.commentaire_rh} disabled={rhDisabled} onSave={(value) => updateRequest(item.id, { commentaire_rh: value })} /> },
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
          { content: item.fonction },
          { content: <span className="cell-money">{item.montant} DH</span> },
          { content: `${item.duree} mois` },
          { content: item.motif || <span className="comment-editor__placeholder">—</span> },
          { content: <StatusSelect value={item.statut_manager} options={STATUS_OPTIONS} toneByValue={getStatusTone} onChange={(value) => updateRequest(item.id, { statut_manager: value })} /> },
          { content: <CommentEditor value={item.commentaire_manager} onSave={(value) => updateRequest(item.id, { commentaire_manager: value })} /> },
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
        { content: item.fonction },
        { content: <span className="cell-money">{item.montant} DH</span> },
        { content: `${item.duree} mois` },
        { content: item.motif || <span className="comment-editor__placeholder">—</span> },
        { content: renderStatusBadge(item.statut_manager) },
        { content: item.commentaire_manager ? <span className="cell-note">{item.commentaire_manager}</span> : <span className="comment-editor__placeholder">—</span> },
        { content: renderStatusBadge(item.statut_rh) },
        { content: item.commentaire_rh ? <span className="cell-note">{item.commentaire_rh}</span> : <span className="comment-editor__placeholder">—</span> },
        { content: <span className="cell-muted">{formatDate(item.date)}</span> },
      ],
    }
  })

  const cardTitle = isRH ? 'Toutes les Demandes de Pret' : isManager ? 'Demandes de Pret a valider' : 'Mes Demandes de Pret'

  return (
    <>
      <ProcessOverview
        title="Demande de Pret"
        breadcrumb="Process Interne RH › Demande de Pret"
        metrics={isRH || isManager ? metrics : null}
        cardIcon="💰"
        cardTitle={cardTitle}
        action={!isRH && !isManager ? (
          <Button variant="primary" onClick={openModal} icon={<Icon name="plus" size={14} />}>
            Nouvelle demande
          </Button>
        ) : null}
      >
        <DataTable
          headers={isRH || isManager ? headers : employeeHeaders}
          rows={rows}
          emptyState={{
            icon: '💰',
            title: 'Aucune demande',
            text: isRH || isManager ? 'Aucune demande de pret a traiter.' : 'Cliquez sur « Nouvelle demande » pour soumettre un dossier.',
          }}
        />
      </ProcessOverview>

      {showModal ? (
        <FormTemplate
          title="Demande de Pret"
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

          <FormGroup label="Fonction" required>
            <Input type="text" value={form.fonction} onChange={(event) => setForm((current) => ({ ...current, fonction: event.target.value }))} placeholder="Ex: Developpeur full-stack" />
          </FormGroup>

          <FormRow>
            <FormGroup label="Montant demande (DH)" required>
              <Input type="number" min="1" step="100" value={form.montant} onChange={(event) => setForm((current) => ({ ...current, montant: event.target.value }))} placeholder="Ex: 5000" />
            </FormGroup>
            <FormGroup label="Duree souhaitee (mois)" required>
              <Select value={form.duree} onChange={(event) => setForm((current) => ({ ...current, duree: event.target.value }))}>
                {DURATIONS.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} mois
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          <FormGroup label="Motif">
            <Textarea rows={3} value={form.motif} onChange={(event) => setForm((current) => ({ ...current, motif: event.target.value }))} placeholder="Saisissez un motif..." />
          </FormGroup>
        </FormTemplate>
      ) : null}
    </>
  )
}

