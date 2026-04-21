/**
 * StatusSelect — select stylise configurable.
 * Props:
 *   value        : valeur courante
 *   options      : [{ value, label }]
 *   toneByValue  : fn(value) => tone
 *   disabled     : bloque le select
 *   onChange     : callback(value)
 */
export default function StatusSelect({ value, options, toneByValue, disabled = false, onChange }) {
  const tone = toneByValue ? toneByValue(value) : ''

  return (
    <select
      className={`status-select${tone ? ` status-select--${tone}` : ''}`}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
