$ErrorActionPreference = "Stop"

$syncScript = "scripts/sync-project-galleries.ps1"
$watchScript = "scripts/watch-project-galleries.mjs"
if (-not (Test-Path $syncScript)) {
  throw "Missing sync script: $syncScript"
}

if (-not (Test-Path $watchScript)) {
  throw "Missing watch script: $watchScript"
}

powershell -ExecutionPolicy Bypass -File $syncScript

if ($LASTEXITCODE -ne 0) {
  throw "Project gallery sync failed during verification."
}

$watchStdout = Join-Path $env:TEMP "watch-project-galleries-out.txt"
$watchStderr = Join-Path $env:TEMP "watch-project-galleries-err.txt"
Remove-Item $watchStdout, $watchStderr -ErrorAction SilentlyContinue

$watchProcess = Start-Process -FilePath "node" `
  -ArgumentList $watchScript `
  -PassThru -NoNewWindow `
  -RedirectStandardOutput $watchStdout `
  -RedirectStandardError $watchStderr

Start-Sleep -Milliseconds 900

if ($watchProcess.HasExited) {
  $watchError = if (Test-Path $watchStderr) { Get-Content -Raw $watchStderr } else { "" }
  throw "Gallery watch script exited unexpectedly during startup.`n$watchError"
}

Stop-Process -Id $watchProcess.Id -Force
Start-Sleep -Milliseconds 200

$watchOutput = if (Test-Path $watchStdout) { Get-Content -Raw $watchStdout } else { "" }
if ($watchOutput -notmatch "Watching project image folders:" -or $watchOutput -notmatch "Synced ") {
  throw "Gallery watch script did not report the expected startup messages."
}

$htmlContent = Get-Content -Raw "index.html"
$cssContent = Get-Content -Raw "assets/css/style-orange-red.css"
$jsContent = Get-Content -Raw "assets/js/script.js"
$manifestContent = Get-Content -Raw "assets/data/project-galleries.js"
$normalizedHtml = ($htmlContent -replace "\s+", " ").Trim()
$normalizedCss = ($cssContent -replace "\s+", " ").Trim()
$normalizedJs = ($jsContent -replace "\s+", " ").Trim()
$normalizedManifest = ($manifestContent -replace "\s+", " ").Trim()

$requiredHtmlSnippets = @(
  "Forklift Battery Protection Controller",
  "Industrial Lithium Battery Protection Controller (04/2026 - Present)",
  "Smart Industrial Valve Controller",
  "Industrial Valve Actuation Controller (03/2025 - Present)",
  "I also designed the H-Bridge motor driver stage for precise stepper motor actuation",
  "testing and deployment at TS FOOD factory",
  'data-project-gallery="Smart-Industrial-Valve-Controller"',
  'data-project-gallery-items',
  "assets/data/project-galleries.js",
  "Application of LoRa Mesh Network in Environmental Monitoring",
  "Graduation Thesis | Embedded Hardware & Firmware Engineer (01/2024 - 05/2024)",
  "a LoRa Mesh routing algorithm for stable long-range communication",
  "final score of 9.17/10 (Grade A).",
  '<div class="thesis-gallery">',
  'class="thesis-gallery-item thesis-gallery-item--hero"',
  'class="thesis-lightbox"',
  'class="thesis-lightbox-img"',
  "assets/img/projects/Graduation-thesis/Master.jpg",
  "assets/img/projects/Graduation-thesis/Node.jpg",
  "assets/img/projects/Graduation-thesis/Bo_tri.jpg",
  "assets/img/projects/Graduation-thesis/Full_Board.jpg",
  "assets/img/projects/Graduation-thesis/Board_Altium.JPG"
)

foreach ($snippet in $requiredHtmlSnippets) {
  $normalizedSnippet = ($snippet -replace "\s+", " ").Trim()

  if (-not $normalizedHtml.Contains($normalizedSnippet)) {
    throw "Missing expected HTML snippet: $snippet"
  }
}

