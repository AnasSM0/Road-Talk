@echo off
echo ===========================================
echo       Fixing RoadWave Dependencies
echo ===========================================

echo 1. Cleaning Cache and Modules...
rmdir /s /q node_modules
del package-lock.json

echo 2. Installing All Dependencies...
call npm install

echo 3. Force Installing expo-av...
call npm install expo-av expo-location --save

echo ===========================================
echo Connect your phone now!
echo Starting with cache clear...
echo ===========================================
call npx expo start --clear

pause
