# NTP Systems Console Context

## Purpose

**NTP Systems Console** is a public portfolio demonstration of engineering-review judgment for a space nuclear propulsion operating case. It is a screening workflow, not a reactor design, qualified analysis, safety assessment, production solver environment, or historical Pewee reconstruction.

## Domain terms

### Operating Case

An **Operating Case** is the complete current screening scenario: controlled inputs, reduced-order outputs, calculation trace, model basis, review posture, and applicable fixture evidence.

Prepared Operating Cases are `Pewee-Inspired Benchmark` and `Thermal Margin Investigation`. Changing an input creates a **Custom What-If**. A Custom What-If recalculates browser-side reduced-order outputs; it does not rerun or mutate fixture evidence.

### Reduced-order result

A **reduced-order result** is calculated in this application from the current Operating Case. It must remain visually and linguistically distinct from an imported fixture value.

### Evidence Artifact

An **Evidence Artifact** is a read-only synthetic MCNP-like, BISON-like, MOOSE-like, or ROCETS-like input or output record parsed for workflow and review demonstration. It is not evidence that the corresponding production solver was executed or validated.

### Evidence Claim

An **Evidence Claim** is a review-ready statement made from one or more Evidence Artifacts. It states what the artifact supports, what it does not establish, its **Source Locator**, its **Limitation**, and a recommended next action. The next action may explicitly be `none required`. A claim never upgrades a fixture into a calculated, qualified, or validated result.

### Source Locator

A **Source Locator** identifies where an Evidence Claim came from: artifact identity plus a stable file, section, table, record, or line reference when available.

### Limitation

A **Limitation** is the explicit reason a result or Evidence Claim cannot support a stronger conclusion. Examples include static fixture status, representative geometry, screening property closure, channel-only pressure loss, and unavailable transient response.

### Review Posture

A **Review Posture** is the conclusion for an Operating Case: nominal only when the required basis is complete; otherwise watch, limit, incomplete, or information with a named follow-up action.

## Claim boundary

Use "Pewee-inspired benchmark", "representative channel", "screening margin", and "synthetic fixture evidence". Do not claim solver execution, computational validation, qualified fuel performance, qualified materials, exact CAD geometry, safety analysis, or delivered engine performance.
