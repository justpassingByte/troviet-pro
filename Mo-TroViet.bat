@echo off
chcp 65001 >nul
title TroViet Pro - He Thong Quan Ly Nha Tro Chuyen Nghiep
color 0A

echo =====================================================================
echo                TROVIET PRO - SMARTRENTAL VN (COSS VIETNAM)
echo         Phan Mem Quan Ly Nha Tro, Can Ho Dich Vu ^& Chung Cu Mini
echo =====================================================================
echo.
echo [*] Dang kiem tra Node.js tren he thong...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May tinh chua cai dat Node.js!
    echo Vui long tai va cai dat tai: https://nodejs.org/ (Phien ban LTS)
    pause
    exit /b 1
)

echo [*] Dang khoi dong may chu TroViet Pro...
cd /d "%~dp0"

if not exist "backend\node_modules" (
    echo [*] Dang cai dat thu vien backend lan dau...
    cd backend && call npm install && cd ..
)

if not exist "frontend\node_modules" (
    echo [*] Dang cai dat thu vien frontend lan dau...
    cd frontend && call npm install && cd ..
)

echo [*] Dang mo trinh duyet Web tai http://localhost:5173...
start "" "http://localhost:5173"

echo [*] Dang khoi chay He Thong TroViet Pro...
npm run dev
