@echo off
echo ========================================
echo SLD App - Starting Application
echo ========================================

echo.
echo 1. Starting Backend Server...
start "SLD Backend" cmd /k "cd /d %~dp0backend && node src/server-simple.js"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 2. Starting React Native Metro...
start "SLD Metro" cmd /k "cd /d %~dp0frontend && npx react-native start"

echo Waiting for Metro to start...
timeout /t 10 /nobreak > nul

echo.
echo 3. Starting Android App...
start "SLD Android" cmd /k "cd /d %~dp0frontend && npx react-native run-android"

echo.
echo ========================================
echo Application Starting...
echo ========================================
echo.
echo Backend: http://localhost:3002
echo Metro: http://localhost:8081
echo.
echo Check the opened terminal windows for status
echo Press any key to exit this script...
pause > nul