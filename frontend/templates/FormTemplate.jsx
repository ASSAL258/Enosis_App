import Icon from '../atoms/Icon.jsx'

/**
 * FormTemplate — template structurel de formulaire en modale.
 * Props:
 *   title      : titre affiche
 *   footer     : zone de footer injectee par la page
 *   children   : contenu du formulaire
 *   onClose    : callback fermeture
 */
export default function FormTemplate({ title, footer = null, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </div>

        <div className="modal__body">
          {children}
        </div>

        {footer ? <div className="modal__footer">{footer}</div> : null}
      </div>
    </div>
  )
}
