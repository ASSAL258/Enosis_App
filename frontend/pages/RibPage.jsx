import { useEffect, useMemo, useState } from 'react'
import { buildApiUrl } from '../config/api.js'
import Badge from '../atoms/Badge.jsx'
import Button from '../atoms/Button.jsx'
import Icon from '../atoms/Icon.jsx'
import Input from '../atoms/Input.jsx'
import Select from '../atoms/Select.jsx'
import Textarea from '../atoms/Textarea.jsx'
import ActionLink from '../molecules/ActionLink.jsx'
import AlertMessage from '../molecules/AlertMessage.jsx'
import CommentEditor from '../molecules/CommentEditor.jsx'
import FormGroup from '../molecules/FormGroup.jsx'
import FormRow from '../molecules/FormRow.jsx'
import SectionDivider from '../molecules/SectionDivider.jsx'
import StatusSelect from '../molecules/StatusSelect.jsx'
import DataTable from '../organisms/DataTable.jsx'
import ProcessOverview from '../organisms/ProcessOverview.jsx'
import FormTemplate from '../templates/FormTemplate.jsx'

const SITE_OPTIONS = ['Casablanca', 'Jorf Lasfar']
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
    nom_banque: '',
    nouvel_iban: '',
    code_bic: '',
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

export default function RibPage({ user, isValidationView = false }) {
  const isRH = user.role === 'rh' && isValidationView
  const [demandes, setDemandes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(createInitialForm(user))
  const [files, setFiles] = useState({ attestation_rib: null, main_levee: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resourceLoading, setResourceLoading] = useState({})

  async function fetchDemandes() {
    try {
      const url = isValidationView
        ? buildApiUrl('/api/changement-rib/?mode=validation')
        : buildApiUrl('/api/changement-rib/')

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

  const metrics = useMemo(() => ([
    { label: 'Total demandes', value: demandes.length, tone: 'blue' },
    { label: 'En attente', value: demandes.filter((item) => item.statut === 'en_attente').length, tone: 'orange' },
    { label: 'Validees', value: demandes.filter((item) => item.statut === 'valide').length, tone: 'green' },
    { label: 'Rejetees', value: demandes.filter((item) => item.statut === 'rejete').length, tone: 'red' },
  ]), [demandes])

  async function updateRequest(id, payload) {
    try {
      const response = await fetch(buildApiUrl(`/api/changement-rib/${id}/`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const msg = data?.detail || JSON.stringify(data) || `Erreur ${response.status}`
        alert(`Erreur lors de la mise a jour : ${msg}`)
      }
    } catch {
      alert('Erreur reseau lors de la mise a jour.')
    }
    fetchDemandes()
  }

  function openModal() {
    setForm(createInitialForm(user))
    setFiles({ attestation_rib: null, main_levee: null })
    setError('')
    setShowModal(true)
  }

  async function openResource(fileId) {
    if (!fileId) return

    setResourceLoading((current) => ({ ...current, [fileId]: true }))
    try {
      const fullUrl = buildApiUrl(`/api/files/${fileId}/`)
      const response = await fetch(fullUrl, {
        headers: { Authorization: `Bearer ${user.token}` },
      })

      if (!response.ok) {
        alert(`Erreur ${response.status} : impossible d'ouvrir le fichier.`)
        setResourceLoading((current) => ({ ...current, [fileId]: false }))
        return
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
    } catch {
      alert("Erreur reseau lors de l'ouverture du fichier.")
    }
    setResourceLoading((current) => ({ ...current, [fileId]: false }))
  }

  async function uploadFile(file, contextEntity) {
    const payload = new FormData()
    payload.append('file', file)
    payload.append('context_service', 'demande-rib-service')
    payload.append('context_entity', contextEntity)
    payload.append('context_entity_id', user.matricule || String(user.email || ''))

    const response = await fetch(buildApiUrl('/api/files/upload/'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${user.token}` },
      body: payload,
    })

    if (!response.ok) {
      throw new Error(`Echec upload ${contextEntity}`)
    }

    const fileMeta = await response.json()
    return fileMeta.id
  }

  async function submitForm() {
    setError('')

    if (!form.nom_banque || !form.nouvel_iban || !form.code_bic) {
      setError('Veuillez remplir toutes les informations bancaires.')
      return
    }
    if (!files.attestation_rib?.length) {
      setError("Veuillez selectionner l'attestation de RIB.")
      return
    }
    if (!files.main_levee?.length) {
      setError('Veuillez selectionner le fichier Main levee.')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (files.attestation_rib[0].size > maxSize || files.main_levee[0].size > maxSize) {
      setError("La taille d'un fichier ne doit pas depasser 10 Mo.")
      return
    }

    setLoading(true)
    try {
      const attestationRibFileId = await uploadFile(files.attestation_rib[0], 'attestation_rib')
      const mainLeveeFileId = await uploadFile(files.main_levee[0], 'main_levee')

      const response = await fetch(buildApiUrl('/api/changement-rib/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...form,
          attestation_rib_file_id: attestationRibFileId,
          main_levee_file_id: mainLeveeFileId,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const msg = data?.detail
          || Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
          || `Erreur ${response.status}`
        setError(`Erreur lors de la soumission : ${msg}`)
        setLoading(false)
        return
      }

      setShowModal(false)
      setForm(createInitialForm(user))
      setFiles({ attestation_rib: null, main_levee: null })
      fetchDemandes()
    } catch {
      setError('Erreur reseau.')
    }
    setLoading(false)
  }

  const headers = isRH
    ? ['Email', 'Nom', 'Prenom', 'Matricule', 'Site', 'Banque', 'IBAN', 'BIC', 'Motif', 'Attestation', 'Main levee', 'Statut', 'Commentaire', 'Date']
    : ['Nom', 'Prenom', 'Matricule', 'Site de rattachement', 'Banque', 'IBAN', 'BIC', 'Motif', 'Attestation RIB', 'Main levee', 'Statut', 'Commentaire RH', 'Date']

  const rows = demandes.map((item) => ({
    key: item.id,
    className: item.statut === 'en_attente' ? 'is-pending' : '',
    cells: isRH
      ? [
        { content: <span className="cell-email">{item.userEmail || '—'}</span> },
        { content: <span className="cell-strong">{item.nom}</span> },
        { content: item.prenom },
        { content: <span className="cell-muted">{item.matricule}</span> },
        { content: item.site },
        { content: item.nom_banque },
        { content: item.nouvel_iban },
        { content: item.code_bic },
        { content: item.motif },
        { content: <ActionLink disabled={!item.attestation_rib_file_id} loading={!!resourceLoading[item.attestation_rib_file_id]} onClick={() => openResource(item.attestation_rib_file_id)} label="PDF" disabledLabel="Non fourni" iconName="pdf" /> },
        { content: <ActionLink disabled={!item.main_levee_file_id} loading={!!resourceLoading[item.main_levee_file_id]} onClick={() => openResource(item.main_levee_file_id)} label="PDF" disabledLabel="Non fourni" iconName="pdf" /> },
        { content: <StatusSelect value={item.statut} options={STATUS_OPTIONS} toneByValue={getStatusTone} onChange={(value) => updateRequest(item.id, { statut: value })} /> },
        { content: <CommentEditor value={item.commentaire} onSave={(value) => updateRequest(item.id, { commentaire: value })} /> },
        { content: <span className="cell-muted">{formatDate(item.date)}</span> },
      ]
      : [
        { content: <span className="cell-strong">{item.nom}</span> },
        { content: item.prenom },
        { content: <span className="cell-muted">{item.matricule}</span> },
        { content: item.site },
        { content: item.nom_banque },
        { content: item.nouvel_iban },
        { content: item.code_bic },
        { content: item.motif },
        { content: <ActionLink disabled={!item.attestation_rib_file_id} loading={!!resourceLoading[item.attestation_rib_file_id]} onClick={() => openResource(item.attestation_rib_file_id)} label="PDF" disabledLabel="Non fourni" iconName="pdf" /> },
        { content: <ActionLink disabled={!item.main_levee_file_id} loading={!!resourceLoading[item.main_levee_file_id]} onClick={() => openResource(item.main_levee_file_id)} label="PDF" disabledLabel="Non fourni" iconName="pdf" /> },
        { content: renderStatusBadge(item.statut) },
        { content: item.commentaire ? <span className="cell-note">{item.commentaire}</span> : <span className="comment-editor__placeholder">—</span> },
        { content: <span className="cell-muted">{formatDate(item.date)}</span> },
      ],
  }))

  return (
    <>
      <ProcessOverview
        title={isRH ? 'Gestion des Changements de RIB' : 'Changement de RIB'}
        breadcrumb={isRH ? 'Process Interne RH › Changement de RIB › Vue RH' : 'Process Interne RH › Changement de RIB'}
        metrics={isRH ? metrics : null}
        cardIcon="💳"
        cardTitle={isRH ? 'Toutes les Demandes de Changement de RIB' : 'Mes Demandes de Changement de RIB'}
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
            text: isRH ? 'Aucune demande de changement de RIB.' : 'Cliquez sur « Nouvelle demande » pour soumettre votre premiere demande.',
          }}
        />
      </ProcessOverview>

      {showModal ? (
        <FormTemplate
          title="Demande Changement de RIB"
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

          <SectionDivider title="Nouvelles coordonnees bancaires" />

          <FormRow>
            <FormGroup label="Nom Banque" required>
              <Input value={form.nom_banque} onChange={(event) => setForm((current) => ({ ...current, nom_banque: event.target.value }))} />
            </FormGroup>
            <FormGroup label="Code BIC" required>
              <Input value={form.code_bic} onChange={(event) => setForm((current) => ({ ...current, code_bic: event.target.value }))} />
            </FormGroup>
          </FormRow>

          <FormGroup label="Nouvel IBAN" required>
            <Input value={form.nouvel_iban} onChange={(event) => setForm((current) => ({ ...current, nouvel_iban: event.target.value }))} />
          </FormGroup>

          <FormGroup label="Motif">
            <Textarea value={form.motif} onChange={(event) => setForm((current) => ({ ...current, motif: event.target.value }))} />
          </FormGroup>

          <SectionDivider title="Pieces jointes (PDF, Max 10 Mo)" />

          <FormRow>
            <FormGroup label="Attestation de RIB" required>
              <Input type="file" accept="application/pdf" onChange={(event) => setFiles((current) => ({ ...current, attestation_rib: event.target.files }))} />
            </FormGroup>
            <FormGroup label="Main levee" required>
              <Input type="file" accept="application/pdf" onChange={(event) => setFiles((current) => ({ ...current, main_levee: event.target.files }))} />
            </FormGroup>
          </FormRow>

          {files.attestation_rib ? <span className="field-hint">Attestation: {files.attestation_rib[0]?.name}</span> : null}
          {files.main_levee ? <span className="field-hint">Main levee: {files.main_levee[0]?.name}</span> : null}
        </FormTemplate>
      ) : null}
    </>
  )
}

