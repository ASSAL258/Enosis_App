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

function createInitialForm(user, selectedUser = 'pour_moi') {
  const isForOther = selectedUser === 'pour_autre'
  return {
    nom: isForOther ? '' : user.last,
    prenom: isForOther ? '' : user.first,
    matricule: isForOther ? '' : (user.matricule || ''),
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
  const [selectedUser, setSelectedUser] = useState('pour_moi')
  const [form, setForm] = useState(createInitialForm(user, selectedUser))
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

  useEffect(() => {
    if (showModal) {
      setForm(createInitialForm(user, selectedUser))
    }
  }, [selectedUser, showModal])

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
    setSelectedUser('pour_moi')
    setForm(createInitialForm(user, 'pour_moi'))
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
        body: JSON.stringify({ ...form, user_email: user.email }),
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
    ? ['Email', 'Nom', 'Prenom', 'Matricule', 'Societe', 'Type', 'Motif', 'Statut Rh', 'Commentaires Rh', 'Date']
    : ['Nom', 'Prenom', 'Matricule', 'Societe', 'Type', 'Motif', 'Statut Rh', 'Commentaires Rh', 'Date']

  const rows = attestations.map((item) => ({
    key: item.id,
    className: item.statut === 'en_attente' ? 'is-pending' : '',
    cells: isRH
      ? [
          { content: <span className="cell-email">{item.userEmail || '—'}</span> },
          { content: <span className="cell-strong">{item.nom || <span className="comment-editor__placeholder">Saisissez un nom...</span>}</span> },
          { content: item.prenom || <span className="comment-editor__placeholder">Saisissez un prenom...</span> },
          { content: <span className="cell-muted">{item.matricule || <span className="comment-editor__placeholder">Saisissez le matricule...</span>}</span> },
          { content: item.societe },
          { content: item.type_demande },
          { content: item.motif ? item.motif : <span className="comment-editor__placeholder">Saisissez un motif...</span> },
          { content: <StatusSelect value={item.statut} options={STATUS_OPTIONS} toneByValue={getStatusTone} onChange={(value) => updateRequest(item.id, { statut: value })} /> },
          { content: <CommentEditor value={item.commentaire} onSave={(value) => updateRequest(item.id, { commentaire: value })} /> },
          { content: <span className="cell-muted">{formatDate(item.date)}</span> },
        ]
      : [
          { content: <span className="cell-strong">{item.nom || <span className="comment-editor__placeholder">Saisissez un nom...</span>}</span> },
          { content: item.prenom || <span className="comment-editor__placeholder">Saisissez un prenom...</span> },
          { content: item.matricule || <span className="comment-editor__placeholder">Saisissez le matricule...</span> },
          { content: item.societe },
          { content: item.type_demande },
          { content: item.motif ? item.motif : <span className="comment-editor__placeholder">Saisissez un motif...</span> },
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
          headerControl={
            <Select value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)} style={{ width: '200px' }}>
              <option value="pour_moi">Pour moi</option>
              <option value="pour_autre">Pour une autre personne</option>
            </Select>
          }
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
              <Input value={form.nom} readOnly={selectedUser === 'pour_moi'} onChange={(event) => selectedUser === 'pour_autre' && setForm((current) => ({ ...current, nom: event.target.value }))} />
            </FormGroup>
            <FormGroup label="Prenom" required>
              <Input value={form.prenom} readOnly={selectedUser === 'pour_moi'} onChange={(event) => selectedUser === 'pour_autre' && setForm((current) => ({ ...current, prenom: event.target.value }))} />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Matricule" required>
              <Input value={form.matricule} readOnly={selectedUser === 'pour_moi'} onChange={(event) => selectedUser === 'pour_autre' && setForm((current) => ({ ...current, matricule: event.target.value }))} />
            </FormGroup>
            <FormGroup label="Societe" required>
              <Select value={form.societe} onChange={(event) => setForm((current) => ({ ...current, societe: event.target.value }))}>
                {COMPANY_OPTIONS.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
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
            <Textarea value={form.motif} onChange={(event) => setForm((current) => ({ ...current, motif: event.target.value }))} placeholder="Saisissez un motif..." />
          </FormGroup>
        </FormTemplate>
      ) : null}
    </>
  )
}

