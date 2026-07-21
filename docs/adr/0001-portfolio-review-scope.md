# ADR-0001: Keep the current product scope as a portfolio review workflow

## Status

Accepted

## Context

The workbench already presents itself as a public portfolio demonstration using screening calculations and static synthetic fixtures. A durable analyst workflow would require persistent case identity, artifact retention, access control, collaboration, and a defined database role. Those requirements are not presently implemented or authorized by the claim boundary.

## Decision

Treat the current product as a portfolio review workflow. The browser may calculate a Custom What-If, parse a locally supplied file, and export an in-memory Review Packet, but none of these actions creates a durable analytical record or represents solver execution.

Any move to a durable analyst workflow must begin with a new ADR covering storage, retention, provenance hashes, access control, sharing, and MongoDB's role.

## Consequences

- UI language must distinguish the current Operating Case from a saved campaign.
- A Review Packet may be exported as a browser-session artifact, provided it states that it is not persisted, shared, access-controlled, or stored in MongoDB.
- Durable Campaign Artifact work remains a later milestone.
- The existing browser-local interaction model is intentional rather than an incomplete persistence feature.
