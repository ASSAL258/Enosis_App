// Mock Data for Development Testing

export const mockUser = {
  id: 1,
  email: 'employee@example.com',
  first: 'Mohamed',
  last: 'Ben Ali',
  matricule: 'MAT-001',
  site: 'Casablanca',
  role: 'employee',
  token: 'mock-token-12345',
}

export const mockUserRH = {
  id: 2,
  email: 'rh@example.com',
  first: 'Fatima',
  last: 'Khaled',
  matricule: 'RH-001',
  site: 'Rabat',
  role: 'rh',
  token: 'mock-token-rh',
}

export const mockUserManager = {
  id: 3,
  email: 'manager@example.com',
  first: 'Ahmed',
  last: 'Hassan',
  matricule: 'MGR-001',
  site: 'Fes',
  role: 'manager',
  token: 'mock-token-manager',
}

// Avance sur Salaire
export const mockAvances = [
  {
    id: 1,
    nom: 'Ben Ali',
    prenom: 'Mohamed',
    userEmail: 'employee@example.com',
    matricule: 'MAT-001',
    site: 'Casablanca',
    montant: 5000,
    duree: 2,
    motif: 'Besoin urgent pour frais medicaux',
    statut: 'en_attente',
    commentaire: '',
    date: '2024-04-15T10:30:00Z',
  },
  {
    id: 2,
    nom: 'Fadel',
    prenom: 'Karim',
    userEmail: 'karim@example.com',
    matricule: 'MAT-002',
    site: 'Rabat',
    montant: 3000,
    duree: 1,
    motif: 'Renovation maison',
    statut: 'valide',
    commentaire: 'Approuve',
    date: '2024-03-20T14:15:00Z',
  },
]

// Attestations
export const mockAttestations = [
  {
    id: 1,
    nom: 'Ben Ali',
    prenom: 'Mohamed',
    userEmail: 'employee@example.com',
    matricule: 'MAT-001',
    site: 'Casablanca',
    type_attestation: 'employment',
    statut: 'en_attente',
    commentaire: '',
    date: '2024-04-10T09:00:00Z',
  },
  {
    id: 2,
    nom: 'Fadel',
    prenom: 'Karim',
    userEmail: 'karim@example.com',
    matricule: 'MAT-002',
    site: 'Rabat',
    type_attestation: 'salary',
    statut: 'valide',
    commentaire: 'Attestation de salaire generee',
    date: '2024-03-15T11:30:00Z',
  },
]

// Congés
export const mockConges = [
  {
    id: 1,
    nom: 'Ben Ali',
    prenom: 'Mohamed',
    userEmail: 'employee@example.com',
    matricule: 'MAT-001',
    site: 'Casablanca',
    date_debut: '2024-05-01',
    date_fin: '2024-05-10',
    nombre_jours: 10,
    type_conge: 'annuel',
    motif: 'Vacances familiales',
    statut: 'en_attente',
    commentaire: '',
    date: '2024-04-01T08:00:00Z',
  },
  {
    id: 2,
    nom: 'Fadel',
    prenom: 'Karim',
    userEmail: 'karim@example.com',
    matricule: 'MAT-002',
    site: 'Rabat',
    date_debut: '2024-04-15',
    date_fin: '2024-04-18',
    nombre_jours: 4,
    type_conge: 'exceptionnel',
    motif: 'Raison personnelle',
    statut: 'valide',
    commentaire: 'Approuve par manager',
    date: '2024-03-25T10:00:00Z',
  },
]

// Prêts
export const mockPrets = [
  {
    id: 1,
    nom: 'Ben Ali',
    prenom: 'Mohamed',
    userEmail: 'employee@example.com',
    matricule: 'MAT-001',
    site: 'Casablanca',
    montant: 50000,
    duree: 24,
    taux: 5.5,
    motif: 'Achat automobile',
    statut: 'en_attente',
    commentaire: '',
    date: '2024-04-08T13:20:00Z',
  },
  {
    id: 2,
    nom: 'Fadel',
    prenom: 'Karim',
    userEmail: 'karim@example.com',
    matricule: 'MAT-002',
    site: 'Rabat',
    montant: 30000,
    duree: 12,
    taux: 4.5,
    motif: 'Travaux renovation',
    statut: 'valide',
    commentaire: 'Pret approuve',
    date: '2024-03-10T15:45:00Z',
  },
]

// RIB (Changement de RIB)
export const mockRibs = [
  {
    id: 1,
    nom: 'Ben Ali',
    prenom: 'Mohamed',
    userEmail: 'employee@example.com',
    matricule: 'MAT-001',
    site: 'Casablanca',
    ancien_rib: 'MA6410000000000001000000',
    nouveau_rib: 'MA6410000000000002000000',
    motif: 'Changement de banque',
    statut: 'en_attente',
    commentaire: '',
    date: '2024-04-12T11:00:00Z',
  },
  {
    id: 2,
    nom: 'Fadel',
    prenom: 'Karim',
    userEmail: 'karim@example.com',
    matricule: 'MAT-002',
    site: 'Rabat',
    ancien_rib: 'MA6420000000000001000000',
    nouveau_rib: 'MA6420000000000002000000',
    motif: 'Fermeture ancien compte',
    statut: 'valide',
    commentaire: 'RIB mis a jour',
    date: '2024-03-05T09:30:00Z',
  },
]

// Sites (pour les dropdowns)
export const mockSites = [
  'Casablanca',
  'Jorf Lasfar',
  'Rabat',
  'Fes',
  'Marrakech',
  'Agadir',
  'Tanger',
  'Meknes',
  'Sale',
  'Kenitra',
  'Tetouan',
  'Oujda',
]

// Notifications
export function getMockNotifications(userRole) {
  const baseNotifications = [
    {
      id: 1,
      type: 'demande_validated',
      title: 'Demande d\'Avance Approuvée',
      message: 'Votre demande d\'avance sur salaire de 5000 DH a été approuvée',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
      read: false,
      icon: '✅',
      action: 'avance',
    },
    {
      id: 2,
      type: 'demande_rejected',
      title: 'Demande de RIB Rejetée',
      message: 'Votre changement de RIB a été rejeté. Motif: Documents incomplets',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      read: false,
      icon: '❌',
      action: 'rib',
    },
    {
      id: 3,
      type: 'conge_pending',
      title: 'Congé en Attente de Validation',
      message: 'Votre demande de congé pour 2024-05-01 attend l\'approbation du manager',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: false,
      icon: '⏳',
      action: 'conge',
    },
  ]

  // Ajouter 4ème notification pour Manager et RH
  if (userRole === 'manager' || userRole === 'rh') {
    baseNotifications.push({
      id: 4,
      type: 'new_demande',
      title: 'Nouvelle Demande à Valider',
      message: 'Ahmed Hassan a soumis une demande de congé en attente de votre validation',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 min ago
      read: false,
      icon: '📋',
      action: userRole === 'rh' ? 'validation_avance' : 'validation_conge',
    })
  }

  return baseNotifications
}

export const mockNotifications = getMockNotifications('employee')
