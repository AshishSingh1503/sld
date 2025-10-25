@echo off
echo ========================================
echo SLD App - Local Test
echo ========================================

echo.
echo Starting Backend Server on port 3002...
start "SLD Backend" cmd /k "cd backend && node src/server-simple.js"

timeout /t 3 /nobreak > nul

echo.
echo Backend started at: http://localhost:3002
echo Health check: http://localhost:3002/health
echo.
echo To test the API:
echo curl http://localhost:3002/health
echo.
echo For frontend, you can:
echo 1. Use React Native CLI: cd frontend && npx react-native start
echo 2. Test API endpoints with Postman or curl
echo.
pause