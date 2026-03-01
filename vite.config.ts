import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '/fran-desktop/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mantine: ['@mantine/core', '@mantine/hooks', '@mantine/dates'],
          motion: ['framer-motion'],
          'icons-vsc': ['react-icons/vsc'],
          'icons-bi': ['react-icons/bi'],
          'icons-lu': ['react-icons/lu'],
          tiptap: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/markdown'],
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
