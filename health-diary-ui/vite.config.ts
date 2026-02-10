import { defineConfig } from 'vite'
import { defineConfig as defineTestConfig } from "vitest/config";
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const config = defineConfig({
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
});

const testConfig = defineTestConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },

});

export default {
  ...config,
  ...testConfig,
} 