import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves a project site from /<repo>/, so the base path is
// injected at build time by CI. Local dev and previews stay at the root.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
