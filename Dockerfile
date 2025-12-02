# ── 1) Build stage ─────────────────────────────────────────
FROM gradle:8.5-jdk21 AS builder
WORKDIR /app

# 소스 복사
COPY . .

# 시스템 Gradle로 빌드 (wrapper 없이)
RUN gradle clean build -x test --no-daemon

# ── 2) Runtime stage ────────────────────────────────────────
FROM eclipse-temurin:21-jdk
WORKDIR /app

ADD https://dtdg.co/latest-java-tracer /app/dd-java-agent.jar
RUN chmod 644 /app/dd-java-agent.jar

# builder 스테이지에서 생성된 fat-jar만 복사
COPY --from=builder /app/build/libs/*SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-javaagent:/app/dd-java-agent.jar", "-jar", "app.jar"]
