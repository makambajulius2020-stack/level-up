@echo off
echo Importing Smart School Database...
echo.

REM Try different XAMPP paths
if exist "C:\xampp\mysql\bin\mysql.exe" (
    echo Found XAMPP at C:\xampp\
    cd /d "C:\xampp\mysql\bin"
    goto :import
)

if exist "D:\xampp\mysql\bin\mysql.exe" (
    echo Found XAMPP at D:\xampp\
    cd /d "D:\xampp\mysql\bin"
    goto :import
)

if exist "C:\Program Files\xampp\mysql\bin\mysql.exe" (
    echo Found XAMPP at C:\Program Files\xampp\
    cd /d "C:\Program Files\xampp\mysql\bin"
    goto :import
)

echo XAMPP MySQL not found! Please install XAMPP or update the path.
pause
exit /b 1

:import
echo Creating database...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS smart_school_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %errorlevel% neq 0 (
    echo Failed to create database. Make sure MySQL is running.
    pause
    exit /b 1
)

echo Importing schema...
mysql -u root smart_school_db < "%~dp0database_schema.sql"
if %errorlevel% neq 0 (
    echo Failed to import schema. Check if database_schema.sql exists.
    pause
    exit /b 1
)

echo.
echo Database import completed!
echo Press any key to exit...
pause > nul
