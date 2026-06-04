$ErrorActionPreference = "Stop"

$nodeScript = Join-Path (Resolve-Path ".").Path "tests\verify-thesis-gallery.mjs"

if (-not (Test-Path $nodeScript)) {
  throw "Missing test runner: $nodeScript"
}

& node $nodeScript

if ($LASTEXITCODE -ne 0) {
  throw "Thesis gallery verification failed with exit code $LASTEXITCODE."
}
