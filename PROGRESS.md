# PROGRESS

## Session
- Timestamp: 2026-06-04 10:31:00 +07:00
- Scope: Automate the `Smart Industrial Valve Controller` project gallery so newly added images can be rendered without editing `index.html` again.

## Current Project Snapshot
- Project type: Static single-page portfolio site.
- Entry point: `index.html`
- Active stylesheet: `assets/css/style-orange-red.css`
- Behavior script: `assets/js/script.js`
- Generated gallery manifest: `assets/data/project-galleries.js`
- Gallery sync scripts: `scripts/sync-project-galleries.mjs`, `scripts/sync-project-galleries.ps1`
- Gallery watch scripts: `scripts/watch-project-galleries.mjs`, `scripts/watch-project-galleries.ps1`

## Completed
- Audited the current valve project markup, stylesheet, JavaScript, and the new image files in `assets/img/projects/Smart-Industrial-Valve-Controller`.
- Confirmed a new image `HP_Valves_Slave_BOT.png` was added to the valve project folder after the previous session.
- Replaced the valve project's hard-coded single-image markup with a manifest-driven auto gallery container in `index.html`.
- Added a generated gallery manifest file at `assets/data/project-galleries.js`.
- Added a Node-based sync script that scans `assets/img/projects/*` and regenerates the manifest automatically.
- Added a Windows-friendly PowerShell wrapper so gallery sync can be run with a short local command.
- Added an optional local watcher script so project image changes can resync the manifest automatically during editing sessions.
- Added runtime JavaScript that reads `window.PROJECT_GALLERIES` and renders all images for the valve project automatically.
- Added scoped CSS for the new `auto-project-gallery` layout, including responsive multi-image rendering and contained hover zoom.
- Kept the `Graduation Thesis` custom gallery and lightbox behavior unchanged.
- Updated verification scripts so they run the sync step first, validate the generated manifest, and confirm the valve gallery renders both board images.
- Added a watcher startup smoke test so the local auto-watch workflow is also verified during testing.
- Executed both verification scripts successfully after the final implementation.

## In Progress
- No active implementation task in this session.

## TODO
- Add a similar auto-gallery container to other future image-backed projects if you want the same workflow elsewhere.
- Add media to the `Forklift Battery Protection Controller` project when assets are ready.
- Run a live in-app browser QA pass if the `iab` backend becomes available again.
- Review and normalize older mojibake text fragments in legacy sections if they become visible in the editor or browser.
- Consider adding a generic lightbox for auto-rendered project galleries if you want click-to-preview behavior for all project folders.

## Technical And Design Decisions
- Keep the site static with no framework or build pipeline.
- Do not attempt direct folder listing from the browser because a static website cannot reliably enumerate local directory contents across deployment environments.
- Use a generated JavaScript manifest (`window.PROJECT_GALLERIES`) instead of `fetch(...)` so the gallery also works when the site is opened from simple static hosting without extra API endpoints.
- Keep the valve project gallery generic and data-driven, while preserving the thesis gallery as a custom handcrafted interaction because its layout and lightbox behavior are more specialized.
- Sort generated gallery images so primary views such as `top/front/master` appear before `BOT/BOTTOM/BACK` views.
- Make the verification scripts run the sync step first so tests also act as a safe pre-publish refresh for gallery data.

## Risks And Notes For Next Session
- This is the most practical automation possible for a static site, but it is not true zero-step filesystem discovery in the browser. Without the watcher running, you still need to run the sync script before refreshing or publishing.
- The Browser plugin backend is still unavailable for this workspace (`Browser is not available: iab`), so visual verification continues to rely on headless Chrome instead of the in-app browser.
- The generated manifest currently includes every image folder under `assets/img/projects`, even if some folders are still rendered with handcrafted HTML.
- The portfolio still depends on CDN-hosted fonts/icons and a live Formspree endpoint.

## Lessons Learned
### 2026-06-04 - Static websites cannot truly auto-discover new files from project folders
- Cause: Browsers do not have a reliable, portable way to enumerate folder contents from a static deployment with only HTML, CSS, and JavaScript.
- Fix: Added a manifest generation step that scans the image folders locally and writes a browser-readable JavaScript manifest.
- Prevention: For future image-driven portfolio sections, plan either a generated manifest workflow or a real backend/build step instead of relying on direct folder discovery.

### 2026-06-04 - Generated data should be refreshed as part of verification
- Cause: A generated manifest can become stale if new images are added but the sync step is skipped.
- Fix: Made both verification scripts run the gallery sync first.
- Prevention: Couple generated asset data with tests or release scripts so stale manifests are caught before publishing.

### 2026-06-04 - A watcher improves the editing workflow even on a static site
- Cause: Manually running sync after every image addition is easy to forget during rapid portfolio updates.
- Fix: Added a lightweight watcher that keeps the manifest in sync while the user is editing.
- Prevention: When a static site depends on generated asset data, offer both a one-shot sync command and a long-running watcher for local development.

### 2026-06-04 - Single-purpose hard-coded media blocks do not scale well
- Cause: The previous valve project card used one hard-coded image path, so every new image required manual HTML edits.
- Fix: Replaced the static media block with a data-driven gallery container.
- Prevention: Use data-driven rendering for project sections that are likely to receive additional media over time.
