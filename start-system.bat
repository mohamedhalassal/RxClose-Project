@echo off
echo ================================
echo    🏥 RxClose System Startup
echo ================================
echo.

echo 📍 Current Directory: %CD%
echo.

echo 🔍 Checking Backend directory...
if exist "RxCloseAPI\RxCloseAPI" (
    echo ✅ Backend directory found
) else (
    echo ❌ Backend directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo 🔍 Checking Frontend directory...
if exist "RxClose-frontend\RxClose-main" (
    echo ✅ Frontend directory found
) else (
    echo ❌ Frontend directory not found
    echo Please make sure the frontend is in RxClose-frontend\RxClose-main
    pause
    exit /b 1
)

echo.
echo 🔄 Starting Backend API...
cd /d "%~dp0RxCloseAPI\RxCloseAPI"
start "RxClose Backend API" cmd /k "echo Starting Backend API... && dotnet run"

echo ⏳ Waiting for backend to start...
timeout /t 8

echo 🔄 Starting Frontend...
cd /d "%~dp0RxClose-frontend\RxClose-main"
start "RxClose Frontend" cmd /k "echo Starting Frontend... && npm start"

echo.
echo ✅ System is starting up!
echo.
echo 📡 Backend API: https://localhost:7000 (HTTPS) or http://localhost:5000 (HTTP)
echo 🌐 Frontend: http://localhost:4200
echo 🔐 Admin Panel: http://localhost:4200/admin
echo 📋 API Documentation: https://localhost:7000/swagger
echo.
echo 👤 Default Admin Credentials:
echo    Email: superadmin@rxclose.com
echo    Password: Admin@123
echo.
echo Press any key to exit...
pause 