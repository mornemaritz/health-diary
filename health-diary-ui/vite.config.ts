import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  preview: {
    port: 8080,
    strictPort: true,
  },
  server: {
    host: true,
    allowedHosts: [ "health-diary.me" ],
    port: 8080,
    strictPort: true,
    origin: "http://0.0.0.0:8080",
  },
})
