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

# 2. application.properties 설정

> 📁 파일 경로: /src/main/resources/application.properties
> 

아래 설정들이 환경 변수 기반으로 포함되어야 합니다:

```
# --- MySQL ---
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=${SPRING_DATASOURCE_DRIVER-CLASS-NAME}

```

# 3. Aiven MySQL 설정

**Aiven**은 MySQL을 포함한 다양한 데이터베이스 서비스를 클라우드에서 쉽게 관리할 수 있게 해주는 플랫폼입니다. 아래는 **Aiven**에 MySQL을 배포하고, **Render** 애플리케이션과 연결하는 단계입니다.

## 3.1 Aiven 계정 생성

- https://aiven.io/에 방문하여 계정을 생성합니다.

## 3.2 MySQL 서비스 생성

- Aiven 대시보드에 로그인한 후, **"Create new service"에서** **MySQL**을 선택합니다.
- 필요한 옵션을 설정합니다.
    - **Service Tier**: 원하는 서비스 계층을 선택합니다 (예: `Free`).
    - **Cloud**: 데이터베이스를 배포할 지역을 선택합니다 (예: `North America`).
    - **Service Basics**: 서비스 이름을 작성합니다 (예: `mysql-budget`).
    - Create service를 클릭하면 서비스가 생성됩니다.

## 3.3 Aiven MySQL 연결 정보 확인

MySQL 서비스 생성 후 **Connection Information**에서 MySQL 데이터베이스에 연결할 정보를 확인할 수 있습니다.

- **Service URI**: 데이터베이스에 연결하는 전체 URL
- **Username**: 데이터베이스에 접근하기 위한 사용자 이름
- **Password**: 사용자 이름에 대응하는 비밀번호
- **Host**: 데이터베이스 서버의 호스트 주소
- **Port**: 데이터베이스 서버에 연결하는 포트 번호
- **Database Name**: 연결할 데이터베이스의 이름(기본적으로 defaultdb)

잠시 창을 그대로 둔 상태에서 Render 배포로 넘어가겠습니다.

# 4. Render 배포

## 4.1 Render 계정 생성

- https://render.com/ 사이트에 방문하여 계정을 만듭니다.
- 이미 계정이 있다면 로그인합니다.

## 4.2 새 웹 서비스 생성

- Render 대시보드에 로그인 후, **"Create new Service"** 버튼을 클릭합니다.
- **Web Service**를 선택하여 새 서비스를 만듭니다.

## 4.3 GitHub 저장소 연결

- **Repository** 항목에서 `GitHub`를 선택하여 배포할 프로젝트 저장소를 연결합니다.
    
    (예: `ogetherBudget_Project`)

## 4.4 애플리케이션 설정

- **Select a service type**: 서비스 타입을 설정합니다 (예: Web Service)
- **Name**: 웹 서비스의 이름을 설정합니다 (예: `ogetherBudget_Project`)
- **Language**: 서비스의 런타임 환경을 선택합니다 (예: `Docker`)
- **Branch**: 브랜치 이름을 설정합니다 (예: `main`)
- **Region**: 배포할 지역을 선택합니다 (예: `Oregon (US West)`)

### Root Directory Optional

Render는 기본적으로 레포지토리 최상단(/project)에서 실행하려고 합니다.

예시 구조:

```
/project
 ├─ realtime-budget (backend)
 └─ client_front (frontend)
```

하지만 우리의 백엔드는 `/realtime-budget` 폴더 안에 있음으로 `"realtime-budget"`을 입력해 줘야 합니다.

### Instance Type

- **Instance Type**: 필요한 리소스를 선택합니다 (예: `Free`)

### Environment Variables

MySQL 데이터베이스와 연결하기 위해 **환경 변수 설정입니다.**

- 위에 **Aiven MySQL 연결 정보를 확인해 Value에 실제 값을 넣어줍니다.**
- Aiven URL은 `mysql://...`로 시작합니다.
    
    하지만 MySQL는 `jdbc:mysql://`로 시작하는 URL만 인식하므로,
    
    `jdbc:`를 붙이고 유저와 비밀번호는 URL에서 제거합니다.
    

### 예시 변환:

```
mysql://(사용자이름):(비밀번호)@(호스트주소):(포트)/(데이터베이스이름)?ssl-mode=REQUIRED

→

jdbc:mysql://호스트주소:포트번호/데이터베이스이름?ssl-mode=REQUIRED

```

### Environment Variable Key/Value 표

