@echo off
cd /d "%~dp0"

echo ==============================================================================
echo    DANG NAP BO DU LIEU MAU CHUNG CU MINI AN CU PRO (12 PHONG)...
echo ==============================================================================
echo.

node backend/dist/seed.js

echo.
echo ==============================================================================
echo    DA NAP XONG 12 PHONG, 8 KHACH THUE VA HOA DON VIETQR!
echo ==============================================================================
echo.
pause
