# Project Practices

## Git and changes

- **Do not create commits, amend commits, push, open pull requests, reset history, or otherwise change Git history without the user's explicit permission in the current conversation.**
- Keep the user's existing changes intact. Inspect `git status` before editing and stage only files that belong to the requested work when explicitly authorized to commit.
- Treat workflow artifacts (plans, brainstorming material, previews, and agent scratch files) as local-only. Store them under `.superpowers/` and do not stage or commit them.
- If a prior agent-created commit must be removed, ask before rewriting history or reverting it.

## Site implementation

- This is a buildless static site: use semantic HTML, `styles.css`, and vanilla JavaScript. Do not add a framework, package manager, or runtime dependency unless the user explicitly requests it.
- Preserve the established visual system: existing CSS variables, serif/sans typography pairing, quiet editorial layout, responsive breakpoints, and accessible focus states.
- Keep sections responsive at desktop and mobile widths; use semantic landmarks, headings, controls, and native elements before adding JavaScript.
- Put testable non-DOM behavior in small modules and cover it with the existing Node test command (`make test`).

## External services and security

- Keep browser API keys narrowly restricted to the required API and approved origins. Never broaden a key's restrictions or create external resources without user approval.
- Do not display or repeat credential values in user-facing messages. Validate integrations with the minimum data needed.
- Preserve graceful UI fallbacks when an external service is unavailable.

## Verification and communication

- Run focused tests and syntax checks for touched JavaScript before reporting verification results.
- Report verification limits plainly (for example, when a browser or production deployment is unavailable).
- Summarize changed files and leave work uncommitted unless the user has explicitly authorized a commit.
