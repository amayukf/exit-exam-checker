import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // No proxy needed - the /api/exit-exam-result.js serverless function
  // handles all API calls both locally (via vercel dev) and on Vercel production.
})
