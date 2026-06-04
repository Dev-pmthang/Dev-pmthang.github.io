# PROGRESS

## Session
- Timestamp: 2026-06-04 10:43:59 +07:00
- Scope: Extend the auto-gallery workflow to `Forklift Battery Protection Controller` so new images in its project folder can appear without further HTML edits.

## Current Project Snapshot
- Project type: Static single-page portfolio site.
- Entry point: `index.html`
- Active stylesheet: `assets/css/style-orange-red.css`
- Behavior script: `assets/js/script.js`
- Generated gallery manifest: `assets/data/project-galleries.js`
- Gallery sync scripts: `scripts/sync-project-galleries.mjs`, `scripts/sync-project-galleries.ps1`
- Gallery watch scripts: `scripts/watch-project-galleries.mjs`, `scripts/watch-project-galleries.ps1`

## Completed
- Audited the new folder `assets/img/projects/Forklift-Battery-Protection-Controller` and confirmed the added image `BMS_RELAY.png`.
- Confirmed the forklift project card was still text-only while the valve project was already using the manifest-driven auto-gallery workflow.
- Updated the `Forklift Battery Protection Controller` project row to use the same `data-project-gallery` auto-rendering mechanism as the valve project.
- Kept the forklift project content unchanged and only added the media container plus fallback image markup.
- Regenerated the gallery manifest so `Forklift-Battery-Protection-Controller` is now included in `assets/data/project-galleries.js`.
- Extended the static verification script to assert the forklift gallery hook, manifest entry, and local media file.
- Extended the browser verification script to validate both auto-rendered project galleries (`Forklift` and `Smart Industrial Valve Controller`) separately instead of treating all auto-gallery images as one group.
- Executed the gallery sync and both verification scripts successfully after the update.

## In Progress
- No active implementation task in this session.

## TODO
- Add more forklift project images whenever they are ready; the folder-based workflow now supports them.
- Add a similar auto-gallery container to any future image-backed projects that should not require manual HTML edits.
- Run a live in-app browser QA pass if the `iab` backend becomes available again.
- Review and normalize older mojibake text fragments in legacy sections if they become visible in the editor or browser.
- Consider adding a generic lightbox for auto-rendered project galleries if you want click-to-preview behavior for all project folders.

## Technical And Design Decisions
- Reuse the existing manifest-driven gallery system instead of creating a second forklift-specific media workflow.
- Keep the static-site approach: local folders are scanned by sync/watch scripts, then rendered in the browser from a generated manifest.
- Scope browser verification by project key so each auto-rendered project gallery can evolve independently without ambiguous selectors.
- Keep the fallback image in HTML for graceful rendering before JavaScript enhancement, while letting the manifest replace it at runtime.

## Risks And Notes For Next Session
- This remains generated-data automation, not direct browser filesystem discovery. Without the watcher running, you still need to run the sync script before refresh or publish.
- The Browser plugin backend is still unavailable for this workspace (`Browser is not available: iab`), so visual verification continues to rely on headless Chrome instead of the in-app browser.
- The generated manifest now covers three project folders: `Forklift-Battery-Protection-Controller`, `Smart-Industrial-Valve-Controller`, and `Graduation-thesis`.
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
