import { useState } from 'react'
import Input from '../atoms/Input.jsx'

/**
 * EditableNumberCell — edition inline d'un nombre.
 * Props:
 *   value    : nombre ou null
 *   disabled : bloque l'edition
 *   onSave   : callback(number|null)
 */
export default function EditableNumberCell({ value, disabled = false, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')

  function startEdit() {
    if (disabled) return
    setDraft(value ?? '')
    setEditing(true)
  }

  async function commit() {
    setEditing(false)
    if (draft === (value ?? '')) return
    await onSave(draft === '' ? null : parseFloat(draft))
  }

  if (editing) {
    return (
      <Input
        type="number"
        min="0"
        step="0.5"
        autoFocus
        className="editable-number"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
          if (event.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <span
      className={`editable-number__trigger${disabled ? ' is-disabled' : ''}`}
      onClick={startEdit}
      title={disabled ? 'Non modifiable' : 'Cliquer pour editer'}
    >
      {value == null ? <span className="editable-number__placeholder">—</span> : value}
    </span>
  )
}
