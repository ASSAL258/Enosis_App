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
    montant: '',
    duree: '1',
    motif: '',
  }
}

function formatCurrency(value) {
  return `${Number(value).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH`
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

export default function AvancePage({ user, isValidationView = false }) {
  const isRH = user.role === 'rh' && isValidationView
  const [demandes, setDemandes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState('pour_moi')
  const [form, setForm] = useState(createInitialForm(user, selectedUser))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchDemandes() {
    try {
      const url = isValidationView
        ? buildApiUrl('/api/demandes/?mode=validation')
        : buildApiUrl('/api/demandes/')

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      const data = await response.json()
      setDemandes(Array.isArray(data) ? data : [])
    } catch {
      setDemandes([])
    }
  }

  useEffect(() => {
    fetchDemandes()
  }, [user.token, isValidationView])

  useEffect(() => {
    if (showModal) {
      setForm(createInitialForm(user, selectedUser))
    }
  }, [selectedUser, showModal])

  const metrics = useMemo(() => ([
    { label: 'Total demandes', value: demandes.length, tone: 'blue' },
    { label: 'En attente', value: demandes.filter((item) => item.statut === 'en_attente').length, tone: 'orange' },
    { label: 'Validees', value: demandes.filter((item) => item.statut === 'valide').length, tone: 'green' },
    { label: 'Rejetees', value: demandes.filter((item) => item.statut === 'rejete').length, tone: 'red' },
  ]), [demandes])

  async function updateRequest(id, payload) {
    await fetch(buildApiUrl(`/api/demandes/${id}/`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(payload),
    })
    fetchDemandes()
  }

  function openModal() {
    setSelectedUser('pour_moi')
    setForm(createInitialForm(user, 'pour_moi'))
    setError('')
    setShowModal(true)
  }

  async function submitForm() {
    setError('')

    if (!form.montant || Number.isNaN(Number(form.montant)) || Number(form.montant) <= 0) {
      setError('Veuillez saisir un montant valide.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(buildApiUrl('/api/demandes/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...form,
          montant: Number(form.montant),
          duree: Number(form.duree),
          user_email: user.email,
        }),
      })

      if (!response.ok) {
        setError('Erreur lors de la soumission.')
        setLoading(false)
        return
      }

      setShowModal(false)
      setForm(createInitialForm(user))
      fetchDemandes()
    } catch {
      setError('Erreur reseau.')
    }

    setLoading(false)
  }

  const headers = isRH
    ? ['Email', 'Nom', 'Prenom', 'Matricule', 'Montant demande', 'Duree', 'Motif', 'Statut Rh', 'Commentaires Rh', 'Date']
    : ['Nom', 'Prenom', 'Matricule', 'Montant demande', 'Duree de remboursement', 'Motif', 'Statut Rh', 'Commentaires Rh', 'Date']

  const rows = demandes.map((item) => ({
    key: item.id,
    className: item.statut === 'en_attente' ? 'is-pending' : '',
    cells: isRH
      ? [
          { content: <span className="cell-email">{item.userEmail || '—'}</span> },
          { content: <span className="cell-strong">{item.nom || <span className="comment-editor__placeholder">Saisissez un nom...</span>}</span> },
          { content: item.prenom || <span className="comment-editor__placeholder">Saisissez un prenom...</span> },
          { content: <span className="cell-muted">{item.matricule || <span className="comment-editor__placeholder">Saisissez le matricule...</span>}</span> },
          { content: <span className="cell-money">{item.montant ? formatCurrency(item.montant) : <span className="comment-editor__placeholder">Saisissez un montant...</span>}</span> },
          { content: `${item.duree} mois` },
          { content: item.motif ? item.motif : <span className="comment-editor__placeholder">Saisissez un motif...</span> },
          {
            content: (
              <StatusSelect
                value={item.statut}
                options={STATUS_OPTIONS}
                toneByValue={getStatusTone}
                onChange={(value) => updateRequest(item.id, { statut: value })}
              />
            ),
          },
          {
            content: (
              <CommentEditor
                value={item.commentaire}
                onSave={(value) => updateRequest(item.id, { commentaire: value })}
              />
            ),
          },
          { content: <span className="cell-muted">{formatDate(item.date)}</span> },
        ]
      : [
          { content: <span className="cell-strong">{item.nom || <span className="comment-editor__placeholder">Saisissez un nom...</span>}</span> },
          { content: item.prenom || <span className="comment-editor__placeholder">Saisissez un prenom...</span> },
          { content: <span className="cell-muted">{item.matricule || <span className="comment-editor__placeholder">Saisissez le matricule...</span>}</span> },
          { content: <span className="cell-money">{item.montant ? formatCurrency(item.montant) : <span className="comment-editor__placeholder">Saisissez un montant...</span>}</span> },
          { content: `${item.duree} mois` },
          { content: item.motif ? item.motif : <span className="comment-editor__placeholder">Saisissez un motif...</span> },
          { content: renderStatusBadge(item.statut) },
          { content: item.commentaire ? <span className="cell-note">{item.commentaire}</span> : <span className="comment-editor__placeholder">—</span> },
          { content: <span className="cell-muted">{formatDate(item.date)}</span> },
        ],
  }))

  return (
    <>
      <ProcessOverview
        title={isRH ? 'Gestion des Avances sur Salaire' : 'Avance sur Salaire'}
        breadcrumb={isRH ? 'Process Interne RH › Avance sur Salaire › Vue RH' : 'Process Interne RH › Avance sur Salaire'}
        metrics={isRH ? metrics : null}
        cardIcon="📋"
        cardTitle={isRH ? "Toutes les Demandes d'Avance sur Salaire" : "Mes Demandes d'Avance sur Salaire"}
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
            text: isRH
              ? "Aucune demande d'avance sur salaire n'a ete soumise."
              : 'Cliquez sur « Nouvelle demande » pour soumettre votre premiere demande.',
          }}
        />
      </ProcessOverview>

      {showModal ? (
        <FormTemplate
          title="Demande d'Avance sur Salaire"
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
            <FormGroup label="Montant demande (DH)" required>
              <Input type="number" min="0" value={form.montant} onChange={(event) => setForm((current) => ({ ...current, montant: event.target.value }))} />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Duree de remboursement" required>
              <Select value={form.duree} onChange={(event) => setForm((current) => ({ ...current, duree: event.target.value }))}>
                <option value="1">1 mois</option>
                <option value="2">2 mois</option>
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

