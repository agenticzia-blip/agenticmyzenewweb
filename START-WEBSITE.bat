@echo off
title AgenticMyze Website
cd /d "%~dp0"
echo ============================================
echo  AgenticMyze Website - starting...
echo  Keep this window OPEN while you view the site.
echo  Close it to stop the website.
echo ============================================
echo.
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js is NOT installed on this computer.
  echo.
  echo Install it first (free, 2 minutes):
  echo   1. Go to https://nodejs.org
  echo   2. Download the LTS version and install it
  echo   3. Double-click START-WEBSITE.bat again
  echo.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo First run - installing what the site needs, please wait...
  call npm install
  echo.
)
echo Starting server on http://localhost:3000
echo Opening your browser...
start http://localhost:3000
call npm start
pause
