@echo off
echo ========================================
echo SLD App - Development Setup
echo ========================================

echo.
echo 1. Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed
    pause
    exit /b 1
)

echo.
echo 2. Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed
    pause
    exit /b 1
)

echo.
echo 3. Setting up MongoDB Database...
cd ..\backend
call npm run setup-db
if %errorlevel% neq 0 (
    echo WARNING: Database setup failed - make sure MongoDB is running
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Start MongoDB: mongod
echo 2. Start Backend: cd backend && npm run dev
echo 3. Start Frontend: cd frontend && npm start
echo 4. Run Android: cd frontend && npm run android
echo.
echo Or use: make dev (if you have make installed)
echo.
pause