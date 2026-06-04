$ErrorActionPreference = "Stop"

$htmlContent = Get-Content -Raw "index.html"
$cssContent = Get-Content -Raw "assets/css/style-orange-red.css"
$normalizedHtml = ($htmlContent -replace "\s+", " ").Trim()
$normalizedCss = ($cssContent -replace "\s+", " ").Trim()

$requiredHtmlSnippets = @(
  '<section class="contact" id="contact">',
  '<div class="contact-layout">',
  'class="contact-card contact-card--intro"',
  'class="contact-card contact-card--zalo"',
  'Connect via Zalo',
  'Scan the QR code to connect with me on Zalo.',
  'assets/img/Contact/Zalo.jpg',
  'class="contact-form-shell"',
  'id="contact-form"',
  'Send a Message'
)

foreach ($snippet in $requiredHtmlSnippets) {
  $normalizedSnippet = ($snippet -replace "\s+", " ").Trim()

  if (-not $normalizedHtml.Contains($normalizedSnippet)) {
    throw "Missing expected contact HTML snippet: $snippet"
  }
}

$requiredCssSnippets = @(
  '.contact-layout',
  '.contact-sidebar',
  '.contact-card',
  '.contact-card--zalo:hover .contact-qr-image',
  '.contact-qr-shell',
  '.contact-qr-image',
  '.contact #contact-form .input-group',
  '.contact-badge--zalo',
  'object-fit: contain',
  'overflow: hidden',
  'grid-template-columns: minmax(300px, 0.84fr) minmax(0, 1.16fr)'
)

foreach ($snippet in $requiredCssSnippets) {
  if (-not $normalizedCss.Contains($snippet)) {
    throw "Missing expected contact CSS snippet: $snippet"
  }
}

$requiredFiles = @(
  "assets/img/Contact/Zalo.jpg",
  "tests/verify-contact-layout.mjs"
)

foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    throw "Missing expected contact asset or test file: $file"
  }
}

$contactCardCount = ([regex]::Matches($htmlContent, 'class="contact-card contact-card--')).Count
if ($contactCardCount -ne 2) {
  throw "Expected 2 primary contact cards but found $contactCardCount"
}

$contactFormCount = ([regex]::Matches($htmlContent, 'id="contact-form"')).Count
if ($contactFormCount -ne 1) {
  throw "Expected 1 contact form but found $contactFormCount"
}

node tests/verify-contact-layout.mjs

if ($LASTEXITCODE -ne 0) {
  throw "Contact layout verification failed."
}

Write-Host "PASS: Contact section markup, styling, and responsive layout checks passed."
