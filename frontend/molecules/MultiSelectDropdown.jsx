import { useState, useRef, useEffect } from 'react'
import Icon from '../atoms/Icon.jsx'

/**
 * MultiSelectDropdown — custom multi-select dropdown component
 * Props:
 *   value      : array of selected values
 *   options    : [{ value, label }]
 *   onChange   : callback with selected values array
 *   placeholder: string for placeholder
 *   disabled   : boolean to disable
 */
export default function MultiSelectDropdown({
  value = [],
  options = [],
  onChange,
  placeholder = 'Select options...',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const handleToggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label)
    .join(', ')

  return (
    <div ref={containerRef} className="multi-select-dropdown">
      <button
        type="button"
        className="multi-select-dropdown__trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={selectedLabels ? '' : 'multi-select-dropdown__placeholder'}>
          {selectedLabels || placeholder}
        </span>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} />
      </button>

      {isOpen && (
        <div className="multi-select-dropdown__menu">
          {options.map((option) => (
            <label key={option.value} className="multi-select-dropdown__option">
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => handleToggleOption(option.value)}
                className="multi-select-dropdown__checkbox"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
