import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(?:@material\/web|@lit\/|lit(?:-html|-element)?\/)/.test(id)) return 'material';
          if (/src\/i18n\/(?:es|pt-BR)\.js$/.test(id)) return 'translations';
        }
      }
    }
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    proxy: {
      '/api': 'http://127.0.0.1:8787'
    }
  }
})
