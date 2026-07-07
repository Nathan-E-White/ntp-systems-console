# MCNP-Like Guided Input Tour

## Audience and Scope

This walkthrough is written for an engine systems, reactor physics, thermal, or model-integration
colleague reviewing the paired MCNP-like fixture workflows:

- `src/fixtures/mcnp/ntp_mcnp.inp` and `ntp_mcnp.out`: fixed-source transport fixtures.
- `src/fixtures/mcnp/ntp_crit.inp` and `ntp_crit.out`: `KCODE` and burnup/depletion fixtures.

These are synthetic, non-operational parser fixtures. They are useful for discussing geometry
decomposition, source posture, tally ownership, criticality-result ingestion, depletion histories,
and cross-model traceability. They are not executable or validated MCNP models. In particular,
the values in `ntp_crit.out` are fabricated records formatted to exercise the application; their
presence does not mean MCNP was executed.

## What This File Is Trying to Represent

The deck converts the ROCETS-like engine network into a spatial transport-oriented representation:

```text
LH2 supply -> pumps -> regenerative jacket -> core -> turbine branch
           -> thrust chamber -> nozzle -> space sink
```

The important modeling choice is that the deck includes more than the reactor. It preserves engine
system context so transport-derived quantities can be associated with thermal and systems-model
components.

Both inputs use the same three major MCNP-style regions:

1. **Cell cards** define material-filled or void regions.
2. **Surface cards** define the geometric boundaries referenced by the cells.
3. **Data cards** define materials, source distributions, tallies, and run controls.

The final metadata block is application-specific and provides explicit cross-model mappings.

## 1. Header and Analysis Posture

The opening comments establish several constraints that should remain visible in any review:

- The geometry mirrors the ROCETS-like engine network.
- Materials and dimensions are synthetic parser values.
- `ntp_mcnp.inp` is a fixed-source neutron-transport fixture.
- `ntp_crit.inp` is a parser-facing eigenvalue and depletion companion.
- No criticality, shielding, safety, or engine-design claim is supported.

That distinction matters because a transport deck with fissile material cards can look like a
criticality model even when it is not configured as one. In the fixed-source deck, `MODE N` plus
`SDEF` defines prescribed neutron histories and the absence of `KCODE` means multiplication is not
estimated. The companion deck does contain `KCODE`, but its own metadata labels the model
`syntactic_fixture_only` and the output declares that all cycle and burnup statistics are fabricated.

**Review question:** What decision is this transport run intended to support: flux-shape handoff,
heating estimates, shielding trades, detector response, or criticality? Those are different
problems and require different source, physics, tally, variance-reduction, and validation choices.

## 2. Cell Cards: From Engine Network to Spatial Regions

Each cell follows the familiar pattern:

```text
cell  material  density  signed-surface expression  importance
```

Negative surface numbers generally indicate the region inside a surface; positive entries select
the opposite half-space. The fixture comments attach each cell to a systems-model component.

### Feed and Turbomachinery Cells

Cells 1–11 represent the tank proxy, isolation valve, boost pump, main turbopump, shaft, and
discharge manifold.

The hydrogen cells use decreasing nominal density as the flow moves downstream. Structural cells
use placeholder steel, nickel-alloy, or aluminum-like material vectors.

For an actual transport model, this region would require deliberate decisions about:

- Whether cold hydrogen scattering treatment is important.
- Whether rotating machinery needs explicit geometry or homogenization.
- Whether streaming paths dominate the response of interest.
- Whether the tank and feed system are close enough to the reactor to affect shielding results.

### Regenerative Jacket and Hydrogen Conditioning

Cells 12–16 represent the regenerative coolant annulus, wall, spin-isomer conditioning bed, inlet
line, and nozzle-wall proxy.

This is an interface-rich part of the model. ROCETS owns flow and thermodynamic state histories;
MCNP would own radiation transport or deposition estimates; MOOSE would consume spatial heating and
boundary-condition data.

The current fixture does not perform temperature-dependent density updates or thermal scattering
feedback. Those would need a controlled mapping from the system transient into material states.

### Shield, Reflector, Drums, and Poison

Cells 17–22 cover:

- Forward internal shield.
- Core inlet plenum.
- Reflector annulus.
- Control-drum absorber band.
- Auxiliary poison bank.
- Reactor vessel and barrel.

The drum bank is represented as a homogeneous annular band, not explicit rotating drums. That is a
reasonable parser simplification but would not preserve local absorber orientation or detailed drum
worth.

**Review question:** Is the required output a global trend, local heating distribution, shutdown
margin, or control worth? A homogenized band may be acceptable for one and unacceptable for another.

### Active Core Decomposition

Cells 23–40 form the main spatial power-shape structure:

- Three axial zones: A, B, and C.
- Six azimuthal sector proxies in each zone.
- Eighteen total fueled regions.

