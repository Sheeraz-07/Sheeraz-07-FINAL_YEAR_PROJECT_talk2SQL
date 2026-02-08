@echo off
echo ================================================
echo   Starting Talk2SQL Backend Server
echo ================================================
echo.

if not exist "venv\" (
    echo ERROR: Virtual environment not found!
    echo Please run setup first:
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r backend\requirements.txt
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

cd backend

echo.
echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop
echo.

uvicorn app.main:app --reload --port 8000
