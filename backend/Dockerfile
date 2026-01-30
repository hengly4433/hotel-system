FROM gradle:jdk21 AS builder

WORKDIR /home/gradle/project

# Copy only necessary files for dependency resolution first (caching)
COPY backend/settings.gradle backend/build.gradle ./
COPY backend/gradle ./gradle

# Copy source code
COPY backend/src ./src
COPY backend/. .

# Copy db migrations as they are needed for the build or runtime config references
COPY db /home/gradle/db

# Build the application
RUN gradle bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built artifact
COPY --from=builder /home/gradle/project/build/libs/*.jar app.jar

# Copy database migrations
COPY --from=builder /home/gradle/db /app/db

# Expose port
EXPOSE 8080

# Configure Flyway to look for migrations in the correct place inside container
# We use /app/db/migrations because we copied db to /app/db
ENV SPRING_FLYWAY_LOCATIONS=filesystem:/app/db/migrations

ENTRYPOINT ["java", "-jar", "app.jar"]