Zone B is identified as the central high-power region. This decomposition gives the parser enough
structure to create axial and sector-based plots and provides a natural handoff to thermal hot-channel
or fuel-performance analysis.

This is not a detailed fuel-element lattice. A production core model would need explicit decisions
about homogenization, coolant channels, tie tubes, fuel loading, temperatures, depletion state, and
cross-section treatment.

Cell 41 is a virtual “Ledinegg monitor” region. Ledinegg instability is a thermal-hydraulic system
phenomenon, not a neutron-transport material region. Its presence is metadata-oriented and should
not be interpreted as MCNP calculating channel stability.

### Downstream Hot-Gas Path

Cells 42–53 represent the exit plenum, turbine split, turbine, mixer, chamber, throat, divergent
nozzle, and nozzle wall. Cells 54 and 99 provide the sink and graveyard.

These regions preserve component identity for flux or heating proxies. They are not sufficient for
detailed activation, gamma heating, dose, or material-damage analysis.

## 3. Surface Cards: Geometry Vocabulary

The fixture uses:

- `cz` cylinders for flow passages, vessels, core regions, and nozzle proxies.
- `pz` planes for axial stations.
- Planes 401–406 for azimuthal sector decomposition.

The axial stations intentionally follow the ROCETS node ordering. This is a good integration
practice: shared station names or IDs make model-to-model mapping inspectable.

The sector planes are parser-oriented rather than a rigorously demonstrated partition of six
non-overlapping wedges. Geometry plotting and lost-particle checks would be mandatory.

## 4. Material Cards

Material cards `M1`–`M11` preserve domain meaning:

- Hydrogen.
- Fuel/graphite composite.
- Graphite reflector.
- Structural alloy.
- Refractory nozzle wall.
- Boron absorber.
- Internal shield.
- Motor, conditioning-bed, poison-bank, and monitor proxies.

The isotope fractions and densities are placeholders. Before a real calculation, the analyst would
need to establish:

- Material specification and fabrication state.
- Temperature-dependent density.
- Appropriate cross-section library and temperature.
- Thermal scattering law treatment where applicable.
- Burnup, isotopic evolution, impurities, and uncertainty.

Material naming is valuable for integration, but semantic naming is not material validation.

## 5. Source and Run Posture

### 5.1 Fixed-Source Companion

The source is distributed through the active-core envelope:

```text
SDEF POS=0 0 1.350 RAD=d1 AXS=0 0 1 EXT=d2 PAR=N ERG=d3
```

The supporting `SI`/`SP` cards define:

- Radial extent from the axis to the core radius.
- Axial weighting across the active core.
- A synthetic neutron energy spectrum.

This source is useful for parser and tally demonstrations. It is not a fission-source convergence
solution and should not be used to infer `k-effective`.

**Review question:** If the intended handoff is power distribution, should the source originate from
a converged criticality calculation, a deterministic solution, a prescribed fission density, or an
external source? The answer controls what the tallies mean.

### 5.2 Criticality and Burnup Companion

`ntp_crit.inp` replaces the fixed `SDEF` source block with:

```text
KCODE  5000  1.00000  50  250
KSRC   0.000  0.000  0.950
...
KSRC   0.000  0.000  1.750
```

The `KCODE` record asks the parser to recognize 5,000 histories per cycle, an initial
`k-effective` guess of 1.0, 50 inactive cycles, and 250 active cycles. Five `KSRC` points seed the
initial fission-source distribution along the active-core axis. In a real eigenvalue calculation,
the inactive cycles would allow the source shape to relax before active-cycle statistics are
accumulated. Source entropy, spatial drift, estimator agreement, cycle correlation, and sensitivity
to the initial source would all require review.

Cells 23–40 add `burn=1`, and material `M2` is selected by a compact synthetic study:

```text
BURN   MAT=2 POWER=1.00E-03 PFRAC=1.0 BOPT=1
BURNUP 0.00  0.01  0.05  0.10  0.25  0.50
```

These records provide application hooks for burnable-region identification, stepwise
`k-effective`, isotopic inventory, iodine/xenon memory, and decay-heat tables. The units,
normalization, predictor-corrector description, and recoverable energy are explicitly proxies.
They are not a defensible depletion specification.

**Review question:** What physical mission history does each depletion step represent, and are the
power normalization, material inventory, fission yields, decay chains, cross-section treatment, and
restart timing consistent with that history?

## 6. Tallies and Intended Handoffs

The `F4:N` family provides cell-average neutron-flux proxies:

