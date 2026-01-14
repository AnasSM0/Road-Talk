@echo off
echo Moving files from RoadTalkApp to root...
REM Robocopy returns codes 0-7 for success.
robocopy "RoadTalkApp" "." /E /MOVE /IS /IT /NFL /NDL /NJH /NJS
if %ERRORLEVEL% GTR 7 (
    echo Robocopy failed with error %ERRORLEVEL%
) else (
    echo Robocopy success.
)

REM Clean up empty source dir if any
if exist "RoadTalkApp" rmdir "RoadTalkApp" /s /q

echo Installing dependencies...
call npm install @supabase/supabase-js expo-secure-store react-native-url-polyfill zustand expo-location expo-keep-awake lucide-react-native clsx tailwind-merge
echo Installing Expo modules...
call npx expo install react-native-webrtc @config-plugins/react-native-webrtc
echo DONE.
