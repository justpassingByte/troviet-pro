@echo off
chcp 65001 >nul
title Nap Du Lieu Mau - TroViet Pro
echo ============================================================
echo      DANG NAP BO DU LIEU MAU CHUNG CU MINI AN CU PRO (12 PHONG)
echo ============================================================
cd /d "%~dp0backend"
call npm run seed
echo.
echo [THANH CONG] Da nap xong 12 phong, 8 khach thue va hoa don VietQR!
pause
