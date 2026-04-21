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

function createInitialForm(user, selectedUser = 'pour_moi') {
  return {
    nom: user.last || '',
    prenom: user.first || '',
    matricule: user.matricule || '',
    user_id: user.id || user.user_id || '',
    motif: '',
    montante: '',
    duree_de_remboursement: '1',
  }
}

function formatCurrency(value) {
  return `${Number(value).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '—'
}

function renderFeedbackBadge(value) {
  return value
    ? <Badge label="Traitee" tone="success" />
    : <Badge label="En attente" tone="warning" />
}

export default function AvancePage({ user, isValidationView = false }) {
  const isRH = user.role === 'rh' && isValidationView
  const [avances, setAvances] = useState([])
  const [usersById, setUsersById] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(createInitialForm(user))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchAvances() {
    try {
      const response = await fetch(buildApiUrl('/api/avances/'), {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      const data = await response.json()
      setAvances(Array.isArray(data) ? data : [])
    } catch {
      setAvances([])
    }
  }

  useEffect(() => {
    fetchAvances()
  }, [user.token])

  useEffect(() => {
    const uniqueUserIds = [...new Set(avances.map((item) => item.user_id).filter(Boolean))]
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
  }, [avances, user.token, usersById])

  useEffect(() => {
    if (showModal) {
      setForm(createInitialForm(user))
    }
  }, [showModal, user])

  const metrics = useMemo(() => {
    const processedCount = avances.filter((item) => item.feedback_rh_id).length
    return [
      { label: 'Total avances', value: avances.length, tone: 'blue' },
      { label: 'Traitees', value: processedCount, tone: 'green' },
      { label: 'En attente', value: avances.length - processedCount, tone: 'orange' },
      { label: 'Mesures RH', value: isRH ? processedCount : 0, tone: 'purple' },
    ]
  }, [avances, isRH])

  function openModal() {
    setForm(createInitialForm(user))
    setError('')
    setShowModal(true)
  }

  async function submitForm() {
    setError('')

    if (!form.montante || Number.isNaN(Number(form.montante)) || Number(form.montante) <= 0) {
      setError('Veuillez saisir un montant valide.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        motif: form.motif,
        montante: Number(form.montante),
        duree_de_remboursement: Number(form.duree_de_remboursement),
      }

      if (form.user_id) {
        payload.user_id = form.user_id
      }

      const response = await fetch(buildApiUrl('/api/avances/create/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        setError(errorPayload?.detail || 'Erreur lors de la soumission.')
        setLoading(false)
        return
      }

      setShowModal(false)
      setForm(createInitialForm(user, 'pour_moi'))
      fetchAvances()
    } catch {
      setError('Erreur reseau.')
    }

    setLoading(false)
  }

  const headers = ['Nom', 'Prenom', 'Matricule', 'Motif', 'Montant', 'Duree', 'Statut RH', 'Comm. RH', 'Date de creation']

  const rows = avances.map((item) => ({
    key: item.id,
    className: item.feedback_rh_id ? 'is-complete' : 'is-pending',
    cells: [
      { content: <span className="cell-strong">{usersById[item.user_id]?.last_name || user.last || <span className="comment-editor__placeholder">—</span>}</span> },
      { content: usersById[item.user_id]?.first_name || user.first || <span className="comment-editor__placeholder">—</span> },
      { content: <span className="cell-muted">{usersById[item.user_id]?.matricule || user.matricule || <span className="comment-editor__placeholder">—</span>}</span> },
      { content: <span className="cell-strong">{item.motif || <span className="comment-editor__placeholder">Saisissez un motif...</span>}</span> },
      { content: <span className="cell-money">{item.montante ? formatCurrency(item.montante) : <span className="comment-editor__placeholder">Saisissez un montant...</span>}</span> },
      { content: `${item.duree_de_remboursement} mois` },
      { content: renderFeedbackBadge(item.feedback_rh_id) },
      { content: item.feedback_rh_id ? <span className="cell-note">—</span> : <span className="comment-editor__placeholder">—</span> },
      { content: <span className="cell-muted">{formatDate(item.created_at)}</span> },
    ],
  }))

  return (
    <>
      <ProcessOverview
        title={isRH ? 'Gestion des Avances sur Salaire' : 'Avance sur Salaire'}
        breadcrumb={isRH ? 'Process Interne RH › Avance sur Salaire › Vue RH' : 'Process Interne RH › Avance sur Salaire'}
        metrics={metrics}
        cardIcon="📋"
        cardTitle={isRH ? 'Toutes les avances sur salaire' : 'Mes avances sur salaire'}
        action={(
          <Button variant="primary" onClick={openModal} icon={<Icon name="plus" size={14} />}>
            Nouvelle avance
          </Button>
        )}
      >
        <DataTable
          headers={headers}
          rows={rows}
          emptyState={{
            icon: '📄',
            title: 'Aucune avance',
            text: 'Cliquez sur « Nouvelle avance » pour soumettre votre premiere demande.',
          }}
        />
      </ProcessOverview>

      {showModal ? (
        <FormTemplate
          title="Demande d'Avance sur Salaire"
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
            <FormGroup label="Matricule" required>
              <Input value={form.matricule} readOnly />
            </FormGroup>
          </FormRow>

          <FormGroup label="Montant demande (DH)" required>
            <Input
              type="number"
              min="0"
              value={form.montante}
              onChange={(event) => setForm((current) => ({ ...current, montante: event.target.value }))}
            />
          </FormGroup>

          <FormRow>
            <FormGroup label="Duree de remboursement" required>
              <Select
                value={form.duree_de_remboursement}
                onChange={(event) => setForm((current) => ({ ...current, duree_de_remboursement: event.target.value }))}
              >
                <option value="1">1 mois</option>
                <option value="2">2 mois</option>
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

