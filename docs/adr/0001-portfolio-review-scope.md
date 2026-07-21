# ADR-0001: Keep the current product scope as a portfolio review workflow

## Status

Accepted

## Context

The workbench already presents itself as a public portfolio demonstration using screening calculations and static synthetic fixtures. A durable analyst workflow would require persistent case identity, artifact retention, access control, collaboration, and a defined database role. Those requirements are not presently implemented or authorized by the claim boundary.

## Decision

Treat the current product as a portfolio review workflow. The browser may calculate a Custom What-If and parse a locally supplied file, but neither action creates a durable analytical record or represents solver execution.

Any move to a durable analyst workflow must begin with a new ADR covering storage, retention, provenance hashes, access control, sharing, and MongoDB's role.

## Consequences

- UI language must distinguish the current Operating Case from a saved campaign.
- Campaign Artifact and Review Packet work remains a later milestone.
- The existing browser-local interaction model is intentional rather than an incomplete persistence feature.
