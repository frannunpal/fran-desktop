import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist-electron',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          mantine: ['@mantine/core', '@mantine/hooks'],
          motion: ['framer-motion'],
          icons: ['react-icons/vsc'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@domain': resolve(__dirname, 'src/Domain'),
      '@application': resolve(__dirname, 'src/Application'),
      '@infrastructure': resolve(__dirname, 'src/Infrastructure'),
      '@presentation': resolve(__dirname, 'src/Presentation'),
      '@shared': resolve(__dirname, 'src/Shared'),
    },
  },
});
