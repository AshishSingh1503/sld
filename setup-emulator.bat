@echo off
echo ========================================
echo Android Emulator Setup
echo ========================================

echo.
echo 1. Download Android Studio from:
echo https://developer.android.com/studio
echo.
echo 2. Install Android Studio and open it
echo.
echo 3. Go to Tools > AVD Manager
echo.
echo 4. Click "Create Virtual Device"
echo.
echo 5. Select "Phone" > "Pixel 4" > Next
echo.
echo 6. Select "API 33" or "API 34" > Next > Finish
echo.
echo 7. Click the Play button to start emulator
echo.
echo 8. Once emulator is running, execute:
echo    cd frontend
echo    npx react-native run-android
echo.
pause