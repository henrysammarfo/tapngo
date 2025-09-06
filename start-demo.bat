@echo off
echo Starting TapNGo Pay Demo...

echo.
echo 1. Starting Backend Demo Server...
start "Backend" cmd /k "cd packages\backend && node src\app-demo.js"

echo.
echo 2. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 3. Starting Frontend...
start "Frontend" cmd /k "cd packages\nextjs && yarn start"

echo.
echo 4. Opening demo page...
timeout /t 10 /nobreak > nul
start http://localhost:3000/demo

echo.
echo Demo is starting up!
echo - Backend: http://localhost:3001
echo - Frontend: http://localhost:3000
echo - Demo Page: http://localhost:3000/demo
echo.
echo Press any key to exit...
pause > nul
