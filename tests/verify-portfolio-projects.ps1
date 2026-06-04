$ErrorActionPreference = "Stop"

$content = Get-Content -Raw "index.html"
$normalizedContent = ($content -replace "\s+", " ").Trim()

$requiredSnippets = @(
  "Forklift Battery Protection Controller",
  "Industrial Lithium Battery Protection Controller (04/2026 - Present)",
  "The controller communicates with the BMS over CAN Bus and RS485 to monitor",
  "the system drives relays to disable fork lifting and lowering while still allowing the vehicle to return to the charging station safely.",
  "<span>ESP32-S3</span>",
  "<span>EMI/EMC PCB Design</span>",
  "<span>Embedded Firmware</span>",
  "Application of LoRa Mesh Network in Environmental Monitoring",
  "Graduation Thesis | Embedded Hardware & Firmware Engineer (01/2024 - 05/2024)",
  "a LoRa Mesh routing algorithm for stable long-range communication",
  "final score of 9.17/10 (Grade A).",
  "<span>LoRa Mesh</span>",
  "<span>Firebase</span>",
  "assets/img/projects/Graduation-thesis/Master.jpg",
  "assets/img/projects/Graduation-thesis/Node.jpg",
  "assets/img/projects/Graduation-thesis/Bo_tri.jpg",
  "project-media-gallery--thesis"
)

foreach ($snippet in $requiredSnippets) {
  $normalizedSnippet = ($snippet -replace "\s+", " ").Trim()

  if (-not $normalizedContent.Contains($normalizedSnippet)) {
    throw "Missing expected snippet: $snippet"
  }
}

$requiredFiles = @(
  "assets/img/projects/Graduation-thesis/Master.jpg",
  "assets/img/projects/Graduation-thesis/Node.jpg",
  "assets/img/projects/Graduation-thesis/Bo_tri.jpg"
)

foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    throw "Missing expected media file: $file"
  }
}

Write-Host "PASS: Portfolio project content and Graduation Thesis media references are present in index.html."
