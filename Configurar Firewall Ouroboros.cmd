@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell.exe -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

powershell.exe -NoProfile -Command "$old = Get-NetFirewallRule -DisplayName 'SCRUB - Radmin VPN TCP 5174' -ErrorAction SilentlyContinue; if ($old) { Set-NetFirewallRule -DisplayName 'SCRUB - Radmin VPN TCP 5174' -NewDisplayName 'Ouroboros - Radmin VPN TCP 5174' -Enabled True -Direction Inbound -Action Allow -Profile Any } else { $existing = Get-NetFirewallRule -DisplayName 'Ouroboros - Radmin VPN TCP 5174' -ErrorAction SilentlyContinue; if ($existing) { Set-NetFirewallRule -DisplayName 'Ouroboros - Radmin VPN TCP 5174' -Enabled True -Direction Inbound -Action Allow -Profile Any } else { New-NetFirewallRule -DisplayName 'Ouroboros - Radmin VPN TCP 5174' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5174 -RemoteAddress 26.0.0.0/8 -Profile Any | Out-Null } }"

if %errorlevel% equ 0 (
  echo Regra do Firewall configurada com sucesso.
) else (
  echo Nao foi possivel configurar a regra do Firewall.
)
pause
