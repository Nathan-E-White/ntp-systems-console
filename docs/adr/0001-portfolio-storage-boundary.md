# ADR-0001: Keep portfolio workflows browser-session only

## Status

Accepted.

## Context

The workbench needs reviewable imported artifacts and exportable packets, but it is a public portfolio demonstration, not a collaboration or records system. Durable storage would imply retention, identity, access control, migration, and operational commitments that are outside the product boundary.

## Decision

Campaign Artifacts, Custom What-If state, and Review Packet exports remain browser-session features. Exports are user-controlled files; the application creates no database records, sharing links, accounts, or access-control model.

## Consequences

- MongoDB has no runtime role and must not remain as unused infrastructure.
- UI must label session/export boundaries plainly.
- Tests may verify import/export data shape, but must not require a persistence adapter.
