/**
 * DataTable — organisme de tableau generique.
 * Props:
 *   headers      : string[]
 *   rows         : [{ key, className, cells: [{ content, className }] }]
 *   emptyState   : { icon, title, text }
 */
export default function DataTable({ headers, rows, emptyState }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {!rows.length ? (
          <tr>
            <td colSpan={headers.length}>
              <div className="empty-state">
                <div className="empty-state__icon">{emptyState.icon}</div>
                <div className="empty-state__title">{emptyState.title}</div>
                <div className="empty-state__text">{emptyState.text}</div>
              </div>
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.key} className={row.className}>
              {row.cells.map((cell, index) => (
                <td key={`${row.key}-${index}`} className={cell.className || ''}>
                  {cell.content}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