$requiredCssSnippets = @(
  ".project-media-gallery--auto",
  ".auto-project-gallery",
  ".auto-project-gallery--single",
  ".auto-project-gallery-item",
  ".auto-project-gallery-thumb",
  ".thesis-gallery-item",
  ".thesis-gallery-item:hover .thesis-gallery-thumb",
  ".thesis-lightbox",
  ".thesis-lightbox.is-open",
  "object-fit: cover",
  "overflow: hidden",
  "transform 0.45s",
  "grid-template-columns: repeat(2, minmax(0, 1fr))"
)

foreach ($snippet in $requiredCssSnippets) {
  if (-not $normalizedCss.Contains($snippet)) {
    throw "Missing expected CSS snippet: $snippet"
  }
}

$requiredJsSnippets = @(
  'const projectGalleryManifest = window.PROJECT_GALLERIES || {}',
  'const autoProjectGalleries = document.querySelectorAll("[data-project-gallery]")',
  'const galleryContainer = galleryRoot.querySelector("[data-project-gallery-items]")',
  'galleryContainer.classList.toggle("auto-project-gallery--single", galleryItems.length === 1)',
  'const thesisGalleryItems = document.querySelectorAll(".thesis-gallery-item")',
  'const thesisLightbox = document.querySelector(".thesis-lightbox")',
  'const openThesisLightbox = (trigger) =>',
  'const closeThesisLightbox = () =>',
  'event.key === "Escape"',
  'thesisLightbox.classList.add("is-open")',
  'thesisLightbox.classList.remove("is-open")'
)

foreach ($snippet in $requiredJsSnippets) {
  if (-not $normalizedJs.Contains($snippet)) {
    throw "Missing expected JS snippet: $snippet"
  }
}

$requiredManifestSnippets = @(
  'window.PROJECT_GALLERIES =',
  '"Smart-Industrial-Valve-Controller"',
  '"assets/img/projects/Smart-Industrial-Valve-Controller/HP_Valves_Slave.png"',
  '"assets/img/projects/Smart-Industrial-Valve-Controller/HP_Valves_Slave_BOT.png"'
)

foreach ($snippet in $requiredManifestSnippets) {
  if (-not $normalizedManifest.Contains($snippet)) {
    throw "Missing expected manifest snippet: $snippet"
  }
}

$removedHtmlSnippets = @(
  "Smart Stair Light System V3",
  "Smart Stair Light System V2",
  "Smart Stair Light System V1",
  "assets/img/projects/Smart-Stair-Light-PLC/Master_PLC.jpg",
  "assets/img/projects/Smart-Stair-Light-RGB/Master_controller_top_layer.jpg",
  "assets/img/projects/Smart-Stair-Light-25Step/SmartStairLight_25steps_Kathode.png"
)

foreach ($snippet in $removedHtmlSnippets) {
  if ($normalizedHtml.Contains($snippet)) {
    throw "Found removed HTML snippet that should no longer be referenced: $snippet"
  }
}

$projectRowCount = ([regex]::Matches($htmlContent, '<div class="project-row">')).Count
if ($projectRowCount -ne 3) {
  throw "Expected 3 project rows but found $projectRowCount"
}

$galleryItemCount = ([regex]::Matches($htmlContent, 'class="thesis-gallery-item\b')).Count
if ($galleryItemCount -ne 5) {
  throw "Expected 5 thesis gallery items but found $galleryItemCount"
}

$requiredFiles = @(
  "assets/data/project-galleries.js",
  "assets/img/projects/Smart-Industrial-Valve-Controller/HP_Valves_Slave.png",
  "assets/img/projects/Smart-Industrial-Valve-Controller/HP_Valves_Slave_BOT.png",
  "assets/img/projects/Graduation-thesis/Master.jpg",
  "assets/img/projects/Graduation-thesis/Node.jpg",
  "assets/img/projects/Graduation-thesis/Bo_tri.jpg",
  "assets/img/projects/Graduation-thesis/Full_Board.jpg",
  "assets/img/projects/Graduation-thesis/Board_Altium.JPG"
)

foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    throw "Missing expected media file: $file"
  }
}

Write-Host "PASS: Portfolio project content, active media references, and thesis gallery markup are present."
