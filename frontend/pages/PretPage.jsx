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

function createInitialForm(user, selectedUser = 'pour_moi') {
  const isForOther = selectedUser === 'pour_autre'
  return {
    nom: isForOther ? '' : user.last,
    prenom: isForOther ? '' : user.first,
    matricule: isForOther ? '' : (user.matricule || ''),
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
  const [selectedUser, setSelectedUser] = useState('pour_moi')
  const [form, setForm] = useState(createInitialForm(user, selectedUser))
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

  useEffect(() => {
    if (showModal) {
      setForm(createInitialForm(user, selectedUser))
    }
  }, [selectedUser, showModal])

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
    setSelectedUser('pour_moi')
    setForm(createInitialForm(user, 'pour_moi'))
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
          nom: form.nom,
          prenom: form.prenom,
          matricule: form.matricule,
          fonction: form.fonction,
          montant: parseFloat(form.montant),
          duree: parseInt(form.duree, 10),
          motif: form.motif,
          user_email: user.email,
        }),
      })
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        setError(errorPayload ? JSON.stringify(errorPayload) : 'Erreur lors de la soumission.')
        setLoading(false)
        return
      }
      setShowModal(false)
      setForm(createInitialForm(user, 'pour_moi'))
      fetchPrets()
    } catch {
      setError('Erreur reseau.')
    }
    setLoading(false)
  }

  const headers = ['Email', 'Nom', 'Prenom', 'Matricule', 'Fonction', 'Montant demande', 'Duree', 'Motif', 'Statut Manager', 'Commentaire Manager', 'Statut Rh', 'Commentaire Rh', 'Date Demande']
  const employeeHeaders = ['Nom', 'Prenom', 'Matricule', 'Fonction', 'Montant demande', 'Duree', 'Motif', 'Statut Manager', 'Commentaire Manager', 'Statut Rh', 'Commentaire Rh', 'Date Demande']

  const rows = prets.map((item) => {
    const rhDisabled = item.statut_manager !== 'valide'
    const managerRejected = item.statut_manager === 'rejete'

    if (isRH) {
      return {
        key: item.id,
        className: item.statut_rh === 'en_attente' ? 'is-pending' : '',
        cells: [
          { content: <span className="cell-email">{item.userEmail || '—'}</span> },
          { content: <span className="cell-strong">{item.nom || <span className="comment-editor__placeholder">Saisissez un nom...</span>}</span> },
          { content: item.prenom || <span className="comment-editor__placeholder">Saisissez un prenom...</span> },
          { content: <span className="cell-muted">{item.matricule || <span className="comment-editor__placeholder">Saisissez le matricule...</span>}</span> },
          { content: item.fonction || <span className="comment-editor__placeholder">Saisissez une fonction...</span> },
          { content: <span className="cell-money">{item.montant ? item.montant + ' DH' : <span className="comment-editor__placeholder">Saisissez un montant...</span>}</span> },
          { content: `${item.duree} mois` },
          { content: item.motif || <span className="comment-editor__placeholder">Saisissez un motif...</span> },
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
          { content: <span className="cell-strong">{item.nom || <span className="comment-editor__placeholder">Saisissez un nom...</span>}</span> },
          { content: item.prenom || <span className="comment-editor__placeholder">Saisissez un prenom...</span> },
          { content: <span className="cell-muted">{item.matricule || <span className="comment-editor__placeholder">Saisissez le matricule...</span>}</span> },
          { content: item.fonction || <span className="comment-editor__placeholder">Saisissez une fonction...</span> },
          { content: <span className="cell-money">{item.montant ? item.montant + ' DH' : <span className="comment-editor__placeholder">Saisissez un montant...</span>}</span> },
          { content: `${item.duree} mois` },
          { content: item.motif || <span className="comment-editor__placeholder">Saisissez un motif...</span> },
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
        { content: <span className="cell-strong">{item.nom || <span className="comment-editor__placeholder">Saisissez un nom...</span>}</span> },
        { content: item.prenom },
        { content: <span className="cell-muted">{item.matricule}</span> },
        { content: item.fonction },
        { content: <span className="cell-money">{item.montant} DH</span> },
        { content: `${item.duree} mois` },
        { content: item.motif || <span className="comment-editor__placeholder">Saisissez un motif...</span> },
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
              <Input value={form.matricule} readOnly={selectedUser === 'pour_moi'} onChange={(event) => selectedUser === 'pour_autre' && setForm((current) => ({ ...current, matricule: event.target.value }))} placeholder="Saisissez le matricule" />
            </FormGroup>
            <FormGroup label="Fonction" required>
              <Input type="text" value={form.fonction} onChange={(event) => setForm((current) => ({ ...current, fonction: event.target.value }))} />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Montant demande (DH)" required>
              <Input type="number" min="1" step="100" value={form.montant} onChange={(event) => setForm((current) => ({ ...current, montant: event.target.value }))} />
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

