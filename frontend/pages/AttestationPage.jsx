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
const COMPANY_OPTIONS = ['AMA Papillon', 'AMA Detergent', 'Sulfonation', 'FMCG Maroc']
const REQUEST_TYPES = ['Attestation de Travail', 'Attestation de Salaire', 'Attestation domiciliation de salaire']
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
    societe: COMPANY_OPTIONS[0],
    type_demande: REQUEST_TYPES[0],
    motif: '',
  }
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : ''
}

function getStatusTone(value) {
  return STATUS_META[value]?.tone || 'warning'
}

function renderStatusBadge(value) {
  const meta = STATUS_META[value] || STATUS_META.en_attente
  return <Badge label={meta.label} tone={meta.tone} />
}

export default function AttestationPage({ user, isValidationView = false }) {
  const isRH = user.role === 'rh' && isValidationView
  const [attestations, setAttestations] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(createInitialForm(user))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchAttestations() {
    try {
      const url = isValidationView
        ? buildApiUrl('/api/attestations/?mode=validation')
        : buildApiUrl('/api/attestations/')
      const response = await fetch(url, { headers: { Authorization: `Bearer ${user.token}` } })
      const data = await response.json()
      setAttestations(Array.isArray(data) ? data : [])
    } catch {
      setAttestations([])
    }
  }

  useEffect(() => {
    fetchAttestations()
  }, [user.token, isValidationView])

  const metrics = useMemo(() => ([
    { label: 'Total demandes', value: attestations.length, tone: 'blue' },
    { label: 'En attente', value: attestations.filter((item) => item.statut === 'en_attente').length, tone: 'orange' },
    { label: 'Validees', value: attestations.filter((item) => item.statut === 'valide').length, tone: 'green' },
    { label: 'Rejetees', value: attestations.filter((item) => item.statut === 'rejete').length, tone: 'red' },
  ]), [attestations])

  async function updateRequest(id, payload) {
    await fetch(buildApiUrl(`/api/attestations/${id}/`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(payload),
    })
    fetchAttestations()
  }

  function openModal() {
    setForm(createInitialForm(user))
    setError('')
    setShowModal(true)
  }

  async function submitForm() {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(buildApiUrl('/api/attestations/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        setError('Erreur lors de la soumission.')
        setLoading(false)
        return
      }
      setShowModal(false)
      setForm(createInitialForm(user))
      fetchAttestations()
    } catch {
      setError('Erreur reseau.')
    }
    setLoading(false)
  }

  const headers = isRH
    ? ['Email', 'Nom', 'Prenom', 'Matricule', 'Site', 'Societe', 'Type', 'Motif', 'Statut', 'Commentaire', 'Date']
    : ['Nom', 'Prenom', 'Matricule', 'Site', 'Societe', 'Type', 'Motif', 'Statut', 'Commentaire RH', 'Date']

  const rows = attestations.map((item) => ({
    key: item.id,
    className: item.statut === 'en_attente' ? 'is-pending' : '',
    cells: isRH
      ? [
          { content: <span className="cell-email">{item.userEmail || '—'}</span> },
          { content: <span className="cell-strong">{item.nom}</span> },
          { content: item.prenom },
          { content: <span className="cell-muted">{item.matricule}</span> },
          { content: item.site },
          { content: item.societe },
          { content: item.type_demande },
          { content: item.motif },
          { content: <StatusSelect value={item.statut} options={STATUS_OPTIONS} toneByValue={getStatusTone} onChange={(value) => updateRequest(item.id, { statut: value })} /> },
          { content: <CommentEditor value={item.commentaire} onSave={(value) => updateRequest(item.id, { commentaire: value })} /> },
          { content: <span className="cell-muted">{formatDate(item.date)}</span> },
        ]
      : [
          { content: <span className="cell-strong">{item.nom}</span> },
          { content: item.prenom },
          { content: item.matricule },
          { content: item.site },
          { content: item.societe },
          { content: item.type_demande },
          { content: item.motif },
          { content: renderStatusBadge(item.statut) },
          { content: item.commentaire ? <span className="cell-note">{item.commentaire}</span> : <span className="comment-editor__placeholder">—</span> },
          { content: <span className="cell-muted">{formatDate(item.date)}</span> },
        ],
  }))

  return (
    <>
      <ProcessOverview
        title="Demande d'attestations"
        breadcrumb="Process Interne RH › Demande d'attestations"
        metrics={isRH ? metrics : null}
        cardIcon="📄"
        cardTitle={isRH ? "Toutes les Demandes d'attestations" : "Mes Demandes d'attestations"}
        action={!isRH ? (
          <Button variant="primary" onClick={openModal} icon={<Icon name="plus" size={14} />}>
            Nouvelle demande
          </Button>
        ) : null}
      >
        <DataTable
          headers={headers}
          rows={rows}
          emptyState={{
            icon: '📄',
            title: 'Aucune demande',
            text: isRH ? "Aucune demande d'attestation n'a ete soumise." : "Cliquez sur « Nouvelle demande » pour soumettre votre premiere demande d'attestation.",
          }}
        />
      </ProcessOverview>

      {showModal ? (
        <FormTemplate
          title="Demande d'Attestation"
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

          <FormRow>
            <FormGroup label="Societe" required>
              <Select value={form.societe} onChange={(event) => setForm((current) => ({ ...current, societe: event.target.value }))}>
                {COMPANY_OPTIONS.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="Type de demande" required>
              <Select value={form.type_demande} onChange={(event) => setForm((current) => ({ ...current, type_demande: event.target.value }))}>
                {REQUEST_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          <FormGroup label="Motif">
            <Textarea value={form.motif} onChange={(event) => setForm((current) => ({ ...current, motif: event.target.value }))} />
          </FormGroup>
        </FormTemplate>
      ) : null}
    </>
  )
}

