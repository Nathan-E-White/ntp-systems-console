# SNP Engine Systems Analysis Workbench

A public portfolio demonstration inspired by Amentum Space Nuclear Propulsion Engine Systems
Analyst role `R0157331`. It shows nuclear fuel-performance judgment, model-integration workflow,
operational-case reasoning, evidence correlation, and design-review communication.

This application is not a reactor design, safety analysis, validated multiphysics model, or
production MCNP, BISON, MOOSE, or ROCETS execution environment.

## Demo Story

1. Open **Operating Case** and establish the `Pewee-Inspired Benchmark`, published source basis, and claim boundary.
2. Play the presenter-paced tour: benchmark basis, hydrogen enthalpy rise, limiting channel station, immutable fixture correlation, and review flags.
3. Use **Channel Results and Evidence Correlation** to select an axial station and inspect bulk/wall temperature, pressure, Reynolds, Nusselt, Mach, and friction results.
4. Open **Nuclear Fuel Performance** and discuss the BISON fuel-channel scaffold, MCNP burnup/restart-memory kit, and cross-code handoff map.
5. Select a KPI and use **Calculation Basis** to show its equation, numerical substitution, upstream inputs, source locator, and limitations.
6. Select `Thermal Margin Investigation` to expose the negative channel-wall criterion margin without implying historical Pewee behavior.
7. Open **Model Evidence** to inspect five output artifacts across four synthetic solver families, then close in **Review** with fuel-performance constraints, compact stability support, explicit flags, and follow-up actions.

The interactive Three.js engine is visual context. The main evidence is traceability between an
operating point, synthetic model outputs, cross-disciplinary interpretation, and a review decision.
The guided visualization is presenter-paced: each of five camera cues waits for `Next` so the evidence and
interpretation can be discussed before advancing.

## Architecture

- React, TypeScript, Vite, Zustand
- Reference-controlled hydrogen enthalpy, representative channel, and nozzle calculations
- Synthetic MCNP-like, BISON-like, MOOSE-like, and ROCETS-like parser registry and adapters
- Typed `DemoCase`, `AnalysisEvidence`, and `IntegratedReview` models
- Lazy-loaded React Three Fiber engine schematic

Calculated dashboard outputs and imported fixture values are intentionally separate. Manual
changes create a `Custom What-If` and never imply that external solver evidence was rerun.

## Run on Linux or macOS

```bash
bun install --frozen-lockfile
bun run dev
```

Open the URL printed by Vite. For a production preview:

```bash
bun run build
bun run preview
```

## Quality Gates

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

Run the complete pre-demo gate with:

```bash
bun run demo:check
```

See [Quality Gates](docs/quality-gates.md) for the automated, manual, accessibility, and
performance acceptance criteria.

## Fixture Provenance

Files under `src/fixtures` and the bundled fixture strings in `src/parser/file_inputs.ts` are
synthetic public parser inputs. They resemble engineering file structures for UI and integration
testing but are not solver records or validated technical results.

See [Model Evidence Review Work Instruction](docs/model-evidence-work-instruction.md).
See [Demo Runbook](docs/demo-runbook.md) for the presenter script, rehearsal checks, and fallback path.
See [Demo Release Checklist](docs/demo-release-checklist.md) for the final machine and projector audit.
See [Reference-Controlled Engine Model Data Handbook](docs/reduced-order-model-basis.html) for the
Pewee-inspired benchmark, NIST hydrogen thermochemistry, representative ELM-style channel model,
standard nozzle relations, source locators, user overrides, and legacy-coefficient disposition.
See [Project Context](CONTEXT.md) for the domain terms and evidence-claim vocabulary.
See [Architecture Decisions](docs/adr/README.md) for the decisions that govern review scope and evidence claims.

## Explicit Claim Boundary

The project demonstrates workflow familiarity with MCNP-, BISON-, MOOSE-, and ROCETS-like data, not
production proficiency or validated computational model results. It makes no claims concerning
HPC scaling, parallel solver development, FORTRAN, computational validation, radiation safety,
qualified fuel performance, qualified materials, or flight engine performance.
