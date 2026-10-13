# PC-Pflege - Speicher aufräumen + Gaming-Boost
# Start: Doppelklick auf "PC-Pflege starten.bat" (im selben Ordner).
# Löscht NUR Caches/Temp-Dateien aus festen, bekannten Ordnern.
# Bilder, Videos, Dokumente, Desktop, Downloads und Musik werden nie angefasst.

param([switch]$NoElevate)

$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Windows.Forms, System.Drawing, Microsoft.VisualBasic

# --- Admin-Rechte (für Windows-Update-Cache usw.) --------------------------
$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $IsAdmin -and -not $NoElevate) {
  try {
    # Nur die Konsole verstecken (über -WindowStyle von powershell.exe), nicht das App-Fenster
    Start-Process powershell.exe -Verb RunAs -ErrorAction Stop -ArgumentList @(
      '-NoProfile', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"", '-NoElevate')
    exit
  } catch { }  # Nachfrage abgelehnt -> ohne Admin weiter
}

# --- Scharfe Schrift auf Laptops mit 125/150 % Skalierung --------------------
Add-Type -Namespace PcPflege -Name Dpi -MemberDefinition @'
[DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
[DllImport("dwmapi.dll")] public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int value, int size);
[DllImport("uxtheme.dll", CharSet = CharSet.Unicode)] public static extern int SetWindowTheme(IntPtr hwnd, string app, string idList);
'@
[void][PcPflege.Dpi]::SetProcessDPIAware()
[System.Windows.Forms.Application]::EnableVisualStyles()
$g = [System.Drawing.Graphics]::FromHwnd([IntPtr]::Zero); $Scale = $g.DpiX / 96; $g.Dispose()
function S([int]$n) { [int]($n * $Scale) }

$DataDir   = Join-Path $env:LOCALAPPDATA 'PC-Pflege'
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
$LogFile   = Join-Path $DataDir 'protokoll.txt'
$StateFile = Join-Path $DataDir 'boost-zustand.json'
function Log([string]$t) { Add-Content -Path $LogFile -Value ('{0:yyyy-MM-dd HH:mm:ss}  {1}' -f (Get-Date), $t) -Encoding UTF8 }
function DoEvents { [System.Windows.Forms.Application]::DoEvents() }

function Format-Size([double]$b) {
  if ($b -ge 1GB) { '{0:N2} GB' -f ($b / 1GB) }
  elseif ($b -ge 1MB) { '{0:N0} MB' -f ($b / 1MB) }
  elseif ($b -gt 0) { '{0:N0} KB' -f [math]::Max(1, $b / 1KB) }
  else { '0 MB' }
}

