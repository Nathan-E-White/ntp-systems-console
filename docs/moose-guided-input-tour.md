# MOOSE-Like Guided Input Tour

## Audience and Scope

This walkthrough reviews `src/fixtures/moose/ntp_moose.inp` as a thermal-structures and
multiphysics handoff model.

The file is a synthetic MOOSE-like parser fixture. It is not a validated or necessarily executable
MOOSE application input. It demonstrates how an engine systems transient and transport-derived
loads could be organized into thermal variables, material surrogates, boundary conditions,
postprocessors, and review metadata.

## Model Intent

The file uses a two-dimensional axisymmetric `RZ` domain extending from a tank-side station through
the nozzle-side station. It tracks thermal state across:

- Fuel, moderator, reflector, and shield.
- Tank wall and hydrogen flow path.
- Regenerative jacket, chamber, and nozzle.
- Gimbal ring and thrust frame.
- Core support grid and reflector liner.
- Pogo accumulator and turbine shaft seals.

Many additional fields are imported proxies rather than solved primary variables. That separation
is the key to understanding the file.

## 1. Problem and Mesh

`[Problem]` selects an `FEProblem` in axisymmetric coordinates. `[Mesh]` defines a generated
72-by-160 QUAD4 mesh.

The mesh is intentionally generic. A real thermomechanical model would need:

- Geometry tied to controlled drawings or CAD.
- Named subdomains and boundaries that actually exist in the mesh.
- Mesh refinement near coolant channels, contact interfaces, stress concentrations, and material
  transitions.
- Mesh-convergence evidence for every review quantity.
- A decision on whether axisymmetry is valid for channels, drums, support structures, and TVC loads.

The current file references many block and boundary names that a simple generated mesh would not
create automatically. That is a fixture-level inconsistency to resolve before execution.

## 2. Primary Variables

The `[Variables]` block contains temperatures that the finite-element problem intends to solve.
They span reactor, propulsion, and structural hardware.

Examples include:

- `fuel_temperature`
- `coolant_temperature`
- `reflector_temperature`
- `nozzle_wall_temperature`
- `thrust_frame_temperature`
- `core_support_grid_temperature`

The broad variable list demonstrates system coverage, but separate uncoupled temperature variables
do not automatically produce conjugate heat transfer. Coupling operators, interfaces, contact,
fluid energy equations, and consistent material regions are required.

## 3. Auxiliary Variables: Imported and Derived State

`[AuxVariables]` contains system and analysis channels such as:

- Normalized core power and decay heat.
- Iodine/xenon inventory proxies.
- Control-drum angle and poison insertion.
- Axial and radial power shape.
- ROCETS mass flow and turbine split.
- Ledinegg margin and status.
- Shield heat leak and reflector gamma heating.
- Thermal, structural, leakage, and stability margins.
- Pogo, pressure-wave, and frequency-response channels.

These are not all finite-element solutions. They are fields used to carry schedules, imported
states, or review metrics through the model.

That is a common integration pattern, but each auxiliary field should declare:

- Source model and version.
- Units.
- Time interpolation.
- Spatial mapping.
- Uncertainty.
- Whether it is prescribed, calculated, or measured.

## 4. Functions: The Transient Handoff Layer

The `[Functions]` block provides piecewise-linear histories for the 900-second mission.

The most important functions are:

- Core power.
- Decay heat.
- Iodine and xenon inventories.
- Drum angle and auxiliary poison.
- Hydrogen mass flow and turbine split.
- Axial/radial power shape.
- Ledinegg margin/status.
- Structural, support-grid, liner, seal, and TVC loads.

The time points align generally with ROCETS mission phases. This is the main systems-to-MOOSE
handoff mechanism.

The model currently duplicates these histories rather than importing a controlled data file. In a
production workflow, duplicated schedules create divergence risk. A stronger implementation would
consume a versioned result file or common exchange schema.

