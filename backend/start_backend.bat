@echo off
echo Starting Smart School Backend...
echo.

REM Try different Python paths
if exist "C:\Python311\python.exe" (
    echo Found Python at C:\Python311\python.exe
    C:\Python311\python.exe run.py
    goto :end
)

if exist "C:\Python310\python.exe" (
    echo Found Python at C:\Python310\python.exe
    C:\Python310\python.exe run.py
    goto :end
)

if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe" (
    echo Found Python in AppData
    "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe" run.py
    goto :end
)

REM Try system python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using system Python
    python run.py
    goto :end
)

echo Python not found! Please install Python 3.11+
pause

:end
echo Backend stopped.
pause
