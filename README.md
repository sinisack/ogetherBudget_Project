# 프로젝트 환경 및 실행 가이드

**실시간 협업 가계부 같이가계**

# 1. 프로젝트 버전 정보

## 1-1. Backend

* **Java**: 17
* **Spring Boot**: 3.5.6
* **Gradle** (Spring Boot Plugin 포함)
* **Spring MVC (Web)**
* **Spring Data JPA**
* **Spring Security + JWT**
* **WebSocket + STOMP**
* **Hibernate Validator**
* **Lombok**

## 1-2. Database

* **MySQL**: 8.0.33
  (본 문서에서는 **Aiven MySQL**을 통한 배포 방식 포함)

## 1-3. Frontend

* **Node.js**: 22.14.0
* **React**: 19.1.1
* **Vite**: 7.1.7
* **ESLint**: 9.36.0

# 2. Backend 설정

## 2-1. application.properties

> 📁 **파일 경로**: `/src/main/resources/application.properties`

아래 설정들이 환경 변수 기반으로 포함되어야 합니다:

```
# --- MySQL ---
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=${SPRING_DATASOURCE_DRIVER-CLASS-NAME}
```

* MySQL(Aiven) DB 접속 정보
* JPA 설정
* JWT Secret Key
* WebSocket/STOMP 설정
* 기타 서버 환경 변수

# 3. Aiven MySQL 배포 및 연결

## 3-1. Aiven MySQL 배포

1. **Aiven 계정 생성**
   [https://aiven.io](https://aiven.io) 에서 회원가입

2. **MySQL 서비스 생성**

   * Dashboard → **Create new service**
   * Database 선택: **MySQL**
   * 설정:

     * **Service Tier**: Free 가능
     * **Cloud Region**: 예: North America
     * **Service Name**: 예: `mysql-budget`
   * **Create Service** 클릭

3. **MySQL 연결 정보 확인**

   * Service → **Connection Information**
   * Render 환경 변수에 넣어야 하는 값:

     * **Service URI**
     * **Username**
     * **Password**
     * **Host**
     * **Port**
     * **Database (defaultdb)**

4. **Aiven MySQL 연결 테스트 (선택)**

   ```bash
   mysql -h mysql-budget-sin10.i.aivencloud.com -P 14613 -u avnadmin -p
   ```

# 4. Render Backend 배포

## 4-1. Render 배포 절차

1. **Render 계정 생성**
   [https://render.com](https://render.com)

2. **Web Service 생성**

   * **Create new Service → Web Service**
   * GitHub 저장소 연결

3. **서비스 설정**

   * **Service Type**: Web Service
   * **Name**: 예) `ogetherBudget_Project`
   * **Language/Runtime**: Docker
   * **Branch**: main
   * **Region**: Oregon (US West)
   * **Root Directory**:

     ```
     /project
     ├── realtime-budget    (backend)
     └── client_front       (frontend)
     ```

     → Root Directory에 `realtime-budget` 입력
   * **Instance Type**: Free

## 4-2. Render 환경 변수(Aiven MySQL 연결)

> Aiven의 URL은 `mysql://`로 시작하지만, Spring JDBC는 `jdbc:mysql://` 형식을 필요로 합니다.
> 반드시 변환하여 넣어야 합니다.

입력해야 할 환경 변수:

```
SPRING_DATASOURCE_URL=<jdbc:mysql://HOST:PORT/DATABASE>
SPRING_DATASOURCE_USERNAME=<AIVEN-USERNAME>
SPRING_DATASOURCE_PASSWORD=<AIVEN-PASSWORD>
SPRING_DATASOURCE_DRIVER-CLASS-NAME=com.mysql.cj.jdbc.Driver
```

## 4-3. 배포

* 모든 설정 완료 → **Deploy Web Service**
* 성공 시 Render에서 URL 발급
  예: `https://yourapp.onrender.com`

# 5. Frontend 설치 & 실행

## 5-1. 패키지 설치

```
npm install
```

## 5-2. 개발 서버 실행

```
npm run dev
```

## 5-3. 빌드

```
npm run build
```

## 5-4. 빌드 미리보기

```
npm run preview
```

# 6. Vite + 환경 변수 + Proxy 설정

`vite.config.js`는 환경 변수에 따라 API Proxy를 자동 설정합니다.

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
```

# 7. 프론트엔드 환경변수 (.env)

```
.env.development
.env.production
```

### 📌 .env.development

```
VITE_API_BASE_URL=http://localhost:8080
```

### 📌 .env.production

```
VITE_API_BASE_URL=https://ogetherbudget-project.onrender.com
```

# 8. Vercel 프론트엔드 배포

## 8-1. 프로젝트 생성

* Vercel 접속 → Add New Project
* GitHub 저장소 선택

## 8-2. 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables

```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

## 8-3. 빌드 옵션

* **Build Command**: `npm run build`
* **Output Directory**: `dist`

## 8-4. Deploy

"Deploy" 클릭 후 배포 완료 → 도메인 발급

# 9. 배포 후 체크리스트

* [ ] Render Backend URL 정상 동작
* [ ] `.env.production`의 `VITE_API_BASE_URL` 검증
* [ ] Vercel 환경 변수 동일하게 설정
* [ ] WebSocket `/ws` 정상 연결
* [ ] Render CORS에 Vercel 도메인 허용