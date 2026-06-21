# Demo Release Checklist

## Build

- [x] `bun install --frozen-lockfile`
- [x] `bun run demo:check`
- [x] No application console errors in either prepared-case walkthrough
- [x] Production preview starts without recovery steps

## Engineering Narrative

- [x] Pewee benchmark values show source locators
- [x] Channel table contains 36 selectable stations
- [x] Peak station and A/B/C cutaway highlighting agree
- [x] Nuclear Fuel Performance surfaces BISON fuel-performance and MCNP burnup/restart evidence
- [x] Fixture and calculated values remain visually separate
- [x] Thermal investigation produces a negative wall-criterion margin
- [x] Review flags include whole-engine pressure, compact stability support, and transient-model limitations
- [x] Legacy model remains behind the advanced regression disclosure

## Presentation

- [x] Fit Engine frames tank-to-nozzle topology at 1280x720 and 1024x768
- [x] Five tour cues wait indefinitely for Next
- [x] Back, Pause, Resume, Stop, and Replay behave deterministically
- [x] Print preview contains the focused dossier only
- [x] Baseline and investigation fallback screenshots are current
- [ ] Interview-day machine setup: browser zoom is 100%; notifications and unrelated tabs are closed

## Release Hygiene

- [x] Review `git status --short`
- [x] Confirm fixture inputs and outputs are intentionally included
- [x] Confirm `dist/`, `node_modules/`, private worktrees, generated secrets, local paths, and temporary browser profiles are not included
- [x] Commit the exact rehearsed state on `codex/demo-ready-release`

## Verification Record

- Verified June 21, 2026 with Bun.
- `demo:check`: 42 test files and 101 tests passed; typecheck, lint, and production build passed.
- Two consecutive walkthroughs completed at both 1280x720 and 1024x768.
- Production preview completed the guided flow, investigation case, and focused Review dossier.
- Known non-blocking notices: Three.js `Clock` deprecation and the Vite large-chunk build warning.
