# PROGRESS

## Session
- Timestamp: 2026-06-04 11:43:09 +07:00
- Scope: Redesign the `Contact` section into a two-column contact layout with a dedicated Zalo QR card while preserving the existing form behavior and responsive styling.

## Current Project Snapshot
- Project type: Static single-page portfolio site.
- Entry point: `index.html`
- Active stylesheet: `assets/css/style-orange-red.css`
- Behavior script: `assets/js/script.js`
- Generated gallery manifest: `assets/data/project-galleries.js`
- Gallery sync scripts: `scripts/sync-project-galleries.mjs`, `scripts/sync-project-galleries.ps1`
- Gallery watch scripts: `scripts/watch-project-galleries.mjs`, `scripts/watch-project-galleries.ps1`
- Active image-backed project folders: `BMS`, `Forklift-Battery-Protection-Controller`, `Graduation-thesis`, `Smart-Industrial-Valve-Controller`
- Contact image folder: `assets/img/Contact`

## Completed
- Audited the current `contact` markup, contact form behavior in `assets/js/script.js`, and contact-related styling in `assets/css/style-orange-red.css` before editing.
- Confirmed the actual QR asset is `assets/img/Contact/Zalo.jpg` and created a git checkpoint commit before modifying the contact section.
- Rebuilt the `Contact` section into a dedicated `contact-layout` with a left sidebar and right form column.
- Added two contact cards on the left side: an intro/collaboration card and a Zalo QR card with the actual `Zalo.jpg` asset.
- Wrapped the existing form in a `contact-form-shell` card, kept the same fields and submit behavior, and improved the JavaScript form selector by targeting `#contact-form` explicitly.
- Added scoped contact-only CSS for the new card layout, QR container, hover effects, and responsive behavior without touching the project gallery or footer structure.
- Implemented responsive behavior so the overall contact layout stays two-column on desktop and collapses to one column on tablet/mobile.
- Added a new static-plus-browser verification flow for the contact section and executed it successfully.
- Re-ran the existing project showcase tests to confirm the contact refactor did not break project galleries or the thesis lightbox.

## In Progress
- No active implementation task in this session.

## TODO
- If you rename the Zalo QR asset later, update the `src` in `index.html` to match the new filename or path.
- Consider adding direct contact metadata later, such as a clickable Zalo ID, email card, or phone card, if you want the left column to carry more than the QR entry point.
- Consider adding a generic lightbox for auto-rendered project galleries if you want click-to-preview behavior for BMS, forklift, and valve images too.
- Run a live in-app browser QA pass if the `iab` backend becomes available again.
- Review and normalize older mojibake text fragments in legacy sections if they become visible in the browser.

## Technical And Design Decisions
- Limited the scope to the `contact` section only and introduced contact-specific class names so header, footer, projects, and the thesis lightbox remain unaffected.
- Used the actual asset path `assets/img/Contact/Zalo.jpg` instead of a placeholder because the file is already present in the workspace.
- Kept the form submission flow unchanged and only tightened the selector from `querySelector("form")` to `getElementById("contact-form")` for more explicit binding.
- Chose card-based layout and hover motion that matches the existing site language: dark surfaces, rounded corners, subtle gradients, soft red/silver glow, and controlled scaling.
- Added a dedicated contact verification script instead of overloading the project gallery tests so the contact section can evolve independently.

## Risks And Notes For Next Session
- The Browser plugin backend is still unavailable for this workspace (`Browser is not available: iab`), so responsive verification for the contact section continues to rely on headless Chrome screenshots and computed-style checks.
- The contact section now depends on the presence of `assets/img/Contact/Zalo.jpg`; if that asset is moved or renamed, the QR card will need its `src` updated.
- The generated manifest still covers four project folders and nine images in total.
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
