#!/usr/bin/env pwsh

echo '>> CLEAN *App data* [WINDOWS]'
# Remove AppData directory that was created for this application
Remove-Item $env:APPDATA\ilias-buddy-desktop -Force -Recurse -ErrorAction Ignore
# Remove registry keys to start electron/ilias-buddy-desktop on start
Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "electron" -ErrorAction Ignore
Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "ilias-buddy-desktop" -ErrorAction Ignore
