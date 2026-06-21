# Model Evidence Review Work Instruction

## Purpose

Use synthetic MCNP-like, BISON-like, MOOSE-like, and ROCETS-like files to demonstrate model
handoff, traceability, parser diagnostics, fuel-performance communication, and engineering-review
judgment. The workflow does not execute or validate any production solver.

## Procedure

1. Launch the app with `bun run dev`.
2. Select `Pewee-Inspired Benchmark` or `Thermal Margin Investigation`.
3. Review calculated reduced-order outputs in **Operating Case**.
4. Open **Nuclear Fuel Performance** and confirm the BISON fuel-performance values and MCNP burnup/restart-memory values are described as fixture evidence.
5. Open **Model Evidence** and confirm all five output artifacts across the four model families report `parsed`.
6. Check the source filename, case identifier, provenance, validation label, and diagnostics.
7. For MCNP-like evidence, distinguish the fixed-source pair (`ntp_mcnp.inp/.out`) from the
   criticality/burnup pair (`ntp_crit.inp/.out`). Confirm that the latter retains the labels
   `syntactic_fixture_only`, `synthetic_kcode_no_design_claim`, and
   `synthetic_depletion_parser_fixture_only`.
8. For BISON-like evidence, confirm `ntp.bison.i`, `ntp.bison.o`, and `ntp.bison.metadata.json`
   remain a fuel-performance scaffold with no validation, qualification, or design-basis claim.
9. Use **Review** to record the objective, posture, fuel-performance constraints, compact ROCETS
   stability support, assumptions, and recommended work.

## Data Handling

- Changing an operating input creates a `Custom What-If`.
- A custom case recalculates dashboard outputs only.
- Imported fixture evidence remains static until the file is explicitly reparsed.
- Unsupported files must display a diagnostic and must not replace the bundled evidence.
- Values parsed from `ntp_crit.out`, including `k_eff`, pcm, burnup, isotope inventory, xenon
  worth, and decay heat, remain synthetic imported records. Do not relabel them as calculated
  reduced-order outputs or as results from an executed MCNP calculation.
- Values parsed from `ntp.bison.o`, including peak fuel temperature, coating margin, hydrogen
  attack margin, burnup proxy, damage index, and restart-memory index, remain synthetic imported
  records. Do not relabel them as BISON validation, fuel qualification, or material-performance
  predictions.

## Review Standard

Technical statements must distinguish reduced-order estimates from imported fixture values.
Do not describe the fixtures as validated MCNP, BISON, MOOSE, ROCETS, shielding, criticality,
depletion, fuel-performance, safety, or engine-design calculations.
