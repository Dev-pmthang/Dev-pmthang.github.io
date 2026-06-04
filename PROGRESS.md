# PROGRESS

## Session
- Timestamp: 2026-06-04 11:30:21 +07:00
- Scope: Add the `Lithium Battery Management System - BMS` project to the portfolio, connect it to the shared auto-gallery workflow, and keep verification coverage aligned with the new project count and media folder.

## Current Project Snapshot
- Project type: Static single-page portfolio site.
- Entry point: `index.html`
- Active stylesheet: `assets/css/style-orange-red.css`
- Behavior script: `assets/js/script.js`
- Generated gallery manifest: `assets/data/project-galleries.js`
- Gallery sync scripts: `scripts/sync-project-galleries.mjs`, `scripts/sync-project-galleries.ps1`
- Gallery watch scripts: `scripts/watch-project-galleries.mjs`, `scripts/watch-project-galleries.ps1`
- Active image-backed project folders: `BMS`, `Forklift-Battery-Protection-Controller`, `Graduation-thesis`, `Smart-Industrial-Valve-Controller`

## Completed
- Audited `index.html`, the gallery manifest workflow, and both verification scripts before making changes.
- Confirmed the new folder `assets/img/projects/BMS` contains `BMS.png` and created a git checkpoint commit before editing the project showcase.
- Added a new `Lithium Battery Management System - BMS` project row in `index.html`, placed between the newer forklift project and the older valve project to preserve reverse-chronological ordering.
- Wrote portfolio copy from the provided CV content without inventing new features, keeping the emphasis on hardware design, 2-layer PCB layout, high-current circuits, ADC measurement, protection logic, STM32 HAL, FreeRTOS, and industrial communications.
- Reused the existing manifest-driven auto-gallery pattern for the BMS project by wiring it to `data-project-gallery="BMS"` and keeping a fallback image in the HTML.
- Updated the static verification script to assert the new BMS content, manifest entry, local media file, and the new project row count.
- Updated the browser verification script to validate the BMS auto-gallery alongside the forklift and valve galleries while keeping thesis lightbox coverage intact.
- Improved the gallery manifest generator so folders whose image file shares the same name no longer emit redundant alt text such as `BMS - BMS`.
- Regenerated `assets/data/project-galleries.js` and verified the BMS folder is now included in the browser-readable manifest.

## In Progress
- No active implementation task in this session.

## TODO
- Add more BMS images whenever they are ready; the shared gallery workflow will render them after sync or while the watcher is running.
- Consider adding a generic lightbox for auto-rendered project galleries if you want click-to-preview behavior for BMS, forklift, and valve images too.
- Run a live in-app browser QA pass if the `iab` backend becomes available again.
- Review and normalize older mojibake text fragments in legacy sections if they become visible in the browser.

## Technical And Design Decisions
- Reused the existing manifest-driven auto-gallery system instead of creating a BMS-specific image renderer.
- Kept the BMS project markup aligned with the existing project-row structure so the layout behavior remains shared across desktop, tablet, and mobile breakpoints.
- Limited the textual content to claims already present in the provided CV excerpt.
- Fixed duplicate folder/file alt text generation in the sync script because the new `BMS/BMS.png` naming exposed that edge case in a user-visible way.
- Kept the fallback image in HTML so the project card still renders meaningfully before JavaScript enhances the gallery.

## Risks And Notes For Next Session
- This remains a generated-data workflow, not true browser-side folder discovery. Without the watcher running, you still need to run the sync script before refresh or publish when adding images.
- The Browser plugin backend is still unavailable for this workspace (`Browser is not available: iab`), so responsive and interaction verification continues to rely on headless Chrome.
- The generated manifest now covers four project folders and nine images in total.
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
