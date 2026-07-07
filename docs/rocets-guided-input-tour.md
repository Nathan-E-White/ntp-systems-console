# ROCETS-Like Guided Input Tour

## Audience and Scope

This walkthrough reviews `src/fixtures/rocets/ntp_rocet.inp` as an engine systems model.

The file is synthetic ROCETS-like text intended for parser and integration demonstrations. It is
not a validated or executable ROCETS deck. The useful discussion is how component models, schedules,
solver constraints, instrumentation, and discipline handoffs are organized around an engine
operating sequence.

## System-Level Story

The modeled flow path is:

```text
LH2 tank
  -> isolation valve
  -> boost pump
  -> main turbopump
  -> nozzle regenerative jacket
  -> ortho/para conditioning proxy
  -> reactor core
  -> turbine tap
     -> primary chamber path
     -> turbine bypass and mixer
  -> thrust chamber
  -> bell nozzle
  -> space sink
```

Parallel control and support paths include neutronics, decay heat, iodine/xenon memory, control
drums, auxiliary poison, channel stability, thrust-vector control, and instrumentation.

## 1. Case Identity and Numerical Controls

The deck begins with case identity, units, and metadata. The numerical controls request a
900-second transient with steady initialization followed by adaptive time integration.

The solver settings communicate intended behavior:

- Newton nonlinear solve.
- Sparse direct linear solve.
- Strict mass-balance check.
- Energy balance reported rather than enforced as a hard qualification.
- Reactivity check explicitly bounded as fixture-only.

For a production model, tolerances should be tied to output sensitivity and balance acceptance
criteria. “Converged” is not enough if the residual tolerance permits unacceptable thrust,
temperature, or margin error.

## 2. Fluid Packages

Two hydrogen property regimes are declared:

- `lh2`: cryogenic real-fluid behavior.
- `hot_h2`: high-temperature equilibrium behavior.

The model references external property tables. That is a key configuration-control interface:
results are only reproducible when property-table versions, interpolation rules, validity ranges,
and extrapolation behavior are known.

The transition between cold and hot property treatments should also be reviewed for continuity.

## 3. Mission Profile

The `deep_space_restart_demo` profile provides the organizing timeline:

| Phase | Time | Main systems question |
|---|---:|---|
| Startup ramp | 0–90 s | Can flow, power, shaft speed, and controls establish a stable rated point? |
| Rated burn | 90–210 s | Do balances and margins hold at power? |
| Shutdown soak | 210–520 s | How do decay heat, xenon memory, and residual flow evolve? |
| Restart ramp | 520–650 s | Can the system restart under poisoned and thermally conditioned states? |
| Cooldown | 650–900 s | Are thermal and hydraulic states recovering acceptably? |

This is stronger than a collection of steady points because restart behavior depends on state
history. The iodine/xenon, decay-heat, tank, shaft, and thermal states must survive phase changes.

## 4. Nodes, Boundaries, and Graph Topology

Nodes identify thermodynamic stations and provide stable integration names. Graphics coordinates
are included so the same identifiers can drive a schematic.

The two primary boundaries are:

- A scheduled cryogenic stagnation reservoir.
- A low-pressure space sink.

The tank boundary accepts shield heat leak as a state input. That is a good example of a
cross-disciplinary connection: shielding analysis affects tank thermal state, which affects inlet
conditions and potentially pump performance.

The explicit `CONNECT` statements form a directed graph. A model-integration review should verify:

- Every component port is connected exactly as intended.
- Split and merge mass flow is conserved.
- State references do not create hidden algebraic loops.
- Disabled components do not remain on the active flow path.
- Component and node names match the MCNP and MOOSE handoff dictionaries.

## 5. Feed System and Turbomachinery

The feed system contains the isolation valve, boost pump, electric start motor, main turbopump, and
discharge manifold. Pumps reference maps rather than closed-form performance equations.

Key review topics include:

- Net positive suction head and cavitation margin.
- Pump-map interpolation and off-map behavior.
- Shaft inertia and startup torque.
- Valve timing and leakage.
- Cryogenic property behavior.
- Pressure-loss allocation between lines, regenerative channels, core, and nozzle.

The main shaft and electric-start shaft are modeled separately. The startup sequence therefore has
an explicit energy path rather than assuming rated shaft speed.

## 6. Regenerative Heating and Hydrogen Conditioning

The nozzle regenerative jacket couples wall heat into the hydrogen before the core. The
ortho/para component represents hydrogen spin-state conditioning and associated enthalpy penalty as
a systems proxy.

For a real model, this area would need controlled thermal boundary conditions, wall heat flux,
pressure loss, residence time, and property data. The current schedules are prescribed rather than
calculated from a conjugate thermal solution.

## 7. Reactor and Neutronics Abstraction

The reactor package separates several responsibilities:

- `reactor_neutronics`: six-group point-kinetics proxy.
- `fission_product_poisoning`: iodine/xenon restart memory.
- `decay_heat_model`: shutdown thermal power.
- `control_drum_bank`: commanded reactivity input.
- `auxiliary_poison_bank`: restart hold-down proxy.
- `reactor_reflector`: structural/thermal context.
- `reflector_gamma_heating`: prescribed reflector heat input.
- `reactor_core`: system-level heat addition and pressure loss.

This architecture is useful because each effect has a named interface. It is also intentionally not
a reactor physics solution. Drum worth, poison worth, kinetics behavior, and decay heat are
schedule-driven.

