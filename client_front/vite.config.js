import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const serverConfig =
    mode === 'development'
      ? {
        server: {
          port: 5173,
          proxy: {
            '/api': {
              target: env.VITE_API_BASE_URL || 'http://localhost:8080',
              changeOrigin: true,
            },
            '/ws': {
              target: env.VITE_API_BASE_URL || 'http://localhost:8080',
              ws: true,
              changeOrigin: true,
            },
          },
        },
      }
      : {};

  return {
    plugins: [react()],
    ...serverConfig,
    build: {
      outDir: 'dist',
    },
  };
});