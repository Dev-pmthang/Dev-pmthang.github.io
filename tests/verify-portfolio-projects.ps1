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
  "assets/img/projects/Graduation-thesis/Full_Board.jpg",
  "assets/img/projects/Graduation-thesis/Board_Altium.JPG",
  "assets/img/projects/Graduation-thesis/Tong_Quang.jpg",
  "project-media-gallery--thesis"
)

foreach ($snippet in $requiredSnippets) {
  $normalizedSnippet = ($snippet -replace "\s+", " ").Trim()

  if (-not $normalizedContent.Contains($normalizedSnippet)) {
    throw "Missing expected snippet: $snippet"
  }
}

$requiredFiles = @(
  "assets/img/projects/Graduation-thesis/Full_Board.jpg",
  "assets/img/projects/Graduation-thesis/Board_Altium.JPG",
  "assets/img/projects/Graduation-thesis/Tong_Quang.jpg"
)

foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    throw "Missing expected media file: $file"
  }
}

Write-Host "PASS: Portfolio project content and Graduation Thesis media references are present in index.html."
