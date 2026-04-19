// Mock API for Development Testing ONLY
import {
  mockAvances,
  mockAttestations,
  mockConges,
  mockPrets,
  mockRibs,
} from './mock-data.js'

export const API_BASE_URL = 'http://localhost:5173'

export function buildApiUrl(path) {
  return path
}

// Mock global fetch
const originalFetch = globalThis.fetch
globalThis.fetch = async (url, options = {}) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Auth endpoints
  if (url.includes('/api/token')) {
    return {
      ok: true,
      json: async () => ({
        access: 'mock-token-12345',
        refresh: 'mock-refresh-token',
      }),
    }
  }

  if (url.includes('/api/me')) {
    return {
      ok: true,
      json: async () => ({
        id: 1,
        email: 'employee@example.com',
        first: 'Mohamed',
        last: 'Ben Ali',
        matricule: 'MAT-001',
        site: 'Casablanca',
        role: 'employee',
      }),
    }
  }

  // Avance sur Salaire endpoints
  if (url.includes('/api/demandes/') && options.method === 'POST') {
    const body = JSON.parse(options.body)
    const newAvance = {
      id: mockAvances.length + 1,
      ...body,
      statut: 'en_attente',
      commentaire: '',
      date: new Date().toISOString(),
    }
    mockAvances.push(newAvance)
    return { ok: true, json: async () => newAvance }
  }

  if (url.includes('/api/demandes/') && options.method === 'PATCH') {
    const id = url.match(/\/api\/demandes\/(\d+)\//)?.[1]
    const body = JSON.parse(options.body)
    const avance = mockAvances.find((a) => a.id === Number(id))
    if (avance) Object.assign(avance, body)
    return { ok: true, json: async () => avance }
  }

  if (url.includes('/api/demandes')) {
    return { ok: true, json: async () => mockAvances }
  }

  // Attestations endpoints
  if (url.includes('/api/attestations/') && options.method === 'POST') {
    const body = JSON.parse(options.body)
    const newAttestation = {
      id: mockAttestations.length + 1,
      ...body,
      statut: 'en_attente',
      commentaire: '',
      date: new Date().toISOString(),
    }
    mockAttestations.push(newAttestation)
    return { ok: true, json: async () => newAttestation }
  }

  if (url.includes('/api/attestations/') && options.method === 'PATCH') {
    const id = url.match(/\/api\/attestations\/(\d+)\//)?.[1]
    const body = JSON.parse(options.body)
    const attestation = mockAttestations.find((a) => a.id === Number(id))
    if (attestation) Object.assign(attestation, body)
    return { ok: true, json: async () => attestation }
  }

  if (url.includes('/api/attestations')) {
    return { ok: true, json: async () => mockAttestations }
  }

  // Congés endpoints
  if (url.includes('/api/conges/') && options.method === 'POST') {
    const body = JSON.parse(options.body)
    const newConge = {
      id: mockConges.length + 1,
      ...body,
      statut: 'en_attente',
      commentaire: '',
      date: new Date().toISOString(),
    }
    mockConges.push(newConge)
    return { ok: true, json: async () => newConge }
  }

  if (url.includes('/api/conges/') && options.method === 'PATCH') {
    const id = url.match(/\/api\/conges\/(\d+)\//)?.[1]
    const body = JSON.parse(options.body)
    const conge = mockConges.find((c) => c.id === Number(id))
    if (conge) Object.assign(conge, body)
    return { ok: true, json: async () => conge }
  }

  if (url.includes('/api/conges')) {
    return { ok: true, json: async () => mockConges }
  }

  // Prêts endpoints
  if (url.includes('/api/prets/') && options.method === 'POST') {
    const body = JSON.parse(options.body)
    const newPret = {
      id: mockPrets.length + 1,
      ...body,
      statut: 'en_attente',
      commentaire: '',
      date: new Date().toISOString(),
    }
    mockPrets.push(newPret)
    return { ok: true, json: async () => newPret }
  }

  if (url.includes('/api/prets/') && options.method === 'PATCH') {
    const id = url.match(/\/api\/prets\/(\d+)\//)?.[1]
    const body = JSON.parse(options.body)
    const pret = mockPrets.find((p) => p.id === Number(id))
    if (pret) Object.assign(pret, body)
    return { ok: true, json: async () => pret }
  }

  if (url.includes('/api/prets')) {
    return { ok: true, json: async () => mockPrets }
  }

  // RIB endpoints
  if (url.includes('/api/changement-rib/') && options.method === 'POST') {
    const body = JSON.parse(options.body)
    const newRib = {
      id: mockRibs.length + 1,
      ...body,
      statut: 'en_attente',
      commentaire: '',
      date: new Date().toISOString(),
    }
    mockRibs.push(newRib)
    return { ok: true, json: async () => newRib }
  }

  if (url.includes('/api/changement-rib/') && options.method === 'PATCH') {
    const id = url.match(/\/api\/changement-rib\/(\d+)\//)?.[1]
    const body = JSON.parse(options.body)
    const rib = mockRibs.find((r) => r.id === Number(id))
    if (rib) Object.assign(rib, body)
    return { ok: true, json: async () => rib }
  }

  if (url.includes('/api/changement-rib')) {
    return { ok: true, json: async () => mockRibs }
  }

  // Fallback
  return { ok: false, status: 404, json: async () => ({ detail: 'Not found' }) }
}
