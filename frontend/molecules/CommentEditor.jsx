import { useState } from 'react'
import Button from '../atoms/Button.jsx'

/**
 * CommentEditor — edition inline d'un commentaire.
 * Props:
 *   value     : commentaire initial
 *   disabled  : bloque l'edition
 *   onSave    : callback(newValue)
 */
export default function CommentEditor({ value, disabled = false, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEdit() {
    if (disabled) return
    setEditing(true)
    setDraft(value || '')
  }

  function cancelEdit() {
    setEditing(false)
    setDraft('')
  }

  async function handleSave() {
    await onSave(draft)
    setEditing(false)
    setDraft('')
  }

  if (editing) {
    return (
      <div className="comment-editor__edit">
        <textarea
          autoFocus
          className="comment-editor__textarea"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="comment-editor__actions">
          <Button variant="secondary" size="sm" onClick={cancelEdit}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Sauvegarder
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`comment-editor__display${disabled ? ' is-disabled' : ''}`}
      onClick={startEdit}
      title={disabled ? 'Non modifiable' : 'Cliquer pour modifier'}
    >
      {value ? (
        <span className="comment-editor__text">{value}</span>
      ) : (
        <span className="comment-editor__placeholder">{disabled ? '—' : '— cliquer pour ajouter'}</span>
      )}
    </div>
  )
}