The core contains 96 channels grouped as inner, middle, outer, and bypass. Representative channel
objects carry group power, flow split, and stability margin. That is a reduced-order way to retain
hot-channel reasoning without solving every channel.

**Review question:** What quantities come from neutronics, which are solved by the system model,
which are imposed schedules, and which are only advisory metadata? The answer should be explicit in
every plotted result.

## 8. Ledinegg Advisory Stability Model

`ledinegg_instability_switch` monitors:

- Core inlet and outlet.
- Main turbopump flow.
- Reactor power.
- Channel-group state.

Its margin and status are prescribed schedules. The restart/cooldown interval moves to `watch`,
which gives the application a scenario to investigate.

This is not a derived Ledinegg criterion. A real implementation would examine pressure-drop versus
flow characteristics, channel parallelism, heat input, inlet subcooling or thermodynamic state,
feedback, and dynamic interaction with the feed system.

The honest interpretation is: the deck defines where a stability assessment belongs and what
signals it consumes.

## 9. Turbine Loop, Chamber, Nozzle, and TVC

The turbine tap divides core-exit flow between the main chamber path and a turbine-drive branch.
Turbine exhaust returns through a mixer before entering the chamber.

The nozzle model includes an expansion-ratio preset and thrust proxy. The TVC path adds:

- Hot-gas bleed valve.
- Hydraulic power unit.
- Accumulator.
- Dual-axis actuator ring.
- Gimbal joint.
- Controller and command schedules.

This makes TVC a parasitic engine-system consumer rather than a disconnected animation. Bleed flow
and hydraulic power affect the same mass and energy balances as propulsion.

## 10. Solver Variables and Residuals

Three independent solver variables are exposed:

- Shaft speed.
- Turbine split fraction.
- Control-drum angle.

Residual equations enforce or track:

- Shaft power balance.
- Chamber-pressure target.
- Core-power target.
- Mass-flow closure.
- TVC hydraulic power balance.
- TVC parasitic-flow accounting.
- Gimbal tracking error.

These residuals reveal the model’s numerical closure strategy. During review, ask whether each
target is a physical law, a controller objective, a data fit, or a prescribed operating schedule.

The most important distinction is between:

- **Conservation residuals**, such as mass or shaft power.
- **Control residuals**, such as chamber-pressure target.
- **Tracking residuals**, such as prescribed core power.

They should not all be interpreted as independent physics validation.

## 11. Maps and Schedules

Maps define pump, turbine, pressure-loss, and shaft-loss behavior. Schedules define nearly every
transient command or imported state, including:

- Tank pressure and temperature.
- Valve and pump commands.
- Core power and decay heat.
- Iodine/xenon state and worth.
- Drum and poison schedules.
- Power shape and flow split.
- Stability margin and status.
- TVC commands, responses, bleed, and loads.

This makes the file excellent for parser coverage but highly prescribed. A production model would
replace selected schedules with solved states and would document interpolation, extrapolation,
units, and data pedigree.

There are deliberate deck-quality concerns worth catching:

- Some schedule entries repeat the same time with different values, notably in the TVC hydraulic
  power region.
- Cross-model schedules must be checked for identical breakpoints and phase definitions.
- The model must define how discontinuities are handled.

## 12. Outputs and Review Products

Requested outputs are grouped by panel:

- Feed.
- Turbomachinery.
- Core.
- Thermal.
- Nozzle/TVC.
- Overview snapshots.

The output list is effectively the analysis contract. It should be traced to customer objectives,
review figures, anomaly criteria, and validation evidence.

The six mission snapshots align with major phase boundaries and are appropriate for a milestone
review summary, while time histories support transient investigation.

## 13. Cross-Discipline Handoffs

The systems model should provide MOOSE with:

- Power and decay-heat histories.
- Mass flow and thermal boundary conditions.
- Pressure and pressure-drop histories.
- Drum, poison, and operating-phase context.
- Thrust and support-structure loads.

It should consume MCNP-derived or reactor-physics-derived information such as:

- Spatial power shape.
- Heating distributions.
- Control worth or feedback models.
- Shield heat deposition.

Every handoff needs units, coordinate mapping, time basis, interpolation policy, uncertainty, and
model version.

## What I Would Challenge Before Real Use

1. Establish property-table pedigree and range checking.
2. Replace prescribed kinetics and stability statuses with qualified models or imported results.
3. Demonstrate mass, energy, and shaft-power closure across every phase.
4. Review pump/turbine map coverage and off-design extrapolation.
5. Resolve duplicate-time schedule entries and discontinuity handling.
6. Verify restart initial-state transfer, especially xenon and decay heat.
7. Quantify channel hot-spot and parallel-flow uncertainty.
8. Confirm TVC bleed and hydraulic loads are included consistently.
9. Tie every output to a requirement, test, trade, or anomaly criterion.
10. Add regression cases and configuration-managed input provenance.

## Suggested Live Narration

> I treat this as the orchestration model. It owns the mission sequence, thermodynamic network,
> component connectivity, controller targets, and balance closure. Reactor behavior is deliberately
> decomposed into power, decay heat, poison memory, controls, and a channel-stability interface so
> each contribution can be traced. The key review question is not whether the synthetic run says
> “converged”; it is which states are solved, which are scheduled, where conservation is enforced,
> and whether the handoffs to transport and thermomechanics preserve operating phase, units, and
> uncertainty.
