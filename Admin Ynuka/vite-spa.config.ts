import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      input: path.resolve(__dirname, 'index-spa.html'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    middlewareMode: false,
  },
});
