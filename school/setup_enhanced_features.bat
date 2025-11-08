@echo off
echo ========================================
echo Enhanced School Management System Setup
echo ========================================
echo.

echo Step 1: Checking MySQL connection...
mysql -u root -p -e "SELECT 'MySQL Connected Successfully!' as Status;"
if errorlevel 1 (
    echo ERROR: MySQL connection failed!
    echo Please ensure MySQL is running and credentials are correct.
    pause
    exit /b 1
)
echo.

echo Step 2: Creating/Using database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS smart_school_db;"
mysql -u root -p -e "USE smart_school_db; SELECT 'Database ready!' as Status;"
echo.

echo Step 3: Importing enhanced schema...
cd backend
mysql -u root -p smart_school_db < enhanced_schema.sql
if errorlevel 1 (
    echo ERROR: Schema import failed!
    pause
    exit /b 1
)
echo Schema imported successfully!
cd ..
echo.

echo Step 4: Installing Python dependencies...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo WARNING: Some Python packages may have failed to install.
    echo You may need to install them manually.
)
cd ..
echo.

echo Step 5: Installing Node dependencies...
call npm install
if errorlevel 1 (
    echo WARNING: Some Node packages may have failed to install.
    echo You may need to run 'npm install' manually.
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& python real_backend.py
echo 2. Start frontend: npm run dev
echo 3. Open browser: http://localhost:5173
echo.
echo Documentation:
echo - Quick Start: QUICK_START_GUIDE.md
echo - Full Guide: ENHANCED_FEATURES_COMPLETE_GUIDE.md
echo - Features: NEW_FEATURES_SUMMARY.md
echo.
pause
