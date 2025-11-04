import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// import fs from 'fs'; // HTTPS 관련 import 제거
// import path from 'path'; // HTTPS 관련 import 제거

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // ⭐️ HTTPS 설정 제거 ⭐️
  // const certDir = path.resolve(__dirname, 'cert');
  // const keyPath = path.join(certDir, 'localhost-key.pem');
  // const certPath = path.join(certDir, 'localhost-cert.pem');
  // const httpsConfig =
  //   fs.existsSync(keyPath) && fs.existsSync(certPath)
  //     ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
  //     : true;

  const serverConfig =
    mode === 'development'
      ? {
        server: {
          // ⭐️ HTTPS 설정 제거 ⭐️
          // https: httpsConfig, 
          port: 5173,
          proxy: {
            '/api': {
              // ⭐️ target을 http로 변경 ⭐️
              target: env.VITE_API_BASE_URL || 'http://localhost:8080',
              changeOrigin: true,
              // ⭐️ secure: false 옵션 제거 (HTTP에서는 무의미) ⭐️
              // secure: false, 
              // 쿠키 수동 재작성 로직은 HTTPS 문제 해결용이었으므로 제거하거나 그대로 둘 수 있습니다. 
              // 문제의 원인을 제거했으므로 제거하는 것을 권장합니다.
            },
            '/ws': {
              // ⭐️ target을 http로 변경 ⭐️
              target: env.VITE_API_BASE_URL || 'http://localhost:8080',
              ws: true,
              changeOrigin: true,
              // ⭐️ secure: false 옵션 제거 ⭐️
              // secure: false,
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