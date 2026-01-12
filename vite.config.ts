import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill for process.env in browser if needed, though usually handled by Vite's import.meta.env
    // We keep this empty or basic to avoid errors with some libs expecting process.env
    'process.env': {} 
  }
});