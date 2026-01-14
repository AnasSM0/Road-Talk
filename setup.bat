@echo off
echo STARTING > setup_log.txt
echo NPM Version: >> setup_log.txt
call npm -v >> setup_log.txt 2>&1
echo NPX Init: >> setup_log.txt
call npx -y create-expo-app@latest RoadTalkApp --template tabs --yes >> setup_log.txt 2>&1
echo DONE >> setup_log.txt
