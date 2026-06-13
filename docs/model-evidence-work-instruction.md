# Model Evidence Review Work Instruction

## Purpose

Use synthetic MCNP-like, MOOSE-like, and ROCETS-like files to demonstrate model handoff,
traceability, parser diagnostics, and engineering-review communication. The workflow does not
execute or validate any production solver.

## Procedure

1. Launch the app with `bun run dev`.
2. Select `Pewee-Inspired Benchmark` or `Thermal Margin Investigation`.
3. Review calculated reduced-order outputs in **Operating Case**.
4. Open **Model Evidence** and confirm all four output artifacts across the three model families report `parsed`.
5. Check the source filename, case identifier, provenance, validation label, and diagnostics.
6. For MCNP-like evidence, distinguish the fixed-source pair (`ntp_mcnp.inp/.out`) from the
   criticality/burnup pair (`ntp_crit.inp/.out`). Confirm that the latter retains the labels
   `syntactic_fixture_only`, `synthetic_kcode_no_design_claim`, and
   `synthetic_depletion_parser_fixture_only`.
7. Use **Stability** to compare prepared cases and identify the controlling contributor.
8. Use **Review** to record the objective, posture, evidence, assumptions, and recommended work.

## Data Handling

- Changing an operating input creates a `Custom What-If`.
- A custom case recalculates dashboard outputs only.
- Imported fixture evidence remains static until the file is explicitly reparsed.
- Unsupported files must display a diagnostic and must not replace the bundled evidence.
- Values parsed from `ntp_crit.out`, including `k_eff`, pcm, burnup, isotope inventory, xenon
  worth, and decay heat, remain synthetic imported records. Do not relabel them as calculated
  reduced-order outputs or as results from an executed MCNP calculation.

## Review Standard

Technical statements must distinguish reduced-order estimates from imported fixture values.
Do not describe the fixtures as validated MCNP, MOOSE, ROCETS, shielding, criticality,
fuel-performance, safety, or engine-design calculations.
