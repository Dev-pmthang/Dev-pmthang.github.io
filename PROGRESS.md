# PROGRESS

## Session
- Timestamp: 2026-07-01 08:30:00 +07:00
- Scope: Redesigned the `Contact` section into a balanced 2-column professional layout. Unified the left sidebar into a single contact-info card with all details + QR code, and the right side into a contact-form card with a tighter input grid.

## Current Project Snapshot
- Project type: Static single-page portfolio site.
- Entry point: `index.html`
- Active stylesheet: `assets/css/style-orange-red.css`
- Behavior script: `assets/js/script.js`
- Generated gallery manifest: `assets/data/project-galleries.js`
- Gallery sync scripts: `scripts/sync-project-galleries.mjs`, `scripts/generate-project-galleries.js`
- Active image-backed project folders: `BMS`, `CANbus`, `Forklift-Battery-Protection-Controller`, `Graduation-thesis`, `NRF`, `Smart-Industrial-Valve-Controller`
- Contact image folder: `assets/img/Contact`

## Completed
- Re-audited the `Projects` markup, gallery manifest flow, and responsive CSS before editing the project list.
- Added a new `CAN Bus Gateway Controller` project row in `index.html` using the existing `project-row` and auto-gallery structure.
- Placed the new project after BMS (both STM32+CAN Bus) and before Smart Industrial Valve Controller for logical grouping.
- Kept the current classes, layout, spacing, and project card visual system unchanged so the new entry inherits the same styling.
- Connected the new project to the existing manifest-driven gallery workflow through the `CANbus` project folder in `assets/img/projects/CANbus/`.
- Added 5 gallery images: Top_ALITUM.png, Bot_ALITUM.png, Top_Board.jpg, Lap_dat.jpg, BOX.png with clear alt text.
- Synced the generated project gallery manifest via `node scripts/generate-project-galleries.js`.
- No CSS changes needed — existing `project-row` and `auto-project-gallery` styles handle the new card correctly.
- No existing projects, classes, IDs, or layouts were modified or removed.

## In Progress
- No active implementation task in this session.

## TODO
- If you rename or replace any image inside `assets/img/projects/CANbus/`, rerun `node scripts/generate-project-galleries.js` so the generated gallery manifest stays in sync.
- Consider adding a lightbox interaction for auto-rendered project galleries later if you want the CANbus, NRF, BMS, forklift, and valve images to support click-to-preview behavior too.
- Review and normalize older mojibake text fragments in legacy CSS comments or content if they become visible in future UI passes.

## Technical And Design Decisions
- Limited the implementation to the `Projects` section and its gallery data so no other portfolio sections were altered.
- Reused the existing manifest-driven auto-gallery component rather than inventing a new gallery pattern, keeping the new project visually consistent with the current cards.
- Left the CSS selectors and spacing rules untouched because the current `project-row` system already handles desktop, tablet, and mobile breakpoints correctly for auto galleries.
- Used descriptive, professional alt text for all 5 CANbus images to support accessibility and SEO in the embedded engineering portfolio context.

## Risks And Notes For Next Session
- The generated manifest now depends on the presence of the five CANbus images: `Top_ALITUM.png`, `Bot_ALITUM.png`, `Top_Board.jpg`, `Lap_dat.jpg`, `BOX.png`.
- The generated manifest now covers six project folders and seventeen images in total.
- The portfolio still depends on CDN-hosted fonts/icons and a live Formspree endpoint.
