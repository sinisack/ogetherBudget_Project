# 📌 프로젝트 환경 및 실행 가이드

실시간 협업 가계부 WIZLET

## ⚙️ Version

### 🖥 Backend

* **Java**: 17
* **Spring Boot**: 3.5.6
* **Gradle**: (Spring Boot Plugin 포함)
* **Spring MVC (Web)**
* **Spring Data JPA**
* **Spring Security + JWT**
* **WebSocket + STOMP**
* **Hibernate Validator**
* **Lombok**

### 🗄 Database

* **MySQL**: 8.0.33

---

### 💻 Frontend

* **Node.js**: 22.14.0
* **React**: 19.1.1
* **Vite**: 7.1.7
* **ESLint**: 9.36.0

---

## 🖥 Backend 설정

📁 **파일 경로**: `application.properties`
아래와 같은 주요 설정을 포함해야 합니다:

* MySQL DB 접속 정보
* JPA 설정
* JWT Secret Key
* WebSocket/STOMP 설정
* 기타 서버 환경 변수

---

## 📦 프론트엔드 설치 & 실행

### 1️⃣ 패키지 설치

```
npm install
```

### 2️⃣ 주요 사용 패키지

#### Dependencies

* **react, react-dom** – UI 렌더링
* **react-router-dom** – 라우팅
* **axios** – API 통신
* **recharts** – 통계 그래프
* **phosphor-react** – 아이콘
* **sockjs-client, stompjs** – 실시간(WebSocket) 협업 기능 구현

#### Dev Dependencies

* **vite** – 프론트엔드 빌드 도구
* **@vitejs/plugin-react** – React 지원
* **eslint** 관련 플러그인
* **@types/react, @types/react-dom** – 타입 지원

---

## 🚀 실행 방법

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
