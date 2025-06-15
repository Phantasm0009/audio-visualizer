import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 8080,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['three', '@tensorflow/tfjs']
    }
  },
  optimizeDeps: {
    include: ['three', '@tensorflow/tfjs']
  }
});