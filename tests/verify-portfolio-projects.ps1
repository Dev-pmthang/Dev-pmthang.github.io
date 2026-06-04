$ErrorActionPreference = "Stop"

$htmlContent = Get-Content -Raw "index.html"
$cssContent = Get-Content -Raw "assets/css/style-orange-red.css"
$jsContent = Get-Content -Raw "assets/js/script.js"
$normalizedHtml = ($htmlContent -replace "\s+", " ").Trim()
$normalizedCss = ($cssContent -replace "\s+", " ").Trim()
$normalizedJs = ($jsContent -replace "\s+", " ").Trim()

$requiredHtmlSnippets = @(
  "Forklift Battery Protection Controller",
  "Industrial Lithium Battery Protection Controller (04/2026 - Present)",
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

$galleryItemCount = ([regex]::Matches($htmlContent, 'class="thesis-gallery-item\b')).Count
if ($galleryItemCount -ne 5) {
  throw "Expected 5 thesis gallery items but found $galleryItemCount"
}

$requiredFiles = @(
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

Write-Host "PASS: Portfolio project content and Graduation Thesis gallery markup are present."
