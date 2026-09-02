@echo off
cd /d "%~dp0"

echo ==============================================================================
echo    DANG KHOI DONG PHAN MEM TROVIET PRO (1-CLICK LOCAL)...
echo ==============================================================================
echo.

:: 1. Khoi chay Backend API tren port 4000 ngam
start /B "" node backend/dist/index.js

:: 2. Cho Backend khoi dong 1 giay va mo trinh duyet
timeout /t 2 /nobreak > nul
start "" "http://localhost:5173"

:: 3. Khoi chay Frontend Vite tren port 5173
echo [*] He thong TroViet Pro dang chay tai: http://localhost:5173
echo [*] Ban co the dong cua so nay khi muon tat phan mem.
echo ==============================================================================
cd frontend
call npx vite --host 0.0.0.0 --port 5173
