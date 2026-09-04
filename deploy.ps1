# Deployment Automation Script
$ErrorActionPreference = "Stop"

Write-Host "--- Starting Deployment Build ---" -ForegroundColor Cyan

# 1. Backend Build
Write-Host "Building Backend JAR..." -ForegroundColor Yellow
cd backend
.\mvnw clean package -DskipTests

# 2. Check for Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "Building Docker Image..." -ForegroundColor Yellow
    docker build -t vehicle-rental-backend .
    Write-Host "Docker image 'vehicle-rental-backend' is ready!" -ForegroundColor Green
} else {
    Write-Host "Docker not found. Skipping image build." -ForegroundColor DarkYellow
}

Write-Host "--- Build Complete ---" -ForegroundColor Green
Write-Host "You can now run the backend using: java -jar backend/target/backend-0.0.1-SNAPSHOT.jar"
