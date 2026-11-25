$ErrorActionPreference = "Stop"

$htmlContent = Get-Content -Raw "index.html"
$cssContent = Get-Content -Raw "assets/css/style-orange-red.css"
$normalizedHtml = ($htmlContent -replace "\s+", " ").Trim()
$normalizedCss = ($cssContent -replace "\s+", " ").Trim()

$requiredHtmlSnippets = @(
  '<section class="contact" id="contact">',
  '<div class="contact-layout">',
  'class="contact-info-card"',
  'class="contact-form-card"',
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
  '.contact-info-card',
  '.contact #contact-form',
  'grid-template-columns: minmax(340px, 0.94fr) minmax(0, 1.06fr)'
)

foreach ($snippet in $requiredCssSnippets) {
  if (-not $normalizedCss.Contains($snippet)) {
    throw "Missing expected contact CSS snippet: $snippet"
  }
}

$requiredFiles = @(
  "tests/verify-contact-layout.mjs"
)

foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    throw "Missing expected contact asset or test file: $file"
  }
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
