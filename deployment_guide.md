# Deployment Guide: Vehicle Rental System

This guide explains how to deploy the Spring Boot backend and React frontend to cloud platforms like Render, Railway, or any VPS with Docker support.

## 🗄️ Database Setup (PostgreSQL)

The application is configured to use PostgreSQL. 
- **Local:** Ensure Postgres is running on `localhost:5432`.
- **Cloud:** When deploying to Render/Railway, they will provide a Connection String.
- **Env Vars:**
  - `DB_URL`: JDBC URL (e.g., `jdbc:postgresql://host:port/db`)
  - `DB_USERNAME`: Database user
  - `DB_PASSWORD`: Database password

## ⚡ Caching Setup (Redis)

Redis is required for the caching layer.
- **Local:** The application looks for Redis at `localhost:6379`.
- **Cloud:** Add a Redis service and provide the host/port via env vars:
  - `REDIS_HOST`: Redis hostname
  - `REDIS_PORT`: Redis port (default 6379)

## 🐳 Docker Deployment (Recommended)

1. **Build the Image:**
   ```powershell
   cd backend
   docker build -t vehicle-rental-backend .
   ```
2. **Run the Container:**
   ```powershell
   docker run -p 8080:8080 `
     -e DB_URL=jdbc:postgresql://your-db-host:5432/dbname `
     -e DB_USERNAME=user `
     -e DB_PASSWORD=pass `
     vehicle-rental-backend
   ```

## 🚀 Cloud Platform Steps

### Render / Railway
1. **New Service** -> **Web Service**.
2. **Repository:** Connect your GitHub repo.
3. **Build Command:** `mvn clean package -DskipTests`
4. **Start Command:** `java -jar target/*.jar`
5. **Environment Variables:**
   - `SERVER_PORT`: `8080`
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