## 5. AuxKernels: Writing Schedules into Fields

`[AuxKernels]` maps the functions into auxiliary variables. Conceptually:

```text
ROCETS/system history -> MOOSE function -> auxiliary field -> kernel/BC/postprocessor
```

This makes the data flow inspectable. It also means the auxiliary values are prescribed, not solved
through feedback.

If two-way coupling is required, a one-directional function assignment is insufficient. The team
would need a coupling strategy, convergence protocol, data-exchange frequency, and ownership of
shared states.

## 6. Kernels: Thermal Physics and Proxy Loads

The primary thermal pattern is:

- Time derivative for energy storage.
- Heat conduction.
- Body-force or proxy source term.

Fuel receives prompt-power and decay-heat sources. Reflector, shield, tank, gimbal, thrust frame,
support grid, liner, accumulator, and shaft seals receive their own prescribed source or sink
proxies.

This block shows where physics belongs, but many coefficients are unitless fixture values. Before
real use, each source term would require dimensional verification and normalization against total
power or load.

The coolant uses an axial-transport proxy rather than a resolved fluid energy equation. Therefore,
the model is not a CFD or full conjugate heat-transfer solution.

## 7. Materials

`[Materials]` assigns temperature-dependent conductivity expressions to named regions. Examples
include cermet fuel, graphite moderator, beryllium reflector, refractory grid, liner, and structural
surrogates.

The expressions are useful for testing parser support for coupled material properties, but they are
not qualified material models.

For fuel-performance or design analysis, additional behavior may include:

- Heat capacity and density.
- Irradiation and burnup dependence.
- Chemical compatibility and hydrogen corrosion.
- Swelling, cracking, creep, and dimensional change.
- Contact conductance and gap evolution.
- Temperature-dependent strength and failure criteria.
- Statistical material-property uncertainty.

One subtle integration risk is terminology mismatch: the MOOSE fixture describes a cermet fuel
surrogate while other fixture comments refer to graphite-composite fuel. The selected fuel concept
must be consistent across neutronics, thermal, materials, and systems models.

## 8. Boundary Conditions

The boundary conditions establish:

- Cold hydrogen inlet temperature.
- Core heat pickup and channel-wall cooling proxies.
- Regenerative and radiative sinks.
- Shield and structure isolation assumptions.
- Gimbal, support-grid, liner, accumulator, and seal thermal interfaces.

The heat-transfer coefficients and far-field temperatures are prescribed. They should ultimately
come from system or CFD evidence with uncertainty and applicability limits.

Adiabatic and isolation assumptions deserve special attention because they can hide missing heat
paths and artificially improve margins.

## 9. Postprocessors: The Review Contract

`[Postprocessors]` defines the quantities intended for the dashboard and design review.

The core thermal set includes:

- Peak and average fuel temperature.
- Average coolant temperature.
- Reflector and shield peaks.
- Minimum thermal margin.

The structural and support set includes:

- Thrust-frame temperature and compression margin.
- Core-support-grid temperature, pressure drop, and creep margin.
- Reflector-liner temperature and barrier margin.
- Shaft-seal leakage margin.

The coupled stability set includes:

- Ledinegg margin/status.
- Point-kinetics matrix stability proxy.
- Core-density oscillation.
- Fuel alignment shift.
- Thrust-frame resonance gain.
- Pogo attenuation and net coupled gain.
- Fluid phase angle.

This is a good review-oriented pattern: outputs are named for engineering questions. However,
postprocessor names do not establish validation. Each metric still needs a requirement, acceptance
threshold, uncertainty, and evidence pedigree.

## 10. Executioner and Outputs

The `[Executioner]` requests a transient Newton solve using BDF2 from 0 to 900 seconds.

Review considerations include:

- Time-step sensitivity near startup, shutdown, and restart discontinuities.
- Nonlinear convergence under rapidly changing source terms.
- Energy conservation.
- Consistent initialization at phase boundaries.
- Whether one-second maximum steps resolve the fastest relevant thermal or structural response.

