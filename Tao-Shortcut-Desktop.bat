@echo off
chcp 65001 >nul
title Tao Shortcut TroViet Pro Ra Desktop
powershell -ExecutionPolicy Bypass -File "%~dp0tao-shortcut.ps1"
echo.
echo ============================================================
echo [DA XONG] Bieu tuong TroViet Pro da duoc tao tren Man hinh Desktop!
echo Ban co the nhap dup chuot vao bieu tuong de mo ung dung bat ky luc nao.
echo ============================================================
pause
