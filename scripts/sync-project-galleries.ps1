$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$nodeScript = Join-Path $repoRoot "scripts\sync-project-galleries.mjs"

if (-not (Test-Path $nodeScript)) {
  throw "Missing sync script: $nodeScript"
}

& node $nodeScript

if ($LASTEXITCODE -ne 0) {
  throw "Project gallery sync failed with exit code $LASTEXITCODE."
}
