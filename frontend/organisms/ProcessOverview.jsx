import PageHeader from '../molecules/PageHeader.jsx'
import KpiGrid from './KpiGrid.jsx'
import TableCard from './TableCard.jsx'

/**
 * ProcessOverview — bloc principal titre + metriques + tableau.
 * Props:
 *   title       : titre de page
 *   breadcrumb  : fil d'ariane
 *   metrics     : liste de metriques optionnelle
 *   cardIcon    : icone du tableau
 *   cardTitle   : titre du tableau
 *   action      : action du header de carte
 *   children    : tableau
 */
export default function ProcessOverview({
  title,
  breadcrumb,
  metrics = null,
  cardIcon,
  cardTitle,
  action = null,
  children,
}) {
  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb} />
      {metrics?.length ? <KpiGrid items={metrics} /> : null}
      <TableCard icon={cardIcon} title={cardTitle} actions={action}>
        {children}
      </TableCard>
    </>
  )
}
