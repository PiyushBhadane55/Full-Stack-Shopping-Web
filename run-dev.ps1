# Development helper script for Nexus Portal (Local Execution)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "     NEXUS PORTAL DEVELOPMENT STARTUP        " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[IMPORTANT] Please ensure you have PostgreSQL running locally on Port 5432" -ForegroundColor Yellow
Write-Host "and you have created the databases 'user_db' and 'shopping_db'." -ForegroundColor Yellow
Write-Host "You can create them by executing: " -ForegroundColor White
Write-Host "  CREATE DATABASE user_db;" -ForegroundColor White
Write-Host "  CREATE DATABASE shopping_db;" -ForegroundColor White
Write-Host ""
Write-Host "Starting all services..." -ForegroundColor Cyan

# 1. Start Backend services
Write-Host "[1/4] Starting User Management Service on Port 8081..." -ForegroundColor Yellow
Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "./user-service" -NoNewWindow

Write-Host "[2/4] Starting Auth/Login POJO Service on Port 8082..." -ForegroundColor Yellow
Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "./auth-service" -NoNewWindow

Write-Host "[3/4] Starting Shopping Portal Service on Port 8083..." -ForegroundColor Yellow
Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "./shopping-service" -NoNewWindow

# 2. Start Frontend
Write-Host "[4/4] Starting React Frontend on Port 5173..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "./frontend" -NoNewWindow

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "     ALL SERVICES LAUNCHED SUCCESSFULLY      " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host " Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host " User Service: http://localhost:8081/api/users" -ForegroundColor Green
Write-Host " Auth Service: http://localhost:8082/api/auth" -ForegroundColor Green
Write-Host " Shopping Service: http://localhost:8083/api/products" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Note: Press Ctrl+C in this terminal window to exit, or close the processes." -ForegroundColor White
