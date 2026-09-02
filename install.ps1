# TroViet Pro - 1-Click Windows Setup
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "        TROVIET PRO - 1-CLICK WINDOWS SETUP SCRIPT               " -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan

$CurrentDir = $PSScriptRoot
Set-Location $CurrentDir

Write-Host "[*] Dang kiem tra Node.js & npm..." -ForegroundColor Green
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Node.js chua duoc cai dat. Vui long cai dat tai https://nodejs.org/" -ForegroundColor Red
    Exit 1
}

Write-Host "[*] Cai dat thu vien Backend..." -ForegroundColor Green
Set-Location "$CurrentDir\backend"
npm install

Write-Host "[*] Cai dat thu vien Frontend..." -ForegroundColor Green
Set-Location "$CurrentDir\frontend"
npm install

Write-Host "[*] Nap du lieu mau ban dau..." -ForegroundColor Green
Set-Location "$CurrentDir\backend"
npm run seed

Write-Host "[*] Tao Shortcut ra Man hinh Desktop..." -ForegroundColor Green
& "$CurrentDir\tao-shortcut.ps1"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host " [HOAN TAT] TroViet Pro da duoc cai dat va san sang su dung!" -ForegroundColor Green
Write-Host " Nhap dup vao file Mo-TroViet.bat hoac icon tren Desktop de bat dau." -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Green
