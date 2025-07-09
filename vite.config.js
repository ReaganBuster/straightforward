import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   resolve: {
    alias: {
      // Mirror your jsconfig.json paths here
      // The key should match the alias in jsconfig.json (e.g., '@shared/*')
      // The value should be the actual path (e.g., path.resolve(__dirname, './src/shared'))
      '@application': path.resolve(__dirname, './src/application'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@constants': path.resolve(__dirname, './src/constants'),
      // Add any other aliases you have or might need
    },
  },
});
