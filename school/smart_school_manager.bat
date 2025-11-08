@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Smart School - Unified Management Script
REM ========================================
REM This script combines all functionality from multiple .bat files
REM into one comprehensive management tool

title Smart School Management System

:main_menu
cls
echo.
echo ========================================
echo    Smart School Management System
echo ========================================
echo.
echo Choose an option:
echo.
echo [1] Complete Setup (Database + Dependencies)
echo [2] Import Database Only
echo [3] Start Backend Only
echo [4] Start Frontend Only
echo [5] Start Both Servers
echo [6] Fix and Start App
echo [7] Setup Enhanced Features
echo [8] Check System Status
echo [9] Install Dependencies
echo [0] Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto complete_setup
if "%choice%"=="2" goto import_database
if "%choice%"=="3" goto start_backend
if "%choice%"=="4" goto start_frontend
if "%choice%"=="5" goto start_both
if "%choice%"=="6" goto fix_and_start
if "%choice%"=="7" goto setup_enhanced
if "%choice%"=="8" goto check_status
if "%choice%"=="9" goto install_deps
if "%choice%"=="0" goto exit
goto invalid_choice

REM ========================================
REM Complete Setup
REM ========================================
:complete_setup
cls
echo ========================================
echo Complete Smart School Setup
echo ========================================
echo.

echo Step 1: Checking MySQL connection...
call :check_mysql
if errorlevel 1 (
    echo ERROR: MySQL connection failed!
    echo Please ensure MySQL/XAMPP is running.
    pause
    goto main_menu
)

echo Step 2: Creating/Using database...
call :create_database
if errorlevel 1 (
    echo ERROR: Database creation failed!
    pause
    goto main_menu
)

echo Step 3: Importing database schema...
call :import_schema
if errorlevel 1 (
    echo ERROR: Schema import failed!
    pause
    goto main_menu
)

echo Step 4: Installing Python dependencies...
call :install_python_deps

echo Step 5: Installing Node dependencies...
call :install_node_deps

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo - Use option [5] to start both servers
echo - Or use options [3] and [4] separately
echo.
pause
goto main_menu

REM ========================================
REM Import Database Only
REM ========================================
:import_database
cls
echo ========================================
echo Import Database Only
echo ========================================
echo.

call :check_mysql
if errorlevel 1 (
    echo ERROR: MySQL connection failed!
    pause
    goto main_menu
)

call :create_database
if errorlevel 1 (
    echo ERROR: Database creation failed!
    pause
    goto main_menu
)

call :import_schema
if errorlevel 1 (
    echo ERROR: Schema import failed!
    pause
    goto main_menu
)

echo Database import completed successfully!
pause
goto main_menu

REM ========================================
REM Start Backend Only
REM ========================================
:start_backend
cls
echo ========================================
echo Starting Backend Server
echo ========================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    goto main_menu
)

echo Python found:
python --version

echo.
echo Starting backend server...
cd /d "%~dp0backend"

REM Use the unified backend manager
if exist "run.py" (
    echo Using unified backend manager...
    start "Backend Server" cmd /k "python run.py"
) else (
    echo ERROR: run.py not found!
    echo Please ensure you're in the correct directory
    pause
    goto main_menu
)

echo Backend server is starting...
echo Backend will be available at: http://localhost:5000
echo.
pause
goto main_menu

REM ========================================
REM Start Frontend Only
REM ========================================
:start_frontend
cls
echo ========================================
echo Starting Frontend Server
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    pause
    goto main_menu
)

echo Node.js found:
node --version

echo.
echo Starting frontend server...
cd /d "%~dp0"

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies first...
    call npm install
)

start "Frontend Server" cmd /k "npm run dev"

echo Frontend server is starting...
echo Frontend will be available at: http://localhost:5173
echo.
pause
goto main_menu

REM ========================================
REM Start Both Servers
REM ========================================
:start_both
cls
echo ========================================
echo Starting Both Servers
echo ========================================
echo.

echo Starting Backend Server...
cd /d "%~dp0backend"

if exist "run.py" (
    start "Backend Server" cmd /k "python run.py"
) else (
    echo ERROR: run.py not found!
    echo Please ensure you're in the correct directory
    pause
    goto main_menu
)

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Check the opened command windows for status
echo.
pause
goto main_menu

REM ========================================
REM Fix and Start App
REM ========================================
:fix_and_start
cls
echo ========================================
echo Fix and Start App
echo ========================================
echo.

echo Clearing cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "dist" rmdir /s /q "dist"

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
)

echo Starting development server...
start "Frontend Server" cmd /k "npm run dev"

echo Development server started!
echo Frontend: http://localhost:5173
echo.
pause
goto main_menu

REM ========================================
REM Setup Enhanced Features
REM ========================================
:setup_enhanced
cls
echo ========================================
echo Setup Enhanced Features
echo ========================================
echo.

echo Step 1: Checking MySQL connection...
call :check_mysql
if errorlevel 1 (
    echo ERROR: MySQL connection failed!
    pause
    goto main_menu
)

echo Step 2: Creating/Using database...
call :create_database

echo Step 3: Importing enhanced schema...
cd backend
if exist "enhanced_schema.sql" (
    mysql -u root -p smart_school_db < enhanced_schema.sql
    if errorlevel 1 (
        echo ERROR: Enhanced schema import failed!
        pause
        goto main_menu
    )
    echo Enhanced schema imported successfully!
) else (
    echo WARNING: enhanced_schema.sql not found, using regular schema...
    mysql -u root -p smart_school_db < "%~dp0database_schema.sql"
)
cd ..

