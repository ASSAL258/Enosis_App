/**
 * SectionDivider — titre de section dans les modales formulaire.
 * Props:
 *   title : string
 */
export default function SectionDivider({ title }) {
  return (
    <div className="section-divider">
      <hr className="section-divider__line" />
      {title ? <h3 className="section-divider__title">{title}</h3> : null}
    </div>
  )
}