| Tally | Region | Intended review use |
|---|---|---|
| `F4` | Core axial zone A | Lower-core power/flux shape |
| `F14` | Core axial zone B | Central peak region |
| `F24` | Core axial zone C | Outlet-side shape |
| `F34` | Reflector, drums, poison, vessel | Control and reflector environment |
| `F44` | Internal shield | Shielding/heat-leak handoff |
| `F54` | Regen, chamber, nozzle walls | Downstream heating proxy |
| `F64` | Cold hydrogen path | Feed-system transport context |
| `F74` | Hot hydrogen and nozzle path | Hot-side transport context |
| `F84` | Virtual channel monitor | Parser cross-link only |
| `F94` | Drum and poison regions | Absorber-region comparison |

The `FM` cards are unit multipliers only. They do not turn the listed tallies into physically
validated heating or dose responses. Production heating analysis would require appropriate particle
modes, energy-deposition tallies, response functions, normalization, and uncertainty assessment.

`NPS 50000` is a compact parser-run value. Adequacy would be determined by tally convergence and
uncertainty, not by particle count alone.

The criticality companion retains a smaller tally subset: `F4`, `F14`, and `F24` for the three core
zones, `F34` for reflector/control regions, and `F84` for the application cross-link. These tally
records remain cell-average flux proxies; the presence of `KCODE` does not automatically make them
power, heating, dose, worth, or stability results.

## 7. Reading the Synthetic Criticality Output

`ntp_crit.out` is deliberately shaped like a compact criticality/depletion report. The most visible
records are:

| Output record | Synthetic value | What the application may demonstrate |
|---|---:|---|
| Combined initial `k-effective` | `1.01039 +/- 0.00072` | Parsing an eigenvalue estimate and reported uncertainty |
| Inactive/active cycles | `50 / 250` | Separating source convergence from scored cycles |
| Burnup-step endpoint | `0.99284 +/- 0.00094` | Plotting a six-step downward synthetic trend |
| Burnup delta | `-1755 pcm` | Comparing beginning and endpoint records |
| Delayed fraction proxy | `6.06E-03` | Connecting an imported kinetics parameter to the systems model |
| Control-drum reserve proxy | `+2850 pcm` | Displaying a labeled control-authority fixture value |
| Peak xenon worth proxy | `-742 pcm` | Discussing restart-memory workflow |
| Final 100 s decay-heat proxy | `1.58E-02` normalized | Passing a shutdown thermal-load record to downstream views |

None of these numbers is an evaluated nuclear result. The output itself states that the cycle
statistics, depletion tables, materials, and convergence checks are fabricated. A credible
criticality review would require, at minimum, executable input, geometry and material verification,
appropriate nuclear data, source-convergence evidence, estimator and uncertainty review, bias and
benchmark treatment, configuration control, and independent checking.

## 8. Application Metadata and Cross-Model Traceability

The metadata block is not MCNP syntax. It exists so the application can preserve relationships such
as:

- MCNP cell 20 ↔ ROCETS `control_drum_bank`.
- Core cells 23–40 ↔ ROCETS `reactor_core`.
- Tally `F34` ↔ reflector gamma-heating schedule.
- Tally `F84` ↔ ROCETS Ledinegg advisory channel.
- Mission phases ↔ startup, burn, shutdown, restart, and cooldown.

This is arguably the most relevant part for an engine systems analyst: it shows that analysis data
must retain component identity, operating phase, ownership, units, and provenance when moving
between tools.

The criticality companion adds explicit metadata for particle/cycle controls, burnable cells,
burnup grid, requested inventory channels, and restart memory. This is useful provenance, but
metadata must never override the physical meaning and limitations of the underlying model.

## 9. What I Would Challenge Before Real Use

1. Run full geometry diagnostics and demonstrate that the sector half-spaces are non-overlapping.
2. Define the actual analysis objective and corresponding source normalization.
3. Replace placeholder materials and densities with controlled input data.
4. Decide whether the core requires explicit lattice treatment or justified homogenization.
5. Establish temperature and density feedback from the systems/thermal models.
6. Replace proxy tallies with response-appropriate transport quantities.
7. Establish eigenvalue source-convergence and cycle-correlation acceptance criteria.
8. Define depletion normalization, chain data, power history, inventory checks, and restart timing.
9. Establish benchmark bias, uncertainty, and margin treatment before any safety interpretation.
10. Validate component-to-cell and tally-to-consumer mappings.
11. Separate transport results from thermal-hydraulic stability indicators.
12. Create configuration control for all paired model versions.

## Suggested Live Narration

> These companion files spatialize the engine network so neutronics evidence can remain tied to
> system components. The fixed-source deck demonstrates prescribed-source transport and tally
> handoffs. The criticality companion adds parser-facing KCODE cycles, source points, burnable
> regions, and restart-memory tables. Its reported k-effective and depletion values are explicitly
> fabricated, so I would discuss them as evidence-ingestion examples, not calculated reactor
> performance. Before real use, I would resolve geometry defects, replace material data, establish
> source convergence and depletion controls, benchmark the model, and define uncertainty and review
> criteria.
