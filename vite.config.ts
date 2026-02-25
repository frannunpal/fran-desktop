import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@domain': resolve(__dirname, 'src/Domain'),
      '@application': resolve(__dirname, 'src/Application'),
      '@infrastructure': resolve(__dirname, 'src/Infrastructure'),
      '@presentation': resolve(__dirname, 'src/Presentation'),
      '@shared': resolve(__dirname, 'src/Shared'),
    },
  },
})
