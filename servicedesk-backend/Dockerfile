FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

COPY servicedesk-backend/.mvn/ .mvn/
COPY servicedesk-backend/mvnw servicedesk-backend/pom.xml ./
COPY servicedesk-backend/src/ src/

RUN chmod +x mvnw && ./mvnw -DskipTests package && \
    find target -maxdepth 1 -type f -name '*.jar' \
    ! -name '*.original' -exec cp {} /app.jar \;

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN useradd --system --uid 10001 appuser

COPY --from=build --chown=appuser:appuser /app.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]