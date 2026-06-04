$ErrorActionPreference = "Stop"

$syncScript = Join-Path (Resolve-Path ".").Path "scripts\sync-project-galleries.ps1"
$nodeScript = Join-Path (Resolve-Path ".").Path "tests\verify-thesis-gallery.mjs"

if (-not (Test-Path $syncScript)) {
  throw "Missing sync script: $syncScript"
}

if (-not (Test-Path $nodeScript)) {
  throw "Missing test runner: $nodeScript"
}

powershell -ExecutionPolicy Bypass -File $syncScript

if ($LASTEXITCODE -ne 0) {
  throw "Project gallery sync failed before browser verification."
}

& node $nodeScript

if ($LASTEXITCODE -ne 0) {
  throw "Project showcase verification failed with exit code $LASTEXITCODE."
}
