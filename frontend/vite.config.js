import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase (largest dependency)
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
          // QR Scanner libraries
          'vendor-qr': ['html5-qrcode', '@yudiel/react-qr-scanner'],
          // UI utilities
          'vendor-utils': ['axios', 'lucide-react'],
        },
      },
    },
  },
})
