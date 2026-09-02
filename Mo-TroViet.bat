@echo off
cd /d "%~dp0"

echo ==============================================================================
echo    DANG KHOI DONG PHAN MEM TROVIET PRO (DOCKER 1-CLICK)...
echo ==============================================================================
echo.

docker compose up -d --build

echo.
echo ==============================================================================
echo    HE THONG DA DUOC KHOI DONG THANH CONG!
echo ==============================================================================
echo  Web URL         : http://localhost:3000
echo  Du lieu mau     : 12 Phong Chung cu Mini An Cu Pro (Co san VietQR & Hop Dong)
echo ==============================================================================
echo.
start http://localhost:3000
