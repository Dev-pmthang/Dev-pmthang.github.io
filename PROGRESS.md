# PROGRESS

## Session
- Timestamp: 2026-06-04 08:01:15 +07:00
- Scope: Establish workflow baseline and audit the current portfolio source before any feature work.

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

## In Progress
- Creating the first baseline commit for the current project snapshot.

## TODO
- Define a repeatable test strategy for future UI or logic changes.
- Verify the site in a browser after the next functional or visual change.
- Review text encoding in source files and normalize if mojibake appears in the editor or browser.

## Technical And Design Decisions
- Preserve the current static-site architecture unless a future task requires a real build pipeline.
- Treat `style-orange-red.css` as the design-system source of truth for current UI work.
- Keep the current Formspree integration unless the user requests a different contact workflow.
- Avoid changing content, layout, or theme in this session because no feature request has been defined yet.

## Risks And Notes For Next Session
- No automated test harness exists yet; any future logic change will need a lightweight test approach added as part of the task.
- The environment currently needs escalated shell access because sandboxed shell startup failed with `windows sandbox: spawn setup refresh`.
- Some console output shows mojibake in emoji/Vietnamese text, which may indicate an encoding mismatch in the terminal path even if the files themselves are still valid.
- External dependencies include CDN-hosted icon/fonts and a live Formspree endpoint.

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
