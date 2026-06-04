$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$nodeScript = Join-Path $repoRoot "scripts\watch-project-galleries.mjs"

if (-not (Test-Path $nodeScript)) {
  throw "Missing watch script: $nodeScript"
}

& node $nodeScript
