import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Saat pengembangan, permintaan /api dan /uploads diteruskan ke backend Express.
const backend = process.env.VITE_BACKEND_URL || 'http://localhost:4000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      '/uploads': { target: backend, changeOrigin: true },
    },
  },
})
