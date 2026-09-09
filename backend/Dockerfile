# Construcción (Usamos Maven con Java 21)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
# Descargar dependencias para aprovechar la caché de Docker
RUN mvn dependency:go-offline
COPY src ./src
# Compilamos saltando los tests por ahora para que sea rápido
RUN mvn clean package -DskipTests

# Ejecución (Solo el JRE, mucho más ligero y seguro)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Buena práctica de seguridad: Crear un usuario que no sea root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/target/*.jar app.jar

# Regla estricta: usar ENTRYPOINT
ENTRYPOINT ["java", "-jar", "app.jar"]