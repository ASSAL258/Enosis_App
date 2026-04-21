import { useState } from 'react'
import Icon from '../atoms/Icon.jsx'

/**
 * SidebarNav — navigation laterale controlee par la page.
 * Props:
 *   sections       : [{ title, items: [{ key, label }] }]
 *   activeView     : vue active
 *   onNavigate     : callback(view)
 *   footer         : zone libre injectee en pied
 */
export default function SidebarNav({
  sections,
  activeView,
  onNavigate,
  footer = null,
}) {
  const [expanded, setExpanded] = useState(() => {
    const init = {}
    sections.forEach((s) => {
      init[s.title] = false
    })
    return init
  })

  const toggleSection = (title) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <aside className="sidebar">
      <div>
        {sections.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <button
              type="button"
              className="sidebar-section-title"
              onClick={() => toggleSection(section.title)}
              aria-expanded={expanded[section.title]}
            >
              <span className="sidebar-section-title-text">{section.title}</span>
              <span className="sidebar-section-chevron" aria-hidden="true">
                <Icon name={expanded[section.title] ? 'chevronDown' : 'chevronRight'} size={14} />
              </span>
            </button>
            {expanded[section.title] && (
              <ul className="sidebar-menu">
                {section.items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      className={`sidebar-item${activeView === item.key ? ' is-active' : ''}`}
                      onClick={() => onNavigate(item.key)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        {footer}
      </div>
    </aside>
  )
}
