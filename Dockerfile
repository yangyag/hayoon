FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /workspace/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM eclipse-temurin:25-jdk-jammy AS backend-builder
WORKDIR /workspace

COPY gradle gradle
COPY gradlew build.gradle settings.gradle ./
RUN chmod +x gradlew

COPY src src
COPY --from=frontend-builder /workspace/frontend/dist ./frontend/dist

RUN ./gradlew clean bootJar -PskipFrontendNpm=true --no-daemon

FROM eclipse-temurin:25-jre-jammy
WORKDIR /app

COPY --from=backend-builder /workspace/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
