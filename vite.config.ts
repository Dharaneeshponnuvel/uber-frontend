import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['@react-google-maps/api'], // force Vite to pre-bundle
    exclude: ['lucide-react'],           // optional, safe to keep
  },
  build: {
    rollupOptions: {
      external: [], // ensure no accidental externals
    },
  },
})
