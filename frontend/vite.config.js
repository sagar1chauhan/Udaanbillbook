import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <-- Added this
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Added this
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
