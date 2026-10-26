import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The proxy sends every "/api/..." request to the backend on port 5000,
// so we never need to worry about CORS while developing.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
