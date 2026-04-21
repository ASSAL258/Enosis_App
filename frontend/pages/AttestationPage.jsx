import { useEffect, useMemo, useState } from 'react'
import { buildApiUrl } from '../config/api.js'
import Badge from '../atoms/Badge.jsx'
import Button from '../atoms/Button.jsx'
import Icon from '../atoms/Icon.jsx'
import Input from '../atoms/Input.jsx'
import Select from '../atoms/Select.jsx'
import Textarea from '../atoms/Textarea.jsx'
import AlertMessage from '../molecules/AlertMessage.jsx'
import FormGroup from '../molecules/FormGroup.jsx'
import FormRow from '../molecules/FormRow.jsx'
import DataTable from '../organisms/DataTable.jsx'
import ProcessOverview from '../organisms/ProcessOverview.jsx'
import FormTemplate from '../templates/FormTemplate.jsx'

const TYPE_OPTIONS = [
  { value: 1, label: 'Attestation de Travail' },
  { value: 2, label: 'Attestation de Salaire' },
  { value: 3, label: 'Attestation domiciliation de salaire' },
]

const COMPANY_OPTIONS = [
  { value: 1, label: 'AMA Papillon' },
  { value: 2, label: 'AMA Detergent' },
  { value: 3, label: 'Sulfonation' },
  { value: 4, label: 'FMCG Maroc' },
]

const STATUS_META = {
  pending: { label: 'En attente', tone: 'warning' },
  approved: { label: 'Approuvee', tone: 'success' },
  rejected: { label: 'Rejetee', tone: 'danger' },
}

function createInitialForm(user) {
  return {
    user_id: user.id || user.user_id || '',
    type_demande: 1,
    societe: 1,
    motif: '',
  }
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '-'
}

function getStatusBadge(status) {
  const meta = STATUS_META[status] || STATUS_META.pending
  return <Badge label={meta.label} tone={meta.tone} />
}

export default function AttestationPage({ user, isValidationView = false }) {
  const canCreate = user.role !== 'courier'
  const isRH = user.role === 'rh' && isValidationView
  const [attestations, setAttestations] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(createInitialForm(user))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchAttestations() {
    try {
      const query = !isRH && (user.id || user.user_id) ? `?user_id=${user.id || user.user_id}` : ''
      const response = await fetch(buildApiUrl(`/api/attestations/${query}`), {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      const data = await response.json()
      setAttestations(Array.isArray(data) ? data : [])
    } catch {
      setAttestations([])
    }
  }

  useEffect(() => {
    fetchAttestations()
  }, [user.token, user.id, user.user_id, isValidationView, isRH])

  useEffect(() => {
    if (showModal) {
      setForm(createInitialForm(user))
    }
  }, [showModal, user])

  const metrics = useMemo(
    () => [
      { label: 'Total demandes', value: attestations.length, tone: 'blue' },
      { label: 'En attente', value: attestations.filter((item) => item.status === 'pending').length, tone: 'orange' },
      { label: 'Approuvees', value: attestations.filter((item) => item.status === 'approved').length, tone: 'green' },
      { label: 'Rejetees', value: attestations.filter((item) => item.status === 'rejected').length, tone: 'red' },
    ],
    [attestations],
  )

  async function updateStatus(id, status) {
    await fetch(buildApiUrl(`/api/attestations/${id}/update-status/`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ status }),
    })
    fetchAttestations()
  }

  async function submitForm() {
    setError('')
    if (!form.user_id) {
      setError("L'identifiant utilisateur est requis.")
      return
    }
    setLoading(true)
    try {
      const response = await fetch(buildApiUrl('/api/attestations/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          user_id: form.user_id,
          type_demande: Number(form.type_demande),
          societe: Number(form.societe),
          motif: form.motif,
        }),
      })

      if (!response.ok) {
        const details = await response.json().catch(() => null)
        setError(details?.detail || 'Erreur lors de la soumission.')
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
    ? ['User UUID', 'Type', 'Societe', 'Motif', 'Statut', 'Feedback RH', 'Creee le', 'Actions']
    : ['Type', 'Societe', 'Motif', 'Statut', 'Feedback RH', 'Creee le']

  const rows = attestations.map((item) => ({
    key: item.id,
    className: item.status === 'pending' ? 'is-pending' : '',
    cells: isRH
      ? [
          { content: <span className="cell-email">{item.user_id}</span> },
          { content: item.type_demande_display },
          { content: item.societe_display },
          { content: item.motif || '-' },
          { content: getStatusBadge(item.status) },
          { content: item.feedback_rh_id || '-' },
          { content: <span className="cell-muted">{formatDate(item.created_at)}</span> },
          {
            content: (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={() => updateStatus(item.id, 'approved')}>
                  Valider
                </Button>
                <Button variant="secondary" onClick={() => updateStatus(item.id, 'rejected')}>
                  Rejeter
                </Button>
              </div>
            ),
          },
        ]
      : [
          { content: item.type_demande_display },
          { content: item.societe_display },
          { content: item.motif || '-' },
          { content: getStatusBadge(item.status) },
          { content: item.feedback_rh_id || '-' },
          { content: <span className="cell-muted">{formatDate(item.created_at)}</span> },
        ],
  }))

  return (
    <>
      <ProcessOverview
        title="Demande d'attestations"
        breadcrumb="Process Interne RH > Demande d'attestations"
        metrics={isRH ? metrics : null}
        cardIcon="file"
        cardTitle={isRH ? 'Toutes les demandes d attestations' : 'Mes demandes d attestations'}
        action={
          canCreate && !isRH ? (
            <Button variant="primary" onClick={() => setShowModal(true)} icon={<Icon name="plus" size={14} />}>
              Nouvelle demande
            </Button>
          ) : null
        }
      >
        <DataTable
          headers={headers}
          rows={rows}
          emptyState={{
            icon: 'file',
            title: 'Aucune demande',
            text: isRH
              ? "Aucune demande d'attestation n'a ete soumise."
              : 'Cliquez sur Nouvelle demande pour soumettre votre premiere demande d attestation.',
          }}
        />
      </ProcessOverview>

      {showModal ? (
        <FormTemplate
          title="Demande d Attestation"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={submitForm} disabled={loading} icon={<Icon name="check" size={14} />}>
                {loading ? 'Envoi...' : 'Soumettre la demande'}
              </Button>
            </>
          }
        >
          <AlertMessage message={error} />

          <FormRow>
            <FormGroup label="User UUID" required>
              <Input
                value={form.user_id}
                onChange={(event) => setForm((current) => ({ ...current, user_id: event.target.value }))}
                placeholder="UUID de l utilisateur"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Type de demande" required>
              <Select value={form.type_demande} onChange={(event) => setForm((current) => ({ ...current, type_demande: event.target.value }))}>
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="Societe" required>
              <Select value={form.societe} onChange={(event) => setForm((current) => ({ ...current, societe: event.target.value }))}>
                {COMPANY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          <FormGroup label="Motif" required>
            <Textarea
              value={form.motif}
              onChange={(event) => setForm((current) => ({ ...current, motif: event.target.value }))}
              placeholder="Saisissez un motif..."
            />
          </FormGroup>
        </FormTemplate>
      ) : null}
    </>
  )
}
