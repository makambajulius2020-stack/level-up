import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = (env.VITE_API_URL || 'http://127.0.0.1:5000').replace(/\/+$/, '')

  const config = {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true
    },
    server: {
      port: 3002,
      host: true,
      allowedHosts: [
        'modern-frontend.onrender.com',
        'localhost',
        '127.0.0.1'
      ]
    },
    preview: {
      port: 3002,
      host: true,
      allowedHosts: [
        'modern-frontend.onrender.com',
        'localhost',
        '127.0.0.1'
      ]
    }
  }

  // Only use proxy in development
  if (mode === 'development') {
    config.server.proxy = {
      '/api': {
        target,
        changeOrigin: true,
        secure: false,
      }
    }
  }

  return config
})
