# StudyOS · KI-Server auf deinem PC
# Startet OmniRoute und einen kostenlosen Cloudflare-Tunnel und meldet die Tunnel-Adresse an StudyOS.
# Solange dieses Fenster offen ist, haben alle angemeldeten StudyOS-Nutzer KI-Hilfe. Schließen = KI aus.
# Einmalig: unten dein Token aus supabase-update-7.sql eintragen. Starten: Doppelklick auf "KI-Server starten.cmd".

$Token = "HIER-DEIN-TOKEN-EINTRAGEN"   # aus dem SQL Editor (supabase-update-7.sql, letzte Zeile)
$Key   = ""                            # optional: API-Key, falls du in OmniRoute einen verlangst

$Supabase = "https://nanknvsfotrcyxjzwsyd.supabase.co"
$Anon     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbmtudnNmb3RyY3l4anp3c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MzY4NDUsImV4cCI6MjEwODAxMjg0NX0.jm2jc4Fix2W1JuawR8a3kYT1pkAfabnDMnZjK38pGGk"
$Port     = 20128
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [Text.Encoding]::UTF8

if ($Token -like "HIER-*") { Write-Host "Bitte zuerst oben in ki-server.ps1 dein Token eintragen (aus supabase-update-7.sql)." -ForegroundColor Red; Read-Host "Enter zum Beenden"; exit 1 }

function Refresh-Path { $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User") }
# Läuft OmniRoute? Jede HTTP-Antwort zählt (auch 401/404), nur „keine Verbindung“ heißt aus.
function Test-Omni {
  try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 "http://localhost:$Port/" | Out-Null; $true }
  catch { [bool]($_.Exception.Response) }
}
function Send-Url($u) {
  $body = @{ t = $Token; u = $u; k = $(if ($Key) { $Key } else { $null }) } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$Supabase/rest/v1/rpc/set_ki_url" -Headers @{ apikey = $Anon; Authorization = "Bearer $Anon" } -ContentType "application/json; charset=utf-8" -Body $body
}

# 1. Programme installieren, falls sie fehlen (Node.js muss installiert sein: https://nodejs.org)
if (-not (Get-Command omniroute -ErrorAction SilentlyContinue)) {
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Write-Host "Node.js fehlt. Bitte von https://nodejs.org installieren und dann nochmal starten." -ForegroundColor Red; Read-Host "Enter zum Beenden"; exit 1 }
  Write-Host "Installiere OmniRoute ..."; npm install -g omniroute; Refresh-Path
}
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
  Write-Host "Installiere cloudflared (Tunnel) ..."; winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements; Refresh-Path
}

# 2. OmniRoute starten, falls es nicht schon läuft
if (-not (Test-Omni)) {
  Write-Host "Starte OmniRoute ..."
  Start-Process -WindowStyle Minimized -FilePath "cmd.exe" -ArgumentList "/c omniroute" | Out-Null
  Write-Host "Beim ersten Mal kann das ein paar Minuten dauern ..."
  for ($i = 0; $i -lt 300 -and -not (Test-Omni); $i++) { Start-Sleep 1 }
  if (-not (Test-Omni)) { Write-Host "OmniRoute antwortet nicht auf Port $Port." -ForegroundColor Red; Read-Host "Enter zum Beenden"; exit 1 }
}
Write-Host "OmniRoute läuft. Freie KI-Anbieter trägst du im OmniRoute-Dashboard ein: http://localhost:$Port" -ForegroundColor Green

# 3. Tunnel öffnen und Adresse auslesen
$log = Join-Path $env:TEMP "studyos-tunnel.log"; Remove-Item $log -ErrorAction SilentlyContinue
$tun = Start-Process -PassThru -WindowStyle Hidden -FilePath "cloudflared" -ArgumentList "tunnel --no-autoupdate --url http://localhost:$Port" -RedirectStandardError $log
$url = $null
for ($i = 0; $i -lt 60 -and -not $url; $i++) { Start-Sleep 1; if (Test-Path $log) { $m = Select-String -Path $log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1; if ($m) { $url = $m.Matches[0].Value } } }
if (-not $url) { Write-Host "Der Tunnel hat keine Adresse geliefert. Log: $log" -ForegroundColor Red; Stop-Process -Id $tun.Id -ErrorAction SilentlyContinue; Read-Host "Enter zum Beenden"; exit 1 }

# 4. Adresse an StudyOS melden
if ((Send-Url $url) -ne $true) { Write-Host "StudyOS hat das Token abgelehnt. Stimmt es mit supabase-update-7.sql überein?" -ForegroundColor Red; Stop-Process -Id $tun.Id -ErrorAction SilentlyContinue; Read-Host "Enter zum Beenden"; exit 1 }
Write-Host ""
Write-Host "KI-Server ist online: $url" -ForegroundColor Green
Write-Host "Alle angemeldeten StudyOS-Nutzer können jetzt Fragen stellen. Fenster offen lassen, Strg+C beendet."
try { while (-not $tun.HasExited) { Start-Sleep 20 } ; Write-Host "Tunnel wurde beendet." -ForegroundColor Yellow }
finally { try { Send-Url $null | Out-Null } catch {} ; Stop-Process -Id $tun.Id -ErrorAction SilentlyContinue; Write-Host "KI-Server ist offline." }
