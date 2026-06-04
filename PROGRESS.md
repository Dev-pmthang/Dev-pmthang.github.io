# PROGRESS

## Session
- Timestamp: 2026-06-04 10:11:48 +07:00
- Scope: Realign the `Projects` section with the project media currently present in `assets/img/projects`, add `Smart Industrial Valve Controller`, and keep the thesis gallery behavior intact.

## Current Project Snapshot
- Project type: Static single-page portfolio site.
- Entry point: `index.html`
- Active stylesheet: `assets/css/style-orange-red.css`
- Behavior script: `assets/js/script.js`
- Primary assets: `assets/img/*`, `assets/docs/PHAM_MINH_THANG_EMBEDDED SYSTEMS ENGINEER_2026.pdf`

## Completed
- Audited the current `Projects` markup and the real contents of `assets/img/projects` before editing.
- Confirmed the project media folder now contains only `Graduation-thesis` and `Smart-Industrial-Valve-Controller`.
- Confirmed the old `Smart Stair Light` project image references in `index.html` pointed to assets that are already deleted from the working tree.
- Kept the `Forklift Battery Protection Controller` as the newest text-only project entry.
- Added `Smart Industrial Valve Controller` as a new project row with its local image `assets/img/projects/Smart-Industrial-Valve-Controller/HP_Valves_Slave.png`.
- Wrote new portfolio copy for `Smart Industrial Valve Controller`, emphasizing 4-layer PCB design, industrial 4-20 mA / 0-10 V interfaces, the H-Bridge motor driver, STM32 + FreeRTOS firmware, closed-loop control, field deployment, and ongoing V2 development.
- Removed the outdated `Smart Stair Light` project blocks from `index.html` so the page no longer references missing project assets.
- Added a scoped single-image media style for board-render style projects without affecting the thesis gallery or other shared project styles.
- Preserved the existing `Graduation Thesis` multi-image gallery and lightbox behavior.
- Extended the static verification script to assert the new valve project content and to ensure removed `Smart Stair Light` references are no longer present.
- Extended the headless browser verification script to confirm the valve project media block renders correctly across desktop, tablet, and mobile while the thesis lightbox still works.
- Executed both verification scripts successfully after the final edits.

## In Progress
- No active implementation task in this session.

## TODO
- Add real project media for the `Forklift Battery Protection Controller` entry when assets are available.
- Run a live in-app browser QA pass if the `iab` backend becomes available again.
- Review and normalize older mojibake text fragments in legacy sections if they become visible in the editor or browser.
- Decide whether the remaining non-project asset deletions in the workspace should be kept permanently if they are no longer needed.
- Consider adding a dedicated local image preview/lightbox for future single-image project cards if more hardware render projects are added.

## Technical And Design Decisions
- Treat the actual contents of `assets/img/projects` as the source of truth for which image-backed project entries should remain in the portfolio.
- Keep `Forklift Battery Protection Controller` because it is a valid active project entry even without a media folder yet.
- Remove stale project blocks that referenced deleted local assets instead of leaving broken images in the portfolio.
- Add a dedicated `.project-media-gallery--single` variant so single hardware renders can use `object-fit: contain` without affecting the thesis gallery grid.
- Keep the thesis lightbox implementation unchanged because its scope and behavior are already isolated and verified.
- Keep the new valve controller copy concise and end-to-end, with explicit emphasis on the H-Bridge motor driver, industrial communication, and deployment work.

## Risks And Notes For Next Session
- The Browser plugin backend is still unavailable for this workspace (`Browser is not available: iab`), so visual verification again relied on headless Chrome instead of the in-app browser.
- The project list is now aligned with the currently available project media folders, but additional project assets can be reintroduced later if you restore them intentionally.
- Some terminal output still shows mojibake, which still looks like a console encoding issue rather than a confirmed HTML/CSS corruption issue.
- The portfolio still depends on CDN-hosted fonts/icons and a live Formspree endpoint.

## Lessons Learned
### 2026-06-04 - The media folder should drive image-backed project entries
- Cause: The HTML still referenced older `Smart Stair Light` assets even after those local files had been deleted.
- Fix: Realigned the `Projects` section with the directories that actually exist in `assets/img/projects`.
- Prevention: Before editing project cards, inspect the real media folders and remove any stale references to deleted assets.

### 2026-06-04 - Single hardware renders need a different media treatment than galleries
- Cause: The shared project media grid was optimized for multi-item or portrait-heavy media blocks.
- Fix: Added a dedicated single-image project media variant with contained rendering and clipped hover zoom.
- Prevention: Use a scoped media modifier when a project has only one wide board render instead of forcing it into a gallery-oriented layout.

### 2026-06-04 - Static content tests should also assert removed references
- Cause: Positive presence checks alone do not catch broken legacy references that remain in HTML after asset cleanup.
- Fix: Added negative assertions for removed `Smart Stair Light` titles and image paths.
- Prevention: When replacing or deleting project assets, update tests to validate both what must exist and what must no longer exist.

### 2026-06-04 - Browser interaction tests remain valuable after non-JS content changes
- Cause: Even mostly content-driven project updates can still break responsive layout or media rendering.
- Fix: Extended the headless browser test to validate the new valve controller media block across multiple viewports.
- Prevention: Keep at least one browser-level verification path for portfolio sections that mix layout, media, and interaction behavior.