CSV output and a performance graph are enabled; Exodus is disabled. That is appropriate for a
dashboard fixture but insufficient for spatial result review or mesh-based verification.

## 11. CrossLinks: Making the Model Part of a System

The cross-link blocks document intended interfaces with MCNP and ROCETS.

### MCNP Geometry Link

Named MOOSE regions are associated with transport cells for:

- Core.
- Reflector.
- Shield.
- Nozzle.
- Tank.
- Thrust frame.
- Support grid.
- Reflector liner.
- Accumulator.
- Shaft seals.

A real transfer would require spatial projection, normalization, conservation checks, coordinate
transforms, and mesh-version compatibility.

### ROCETS System Link

ROCETS histories provide power, flow, drum position, poison state, channel stability, thrust load,
support-grid pressure drop, and other system channels.

The ideal integration contract should identify one authoritative owner for every field. Copying
values into multiple decks should be replaced by generated inputs or versioned exchange files.

### Coupled Stability Metadata

The file describes a chain involving:

```text
feed pressure wave
  -> pogo attenuation
  -> core density oscillation
  -> kinetics feedback
  -> structural/fuel alignment response
```

This is architecture metadata, not a solved coupled eigenvalue or frequency-response analysis.
Still, it is useful because it identifies the disciplines and signals that must be brought together.

## 12. Equation and Frequency-Response Metadata

The support-grid pressure-drop equation stores its open-area fraction, form-loss contribution, and
dynamic-pressure dependence.

The frequency map compares:

- Thrust-frame gain.
- Suppressor attenuation.
- Net coupled gain.
- Fluid phase.

The 24.5 Hz point is presented as a damped target. A real stability assessment would need model
derivation, transfer functions, uncertainty, damping assumptions, modal participation, and test
correlation.

## 13. Fixture-Quality Issues Worth Finding

A technically credible tour should acknowledge visible inconsistencies:

- The generated mesh does not define the numerous named blocks and boundaries used later.
- `mission_profile` is assigned twice in `[ParserMetadata]`.
- The paired MCNP case name does not match the current fixture filename/case ID.
- Material-concept terminology is inconsistent across the fixture set.
- Many source terms and margins are prescribed proxies without dimensional derivation.
- The file blends thermal, structural, hydraulic, and frequency-response metadata beyond what the
  stated simple thermal problem actually solves.

These are exactly the kinds of interface issues a systems analyst should surface rather than hide.

## What I Would Challenge Before Real Use

1. Build the mesh from controlled geometry with valid subdomain and boundary IDs.
2. Define the solved physics and remove unsupported “decorative” variables.
3. Establish a generated, versioned ROCETS-to-MOOSE data handoff.
4. Map MCNP heating conservatively between meshes.
5. Replace material surrogates with qualified temperature- and irradiation-dependent properties.
6. Add mechanical variables, constitutive laws, contact, and failure criteria where structural
   margins are claimed.
7. Perform mesh and time-step convergence studies.
8. Demonstrate energy conservation and source normalization.
9. Tie postprocessors to requirements and uncertainty bands.
10. Correlate selected outputs against experiment, benchmark, or higher-fidelity analysis.

## Suggested Live Narration

> I treat this file as the receiving multiphysics model. Primary variables represent temperatures
> that could be solved, while auxiliary variables carry the ROCETS operating history and
> transport/system metadata. The functions and AuxKernels make that handoff explicit, and the
> postprocessors define the review quantities: fuel temperature, support-grid margin, liner
> response, structural loads, and coupled stability indicators. The fixture deliberately stops
> short of claiming executable fidelity. Before design use, I would reconcile geometry and material
> concepts, automate the data exchange, add the missing mechanical and fluid physics, and establish
> mesh, time-step, conservation, and validation evidence.
