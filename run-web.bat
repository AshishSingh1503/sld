@echo off
echo ========================================
echo SLD App - Web Version
echo ========================================

echo.
echo 1. Starting Backend...
start "SLD Backend" cmd /k "cd /d %~dp0backend && node src/server-simple.js"

timeout /t 3 /nobreak > nul

echo.
echo 2. Starting Web Server...
start "SLD Web" cmd /k "cd /d %~dp0frontend && npx serve -s public -l 3000"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo Web App Starting...
echo ========================================
echo.
echo Backend: http://localhost:3002
echo Web App: http://localhost:3000
echo.
echo Opening browser...
start http://localhost:3000
echo.
pause