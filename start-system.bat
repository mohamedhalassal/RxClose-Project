@echo off
echo ================================
echo    RxClose System Startup
echo ================================
echo.

echo 🔄 Starting Backend API...
cd /d "C:\Users\ezzmo\Desktop\RxClose-backend\RxCloseAPI\RxCloseAPI"
start "Backend API" cmd /k "dotnet run"

echo ⏳ Waiting for backend to start...
timeout /t 5

echo 🔄 Starting Frontend...
cd /d "C:\Users\ezzmo\Desktop\RxClose-main(2)\RxClose-main"
start "Frontend Angular" cmd /k "ng serve"

echo.
echo ✅ System is starting up!
echo.
echo 📡 Backend API: http://localhost:5000
echo 🌐 Frontend: http://localhost:4200
echo 🔑 Forgot Password: http://localhost:4200/auth/forgot-password
echo.
echo Press any key to exit...
pause 