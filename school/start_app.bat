@echo off
echo Starting Smart School Application...
echo.

echo Starting Backend Server...
cd /d "C:\Users\MARY\Desktop\school\school\backend"
start "Backend Server" cmd /k "python run.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd /d "C:\Users\MARY\Desktop\school\school"
start "Frontend Server" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3002
echo.
echo Press any key to exit...
pause > nul

