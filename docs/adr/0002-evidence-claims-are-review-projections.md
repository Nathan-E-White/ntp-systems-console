# ADR-0002: Treat evidence claims as review projections

## Status

Accepted

## Context

The parser layer yields rich family-specific records. The review interface needs a smaller, stable way to state what a record supports, where it came from, and why it cannot establish more. Exposing parser records directly makes the review interface broad and encourages accidental upgrades from synthetic fixture to engineering result.

## Decision

An Evidence Claim is the canonical review projection. Every claim must carry:

1. a plain-language statement;
2. its supporting Evidence Artifact or artifacts;
3. a Source Locator;
4. a Limitation; and
5. a recommended next action, which may explicitly be `none required`.

Family-specific parsing remains behind the parser seam. A later Artifact Projection module may have adapters for MCNP-like, BISON-like, MOOSE-like, and ROCETS-like records, but its review interface uses the terms in `CONTEXT.md`.

## Consequences

- Parser records remain available for expert drill-down but are not the default review surface.
- Tests for future review behavior should cross the Evidence Claim interface rather than parser implementation details.
- A fixture can support a claim without becoming a calculated, validated, or qualified result.
