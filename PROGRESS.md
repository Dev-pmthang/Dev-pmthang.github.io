# PROGRESS

## Session
- Timestamp: 2026-06-04 09:54:28 +07:00
- Scope: Add a responsive multi-image gallery and lightbox for the Graduation Thesis project without affecting the rest of the portfolio site.

## Current Project Snapshot
- Project type: Static single-page portfolio site.
- Entry point: `index.html`
- Active stylesheet: `assets/css/style-orange-red.css`
- Behavior script: `assets/js/script.js`
- Primary assets: `assets/img/*`, `assets/docs/PHAM_MINH_THANG_EMBEDDED SYSTEMS ENGINEER_2026.pdf`

## Completed
- Audited the current `projects` markup, thesis asset folder, active stylesheet, and behavior script before editing.
- Kept the existing portfolio layout and scoped all new UI behavior to the Graduation Thesis project only.
- Replaced the thesis single-image presentation with a dedicated five-image gallery using local assets from `assets/img/projects/Graduation-thesis`.
- Added thesis-only hover zoom behavior with clipped overflow, rounded cards, and responsive grid behavior for desktop, tablet, and mobile.
- Added a thesis-only lightbox modal with close button, overlay click-to-close, and `Esc` key support.
- Preserved image proportions by keeping thumbnail crops inside card containers and using `object-fit: contain` in the lightbox preview.
- Added thesis-specific verification coverage in `tests/verify-portfolio-projects.ps1`.
- Added a headless browser interaction test in `tests/verify-thesis-gallery.mjs` and a PowerShell wrapper in `tests/verify-thesis-gallery.ps1`.
- Replaced the earlier iframe-based harness approach with a Chrome DevTools Protocol test runner because the iframe dump-dom method was not reliable for modal interaction checks.
- Captured headless QA screenshots during thesis gallery verification for desktop, tablet, and mobile viewports.
- Cleaned `assets/js/script.js` comments to readable ASCII English while preserving existing logic.
- Executed all verification scripts successfully after the final code update.

## In Progress
- No active implementation task in this session.

## TODO
- Add real project media for the Forklift Battery Protection Controller entry when assets are available.
- Run a live in-app browser QA pass if the `iab` backend becomes available again.
- Review and normalize older mojibake comments or text fragments in legacy source sections if they become visible in the editor or browser.
- Decide whether older unused thesis images should remain in `assets/img/projects/Graduation-thesis` long-term.
- Add broader site-wide responsive checks later if you plan a full UI refresh beyond the thesis section.

## Technical And Design Decisions
- Keep `assets/css/style-orange-red.css` as the current design-system source of truth.
- Keep the thesis gallery isolated with dedicated classes such as `thesis-gallery`, `thesis-gallery-item`, and `thesis-lightbox` to avoid regressions in other projects.
- Preserve the existing `.project-row` structure and add a thesis-specific media modifier instead of refactoring shared project gallery rules.
- Use semantic `<button>` elements for gallery items so click, focus, and keyboard activation work naturally without extra libraries.
- Keep the lightbox implementation in vanilla JavaScript because the site has no build step and the interaction is simple enough to stay dependency-free.
- Prefer direct browser automation through Chrome DevTools Protocol for future static-site UI interaction tests when the built-in browser backend is unavailable.

## Risks And Notes For Next Session
- The Browser plugin backend is still unavailable for this workspace (`Browser is not available: iab`), so final visual verification relied on headless Chrome instead of the in-app browser.
- The portfolio still depends on CDN-hosted fonts/icons and a live Formspree endpoint.
- Some terminal output still shows mojibake, which suggests a console encoding mismatch rather than a confirmed source-file corruption issue.
- Thesis interaction coverage is now automated, but unrelated site-wide responsive issues outside the thesis scope should be validated separately if you touch broader layout code later.

## Lessons Learned
### 2026-06-04 - Git checkpoint workflow could not be applied initially
- Cause: The working directory was not yet a git repository.
- Fix: Initialized git before continuing feature work.
- Prevention: Verify `git status` works at the start of every session before promising checkpoint commits.

### 2026-06-04 - Active styling source could be misidentified
- Cause: Multiple CSS files exist, but the real entry point loads `assets/css/style-orange-red.css`.
- Fix: Confirmed the linked stylesheet from `index.html` before editing styles.
- Prevention: Always inspect the entry document and active asset references before changing UI code.

### 2026-06-04 - Content verification for HTML should not depend on line wrapping
- Cause: Multiline HTML paragraphs can break exact string matches in simple static tests.
- Fix: Normalized whitespace in verification scripts before checking required snippets.
- Prevention: Use whitespace-tolerant assertions for static HTML validation from the start.

### 2026-06-04 - Media galleries need project-specific aspect ratios
- Cause: The shared media rules were tuned for portrait-heavy project content and would crop wider hardware images too aggressively.
- Fix: Added a thesis-specific gallery modifier with mixed hero, portrait, and wide thumbnail ratios.
- Prevention: Inspect image shapes before reusing a shared gallery layout and add scoped modifiers when a project has different media proportions.

### 2026-06-04 - Thesis media and thesis narrative must stay aligned
- Cause: The original thesis copy and the newly supplied images described different systems.
- Fix: Rewrote the thesis title, summary, description, tags, and media references together.
- Prevention: Treat project text and project media as one content unit during portfolio updates.

### 2026-06-04 - Iframe dump-dom browser checks were not reliable for modal testing
- Cause: The first headless verification approach relied on an iframe harness and dump-dom timing, which was inconsistent for lightbox interactions across viewports.
- Fix: Replaced it with a direct Chrome DevTools Protocol runner that drives the real page and checks UI state after each interaction.
- Prevention: For future UI interaction tests on this static site, prefer direct browser automation over iframe-based DOM dumps when behavior matters.
