# ADR-0002: Set the initial gzip budget to 560 KiB

## Status

Accepted.

## Context

The integrated portfolio workbench now loads review sections and the scene lazily, but the measured primary entry is 551.95 KiB gzip. The previous 550 KiB policy is therefore below the measured, intentional baseline by roughly 2 KiB.

## Decision

Set the enforced initial JavaScript budget to 560 KiB gzip. The Vite plugin must evaluate the largest entry chunk, rather than whichever entry happens to appear first in the generated bundle.

## Consequences

- Meaningful regressions still fail the build.
- Review, fuel-performance, evidence, and 3D-scene chunks remain demand-loaded.
- Future growth beyond 560 KiB requires a new measured decision or further code splitting.
