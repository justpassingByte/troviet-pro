$WScriptShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "TroViet Pro - Quan Ly Nha Tro.lnk"
$TargetBat = Join-Path -Path $PSScriptRoot -ChildPath "Mo-TroViet.bat"

$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetBat
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "TroViet Pro - Phan Mem Quan Ly Nha Tro & Chung Cu Mini"
$Shortcut.IconLocation = "shell32.dll,275"
$Shortcut.Save()

Write-Host "Da tao loi tat Desktop tai: $ShortcutPath" -ForegroundColor Green
