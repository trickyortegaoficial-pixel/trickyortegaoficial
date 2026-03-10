import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Carga variables de entorno
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()], // solo React, no tailwind plugin para v3
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // alias más limpio hacia src
      },
    },
    server: {
      port: 3000,
      open: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});