| Key | Value |
| --- | --- |
| SPRING_DATASOURCE_URL | AIVEN-URL |
| SPRING_DATASOURCE_USERNAME | AIVEN-USERNAME |
| SPRING_DATASOURCE_PASSWORD | AIVEN-PASSWORD |
| SPRING_DATASOURCE_DRIVER-CLASS-NAME | com.mysql.cj.jdbc.Driver |

- **DRIVER-CLASS-NAME**: 기본적으로 `com.mysql.cj.jdbc.Driver`를 사용합니다.
- **Advanced**는 건너뛰어도 됩니다.

# 5. 배포 시작

- 모든 설정을 완료한 후, **Deploy Web Service** 버튼을 클릭하면 Render가 애플리케이션을 빌드하고 배포를 시작합니다.
- 배포가 완료되면, 서비스 URL을 제공받습니다.

# **6. 로컬 개발 환경 설정**

## **6.1 패키지 설치**

아래 명령으로 프론트엔드 의존성을 설치합니다.

```
npm install
```

## **6.2 환경 변수 설정 (.env.development 자동 로드)**

Vite는 `mode=development`일 때 최상위 디렉토리의 `.env.development` 파일을 자동으로 인식합니다.

예시:

```
VITE_API_BASE_URL=http://localhost:8080
```

## **6.3 개발 서버 실행**

```
npm run dev
```

- 이 단계에서는 빌드를 수행할 필요가 없습니다.
- 개발 모드에서는 `vite.config.js`의 proxy 설정이 자동 적용됩니다.
- 백엔드 API와 웹소켓도 프록시에 포함되므로 CORS 문제가 발생하지 않습니다.

# **7. 운영 빌드(로컬 테스트용)**

운영 환경과 동일한 결과물을 로컬에서 테스트하고 싶은 경우에만 사용합니다.

## **7.1 빌드**

```
npm run build
```

## **7.2 빌드 결과 미리보기**

```
npm run preview
```

- 운영 빌드가 실제로 어떻게 동작하는지 확인할 때만 사용하는 과정입니다.
- Vercel은 배포 시 자체적으로 빌드를 수행하므로 배포 과정에서는 직접 빌드할 필요가 없습니다.

# **8. Vercel 배포**

## **8.1 프로젝트 Import**

Vercel 메인 화면에서:

1. **Add New… → Project** 선택
2. 배포할 Git 저장소를 선택 후 Import를 클릭합니다.
3. Framework Preset을 **Vite**로 설정
4. Root Directory를 **client-front**로 지정
5. Environment Variables에 아래와 같이 입력:
- 입력되는 URL 값은 5번 단계 (배포 시작)에서 제공받은 URL을 입력합니다.

```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

이후 Deploy 버튼을 클릭합니다.

## **8.2 배포 진행**

"Deploy" 버튼을 클릭하면 자동으로 빌드와 배포가 진행되며, 완료 후 Vercel에서 기본 도메인이 생성됩니다. 

이후 화면 하단의 버튼을 눌러 **Production Deployment** 목록으로 이동한 뒤,

**Domains** 최상단에 표시된 도메인을 클릭하면 배포된 프론트엔드에 접속할 수 있습니다.

# **9. 구조가 이렇게 설계된 이유**

## **9.1 Vite가 `.env.*` 파일을 분리하는 이유**

Vite는 빌드 시점에 모드별 환경 변수를 자동으로 로드합니다.

| 모드 | 적용되는 파일 |
| --- | --- |
| development | `.env.development` |
| production | `.env.production` |

따라서:

- 로컬 개발과 운영 서버의 API 주소를 자동으로 구분할 수 있고
- `VITE_` prefix가 붙은 변수만 브라우저에 노출되도록 제한되어 보안적으로도 안전합니다.

## **9.2 왜 vite.config.js에서 env를 불러와야 하는가?**

핵심 이유는 Proxy 설정을 개발 모드에서만 사용하기 위해서입니다.

### 개발 환경

- 프론트는 5173, 백엔드는 8080에서 실행되는 경우가 많음
- 기본적으로 CORS 문제가 발생
- 이를 해결하기 위해 **Vite Proxy 필요**
- 따라서 개발 모드일 때만 proxy 설정이 적용되도록 분기합니다.

### 운영 환경

- 빌드된 정적 파일만 서비스되므로 proxy 불필요
- 프론트엔드는 직접 백엔드 도메인을 호출하게 됨

따라서 아래와 같이 분기하는 구조가 필요합니다:

```jsx
mode === 'development'
  ? { server: { proxy: { ... }}}
  : {};
```

정리하면,

- 개발 모드 = Proxy 필요 (CORS 해결)
- 운영 모드 = Proxy 불필요 (정적 배포 환경)
