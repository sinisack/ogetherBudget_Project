import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 환경 변수 로딩 함수를 추가하여 모드별로 환경 변수를 가져옵니다.
export default defineConfig(({ mode }) => {
  // 현재 모드(development 또는 production)에 맞는 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');

  // 로컬 개발 환경(npm run dev)일 때만 프록시 서버 설정을 추가합니다.
  const serverConfig = mode === 'development' 
    ? {
        server: {
          proxy: {
            // 로컬 환경 변수 (.env.development)에 설정된 주소를 사용하도록 수정
            '/api': env.VITE_API_BASE_URL || 'http://localhost:8080', 
            '/ws': { 
              target: env.VITE_API_BASE_URL || 'http://localhost:8080', 
              ws: true 
            }
          }
        }
      }
    : {}; // 프로덕션 환경에서는 server 설정을 제외합니다.

  return {
    plugins: [react()],
    // 개발 환경일 때만 server 설정을 포함합니다.
    ...serverConfig, 
  };
});