# PROGRESS

## Session
- Timestamp: 2026-06-05 14:06:19 +07:00
- Scope: Add a new `Vehicle Navigation Display` entry to the `Projects` section using the existing auto-gallery project card pattern, keep the current layout/styles untouched, and verify the new row across desktop, tablet, and mobile.

## Current Project Snapshot
- Project type: Static single-page portfolio site.
- Entry point: `index.html`
- Active stylesheet: `assets/css/style-orange-red.css`
- Behavior script: `assets/js/script.js`
- Generated gallery manifest: `assets/data/project-galleries.js`
- Gallery sync scripts: `scripts/sync-project-galleries.mjs`, `scripts/sync-project-galleries.ps1`
- Gallery watch scripts: `scripts/watch-project-galleries.mjs`, `scripts/watch-project-galleries.ps1`
- Active image-backed project folders: `BMS`, `Forklift-Battery-Protection-Controller`, `Graduation-thesis`, `NRF`, `Smart-Industrial-Valve-Controller`
- Contact image folder: `assets/img/Contact`

## Completed
- Re-audited the `Projects` markup, gallery manifest flow, and responsive CSS before editing the project list.
- Created a checkpoint commit before modifying the project showcase.
- Added a new `Vehicle Navigation Display` project row in `index.html` using the existing `project-row` and auto-gallery structure.
- Kept the current classes, layout, spacing, and project card visual system unchanged so the new entry inherits the same styling.
- Connected the new project to the existing manifest-driven gallery workflow through the `NRF` project folder in `assets/img/projects/NRF/`.
- Updated the project regression checks so the new card, manifest entries, and NRF image assets are covered automatically.
- Updated the browser-based showcase verification to include the new NRF gallery and to capture screenshots centered on the new project row for responsive QA.
- Synced the generated project gallery manifest so it now includes five image-backed project folders and twelve total project images.
- Passed `tests/verify-portfolio-projects.ps1` after the new project was added.
- Passed `tests/verify-thesis-gallery.ps1`, confirming the new project row fits correctly on desktop, tablet, and mobile with non-distorted gallery images.
- Reviewed the generated desktop, tablet, and mobile screenshots for the new project row to confirm spacing and visual consistency with the existing portfolio style.

## In Progress
- No active implementation task in this session.

## TODO
- If you rename or replace any image inside `assets/img/projects/NRF/`, rerun `scripts/sync-project-galleries.ps1` so the generated gallery manifest stays in sync.
- Consider adding a lightbox interaction for auto-rendered project galleries later if you want the NRF, BMS, forklift, and valve images to support click-to-preview behavior too.
- Review and normalize older mojibake text fragments in legacy CSS comments or content if they become visible in future UI passes.

## Technical And Design Decisions
- Limited the implementation to the `Projects` section and its gallery verification flow so no other portfolio sections were altered.
- Reused the existing manifest-driven auto-gallery component rather than inventing a new gallery pattern, keeping the new project visually consistent with the current cards.
- Left the CSS selectors and spacing rules untouched because the current `project-row` system already handles desktop, tablet, and mobile breakpoints correctly for auto galleries.
- Used the existing `NRF` asset folder as the gallery source so the browser receives the same multi-image behavior already used by other image-backed projects.

## Risks And Notes For Next Session
- Responsive verification for the projects section still depends on local headless Chromium checks and captured screenshots rather than the unavailable in-app browser backend.
- The generated manifest now depends on the presence of the three NRF images: `Board.jpg`, `NRF.png`, and `NRF_BOT.png`.
- The generated manifest now covers five project folders and twelve images in total.
- The portfolio still depends on CDN-hosted fonts/icons and a live Formspree endpoint.

## Lessons Learned
### 2026-06-04 - New image-backed projects should join the same gallery pipeline immediately
- Cause: The forklift project gained real media after the valve auto-gallery workflow already existed, but its card markup had not yet been connected to that system.
- Fix: Replaced the forklift text-only media area with the same manifest-driven gallery hook used by the valve project.
- Prevention: When a project folder first receives media assets, connect the project card to the shared gallery pipeline in the same session.

### 2026-06-04 - Browser verification for auto galleries should be scoped by project
- Cause: Once multiple projects use the same auto-gallery classes, broad selectors like `.auto-project-gallery-thumb` become ambiguous.
- Fix: Updated the verification logic to target galleries by their `data-project-gallery` key.
- Prevention: Use stable per-project data attributes whenever a generic component can appear more than once on the same page.

### 2026-06-04 - Static websites cannot truly auto-discover new files from project folders
- Cause: Browsers do not have a reliable, portable way to enumerate folder contents from a static deployment with only HTML, CSS, and JavaScript.
- Fix: Added a manifest generation step that scans the image folders locally and writes a browser-readable JavaScript manifest.
- Prevention: For future image-driven portfolio sections, plan either a generated manifest workflow or a real backend/build step instead of relying on direct folder discovery.

### 2026-06-04 - Generated data should be refreshed as part of verification
- Cause: A generated manifest can become stale if new images are added but the sync step is skipped.
- Fix: Made both verification scripts run the gallery sync first.
- Prevention: Couple generated asset data with tests or release scripts so stale manifests are caught before publishing.

### 2026-06-04 - Folder and file names can expose awkward generated alt text
- Cause: The new asset path `assets/img/projects/BMS/BMS.png` caused the generated alt text to become `BMS - BMS`.
- Fix: Updated the manifest generator to collapse duplicate folder/file names into a single alt label.
- Prevention: Treat generated accessibility text as part of the UI surface and harden naming helpers when new folders expose edge cases.

### 2026-06-04 - Prefix-based regex checks can overcount component variants
- Cause: The initial contact test counted `contact-card-heading` along with the two main `contact-card` blocks because the regex matched the shared prefix.
- Fix: Narrowed the assertion to count only `class="contact-card contact-card--..."` blocks.
- Prevention: When testing utility or BEM-like class names, scope regex assertions to the exact variant pattern instead of the shared prefix.

### 2026-06-04 - Contact imbalance was driven more by proportion than by missing components
- Cause: The first contact redesign introduced the right pieces, but the left column still felt visually heavy because the sidebar width, QR size, and internal spacing were too generous relative to the form shell.
- Fix: Reduced the sidebar share, compacted the QR card, tightened padding and typography, and stretched the form shell to restore visual balance.
- Prevention: For split contact layouts, validate width ratios and visual weight explicitly instead of assuming a structurally correct two-column layout will feel balanced by default.
