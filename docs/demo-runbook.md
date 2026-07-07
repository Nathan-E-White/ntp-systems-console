# SNP Engine Systems Analysis Workbench Demo Runbook

## Purpose

Deliver a 5-8 minute portfolio walkthrough that demonstrates source control, thermal-hydraulic reasoning, evidence traceability, and review communication. The application is a representative engineering study, not a Pewee reconstruction or validated solver environment.

## Deterministic Launch

```bash
bun install --frozen-lockfile
bun run demo:check
bun run preview
```

Open the Vite preview URL in a fresh browser session. Do not enable `?theatreStudio` during the interview.

## Presenter Path

1. Select **Pewee-Inspired Benchmark** and state the claim boundary.
2. Start **Play guided visualization**.
3. At **Establish benchmark and source basis**, identify the published benchmark, NIST thermochemistry, and representative geometry inputs.
4. At **Follow power deposition and enthalpy rise**, explain the enthalpy balance and the separation between calculated results and fixture evidence.
5. At **Inspect peak wall temperature and pressure loss**, select the limiting station and point out wall temperature, criterion margin, and channel-only pressure drop.
6. At **Correlate immutable fixture evidence**, explain the MCNP axial partition, MOOSE thermal constraints, and ROCETS system channels as questions for model handoff, not merged calculations.
7. At **Return to review flags and follow-up**, summarize missing property, whole-engine pressure, material, and transient bases.
8. Select **Thermal Margin Investigation** and show that the same controlled stack produces a negative wall-criterion margin.
9. Open **Review** and print or discuss the focused dossier.

## Claim Language

- Say: "Pewee-inspired benchmark" and "representative channel."
- Say: "synthetic MCNP-like, MOOSE-like, and ROCETS-like fixture evidence."
- Say: "channel wall criterion margin," not qualified fuel margin.
- Say: "basis completeness and engineering review flags," not engine stability score.
- Do not claim solver execution, computational validation, exact CAD geometry, or historical Pewee reconstruction.

## Rehearsal Checks

- Run both prepared cases twice from **Reset Demo**.
- Exercise all five tour steps, including Back, Pause, Resume, Stop, and Replay.
- Select at least one station in Core A, B, and C and confirm the cutaway highlight follows.
- Open each Model Evidence artifact and return to the same investigation focus.
- Verify the Review print preview omits navigation and controls.
- Check 1280x720 and 1024x768 with browser zoom at 100%.

## Fallback

If WebGL fails, continue with Channel Results, Calculation Basis, Model Evidence, Stability, and Review; the engineering narrative does not depend on the 3D scene.

If the local server fails, present the two captured fallback screenshots in `docs/demo-captures/` and use `docs/reduced-order-model-basis.html` plus `docs/physics.html` for the calculation and physics discussion.

If Theatre playback fails, use the scene presets manually in this order: Fit Engine, Flow Path, Reactor, Exploded, Fit Engine.
