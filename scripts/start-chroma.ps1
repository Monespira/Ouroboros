$ErrorActionPreference = "Stop"
$chroma = $env:CHROMA_EXECUTABLE
if (-not $chroma) { $chroma = "C:\Users\Zimbra\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\Scripts\chroma.exe" }
if (-not (Test-Path -LiteralPath $chroma)) { throw "Configure CHROMA_EXECUTABLE com o caminho do chroma.exe." }
$dataPath = Join-Path (Split-Path -Parent $PSScriptRoot) "data\chroma"
New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
& $chroma run --path $dataPath --host 127.0.0.1 --port 8000
