import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api/token': {
        target: process.env.VITE_AUTH_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api/me': {
        target: process.env.VITE_AUTH_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api/rh': {
        target: process.env.VITE_AUTH_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api/admin': {
        target: process.env.VITE_AUTH_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api/demandes': {
        target: process.env.VITE_AVANCE_PROXY_TARGET || process.env.VITE_PROCESS_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api/attestations': {
        target: process.env.VITE_ATTESTATION_PROXY_TARGET || process.env.VITE_PROCESS_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api/changement-rib': {
        target: process.env.VITE_RIB_PROXY_TARGET || process.env.VITE_PROCESS_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api/conges': {
        target: process.env.VITE_CONGE_PROXY_TARGET || process.env.VITE_PROCESS_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api/prets': {
        target: process.env.VITE_PRET_PROXY_TARGET || process.env.VITE_PROCESS_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api/files': {
        target: process.env.VITE_FILES_PROXY_TARGET || process.env.VITE_PROCESS_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
      '/api': {
        target: process.env.VITE_PROCESS_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://auth-service:8000',
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
  },
})
