# Quality Gates

## Automated release gate

The required automated seam is:

```bash
bun install --frozen-lockfile
bun run demo:check
```

`demo:check` runs typecheck, lint, the Vitest suite, and the production build. GitHub Actions runs this gate on pushes and pull requests to `main`.

## Manual review gate

Before a demo-ready release, follow `docs/demo-release-checklist.md` and `docs/demo-runbook.md`.

- Walk both prepared Operating Cases from Reset Demo.
- Verify the five guided-tour cues and the fallback path.
- Verify the keyboard order reaches primary navigation, Operating Case controls, Model Evidence controls, and Review without an unreachable visible control.
- Verify the claim boundary remains visible whenever a reviewer can confuse a reduced-order result with fixture evidence.
- Review at 1280x720 and 1024x768 at 100% zoom; no horizontal overflow or overlapping primary navigation is acceptable.

## Performance gate

The current production build baseline is a 2.09 MB primary JavaScript asset (561.70 kB gzip). Vite reports it as above the default 500 kB warning threshold.

Until the baseline is reduced, new UI work must not increase the primary gzip asset by more than 10 kB without an explicit explanation in its pull request. Before M5 (state and narrative consolidation) completes, reduce the primary asset to 500 kB gzip or less, or record an ADR for a deliberately different budget.

## Evidence-language gate

Any change to the review interface must obey `CONTEXT.md` and ADR-0002: an Evidence Claim identifies its artifact, Source Locator, Limitation, and any review-follow-up action. Static fixtures remain distinct from reduced-order results.
