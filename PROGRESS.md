# PROGRESS

## Session
- Timestamp: 2026-06-04 09:14:04 +07:00
- Scope: Rewrite the Graduation Thesis project as a LoRa Mesh environmental monitoring thesis and switch its gallery to the new local image set.

## Current Project Snapshot
- Project type: Static single-page portfolio site.
- Entry point: `index.html`
- Active stylesheet: `assets/css/style-orange-red.css`
- Behavior script: `assets/js/script.js`
- Primary assets: `assets/img/*`, `assets/docs/PHAM_MINH_THANG_EMBEDDED SYSTEMS ENGINEER_2026.pdf`

## Completed
- Audited the repository structure and primary source files before editing.
- Confirmed the site architecture is HTML + CSS + vanilla JavaScript with no build step.
- Confirmed the active theme is loaded from `assets/css/style-orange-red.css`, not `assets/css/style.css`.
- Confirmed the contact form submits directly to Formspree from client-side JavaScript.
- Confirmed `PROGRESS.md` did not exist before this session.
- Confirmed the current folder originally had no git repository.
- Initialized a new git repository at the project root to enable checkpoint and rollback workflow from this session onward.
- Created an initial baseline commit for the current project snapshot.
- Reviewed the existing `projects` section structure and kept the new project entry consistent with the current prose, tag layout, and reverse-chronological ordering.
- Added the Forklift Battery Protection Controller as the newest project entry in `index.html`.
- Added a lightweight PowerShell verification script to confirm the inserted title, summary, description, and key tags are present in `index.html`.
- Executed the verification script successfully after normalizing whitespace handling for multiline HTML content.
- Confirmed the user replaced the Graduation Thesis image set directly in `assets/img/projects/Graduation-thesis`.
- Updated the Graduation Thesis project card to render local images directly from `assets/img/projects/Graduation-thesis`.
- Added a dedicated thesis gallery modifier so project-specific media ratios do not inherit the older portrait-heavy crop ratio.
- Extended the verification script to assert thesis image references and file existence, then executed it successfully.
- Replaced the previous thesis content with the LoRa Mesh environmental monitoring thesis description, role context, and final grade.
- Switched the thesis gallery to the user-provided `Master.jpg`, `Node.jpg`, and `Bo_tri.jpg` media set in `assets/img/projects/Graduation-thesis`.
- Retuned the thesis gallery aspect ratios so one landscape hero image and two portrait support images display more cleanly.
- Updated the verification script to assert the new thesis title, summary, tags, image references, and file existence, then executed it successfully.

## In Progress
- No active implementation task in this session.

## TODO
- Define a repeatable test strategy for future UI or logic changes.
- Verify the site in a browser after the next functional or visual change.
- Review text encoding in source files and normalize if mojibake appears in the editor or browser.
- Replace the text-only Forklift Battery Protection Controller entry with real project media when image or demo assets become available.
- Run a manual browser QA pass for the updated thesis gallery once an in-app browser session is available.
- Clean up unused legacy thesis images in the folder later if you decide they are no longer needed.

## Technical And Design Decisions
- Preserve the current static-site architecture unless a future task requires a real build pipeline.
- Treat `style-orange-red.css` as the design-system source of truth for current UI work.
- Keep the current Formspree integration unless the user requests a different contact workflow.
- Keep project descriptions concise, technical, and focused on system behavior plus real-world operating value.
- Insert the new project as a content-only `project-row` because no image or video asset was provided for this session.
- Use project-specific gallery modifiers when new media shapes differ significantly from the original portrait-oriented gallery assumptions.
- Prefer project text and gallery media that describe the same real system revision to avoid mismatched storytelling in the portfolio.

## Risks And Notes For Next Session
- No automated test harness exists yet; any future logic change will need a lightweight test approach added as part of the task.
- The environment currently needs escalated shell access because sandboxed shell startup failed with `windows sandbox: spawn setup refresh`.
- Some console output shows mojibake in emoji/Vietnamese text, which may indicate an encoding mismatch in the terminal path even if the files themselves are still valid.
- External dependencies include CDN-hosted icon/fonts and a live Formspree endpoint.
- The new forklift project currently has no dedicated media block, so visual consistency can be improved later by adding a project image or demo video.
- Browser-based visual verification is still blocked because the in-app browser backend remains unavailable (`Browser is not available: iab`).
- The thesis folder now contains both the older hardware images and the newer LoRa environmental monitoring images; only the newer set is referenced in `index.html`.

## Lessons Learned
### 2026-06-04 - Git checkpoint workflow could not be applied
- Cause: The working directory is not a git repository.
- Fix: Initialize git with `git init` or open the project from the intended repository root before starting feature work.
- Prevention: Verify `git status` succeeds at session start before promising checkpoint commits.

### 2026-06-04 - Active styling source could be misidentified
- Cause: Multiple CSS files exist, but `index.html` currently loads `assets/css/style-orange-red.css`.
- Fix: Inspect the linked stylesheet in the HTML entry point before editing styles.
- Prevention: Always confirm the active asset references from the entry document, not only from filenames in the tree.

### 2026-06-04 - Tooling access required escalation
- Cause: Sandboxed shell and Node REPL startup failed with `windows sandbox: spawn setup refresh`.
- Fix: Re-run essential inspection commands with escalated permissions.
- Prevention: If the same sandbox error appears again, escalate read-only inspection commands immediately instead of retrying multiple times in the sandbox.

### 2026-06-04 - New project entries may not always ship with media assets
- Cause: Portfolio content requests can arrive before project photos or demo videos are prepared.
- Fix: Add the project as a text-only `project-row` first, then attach media in a later session.
- Prevention: Ask for or prepare representative project media before doing a final visual polish pass on the projects section.

### 2026-06-04 - Content verification for HTML should not depend on line wrapping
- Cause: Multiline HTML paragraphs can break exact string matches in simple text-based tests.
- Fix: Normalize whitespace in the verification script before checking required snippets.
- Prevention: Use whitespace-tolerant assertions for static HTML content tests from the start.

### 2026-06-04 - Media galleries need project-specific aspect ratios
- Cause: The shared `.media-item` styling assumed tall portrait media and would crop wide board photos too aggressively.
- Fix: Added a thesis-specific gallery modifier with wider aspect ratios and a hero image spanning both columns.
- Prevention: When adding new project media, inspect the image shapes first and add a modifier class instead of forcing every project into one gallery ratio.

### 2026-06-04 - Browser verification may be unavailable even after frontend edits
- Cause: The in-app browser backend was not available for this session.
- Fix: Completed text-based verification and file existence checks, then recorded the missing visual QA as follow-up work.
- Prevention: Attempt browser verification after each frontend change, but keep a fallback verification script so the session can still produce evidence of correctness.

### 2026-06-04 - Thesis media and thesis narrative must stay aligned
- Cause: The original thesis text described a different hardware theme than the newly supplied LoRa environmental monitoring photos.
- Fix: Rewrote the thesis title, summary, description, tags, and image references together in the same session.
- Prevention: When swapping a project's image set, review and update the corresponding project copy in the same change.
