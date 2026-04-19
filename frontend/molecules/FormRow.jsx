/**
 * FormRow — grille horizontale de champs.
 * Props:
 *   columns  : nombre de colonnes
 *   children : contenu de la ligne
 */
export default function FormRow({ columns = 2, children }) {
  return (
    <div
      className="field-row"
      style={columns === 2 ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  )
}
