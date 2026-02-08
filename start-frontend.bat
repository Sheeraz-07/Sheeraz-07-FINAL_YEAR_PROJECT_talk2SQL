@echo off
echo ================================================
echo   Starting Talk2SQL Frontend
echo ================================================
echo.

cd /d "%~dp0"

if not exist "node_modules\" (
    echo ERROR: node_modules not found!
    echo Please run: npm install
    pause
    exit /b 1
)

echo Starting Next.js development server...
echo Server will be available at http://localhost:3000
echo Press Ctrl+C to stop
echo.

npm run dev
