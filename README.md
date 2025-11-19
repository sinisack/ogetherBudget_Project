# 프로젝트 환경 및 실행 가이드

실시간 협업 가계부 WIZLET

## Version

### Backend

* **Java**: 17
* **Spring Boot**: 3.5.6
* **Gradle**: (Spring Boot Plugin 포함)
* **Spring MVC (Web)**
* **Spring Data JPA**
* **Spring Security + JWT**
* **WebSocket + STOMP**
* **Hibernate Validator**
* **Lombok**

### Database

* **MySQL**: 8.0.33

---

### Frontend

* **Node.js**: 22.14.0
* **React**: 19.1.1
* **Vite**: 7.1.7
* **ESLint**: 9.36.0

---

## Backend 설정

📁 **파일 경로**: `application.properties`
아래와 같은 주요 설정을 포함해야 합니다:

* MySQL DB 접속 정보
* JPA 설정
* JWT Secret Key
* WebSocket/STOMP 설정
* 기타 서버 환경 변수

---

## 프론트엔드 설치 & 실행

### 1️패키지 설치

```
npm install
```

---

## 실행 방법

### 🔧 개발 서버 실행

```
npm run dev
```

### 🔨 빌드

```
npm run build
```

### 👀 빌드 미리보기

```
npm run preview
```

---

# 프론트엔드(Vercel) 배포하기

### 1) 로컬 `.env` 구성

루트에 다음 파일들이 존재해야 합니다.

```
.env.development
.env.production
```

### 📌 `.env.development`

```
VITE_API_BASE_URL=http://localhost:8080
```

### 📌 `.env.production`

```
VITE_API_BASE_URL=https://ogetherbudget-project.onrender.com
```

> ⚠️ .env.production의 URL은 Render 배포 후 실제 발급된 백엔드 주소로 수정해야 합니다.

---

# Vite 환경변수 + Proxy 설정

프로젝트에 포함된 `vite.config.js`는 아래처럼 환경 변수에 따라 자동으로 API 프록시를 설정해줍니다.

```jsx
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
              target: env.VITE_API_BASE_URL || '<http://localhost:8080>',
              changeOrigin: true,
            },
            '/ws': {
              target: env.VITE_API_BASE_URL || '<http://localhost:8080>',
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
```

---

# Vercel에 프론트엔드 배포하기

### 1) Vercel 프로젝트 생성

1. [https://vercel.com](https://vercel.com) 접속 후 로그인
2. “Add New → Project”
3. GitHub 저장소 연결 후 프론트엔드 프로젝트 선택

### 2) Production 환경 변수 등록

Vercel Dashboard → *Settings → Environment Variables* 에 아래를 등록:

```
VITE_API_BASE_URL=https://ogetherbudget-project.onrender.com
```

(※ 반드시 Render에서 받은 실제 URL로 설정)

### 3) Framework 설정

* Build Command: `npm run build`
* Output Directory: `dist`

### 4) Deploy

환경 변수가 준비되면 "Deploy" 버튼 클릭 → 배포 완료 후 URL 발급

---

# 배포 후 확인해야 할 체크리스트

* [ ] 백엔드 Render URL이 정상 응답하는지
* [ ] `.env.production`의 `VITE_API_BASE_URL`이 올바르게 설정되었는지
* [ ] Vercel 환경 변수에도 동일한 값이 들어있는지
* [ ] WebSocket(`/ws`) 경로가 정상 동작하는지
* [ ] Render 백엔드 CORS 설정이 프론트 도메인을 허용하는지