# --- Schutz: diese Ordner werden nie geleert und nie betreten ---------------
$L = $env:LOCALAPPDATA; $R = $env:APPDATA; $U = $env:USERPROFILE
$PersonalDirs = @(
  [Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('MyDocuments'),
  [Environment]::GetFolderPath('MyPictures'), [Environment]::GetFolderPath('MyVideos'),
  [Environment]::GetFolderPath('MyMusic'), "$U\Downloads", "$U\OneDrive", "$U\Desktop",
  "$U\Documents", "$U\Pictures", "$U\Videos", "$U\Music"
) | Where-Object { $_ } | ForEach-Object { $_.TrimEnd('\') }
$NeverClear = @($U, $L, $R, $env:windir, $env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:ProgramData) +
  ([System.IO.DriveInfo]::GetDrives() | ForEach-Object { $_.RootDirectory.FullName.TrimEnd('\') }) + $PersonalDirs

function Test-SafeTarget([string]$Path) {
  $p = $Path.TrimEnd('\')
  if ($p.Length -lt 8) { return $false }
  foreach ($n in $NeverClear) {
    if (-not $n) { continue }
    if ($p -ieq $n -or $n.StartsWith($p + '\', 'OrdinalIgnoreCase')) { return $false }
  }
  foreach ($d in $PersonalDirs) { if ($p.StartsWith($d + '\', 'OrdinalIgnoreCase')) { return $false } }
  return $true
}

# Alle Dateien unter $Root, ohne Verknuepfungen/Junctions zu folgen.
# Mit $Filter <> '*' nur direkt im Ordner (z. B. thumbcache_*.db).
function Get-FilesSafe([string]$Root, [string]$Filter = '*', [int]$MinAgeHours = 0) {
  $list = New-Object System.Collections.Generic.List[System.IO.FileInfo]
  if (-not [System.IO.Directory]::Exists($Root)) { return , $list }
  $rootInfo = New-Object System.IO.DirectoryInfo $Root
  if ($rootInfo.Attributes -band [System.IO.FileAttributes]::ReparsePoint) { return , $list }
  $cutoff = (Get-Date).AddHours(-$MinAgeHours)
  $stack = New-Object System.Collections.Generic.Stack[System.IO.DirectoryInfo]
  $stack.Push($rootInfo); $n = 0
  while ($stack.Count -gt 0) {
    $dir = $stack.Pop()
    try { $entries = $dir.GetFileSystemInfos() } catch { continue }
    foreach ($e in $entries) {
      if ($e.Attributes -band [System.IO.FileAttributes]::ReparsePoint) { continue }
      if ($e -is [System.IO.DirectoryInfo]) { if ($Filter -eq '*') { $stack.Push($e) }; continue }
      if ($Filter -ne '*' -and $e.Name -notlike $Filter) { continue }
      if ($MinAgeHours -gt 0 -and $e.LastWriteTime -gt $cutoff) { continue }
      $list.Add($e)
    }
    if ((++$n % 150) -eq 0) { DoEvents }
  }
  return , $list
}

function Remove-EmptyDirs([string]$Root) {
  if (-not [System.IO.Directory]::Exists($Root)) { return }
  $dirs = New-Object System.Collections.Generic.List[string]
  $stack = New-Object System.Collections.Generic.Stack[System.IO.DirectoryInfo]
  $stack.Push((New-Object System.IO.DirectoryInfo $Root))
  while ($stack.Count -gt 0) {
    try { $subs = $stack.Pop().GetDirectories() } catch { continue }
    foreach ($d in $subs) {
      if ($d.Attributes -band [System.IO.FileAttributes]::ReparsePoint) { continue }
      $dirs.Add($d.FullName); $stack.Push($d)
    }
  }
  # tiefste zuerst; Delete(..., $false) löscht nur wirklich leere Ordner
  foreach ($d in ($dirs | Sort-Object Length -Descending)) { try { [System.IO.Directory]::Delete($d, $false) } catch { } }
}

function Expand-Dirs([string[]]$Patterns) {
  foreach ($p in $Patterns) {
    Get-Item -Path $p -Force -ErrorAction SilentlyContinue | Where-Object { $_.PSIsContainer } | ForEach-Object { $_.FullName }
  }
}

# --- Was aufgeräumt werden kann --------------------------------------------
$ChromiumBases = @("$L\Google\Chrome\User Data", "$L\Microsoft\Edge\User Data",
  "$L\BraveSoftware\Brave-Browser\User Data", "$L\Vivaldi\User Data")
$MySid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value

$Categories = @(
  @{ Name = 'Temporäre Dateien (dein Benutzer)'; Default = $true; MinAge = 24
     Hint = 'Reste von Installationen und Programmen. Nur Dateien älter als 1 Tag.'
     Targets = { $env:TEMP } }
  @{ Name = 'Browser-Cache (Chrome, Edge, Brave, Opera, Firefox)'; Default = $true
     Hint = 'Zwischengespeicherte Webseiten. Logins, Passwörter und Verlauf bleiben. Browser vorher schließen.'
     Targets = {
       $p = foreach ($b in $ChromiumBases) {
         foreach ($sub in 'Cache', 'Code Cache', 'GPUCache', 'Service Worker\CacheStorage') { "$b\*\$sub" }
         "$b\ShaderCache"; "$b\GrShaderCache"
       }
       $p += foreach ($base in "$L\Opera Software\Opera*", "$R\Opera Software\Opera*") {
         foreach ($sub in 'Cache', 'Code Cache', 'GPUCache') { "$base\$sub" } }
       $p += "$L\Mozilla\Firefox\Profiles\*\cache2"
       Expand-Dirs $p } }
  @{ Name = 'App-Caches (Discord, VS Code, Teams, Steam, Epic)'; Default = $true
     Hint = 'Nur Cache-Ordner der Apps. Chats, Einstellungen und Spiele bleiben.'
     Targets = {
       $p = foreach ($a in "$R\discord", "$R\Code", "$R\Microsoft\Teams", "$R\Slack", "$R\Notion") {
         foreach ($sub in 'Cache', 'Code Cache', 'GPUCache') { "$a\$sub" } }
       $p += "$R\Code\CachedData", "$R\Code\CachedExtensionVSIXs", "$L\Steam\htmlcache",
             "$L\EpicGamesLauncher\Saved\webcache*"
       Expand-Dirs $p } }
  @{ Name = 'Vorschaubilder-Cache (Explorer)'; Default = $true; Filter = 'thumbcache_*.db'
     Hint = 'Windows erstellt die Mini-Vorschauen neu. Deine Bilder selbst bleiben.'
     Targets = { "$L\Microsoft\Windows\Explorer" } }
  @{ Name = 'Absturzberichte (dein Benutzer)'; Default = $true
     Hint = 'Alte Fehlerberichte und Speicherabbilder von abgestürzten Programmen.'
     Targets = { "$L\CrashDumps", "$L\Microsoft\Windows\WER\ReportArchive", "$L\Microsoft\Windows\WER\ReportQueue" } }
  @{ Name = 'Papierkorb (alle Laufwerke)'; Default = $false
     Hint = 'Erst reinschauen! Danach ist der Inhalt endgültig weg.'
     Targets = { [System.IO.DriveInfo]::GetDrives() | Where-Object { $_.IsReady -and $_.DriveType -eq 'Fixed' } |
                 ForEach-Object { Join-Path $_.RootDirectory.FullName "`$Recycle.Bin\$MySid" } }
     Clean = { Clear-RecycleBin -Force -ErrorAction SilentlyContinue } }
  @{ Name = 'Grafik-Shader-Cache (NVIDIA, AMD, Intel, DirectX)'; Default = $false
     Hint = 'Wird neu gebaut. Danach ruckeln Spiele beim ersten Start kurz. Sinnvoll nach Treiber-Update.'
     Targets = { Expand-Dirs @("$L\D3DSCache", "$L\NVIDIA\DXCache", "$L\NVIDIA\GLCache", "$L\AMD\DxCache",
                 "$L\AMD\DxcCache", "$L\AMD\VkCache", "$L\AMD\GLCache", "$L\Intel\ShaderCache",
                 "$U\AppData\LocalLow\NVIDIA\PerDriverVersion\DXCache") } }
  @{ Name = 'Entwickler-Caches (uv, pip, npm)'; Default = $false
     Hint = 'Python/JS-Pakete werden bei Bedarf neu geladen (braucht Internet). Deine Projekte bleiben.'
     Targets = { "$L\uv\cache", "$L\pip\Cache", "$L\npm-cache\_cacache" } }
  @{ Name = 'Temporäre Dateien (Windows)'; Admin = $true; Default = $true; MinAge = 24
     Hint = 'Temp-Ordner von Windows. Nur Dateien älter als 1 Tag.'
     Targets = { "$env:windir\Temp" } }
  @{ Name = 'Übermittlungsoptimierung (Update-Kopien)'; Admin = $true; Default = $true
     Hint = 'Windows-Update-Dateien, die Windows mit anderen PCs teilt. Unnötig.'
     Targets = { "$env:windir\ServiceProfiles\NetworkService\AppData\Local\Microsoft\Windows\DeliveryOptimization\Cache" }
     Clean = { if (Get-Command Delete-DeliveryOptimizationCache -ErrorAction SilentlyContinue) {
                 Delete-DeliveryOptimizationCache -Force -ErrorAction SilentlyContinue } else { $null = Clean-Files $args[0] } } }
  @{ Name = 'Windows-Update-Downloads'; Admin = $true; Default = $false
     Hint = 'Bereits installierte Update-Pakete. Nicht anhaken, während Windows gerade Updates installiert.'
     Targets = { "$env:windir\SoftwareDistribution\Download" }
     Before = { Stop-Service wuauserv, bits -Force -ErrorAction SilentlyContinue }
     After  = { Start-Service bits, wuauserv -ErrorAction SilentlyContinue } }
  @{ Name = 'Absturzberichte (System)'; Admin = $true; Default = $true
     Hint = 'Fehlerberichte und Speicherabbilder von Windows-Abstürzen (können mehrere GB sein).'
     Targets = { "$env:ProgramData\Microsoft\Windows\WER\ReportArchive", "$env:ProgramData\Microsoft\Windows\WER\ReportQueue",
                 "$env:windir\Minidump", "$env:windir\LiveKernelReports", @{ P = $env:windir; F = 'MEMORY.DMP' } } }
)

function Get-Targets($cat) {
  foreach ($t in (& $cat.Targets)) {
    if (-not $t) { continue }
    if ($t -is [hashtable]) { $t } else { @{ P = [string]$t; F = $(if ($cat.Filter) { $cat.Filter } else { '*' }) } }
  }
}

function Measure-Category($cat) {
  $sum = 0
  foreach ($t in (Get-Targets $cat)) {
    if ($t.F -eq '*' -and -not (Test-SafeTarget $t.P)) { continue }
    foreach ($f in (Get-FilesSafe $t.P $t.F ([int]$cat.MinAge))) { $sum += $f.Length }
  }
  $sum
}

function Clean-Files($cat) {
  $skipped = 0
  foreach ($t in (Get-Targets $cat)) {
    if ($t.F -eq '*' -and -not (Test-SafeTarget $t.P)) { Log "ÜBERSPRUNGEN (geschützt): $($t.P)"; continue }
    $i = 0
    foreach ($f in (Get-FilesSafe $t.P $t.F ([int]$cat.MinAge))) {
      try { $f.Attributes = 'Normal'; $f.Delete() } catch { $skipped++ }
      if ((++$i % 150) -eq 0) { DoEvents }
    }
    if ($t.F -eq '*') { Remove-EmptyDirs $t.P }
  }
  $skipped
}

function Invoke-Clean($cat) {
  $before = Measure-Category $cat
  $skipped = 0
  if ($cat.Before) { & $cat.Before }
  try {
    if ($cat.Clean) { & $cat.Clean $cat } else { $skipped = Clean-Files $cat }
  } finally { if ($cat.After) { & $cat.After } }
  $after = Measure-Category $cat
  $freed = [math]::Max(0, $before - $after)
  Log ("Aufgeräumt: {0} -> {1} frei, {2} Dateien in Benutzung übersprungen" -f $cat.Name, (Format-Size $freed), $skipped)
  @{ Freed = $freed; After = $after; Skipped = $skipped }
}

# --- Gaming-Boost -------------------------------------------------------------
$HighPerf = '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c'
$BestPerfOverlay = 'ded574b5-45a0-4f42-8737-46345c09c238'

function Get-ActiveScheme {
  $o = powercfg /getactivescheme | Out-String
  if ($o -match '([0-9a-fA-F]{8}-[0-9a-fA-F-]{27})\s*\((.+)\)') { @{ Guid = $Matches[1]; Name = $Matches[2] } }
}

function Load-State {
  if (Test-Path $StateFile) {
    try {
      $j = Get-Content $StateFile -Raw -Encoding UTF8 | ConvertFrom-Json
      $s = @{ PrevScheme = $j.PrevScheme; CreatedScheme = $j.CreatedScheme; OverlaySet = [bool]$j.OverlaySet; Reg = @() }
      foreach ($reg in @($j.Reg)) { if ($reg) { $s.Reg += @{ Path = $reg.Path; Name = $reg.Name; Old = $reg.Old } } }
      return $s
    } catch { }
  }
  return $null
}
function Save-State($s) { $s | ConvertTo-Json -Depth 4 | Set-Content -Path $StateFile -Encoding UTF8 }

function Set-RegTracked($s, [string]$Path, [string]$Name, [int]$Value) {
  if (-not ($s.Reg | Where-Object { $_.Path -eq $Path -and $_.Name -eq $Name })) {
    $old = (Get-ItemProperty -Path $Path -Name $Name -ErrorAction SilentlyContinue).$Name
    $s.Reg += @{ Path = $Path; Name = $Name; Old = $(if ($null -eq $old) { '__keiner__' } else { $old }) }
  }
  if (-not (Test-Path $Path)) { New-Item -Path $Path -Force | Out-Null }
  Set-ItemProperty -Path $Path -Name $Name -Value $Value -Type DWord
}

function Enable-Boost([bool]$Power, [bool]$GameMode, [bool]$NoDvr) {
  $s = Load-State
  if (-not $s) { $cur = Get-ActiveScheme; $s = @{ PrevScheme = $cur.Guid; CreatedScheme = $null; OverlaySet = $false; Reg = @() } }
  $done = @()
  if ($Power) {
    $list = powercfg /list | Out-String
    $guid = $null
    if ($list -match $HighPerf) { $guid = $HighPerf }
    elseif ($s.CreatedScheme -and $list -match $s.CreatedScheme) { $guid = $s.CreatedScheme }
    else {
      $o = powercfg -duplicatescheme $HighPerf 2>$null | Out-String
      if ($o -match '([0-9a-fA-F]{8}-[0-9a-fA-F-]{27})') { $guid = $Matches[1]; $s.CreatedScheme = $guid }
    }
    $ok = $false
    if ($guid) { powercfg /setactive $guid 2>$null; $ok = ($LASTEXITCODE -eq 0) }
    if ($ok) { $done += 'Energiesparplan: Höchstleistung' }
    else {
      powercfg /overlaysetactive $BestPerfOverlay 2>$null
      if ($LASTEXITCODE -eq 0) { $s.OverlaySet = $true; $done += "Energiemodus: Beste Leistung" }
      else { $done += 'Energiesparplan: konnte nicht umgestellt werden (Einstellungen > System > Energie > "Beste Leistung" wählen)' }
    }
  }
  if ($GameMode) {
    Set-RegTracked $s 'HKCU:\Software\Microsoft\GameBar' 'AutoGameModeEnabled' 1
    Set-RegTracked $s 'HKCU:\Software\Microsoft\GameBar' 'AllowAutoGameMode' 1
    $done += 'Windows-Spielmodus: an'
  }
  if ($NoDvr) {
    Set-RegTracked $s 'HKCU:\System\GameConfigStore' 'GameDVR_Enabled' 0
    Set-RegTracked $s 'HKCU:\Software\Microsoft\Windows\CurrentVersion\GameDVR' 'AppCaptureEnabled' 0
    $done += 'Xbox-Hintergrundaufnahme: aus'
  }
  Save-State $s
  Log ('Boost an: ' + ($done -join '; '))
  $done
}

function Disable-Boost {
  $s = Load-State
  if (-not $s) { return @('Es war kein Boost aktiv - nichts zu tun.') }
  $done = @()
  if ($s.PrevScheme) { powercfg /setactive $s.PrevScheme 2>$null; $done += 'Energiesparplan: wie vorher' }
  if ($s.OverlaySet) { powercfg /overlaysetactive 00000000-0000-0000-0000-000000000000 2>$null; $done += 'Energiemodus: Ausbalanciert' }
  if ($s.CreatedScheme -and $s.CreatedScheme -ne $s.PrevScheme) { powercfg /delete $s.CreatedScheme 2>$null }
  foreach ($reg in $s.Reg) {
    if ($reg.Old -eq '__keiner__') { Remove-ItemProperty -Path $reg.Path -Name $reg.Name -ErrorAction SilentlyContinue }
    else { Set-ItemProperty -Path $reg.Path -Name $reg.Name -Value ([int]$reg.Old) -Type DWord }
  }
  if ($s.Reg.Count) { $done += 'Spielmodus und Xbox-Aufnahme: wie vorher' }
  Remove-Item $StateFile -Force
  Log ('Boost aus: ' + ($done -join '; '))
  $done
}

$NeverClose = 'explorer', 'dwm', 'csrss', 'winlogon', 'svchost', 'lsass', 'services', 'smss', 'wininit', 'System', 'Idle',
  'fontdrvhost', 'sihost', 'ctfmon', 'SearchHost', 'SearchApp', 'StartMenuExperienceHost', 'ShellExperienceHost',
  'RuntimeBroker', 'TextInputHost', 'powershell', 'pwsh', 'conhost', 'audiodg', 'MsMpEng', 'SecurityHealthSystray',
  'SecurityHealthService', 'taskhostw', 'dllhost', 'ApplicationFrameHost', 'LockApp', 'SystemSettings', 'Widgets',
  'nvcontainer', 'NVDisplay.Container', 'RtkAudUService64', 'AMDRSServ', 'atieclxx', 'igfxEM', 'Claude', 'cowork-svc'
$OftenUnneeded = 'OneDrive', 'Teams', 'ms-teams', 'Dropbox', 'Spotify', 'msedge', 'chrome', 'firefox', 'opera', 'brave',
  'AdobeCollabSync', 'Creative Cloud', 'CCXProcess', 'iCloudDrive', 'EpicGamesLauncher', 'Slack', 'Notion', 'WhatsApp'

function Get-BackgroundApps {
  $session = (Get-Process -Id $PID).SessionId
  Get-Process | Where-Object {
    $_.SessionId -eq $session -and $_.Id -ne $PID -and $_.Path -and
    $_.Path -notlike "$env:windir\*" -and $NeverClose -notcontains $_.Name
  } | Group-Object Name | ForEach-Object {
    $first = $_.Group[0]
    [pscustomobject]@{
      Name = $_.Name
      Title = $(if ($first.Description) { $first.Description } else { $_.Name })
      Ram = ($_.Group | Measure-Object WorkingSet64 -Sum).Sum
      Count = $_.Count
    }
  } | Sort-Object Ram -Descending | Select-Object -First 30
}

# --- Oberfläche ------------------------------------------------------------
$Font  = New-Object System.Drawing.Font('Segoe UI', 10)
$Bold  = New-Object System.Drawing.Font('Segoe UI Semibold', 10)
$Title = New-Object System.Drawing.Font('Segoe UI Semibold', 18)
$Big   = New-Object System.Drawing.Font('Segoe UI Semibold', 13)
$Small = New-Object System.Drawing.Font('Segoe UI', 9)
function Rgb([int]$r, [int]$g, [int]$b) { [System.Drawing.Color]::FromArgb($r, $g, $b) }
# Dunkles Design: Grundfläche, Karten, Bedienelemente, Text, Akzent
$C = @{
  Bg = (Rgb 15 17 23); Surface = (Rgb 22 25 34); Surface2 = (Rgb 32 36 48); Hover = (Rgb 44 49 64)
  Text = (Rgb 232 234 240); Muted = (Rgb 150 158 175); Dim = (Rgb 95 102 118)
  Accent = (Rgb 79 140 255); AccentHover = (Rgb 106 160 255); Good = (Rgb 52 199 120); Warn = (Rgb 245 165 36)
}
$PrimaryButtons = @('Angehakte löschen', 'Suchen', 'Boost einschalten')

function New-Button([string]$Text, [scriptblock]$OnClick) {
  $b = New-Object System.Windows.Forms.Button
  $b.Text = $Text; $b.AutoSize = $true; $b.Padding = New-Object System.Windows.Forms.Padding(12, 5, 12, 5)
  $b.Margin = New-Object System.Windows.Forms.Padding(0, 4, 8, 4)
  $b.add_Click($OnClick); $b
}
function New-Flow {
  $f = New-Object System.Windows.Forms.FlowLayoutPanel
  $f.Dock = 'Bottom'; $f.AutoSize = $true; $f.WrapContents = $true; $f.Padding = New-Object System.Windows.Forms.Padding(0, 10, 0, 0); $f
}
function New-Info([string]$Text) {
  $l = New-Object System.Windows.Forms.Label
  $l.Text = $Text; $l.Dock = 'Top'; $l.AutoSize = $false; $l.Height = S 58; $l.Tag = 'muted'
  $l.Padding = New-Object System.Windows.Forms.Padding(0, 0, 0, 10); $l
}
function Ask([string]$Text, [string]$Title = 'PC-Pflege') {
  [System.Windows.Forms.MessageBox]::Show($Text, $Title, 'YesNo', 'Question') -eq 'Yes'
}
function Say([string]$Text, [string]$Title = 'PC-Pflege') { [void][System.Windows.Forms.MessageBox]::Show($Text, $Title, 'OK', 'Information') }

$form = New-Object System.Windows.Forms.Form
$form.Text = 'PC-Pflege' + $(if ($IsAdmin) { '  (Administrator)' } else { '  (ohne Admin-Rechte)' })
$form.Font = $Font
$form.Size = New-Object System.Drawing.Size((S 980), (S 660))
$form.MinimumSize = New-Object System.Drawing.Size((S 760), (S 480))
$form.StartPosition = 'CenterScreen'
$form.BackColor = $C.Bg; $form.ForeColor = $C.Text

$content = New-Object System.Windows.Forms.Panel
$content.Dock = 'Fill'; $content.Padding = New-Object System.Windows.Forms.Padding((S 28), (S 20), (S 28), (S 16))
$pageHost = New-Object System.Windows.Forms.Panel; $pageHost.Dock = 'Fill'
$pageTitle = New-Object System.Windows.Forms.Label
$pageTitle.Dock = 'Top'; $pageTitle.Font = $Title; $pageTitle.Height = S 52; $pageTitle.ForeColor = $C.Text; $pageTitle.Tag = 'keep'
$content.Controls.Add($pageHost); $content.Controls.Add($pageTitle); $pageHost.BringToFront()

$sidebar = New-Object System.Windows.Forms.Panel
$sidebar.Dock = 'Left'; $sidebar.Width = S 230; $sidebar.BackColor = $C.Surface
$sidebar.Padding = New-Object System.Windows.Forms.Padding(0, (S 18), 0, (S 14))
$form.Controls.Add($content); $form.Controls.Add($sidebar)

$status = New-Object System.Windows.Forms.StatusStrip
$status.RenderMode = 'System'; $status.SizingGrip = $false; $status.BackColor = $C.Surface
$status.Padding = New-Object System.Windows.Forms.Padding((S 10), 2, (S 10), 2)
$statusText = New-Object System.Windows.Forms.ToolStripStatusLabel
$statusText.Spring = $true; $statusText.TextAlign = 'MiddleLeft'; $statusText.ForeColor = $C.Muted
$progress = New-Object System.Windows.Forms.ToolStripProgressBar
$progress.Width = S 200
[void]$status.Items.Add($statusText); [void]$status.Items.Add($progress)
$form.Controls.Add($status)
function Set-Status([string]$t) { $statusText.Text = $t; DoEvents }

# ===== Tab 1: Aufräumen =====================================================
$tabClean = New-Object System.Windows.Forms.Panel; $tabClean.Dock = 'Fill'; $tabClean.Text = 'Aufräumen'
$lv = New-Object System.Windows.Forms.ListView
$lv.View = 'Details'; $lv.CheckBoxes = $true; $lv.FullRowSelect = $true; $lv.Dock = 'Fill'
[void]$lv.Columns.Add('Was', (S 330)); [void]$lv.Columns.Add('Größe', (S 90)); [void]$lv.Columns.Add('Hinweis', (S 520))
foreach ($cat in $Categories) {
  $locked = $cat.Admin -and -not $IsAdmin
  $it = New-Object System.Windows.Forms.ListViewItem($cat.Name)
  [void]$it.SubItems.Add('-')
  [void]$it.SubItems.Add($(if ($locked) { '(braucht Admin-Rechte) ' + $cat.Hint } else { $cat.Hint }))
  $it.Tag = $cat
  $it.Checked = [bool]$cat.Default -and -not $locked
  if ($locked) { $it.ForeColor = $C.Dim }
  $it.ToolTipText = $cat.Hint
  [void]$lv.Items.Add($it)
}
$lv.ShowItemToolTips = $true
$lv.add_ItemCheck({ param($s, $e)
  $kat = $lv.Items[$e.Index].Tag
  if ($kat.Admin -and -not $IsAdmin) { $e.NewValue = $e.CurrentValue }
})

$totalLabel = New-Object System.Windows.Forms.Label
$totalLabel.AutoSize = $true; $totalLabel.Font = $Bold; $totalLabel.Margin = New-Object System.Windows.Forms.Padding(12, 10, 4, 4)
$totalLabel.Text = 'Erst "Scannen" klicken - es wird dabei nichts gelöscht.'

function Update-Total {
  $sum = 0
  foreach ($it in $lv.Items) { if ($it.Checked -and $null -ne $it.Tag.Size) { $sum += $it.Tag.Size } }
  $totalLabel.Text = 'Angehakt: ca. ' + (Format-Size $sum) + ' können frei werden.'
}
$lv.add_ItemChecked({ if ($script:Scanned) { Update-Total } })

function Start-Scan {
  $form.UseWaitCursor = $true
  $i = 0; $progress.Maximum = $lv.Items.Count
  foreach ($it in $lv.Items) {
    $kat = $it.Tag; $progress.Value = ++$i
    if ($kat.Admin -and -not $IsAdmin) { continue }
    Set-Status ('Prüfe: ' + $kat.Name)
    $kat.Size = Measure-Category $kat
    $it.SubItems[1].Text = Format-Size $kat.Size
  }
  $script:Scanned = $true
  Update-Total
  Set-Status 'Scan fertig. Haken setzen/entfernen, dann "Angehakte löschen".'
  $progress.Value = 0; $form.UseWaitCursor = $false
}

$flowClean = New-Flow
$flowClean.Controls.Add((New-Button 'Scannen' { Start-Scan }))
$flowClean.Controls.Add((New-Button 'Angehakte löschen' {
  if (-not $script:Scanned) { Start-Scan }
  $sel = @($lv.Items | Where-Object { $_.Checked })
  if (-not $sel.Count) { Say 'Nichts angehakt.'; return }
  $sum = ($sel | ForEach-Object { $_.Tag.Size } | Measure-Object -Sum).Sum
  $names = ($sel | ForEach-Object { ' - ' + $_.Tag.Name }) -join "`n"
  if (-not (Ask ("Folgendes wird geleert (ca. {0}):`n`n{1}`n`nDeine Bilder, Videos, Dokumente, Downloads und Desktop werden nicht angefasst.`nWeiter?" -f (Format-Size $sum), $names))) { return }
  $form.UseWaitCursor = $true
  $freed = 0; $skipped = 0; $i = 0; $progress.Maximum = $sel.Count
  foreach ($it in $sel) {
    $progress.Value = ++$i
    Set-Status ('Räume auf: ' + $it.Tag.Name)
    $res = Invoke-Clean $it.Tag
    $freed += $res.Freed; $skipped += $res.Skipped
    $it.Tag.Size = $res.After; $it.SubItems[1].Text = Format-Size $res.After
  }
  $progress.Value = 0; $form.UseWaitCursor = $false
  Update-Total
  Set-Status ('Fertig: ' + (Format-Size $freed) + ' freigegeben.')
  $extra = if ($skipped) { "`n`n$skipped Dateien waren gerade in Benutzung und wurden übersprungen. Das ist normal (z. B. offener Browser)." } else { '' }
  Say ('Fertig! ' + (Format-Size $freed) + ' freigegeben.' + $extra)
}))
$flowClean.Controls.Add((New-Button 'Windows-Speicheroptimierung öffnen' { Start-Process 'ms-settings:storagesense' }))
$flowClean.Controls.Add((New-Button 'Protokoll' { if (Test-Path $LogFile) { Start-Process notepad.exe $LogFile } else { Say 'Noch nichts protokolliert.' } }))
$flowClean.Controls.Add($totalLabel)

$infoClean = New-Info ('Hier werden nur Caches und Temp-Dateien aus festen Ordnern geleert - Windows und Apps bauen sie bei Bedarf neu. ' +
  'Persönliche Dateien (Bilder, Videos, Dokumente, Downloads, Desktop) sind gesperrt.' +
  $(if (-not $IsAdmin) { ' Graue Zeilen brauchen Admin-Rechte: App schließen und beim Start "Ja" klicken.' } else { '' }))
$tabClean.Controls.Add($lv); $tabClean.Controls.Add($flowClean); $tabClean.Controls.Add($infoClean)
$lv.BringToFront()

# ===== Tab 2: Speicherfresser finden =========================================
$tabBig = New-Object System.Windows.Forms.Panel; $tabBig.Dock = 'Fill'; $tabBig.Text = 'Große Dateien finden'
$topBig = New-Object System.Windows.Forms.FlowLayoutPanel
$topBig.Dock = 'Top'; $topBig.AutoSize = $true; $topBig.Padding = New-Object System.Windows.Forms.Padding(4)
$lblWhere = New-Object System.Windows.Forms.Label; $lblWhere.Text = 'Wo suchen:'; $lblWhere.AutoSize = $true
$lblWhere.Margin = New-Object System.Windows.Forms.Padding(4, 9, 4, 4)
$cbWhere = New-Object System.Windows.Forms.ComboBox; $cbWhere.Width = S 300
[void]$cbWhere.Items.Add($U)
foreach ($d in [System.IO.DriveInfo]::GetDrives()) { if ($d.IsReady) { [void]$cbWhere.Items.Add($d.RootDirectory.FullName) } }
$cbWhere.SelectedIndex = 0
$btnBrowse = New-Button 'Ordner wählen...' {
  $dlg = New-Object System.Windows.Forms.FolderBrowserDialog
  if ($dlg.ShowDialog() -eq 'OK') { $cbWhere.Text = $dlg.SelectedPath }
}
$lblMin = New-Object System.Windows.Forms.Label; $lblMin.Text = 'ab MB:'; $lblMin.AutoSize = $true
$lblMin.Margin = New-Object System.Windows.Forms.Padding(12, 9, 4, 4)
$numMin = New-Object System.Windows.Forms.NumericUpDown
$numMin.Minimum = 10; $numMin.Maximum = 100000; $numMin.Value = 300; $numMin.Increment = 100; $numMin.Width = S 90
$script:StopScan = $false
$btnFind = New-Button 'Suchen' { Find-BigFiles }
$btnStop = New-Button 'Stopp' { $script:StopScan = $true }
$topBig.Controls.AddRange(@($lblWhere, $cbWhere, $btnBrowse, $lblMin, $numMin, $btnFind, $btnStop))

$lvBig = New-Object System.Windows.Forms.ListView
$lvBig.View = 'Details'; $lvBig.FullRowSelect = $true; $lvBig.Dock = 'Fill'; $lvBig.MultiSelect = $false
[void]$lvBig.Columns.Add('Größe', (S 90)); [void]$lvBig.Columns.Add('Art', (S 230))
[void]$lvBig.Columns.Add('Geändert', (S 100)); [void]$lvBig.Columns.Add('Datei', (S 520))

$BlockedRoots = @($env:windir, $env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:ProgramData, $L, $R, "$U\AppData") |
  Where-Object { $_ } | ForEach-Object { $_.TrimEnd('\') + '\' }
function Get-FileKind([System.IO.FileInfo]$f) {
  $p = $f.FullName
  foreach ($b in $BlockedRoots) { if ($p.StartsWith($b, 'OrdinalIgnoreCase')) { return @('System/Programm - nicht löschen', $false) } }
  if ($p -match '\\(steamapps|SteamLibrary|Epic Games|Riot Games|XboxGames|EA Games|Ubisoft Game Launcher|Battle\.net)\\') {
    return @('Spiel - über Steam/Launcher deinstallieren', $false) }
  if ($f.Name -match '^(pagefile|hiberfil|swapfile)\.sys$') { return @('Windows-Systemdatei - nicht löschen', $false) }
  switch -Regex ($f.Extension) {
    '^\.(mp4|mkv|mov|avi|wmv|webm|m4v)$' { return @('Video (behalten?)', $true) }
    '^\.(jpg|jpeg|png|heic|raw|cr2|nef|arw|psd)$' { return @('Bild (behalten?)', $true) }
    '^\.(iso|img|msi|exe)$' { return @('Installer/Abbild - oft löschbar', $true) }
    '^\.(zip|rar|7z|tar|gz)$' { return @('Archiv - oft löschbar, falls entpackt', $true) }
    '^\.(vhd|vhdx|vmdk)$' { return @('Virtuelle Festplatte - Vorsicht', $true) }
  }
  @('Sonstige Datei', $true)
}

function Find-BigFiles {
  $root = $cbWhere.Text
  if (-not [System.IO.Directory]::Exists($root)) { Say 'Diesen Ordner gibt es nicht.'; return }
  $min = [int64]$numMin.Value * 1MB
  $lvBig.Items.Clear(); $script:StopScan = $false; $btnFind.Enabled = $false
  $form.UseWaitCursor = $true; $progress.Style = 'Marquee'
  $found = New-Object System.Collections.Generic.List[System.IO.FileInfo]
  $stack = New-Object System.Collections.Generic.Stack[System.IO.DirectoryInfo]
  $stack.Push((New-Object System.IO.DirectoryInfo $root)); $n = 0
  while ($stack.Count -gt 0 -and -not $script:StopScan) {
    $dir = $stack.Pop()
    try { $entries = $dir.GetFileSystemInfos() } catch { continue }
    foreach ($e in $entries) {
      if ($e.Attributes -band [System.IO.FileAttributes]::ReparsePoint) { continue }
      if ($e -is [System.IO.DirectoryInfo]) { $stack.Push($e) }
      elseif ($e.Length -ge $min) { $found.Add($e) }
    }
    if ((++$n % 100) -eq 0) { Set-Status ("Durchsuche ({0} gefunden): {1}" -f $found.Count, $dir.FullName) }
  }
  $lvBig.BeginUpdate()
  foreach ($f in ($found | Sort-Object Length -Descending | Select-Object -First 300)) {
    $kind = Get-FileKind $f
    $it = New-Object System.Windows.Forms.ListViewItem((Format-Size $f.Length))
    [void]$it.SubItems.Add($kind[0]); [void]$it.SubItems.Add($f.LastWriteTime.ToString('dd.MM.yyyy'))
    [void]$it.SubItems.Add($f.FullName)
    $it.Tag = @{ Path = $f.FullName; CanDelete = $kind[1] }
    if (-not $kind[1]) { $it.ForeColor = $C.Dim }
    [void]$lvBig.Items.Add($it)
  }
  $lvBig.EndUpdate()
  $progress.Style = 'Blocks'; $form.UseWaitCursor = $false; $btnFind.Enabled = $true
  $total = ($found | Measure-Object Length -Sum).Sum
  Set-Status ("{0} große Dateien gefunden, zusammen {1}.{2}" -f $found.Count, (Format-Size $total), $(if ($script:StopScan) { ' (gestoppt)' } else { '' }))
}

$flowBig = New-Flow
$flowBig.Controls.Add((New-Button 'Im Explorer zeigen' {
  if (-not $lvBig.SelectedItems.Count) { Say 'Erst eine Datei anklicken.'; return }
  Start-Process explorer.exe ('/select,"' + $lvBig.SelectedItems[0].Tag.Path + '"')
}))
$flowBig.Controls.Add((New-Button 'In den Papierkorb verschieben' {
  if (-not $lvBig.SelectedItems.Count) { Say 'Erst eine Datei anklicken.'; return }
  $it = $lvBig.SelectedItems[0]
  if (-not $it.Tag.CanDelete) { Say ('Diese Datei gehört zu Windows, einem Programm oder einem Spiel. Löschen würde etwas kaputt machen.' +
    "`n`nSpiele/Programme bitte über Einstellungen > Apps oder den Launcher deinstallieren."); return }
  if (-not (Ask ("In den Papierkorb verschieben?`n`n" + $it.Tag.Path + "`n`nDu kannst sie dort wiederherstellen, solange du den Papierkorb nicht leerst."))) { return }
  try {
    [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($it.Tag.Path, 'OnlyErrorDialogs', 'SendToRecycleBin')
    Log ('In Papierkorb: ' + $it.Tag.Path)
    $lvBig.Items.Remove($it)
  } catch { Say ('Ging nicht: ' + $_.Exception.Message) }
}))
$flowBig.Controls.Add((New-Button 'Apps deinstallieren (Windows)' { Start-Process 'ms-settings:appsfeatures' }))
$infoBig = New-Info ('Zeigt die größten Dateien, z. B. auf C: oder G:. Hier wird nichts automatisch gelöscht: du entscheidest pro Datei, ' +
  'und sie landet im Papierkorb (wiederherstellbar). Graue Einträge (Windows, Programme, Spiele) sind gesperrt.')
$tabBig.Controls.Add($lvBig); $tabBig.Controls.Add($flowBig); $tabBig.Controls.Add($topBig); $tabBig.Controls.Add($infoBig)
$lvBig.BringToFront()

# ===== Tab 3: Gaming-Boost ===================================================
$tabBoost = New-Object System.Windows.Forms.Panel; $tabBoost.Dock = 'Fill'; $tabBoost.Text = 'Gaming-Boost'

$pnlBoost = New-Object System.Windows.Forms.FlowLayoutPanel
$pnlBoost.Dock = 'Top'; $pnlBoost.AutoSize = $true; $pnlBoost.FlowDirection = 'TopDown'; $pnlBoost.WrapContents = $false
$pnlBoost.Padding = New-Object System.Windows.Forms.Padding(0, 0, 0, (S 16))
function New-Check([string]$t) {
  $cb = New-Object System.Windows.Forms.CheckBox; $cb.Text = $t; $cb.AutoSize = $true; $cb.Checked = $true
  $cb.Margin = New-Object System.Windows.Forms.Padding(0, 3, 0, 3); $cb
}
$chkPower = New-Check 'Energiesparplan auf Höchstleistung (CPU/GPU drosseln nicht mehr)'
$chkGame  = New-Check 'Windows-Spielmodus einschalten (Spiel bekommt Vorrang)'
$chkDvr   = New-Check 'Xbox-Hintergrundaufnahme ausschalten (kostet sonst FPS)'
$lblBoostState = New-Object System.Windows.Forms.Label; $lblBoostState.AutoSize = $true; $lblBoostState.Font = $Big; $lblBoostState.Tag = 'keep'
$lblBoostState.Margin = New-Object System.Windows.Forms.Padding(0, (S 14), 0, (S 4))
$lblHw = New-Object System.Windows.Forms.Label; $lblHw.AutoSize = $true; $lblHw.Tag = 'keep'
$lblHw.MaximumSize = New-Object System.Drawing.Size((S 900), 0)

function Update-BoostState {
  $cur = Get-ActiveScheme
  $on = Test-Path $StateFile
  $lblBoostState.Text = $(if ($on) { 'Boost ist AN' } else { 'Boost ist aus' }) + '   |   Aktueller Energiesparplan: ' + $cur.Name
  $lblBoostState.ForeColor = $(if ($on) { $C.Good } else { $C.Muted })
  $lines = @()
  $bat = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($bat) {
    if ($bat.BatteryStatus -eq 1) { $lines += 'ACHTUNG: Laptop läuft auf Akku. Für volle Leistung Ladegerät anstecken - das bringt am meisten!' }
    else { $lines += 'Laptop hängt am Strom - gut.' }
  }
  foreach ($v in (Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue)) {
    $date = if ($v.DriverDate) { $v.DriverDate.ToString('dd.MM.yyyy') } else { '?' }
    $lines += ('Grafik: {0} (Treiber vom {1})' -f $v.Name, $date)
  }
  $lblHw.Text = $lines -join "`n"
  $lblHw.ForeColor = $(if ($lines -match 'ACHTUNG') { $C.Warn } else { $C.Muted })
}

$flowBoostBtns = New-Object System.Windows.Forms.FlowLayoutPanel; $flowBoostBtns.AutoSize = $true
$flowBoostBtns.Margin = New-Object System.Windows.Forms.Padding(0, (S 10), 0, 0)
$flowBoostBtns.Controls.Add((New-Button 'Boost einschalten' {
  $res = Enable-Boost $chkPower.Checked $chkGame.Checked $chkDvr.Checked
  Update-BoostState; Say ("Boost ist an:`n`n- " + ($res -join "`n- ") + "`n`nNach dem Zocken 'Alles zurücksetzen' klicken, das spart wieder Akku.")
}))
$flowBoostBtns.Controls.Add((New-Button 'Alles zurücksetzen' {
  $res = Disable-Boost; Update-BoostState; Say ("Zurückgesetzt:`n`n- " + ($res -join "`n- "))
}))
$flowBoostBtns.Controls.Add((New-Button 'Grafiktreiber-Hilfe' {
  Say ("Ein aktueller Grafiktreiber bringt oft mehr als alles andere:`n`n" +
    "- NVIDIA: App 'NVIDIA App' öffnen > Treiber > Aktualisieren`n- AMD: 'AMD Software: Adrenalin' > Treiber`n" +
    "- Intel: 'Intel Driver & Support Assistant'`n`nDie Programme findest du über die Windows-Suche (Windows-Taste, Namen tippen).")
}))
$pnlBoost.Controls.AddRange(@($chkPower, $chkGame, $chkDvr, $flowBoostBtns, $lblBoostState, $lblHw))

$grpApps = New-Object System.Windows.Forms.Panel; $grpApps.Dock = 'Fill'
$lblApps = New-Object System.Windows.Forms.Label; $lblApps.Dock = 'Top'; $lblApps.Height = S 34; $lblApps.Font = $Bold
$lblApps.Text = 'Hintergrund-Apps vor dem Zocken schließen (macht RAM und CPU frei)'
$lvApps = New-Object System.Windows.Forms.ListView
$lvApps.View = 'Details'; $lvApps.CheckBoxes = $true; $lvApps.FullRowSelect = $true; $lvApps.Dock = 'Fill'
[void]$lvApps.Columns.Add('App', (S 330)); [void]$lvApps.Columns.Add('RAM', (S 90)); [void]$lvApps.Columns.Add('Hinweis', (S 300))
function Fill-Apps {
  $lvApps.BeginUpdate(); $lvApps.Items.Clear()
  foreach ($a in Get-BackgroundApps) {
    $it = New-Object System.Windows.Forms.ListViewItem($a.Title)
    [void]$it.SubItems.Add((Format-Size $a.Ram))
    [void]$it.SubItems.Add($(if ($OftenUnneeded -contains $a.Name) { 'beim Zocken meist verzichtbar' } else { '' }))
    $it.Tag = $a.Name
    [void]$lvApps.Items.Add($it)
  }
  $lvApps.EndUpdate()
}
$flowApps = New-Flow
$flowApps.Controls.Add((New-Button 'Liste aktualisieren' { Fill-Apps }))
$flowApps.Controls.Add((New-Button 'Angehakte schließen' {
  $sel = @($lvApps.Items | Where-Object { $_.Checked })
  if (-not $sel.Count) { Say 'Erst Apps anhaken.'; return }
  foreach ($it in $sel) { Get-Process -Name $it.Tag -ErrorAction SilentlyContinue | ForEach-Object { [void]$_.CloseMainWindow() } }
  Set-Status 'Warte, bis die Apps sich schließen ...'
  $t = (Get-Date).AddSeconds(4); while ((Get-Date) -lt $t) { DoEvents; Start-Sleep -Milliseconds 100 }
  $left = @($sel | Where-Object { Get-Process -Name $_.Tag -ErrorAction SilentlyContinue })
  if ($left.Count) {
    $names = ($left | ForEach-Object { ' - ' + $_.Text }) -join "`n"
    if (Ask ("Diese Apps laufen noch (meist unten rechts im Infobereich):`n`n$names`n`nHart beenden? Nicht gespeicherte Sachen darin gehen verloren.")) {
      foreach ($it in $left) { Get-Process -Name $it.Tag -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue }
    }
  }
  Log ('Apps geschlossen: ' + (($sel | ForEach-Object { $_.Tag }) -join ', '))
  Fill-Apps; Set-Status 'Apps geschlossen. Sie starten wieder normal, wenn du sie öffnest.'
}))
$grpApps.Controls.Add($lvApps); $grpApps.Controls.Add($flowApps); $grpApps.Controls.Add($lblApps); $lvApps.BringToFront()

$infoBoost = New-Info ('Ehrlich gesagt: Der Boost macht deine Grafikkarte nicht schneller. Er sorgt dafür, dass Windows nicht bremst ' +
  '(kein Stromsparen, Spiel hat Vorrang, keine Hintergrundaufnahme) - das bringt meist ruhigere FPS und weniger Ruckler. ' +
  'Am meisten hilft: Ladegerät dran, aktueller Grafiktreiber, passende Grafikeinstellungen im Spiel, Laptop frei stehen lassen (Hitze).')
$infoBoost.Height = S 78
$tabBoost.Controls.Add($grpApps); $tabBoost.Controls.Add($pnlBoost); $tabBoost.Controls.Add($infoBoost)
$grpApps.BringToFront()

# ===== Navigation und Design ==================================================
$Pages = @($tabClean, $tabBig, $tabBoost)
$pageHost.Controls.AddRange($Pages)
$NavButtons = @{}

function Show-Page($page) {
  foreach ($p in $Pages) { $p.Visible = ($p -eq $page) }
  $pageTitle.Text = $page.Text
  foreach ($p in $Pages) {
    $b = $NavButtons[$p.Text]; $active = ($p -eq $page)
    $b.BackColor = $(if ($active) { $C.Surface2 } else { $C.Surface })
    $b.ForeColor = $(if ($active) { $C.Text } else { $C.Muted })
  }
  if ($page -eq $tabBoost -and -not $script:AppsLoaded) { Fill-Apps; Update-BoostState; $script:AppsLoaded = $true }
}

# Seitenleiste: Dock=Top stapelt in umgekehrter Reihenfolge, darum rückwärts hinzufügen
$navItems = @(@($tabClean, 'Caches und Temp-Dateien'), @($tabBig, 'Platzfresser aufspüren'), @($tabBoost, 'Mehr Leistung beim Zocken'))
[array]::Reverse($navItems)
foreach ($n in $navItems) {
  $page = $n[0]
  $b = New-Object System.Windows.Forms.Button
  $b.Text = $page.Text + "`n" + $n[1]; $b.Dock = 'Top'; $b.Height = S 58
  $b.TextAlign = 'MiddleLeft'; $b.Padding = New-Object System.Windows.Forms.Padding((S 18), 0, 0, 0)
  $b.FlatStyle = 'Flat'; $b.FlatAppearance.BorderSize = 0; $b.FlatAppearance.MouseOverBackColor = $C.Hover
  $b.Cursor = 'Hand'; $b.Font = $Font
  $NavButtons[$page.Text] = $b
  $sidebar.Controls.Add($b)
}
foreach ($p in $Pages) { $NavButtons[$p.Text].Tag = $p; $NavButtons[$p.Text].add_Click({ Show-Page $this.Tag }) }

$spacer = New-Object System.Windows.Forms.Panel; $spacer.Dock = 'Top'; $spacer.Height = S 24
$appSub = New-Object System.Windows.Forms.Label; $appSub.Dock = 'Top'; $appSub.Height = S 24; $appSub.Tag = 'muted'
$appSub.Text = 'Aufräumen  ·  Boost'; $appSub.Padding = New-Object System.Windows.Forms.Padding((S 20), 0, 0, 0); $appSub.Font = $Small
$appName = New-Object System.Windows.Forms.Label; $appName.Dock = 'Top'; $appName.Height = S 34; $appName.Tag = 'keep'
$appName.Text = 'PC-Pflege'; $appName.Font = $Big; $appName.ForeColor = $C.Text
$appName.Padding = New-Object System.Windows.Forms.Padding((S 18), 0, 0, 0)
$sidebar.Controls.AddRange(@($spacer, $appSub, $appName))

$adminBadge = New-Object System.Windows.Forms.Label; $adminBadge.Dock = 'Bottom'; $adminBadge.Height = S 30; $adminBadge.Tag = 'keep'
$adminBadge.Font = $Small; $adminBadge.Padding = New-Object System.Windows.Forms.Padding((S 20), 0, 0, 0)
$adminBadge.Text = $(if ($IsAdmin) { [char]0x25CF + '  Administrator' } else { [char]0x25CF + '  Ohne Admin-Rechte' })
$adminBadge.ForeColor = $(if ($IsAdmin) { $C.Good } else { $C.Warn })
$sidebar.Controls.Add($adminBadge)

function Set-DarkTheme($ctl) {
  foreach ($x in $ctl.Controls) {
    if ($x -is [System.Windows.Forms.Button]) {
      if ($x.Parent -ne $sidebar) {
        $primary = $PrimaryButtons -contains $x.Text
        $x.FlatStyle = 'Flat'; $x.FlatAppearance.BorderSize = 0; $x.Cursor = 'Hand'
        $x.BackColor = $(if ($primary) { $C.Accent } else { $C.Surface2 })
        $x.ForeColor = $(if ($primary) { [System.Drawing.Color]::White } else { $C.Text })
        $x.FlatAppearance.MouseOverBackColor = $(if ($primary) { $C.AccentHover } else { $C.Hover })
        if ($primary) { $x.Font = $Bold }
      }
    } elseif ($x -is [System.Windows.Forms.ListView]) {
      $x.BackColor = $C.Surface; $x.ForeColor = $C.Text; $x.BorderStyle = 'None'; $x.OwnerDraw = $true
      $x.add_DrawColumnHeader({ param($s, $e)
        # Fehler beim Zeichnen duerfen das Fenster nie einfrieren: dann Standard-Kopfzeile
        try {
          $br = New-Object System.Drawing.SolidBrush $C.Surface2; $e.Graphics.FillRectangle($br, $e.Bounds); $br.Dispose()
          $rect = New-Object System.Drawing.Rectangle(($e.Bounds.X + 8), $e.Bounds.Y, ($e.Bounds.Width - 8), $e.Bounds.Height)
          [System.Windows.Forms.TextRenderer]::DrawText($e.Graphics, $e.Header.Text, $Bold, $rect, $C.Muted,
            [System.Windows.Forms.TextFormatFlags]'VerticalCenter, Left, EndEllipsis')
        } catch { $e.DrawDefault = $true }
      })
      $x.add_DrawItem({ param($s, $e) $e.DrawDefault = $true })
      $x.add_DrawSubItem({ param($s, $e) $e.DrawDefault = $true })
      $x.add_Resize({ param($s, $e) if ($s.Columns.Count) { $s.Columns[$s.Columns.Count - 1].Width = -2 } })
      $x.add_HandleCreated({ param($s, $e) [void][PcPflege.Dpi]::SetWindowTheme($s.Handle, 'DarkMode_Explorer', $null) })
    } elseif ($x -is [System.Windows.Forms.Label]) {
      if ($x.Tag -eq 'muted') { $x.ForeColor = $C.Muted } elseif ($x.Tag -ne 'keep') { $x.ForeColor = $C.Text }
    } elseif ($x -is [System.Windows.Forms.CheckBox]) {
      $x.ForeColor = $C.Text
    } elseif ($x -is [System.Windows.Forms.ComboBox]) {
      $x.BackColor = $C.Surface2; $x.ForeColor = $C.Text; $x.FlatStyle = 'Flat'
    } elseif ($x -is [System.Windows.Forms.NumericUpDown]) {
      $x.BackColor = $C.Surface2; $x.ForeColor = $C.Text; $x.BorderStyle = 'FixedSingle'
    }
    if ($x.Controls.Count) { Set-DarkTheme $x }
  }
}
Set-DarkTheme $form
$form.add_Shown({
  $one = 1
  [void][PcPflege.Dpi]::DwmSetWindowAttribute($form.Handle, 20, [ref]$one, 4)  # dunkle Titelleiste (Windows 10/11)
  $form.Activate()
})
Show-Page $tabClean

try {
  Set-Status $(if ($IsAdmin) { 'Bereit.' } else { 'Bereit (ohne Admin-Rechte: ein paar System-Caches sind gesperrt).' })
  $form.WindowState = 'Normal'
  [void]$form.ShowDialog()
} catch {
  [void][System.Windows.Forms.MessageBox]::Show("Fehler: $($_.Exception.Message)`n`nDetails im Protokoll: $LogFile", 'PC-Pflege', 'OK', 'Error')
  Log ("FEHLER: " + ($_ | Out-String))
}
