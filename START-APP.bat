@echo off
echo ========================================
echo   Maison Royale Management App
echo ========================================
echo.
echo Starting application...
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call pnpm install
    echo.
)

:: Start the app
echo Opening Maison Royale App...
echo Press Ctrl+C to stop the server
echo.
start http://localhost:5173
call pnpm dev

pause
