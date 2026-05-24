import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the built site works from any subfolder (GitHub Pages, file://, etc.)
export default defineConfig({
  base: './',
  plugins: [react()],
})
