# ---------- Build stage ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Gradle 래퍼와 설정 복사
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x ./gradlew

# 소스 복사 후 빌드
COPY src ./src
RUN ./gradlew bootJar -x test

# ---------- Run stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# 빌드된 JAR 복사
COPY --from=build /app/build/libs/*.jar app.jar

# Render의 기본 포트 변수
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]