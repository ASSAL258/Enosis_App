import { useMemo, useState } from 'react'
import { getMockNotifications } from '../config/mock-data.js'
import Button from '../atoms/Button.jsx'
import Icon from '../atoms/Icon.jsx'
import UserChip from '../molecules/UserChip.jsx'
import Navbar from '../organisms/Navbar.jsx'
import SidebarNav from '../organisms/SidebarNav.jsx'
import DashboardLayout from '../templates/DashboardLayout.jsx'
import AttestationPage from './AttestationPage.jsx'
import AvancePage from './AvancePage.jsx'
import CongePage from './CongePage.jsx'
import PretPage from './PretPage.jsx'
import RibPage from './RibPage.jsx'

export default function DashboardPage({ user, onLogout }) {
  const defaultView = user.role === 'manager' ? 'conge' : 'avance'
  const [view, setView] = useState(defaultView)
  const userInitials = `${user.first?.[0] || ''}${user.last?.[0] || ''}`.toUpperCase() || '?'
  const userName = `${user.first} ${user.last}`
  const roleLabel = user.role === 'rh'
    ? 'Ressources Humaines'
    : user.role === 'manager'
      ? 'Manager'
      : 'Employe'
  const accentUser = user.role === 'rh' || user.role === 'manager'
  const notifications = getMockNotifications(user.role)

  const sections = useMemo(() => {
    const processItems = [
      { key: 'avance', label: 'Avance sur Salaire' },
      { key: 'attestation', label: "Demande d'attestations" },
      { key: 'rib', label: 'Changement de RIB' },
      { key: 'conge', label: 'Demande de Conge' },
      { key: 'pret', label: 'Demande de Pret' },
    ]

    const validationItems = []

    if (user.role === 'rh') {
      validationItems.push(
        { key: 'validation_avance', label: 'Avance sur Salaire' },
        { key: 'validation_attestation', label: "Demande d'attestations" },
        { key: 'validation_rib', label: 'Changement de RIB' },
      )
    }

    if (user.role === 'rh' || user.role === 'manager') {
      validationItems.push(
        { key: 'validation_conge', label: 'Demande de Conge' },
        { key: 'validation_pret', label: 'Demande de Pret' },
      )
    }

    return validationItems.length
      ? [
        { title: 'Process Interne RH', items: processItems },
        { title: 'Demandes a Valider', items: validationItems },
      ]
      : [{ title: 'Process Interne RH', items: processItems }]
  }, [user.role])

  let page = <AvancePage user={user} />
  if (view === 'attestation') page = <AttestationPage user={user} />
  if (view === 'rib') page = <RibPage user={user} />
  if (view === 'conge') page = <CongePage user={user} />
  if (view === 'pret') page = <PretPage user={user} />
  if (view === 'validation_avance') page = <AvancePage user={user} isValidationView />
  if (view === 'validation_attestation') page = <AttestationPage user={user} isValidationView />
  if (view === 'validation_rib') page = <RibPage user={user} isValidationView />
  if (view === 'validation_conge') page = <CongePage user={user} isValidationView />
  if (view === 'validation_pret') page = <PretPage user={user} isValidationView />

  return (
    <DashboardLayout
      header={(
        <Navbar
          notifications={notifications}
          onNavigate={setView}
          brand={(
            <>
              <img src="/image_enosisapp.png" alt="enosisapp Group Logo" />
              <span>ENOSISAPP</span>
            </>
          )}
        >
          <UserChip
            initials={userInitials}
            primaryText={userName}
            secondaryText={roleLabel}
            accent={accentUser}
          />
          <Button variant="ghost-danger" onClick={onLogout} icon={<Icon name="logout" size={14} />}>
            Deconnexion
          </Button>
        </Navbar>
      )}
      sidebar={(
        <SidebarNav
          sections={sections}
          activeView={view}
          onNavigate={setView}
          footer={(
            <UserChip
              initials={userInitials}
              primaryText={userName}
              variant="sidebar"
              accent={accentUser}
            />
          )}
        />
      )}
    >
      {page}
    </DashboardLayout>
  )
}

