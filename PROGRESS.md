# PROGRESS

## Session
- Timestamp: 2026-06-04 13:11:49 +07:00
- Scope: Rebalance the `Contact` section so the left sidebar and right form column feel cleaner, lighter, and more proportional while keeping the same overall structure and responsive behavior.

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
- Re-audited the current contact markup and the new contact-only CSS block before refining the layout further.
- Created a new checkpoint commit before tuning the visual balance of the contact section.
- Reduced the visual weight of the left sidebar by tightening card padding, shrinking the QR presentation, and reducing internal gaps.
- Adjusted the desktop grid ratio to a clearer left/right balance closer to the intended 40-45% / 55-60% split.
- Changed the contact grid to stretch the right form shell vertically on desktop so the form column reads as a balanced counterpart to the stacked left cards.
- Tightened typography, badge sizing, highlight-card spacing, input padding, textarea height, and submit button styling to make the contact area feel denser and more intentional.
- Kept the existing HTML structure and form functionality intact; the rebalancing work was handled almost entirely through scoped CSS updates.
- Strengthened the contact verification script to assert desktop sidebar width ratio, QR visual footprint, and form-height balance in addition to the existing responsive checks.
- Verified the updated contact layout in headless Chrome and reviewed the generated desktop screenshot for visual QA.
- Re-ran the existing project showcase and thesis regression tests successfully after the contact rebalance.

## In Progress
- No active implementation task in this session.

## TODO
- If you rename the Zalo QR asset later, update the `src` in `index.html` to match the new filename or path.
- Consider adding direct contact metadata later, such as a clickable Zalo ID, email card, or phone card, if you want the left column to carry more than the QR entry point.
- Consider adding a second CTA below the form, such as `Download CV` or `Schedule a Call`, if you want to use the remaining vertical space in the form shell on larger screens.
- Consider adding a generic lightbox for auto-rendered project galleries if you want click-to-preview behavior for BMS, forklift, and valve images too.
- Run a live in-app browser QA pass if the `iab` backend becomes available again.
- Review and normalize older mojibake text fragments in legacy sections if they become visible in the browser.

## Technical And Design Decisions
- Limited the rebalance to scoped contact selectors so no project, footer, or thesis-lightbox layout behavior changed.
- Preserved the actual asset path `assets/img/Contact/Zalo.jpg` and kept the contact section structure stable, using CSS as the primary tool for visual rebalancing.
- Used a stretched desktop grid with a smaller left-column ratio instead of inventing a new markup pattern, because the imbalance was caused mainly by proportion and spacing rather than DOM structure.
- Reduced QR dominance by constraining the QR shell and QR image width rather than removing content from the Zalo card.
- Strengthened the browser verification script so the intended design targets are measurable instead of relying only on subjective inspection.

## Risks And Notes For Next Session
- The Browser plugin backend is still unavailable for this workspace (`Browser is not available: iab`), so responsive verification for the contact section still relies on headless Chrome screenshots and computed-style checks.
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

### 2026-06-04 - Contact imbalance was driven more by proportion than by missing components
- Cause: The first contact redesign introduced the right pieces, but the left column still felt visually heavy because the sidebar width, QR size, and internal spacing were too generous relative to the form shell.
- Fix: Reduced the sidebar share, compacted the QR card, tightened padding and typography, and stretched the form shell to restore visual balance.
- Prevention: For split contact layouts, validate width ratios and visual weight explicitly instead of assuming a structurally correct two-column layout will feel balanced by default.
