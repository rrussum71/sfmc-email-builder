import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sfmc-email-builder/', // REQUIRED for GitHub Pages
})