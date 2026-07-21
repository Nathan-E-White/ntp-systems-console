# ADR-0003: Maintain a bounded portfolio bundle budget during narrative consolidation

## Status

Accepted

## Context

The interactive engine scene and evidence visualizations keep the primary production asset above Vite's default 500 kB gzip warning threshold. `bun run build` on July 21, 2026 measured the M3-M6 primary asset at 564.56 kB gzip, versus the M1 baseline of 561.70 kB gzip: a 2.86 kB increase, within the 10 kB change allowance. The current product is a public portfolio workflow, not a bandwidth-constrained production application.

## Decision

Until a later performance-focused milestone separates the visualization and charting dependencies further, permit a primary JavaScript asset of at most 575 kB gzip. Every UI change must remain within the existing 10 kB gzip change allowance, and the build output must be recorded in review.

## Consequences

- The warning remains visible and intentional rather than being hidden by raising Vite's warning limit.
- M5 can consolidate narrative adapters without making an unsupported claim that the asset is below 500 kB gzip.
- A later performance milestone must either lower the asset below 500 kB gzip or replace this ADR with a measured product requirement.