echo Step 4: Installing Python dependencies...
call :install_python_deps

echo Step 5: Installing Node dependencies...
call :install_node_deps

echo.
echo ========================================
echo Enhanced Features Setup Complete!
echo ========================================
echo.
echo Next steps:
echo - Use option [5] to start both servers
echo - Open browser: http://localhost:5173
echo.
pause
goto main_menu

REM ========================================
REM Check System Status
REM ========================================
:check_status
cls
echo ========================================
echo System Status Check
echo ========================================
echo.

echo Checking Python...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python: 
    python --version
) else (
    echo ❌ Python: Not installed or not in PATH
)

echo.
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js: 
    node --version
) else (
    echo ❌ Node.js: Not installed or not in PATH
)

echo.
echo Checking MySQL...
call :check_mysql
if %errorlevel% == 0 (
    echo ✅ MySQL: Connected successfully
) else (
    echo ❌ MySQL: Connection failed
)

echo.
echo Checking Backend Files...
if exist "backend\run.py" (
    echo ✅ Backend: Unified run.py found
) else if exist "backend\real_backend.py" (
    echo ✅ Backend: real_backend.py found
) else (
    echo ❌ Backend: No backend files found
)

echo.
echo Checking Frontend Files...
if exist "package.json" (
    echo ✅ Frontend: package.json found
) else (
    echo ❌ Frontend: package.json not found
)

echo.
echo Checking Dependencies...
if exist "node_modules" (
    echo ✅ Node Dependencies: Installed
) else (
    echo ❌ Node Dependencies: Not installed
)

if exist "backend\requirements.txt" (
    echo ✅ Python Dependencies: requirements.txt found
) else (
    echo ❌ Python Dependencies: requirements.txt not found
)

echo.
pause
goto main_menu

REM ========================================
REM Install Dependencies
REM ========================================
:install_deps
cls
echo ========================================
echo Install Dependencies
echo ========================================
echo.

echo Installing Python dependencies...
cd backend
if exist "requirements.txt" (
    pip install -r requirements.txt
    if errorlevel 1 (
        echo WARNING: Some Python packages may have failed to install
    ) else (
        echo ✅ Python dependencies installed successfully
    )
) else (
    echo ❌ requirements.txt not found
)
cd ..

echo.
echo Installing Node dependencies...
if exist "package.json" (
    call npm install
    if errorlevel 1 (
        echo WARNING: Some Node packages may have failed to install
    ) else (
        echo ✅ Node dependencies installed successfully
    )
) else (
    echo ❌ package.json not found
)

echo.
pause
goto main_menu

REM ========================================
REM Helper Functions
REM ========================================

:check_mysql
REM Try different XAMPP paths
if exist "C:\xampp\mysql\bin\mysql.exe" (
    set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
    goto :test_mysql
)

if exist "D:\xampp\mysql\bin\mysql.exe" (
    set MYSQL_PATH=D:\xampp\mysql\bin\mysql.exe
    goto :test_mysql
)

if exist "C:\Program Files\xampp\mysql\bin\mysql.exe" (
    set MYSQL_PATH=C:\Program Files\xampp\mysql\bin\mysql.exe
    goto :test_mysql
)

REM Try system MySQL
mysql --version >nul 2>&1
if %errorlevel% == 0 (
    set MYSQL_PATH=mysql
    goto :test_mysql
)

echo XAMPP MySQL not found! Please install XAMPP or update the path.
exit /b 1

:test_mysql
"%MYSQL_PATH%" -u root -e "SELECT 'MySQL Connected Successfully!' as Status;" >nul 2>&1
exit /b %errorlevel%

:create_database
"%MYSQL_PATH%" -u root -e "CREATE DATABASE IF NOT EXISTS smart_school_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>&1
if %errorlevel% neq 0 (
    echo Failed to create database. Make sure MySQL is running.
    exit /b 1
)
echo Database created/verified successfully
exit /b 0

:import_schema
if exist "database_schema.sql" (
    "%MYSQL_PATH%" -u root smart_school_db < "database_schema.sql" >nul 2>&1
    if %errorlevel% neq 0 (
        echo Failed to import schema. Check if database_schema.sql exists.
        exit /b 1
    )
    echo Schema imported successfully
) else (
    echo WARNING: database_schema.sql not found
)
exit /b 0

:install_python_deps
cd backend
if exist "requirements.txt" (
    pip install -r requirements.txt >nul 2>&1
    if errorlevel 1 (
        echo WARNING: Some Python packages may have failed to install
    ) else (
        echo ✅ Python dependencies installed successfully
    )
) else (
    echo ❌ requirements.txt not found
)
cd ..
exit /b 0

:install_node_deps
if exist "package.json" (
    call npm install >nul 2>&1
    if errorlevel 1 (
        echo WARNING: Some Node packages may have failed to install
    ) else (
        echo ✅ Node dependencies installed successfully
    )
) else (
    echo ❌ package.json not found
)
exit /b 0

REM ========================================
REM Error Handling
REM ========================================
:invalid_choice
echo.
echo Invalid choice! Please enter a number between 0-9.
timeout /t 2 /nobreak > nul
goto main_menu

:exit
echo.
echo Thank you for using Smart School Management System!
echo.
timeout /t 2 /nobreak > nul
exit /b 0
