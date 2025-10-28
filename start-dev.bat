@echo off
echo ========================================
echo SLD App - Starting Development Servers
echo ========================================

echo.
echo Starting Backend Server...
start "SLD Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Metro Server...
start "SLD Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Development servers are starting...
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: React Native Metro Bundler
echo.
echo To run on Android: cd frontend && npm run android
echo To run on iOS: cd frontend && npm run ios
echo.
echo Press any key to exit...
pause > nul