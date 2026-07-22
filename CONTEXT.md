# NTP Systems Console context

## Purpose

This is a public portfolio workbench for explaining an engineering review workflow. It is not a reactor-design, safety-analysis, or validated solver environment.

## Core terms

- **Operating Case**: the browser-held set of reduced-order engine inputs and calculated outputs.
- **Custom What-If**: an Operating Case changed locally from a prepared baseline; bundled evidence is not rerun.
- **Evidence Artifact**: a read-only, synthetic MCNP-, BISON-, MOOSE-, or ROCETS-like parser input/output record.
- **Evidence Claim**: a review statement backed by selected artifacts, source location, limitation, and next action.
- **Campaign Artifact**: a versioned browser-session snapshot of an imported parser artifact. It has no durable storage, sharing, or access-control role.
- **Review Packet**: an ordered decision brief (posture, claim, source locator, limitation, next action) rendered for screen, print, or browser-session export.

## Architectural boundaries

- Reduced-order calculations and parser fixtures are distinct evidence classes.
- Parser syntax adapters may vary by solver family; review projections share semantic contracts.
- Active Case owns reviewer interaction state; scene presentation consumes compact cues and must not redefine analytical selection.
- Browser-session features must not imply persistence or collaboration.

## Working checks

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run build
```

The browser proof harness requires a running Vite server and Chrome remote-debugging target; CI configures both.
