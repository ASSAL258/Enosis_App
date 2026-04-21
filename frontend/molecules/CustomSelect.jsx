/**
 * CustomSelect — styled multi-select component
 * Props:
 *   value      : array of selected values (for multiple) or single value
 *   options    : [{ value, label }]
 *   onChange   : callback with value(s)
 *   multiple   : boolean for multi-select
 *   disabled   : boolean to disable select
 *   placeholder: string for placeholder option
 */
export default function CustomSelect({
  value,
  options,
  onChange,
  multiple = false,
  disabled = false,
  placeholder = 'Select an option',
}) {
  const handleChange = (event) => {
    if (multiple) {
      const selected = Array.from(event.target.selectedOptions, (option) => option.value)
      onChange(selected)
    } else {
      onChange(event.target.value)
    }
  }

  const selectClass = multiple ? 'select-base custom-select-multiple' : 'select-base'

  return (
    <select
      className={selectClass}
      value={multiple ? value : (value || '')}
      onChange={handleChange}
      disabled={disabled}
      multiple={multiple}
      size={multiple ? 4 : 1}
    >
      {!multiple && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
