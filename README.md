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

2. application.properties 설정

📁 파일 경로: /src/main/resources/application.properties

아래 설정들이 환경 변수 기반으로 포함되어야 합니다:

# --- MySQL ---
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=${SPRING_DATASOURCE_DRIVER-CLASS-NAME}

3. Aiven MySQL 설정

Aiven은 MySQL을 포함한 다양한 데이터베이스 서비스를 클라우드에서 쉽게 관리할 수 있게 해주는 플랫폼입니다. 아래는 Aiven에 MySQL을 배포하고, Render 애플리케이션과 연결하는 단계입니다.

3.1 Aiven 계정 생성

https://aiven.io/에
 방문하여 계정을 생성합니다.

3.2 MySQL 서비스 생성

Aiven 대시보드에 로그인한 후, "Create new service"에서 MySQL을 선택합니다.

필요한 옵션을 설정합니다.

Service Tier: 원하는 서비스 계층을 선택합니다 (예: Free).

Cloud: 데이터베이스를 배포할 지역을 선택합니다 (예: North America).

Service Basics: 서비스 이름을 작성합니다 (예: mysql-budget).

Create service를 클릭하면 서비스가 생성됩니다.

3.3 Aiven MySQL 연결 정보 확인

MySQL 서비스 생성 후 Connection Information에서 MySQL 데이터베이스에 연결할 정보를 확인할 수 있습니다.

Service URI: 데이터베이스에 연결하는 전체 URL

Username: 데이터베이스에 접근하기 위한 사용자 이름

Password: 사용자 이름에 대응하는 비밀번호

Host: 데이터베이스 서버의 호스트 주소

Port: 데이터베이스 서버에 연결하는 포트 번호

Database Name: 연결할 데이터베이스의 이름(기본적으로 defaultdb)

잠시 창을 그대로 둔 상태에서 Render 배포로 넘어가겠습니다.

4. Render 배포
4.1 Render 계정 생성

https://render.com/
 사이트에 방문하여 계정을 만듭니다.

이미 계정이 있다면 로그인합니다.

4.2 새 웹 서비스 생성

Render 대시보드에 로그인 후, "Create new Service" 버튼을 클릭합니다.

Web Service를 선택하여 새 서비스를 만듭니다.

4.3 GitHub 저장소 연결

Repository 항목에서 GitHub를 선택하여 배포할 프로젝트 저장소를 연결합니다.
(예: ogetherBudget_Project)

4.4 애플리케이션 설정

Select a service type: 서비스 타입을 설정합니다 (예: Web Service)

Name: 웹 서비스의 이름을 설정합니다 (예: ogetherBudget_Project)

Language: 서비스의 런타임 환경을 선택합니다 (예: Docker)

Branch: 브랜치 이름을 설정합니다 (예: main)

Region: 배포할 지역을 선택합니다 (예: Oregon (US West))

Root Directory Optional

Render는 기본적으로 레포지토리 최상단(/project)에서 실행하려고 합니다.

예시 구조:

/project
 ├─ realtime-budget (backend)
 └─ client_front (frontend)


하지만 우리의 백엔드는 /realtime-budget 폴더 안에 있음으로 "realtime-budget"을 입력해 줘야 합니다.

Instance Type

Instance Type: 필요한 리소스를 선택합니다 (예: Free)

Environment Variables

MySQL 데이터베이스와 연결하기 위해 환경 변수 설정입니다.

위에 Aiven MySQL 연결 정보를 확인해 Value에 실제 값을 넣어줍니다.

Aiven URL은 mysql://...로 시작합니다.
하지만 MySQL는 jdbc:mysql://로 시작하는 URL만 인식하므로,
jdbc:를 붙이고 유저와 비밀번호는 URL에서 제거합니다.

예시 변환:
mysql://(사용자이름):(비밀번호)@(호스트주소):(포트)/(데이터베이스이름)?ssl-mode=REQUIRED
→
jdbc:mysql://호스트주소:포트번호/데이터베이스이름?ssl-mode=REQUIRED

Environment Variable Key/Value 표
Key	Value
SPRING_DATASOURCE_URL	AIVEN-URL
SPRING_DATASOURCE_USERNAME	AIVEN-USERNAME
SPRING_DATASOURCE_PASSWORD	AIVEN-PASSWORD
SPRING_DATASOURCE_DRIVER-CLASS-NAME	com.mysql.cj.jdbc.Driver

DRIVER-CLASS-NAME: 기본적으로 com.mysql.cj.jdbc.Driver를 사용합니다.

Advanced는 건너뛰어도 됩니다.

5. 배포 시작

모든 설정을 완료한 후, Deploy Web Service 버튼을 클릭하면 Render가 애플리케이션을 빌드하고 배포를 시작합니다.

배포가 완료되면, 서비스 URL을 제공받습니다.

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
