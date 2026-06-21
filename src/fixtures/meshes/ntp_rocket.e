

# ======================================================================
# NTP_ROCKET.E
# Text-mode Exodus-II-style mesh manifest for ntp-sys-console
# ----------------------------------------------------------------------
# IMPORTANT:
#   Real Exodus-II files are binary NetCDF databases.  This fixture is a
#   credible, human-readable mesh manifest that mirrors the block, side-set,
#   node-set, QA, and provenance information expected by the BISON/MOOSE,
#   MCNP, MOOSE, and ROCETS companion decks.  It is intentionally not a
#   directly executable Exodus mesh.
# ======================================================================

exodus_manifest_version: 1
mesh_name: ntp_rocket_fuel_element_unit_cell
mesh_family: ntp_bison_rz_unit_cell_surrogate
application_context: ntp-sys-console
intended_consumers:
  - ntp.bison.i
  - ntp.bison.metadata.json
  - ntp_moose.inp
  - ntp_mcnp.inp
  - ntp_crit.inp
  - ntp_rocet.inp
validation_status: non_executable_mesh_manifest
coordinate_system: RZ
units:
  length: m
  temperature: K
  pressure: Pa
  mass_flow: kg/s
  power_density: W/m^3

# ----------------------------------------------------------------------
# Geometry concept
# ----------------------------------------------------------------------
# This mesh represents a 2-D axisymmetric surrogate for one hot-channel
# fuel-element ligament, not a full NTP core.  The radial coordinate spans
# the centerline-side ligament interior to the coolant-channel hot wall.
# The axial coordinate spans the active heated length used by the restart
# demonstration timeline.
#
# Radial layout, approximate:
#   r = 0.000000 m  symmetry axis / ligament interior reference
#   r = 0.001250 m  fuel compact inner region
#   r = 0.002900 m  fuel compact mid region
#   r = 0.004700 m  fuel compact outer region
#   r = 0.005250 m  coating / barrier region
#   r = 0.005700 m  refractory liner / hot-face skin
#   r = 0.006000 m  hydrogen coolant channel wall
#
# Axial layout, approximate:
#   z = 0.000 m     inlet / lower support land
#   z = 0.180 m     lower inactive / entrance conditioning land
#   z = 0.720 m     axial segment A
#   z = 1.260 m     axial segment B / nominal peak-power neighborhood
#   z = 1.620 m     axial segment C
#   z = 1.800 m     outlet / upper support land
# ----------------------------------------------------------------------

mesh_extents:
  radial_min: 0.000000
  radial_max: 0.006000
  axial_min: 0.000000
  axial_max: 1.800000
  theta_extent: axisymmetric

mesh_resolution_summary:
  dimension: 2
  topology: QUAD4_dominant_structured_RZ
  radial_intervals: 96
  axial_intervals: 288
  nominal_nodes: 28033
  nominal_elements: 27648
  radial_biasing:
    description: refined toward channel_hot_wall and coating_barrier
    min_dr: 1.50e-5
    max_dr: 1.10e-4
  axial_biasing:
    description: refined near inlet ramp, peak-power region, and support lands
    min_dz: 2.50e-3
    max_dz: 9.00e-3
  element_quality_targets:
    max_aspect_ratio_target: 8.0
    min_scaled_jacobian_target: 0.35
    max_skew_target_degrees: 18.0

# ----------------------------------------------------------------------
# Exodus-style block catalog
# ----------------------------------------------------------------------
element_blocks:
  - id: 101
    name: fuel_compact_inner
    topology: QUAD4
    material_role: fuel_graphite_composite_inner
    radial_range: [0.000000, 0.001250]
    axial_range: [0.180000, 1.620000]
    nominal_elements: 4320
    source_coupling:
      mcnp_material: M2
      bison_region: fuel-bearing compact inner zone
      heat_source_shape: radial_power_shape_function
      notes: lower temperature-gradient fuel-bearing region

  - id: 102
    name: fuel_compact_mid
    topology: QUAD4
    material_role: fuel_graphite_composite_mid
    radial_range: [0.001250, 0.002900]
    axial_range: [0.180000, 1.620000]
    nominal_elements: 6048
    source_coupling:
      mcnp_material: M2
      bison_region: fuel-bearing compact mid zone
      heat_source_shape: radial_power_shape_function
      notes: central ligament fuel-bearing region

  - id: 103
    name: fuel_compact_outer
    topology: QUAD4
    material_role: fuel_graphite_composite_outer
    radial_range: [0.002900, 0.004700]
    axial_range: [0.180000, 1.620000]
    nominal_elements: 6912
    source_coupling:
      mcnp_material: M2
      bison_region: fuel-bearing compact outer zone
      heat_source_shape: radial_power_shape_function
      notes: high-gradient fuel-bearing region nearest coolant channel

  - id: 104
    name: graphite_matrix
    topology: QUAD4
    material_role: unfueled_graphite_matrix_and_web
    radial_range: [0.000000, 0.004700]
    axial_ranges:
      - [0.000000, 0.180000]
      - [1.620000, 1.800000]
    nominal_elements: 2688
    source_coupling:
      mcnp_material: M2_matrix_fraction_proxy
      bison_region: low-power graphite support matrix
      notes: inlet/outlet inactive matrix and axial end effects

  - id: 105
    name: coating_barrier
    topology: QUAD4
    material_role: hydrogen_barrier_or_fuel_surface_coating
    radial_range: [0.004700, 0.005250]
    axial_range: [0.120000, 1.700000]
    nominal_elements: 4224
    source_coupling:
      mcnp_material: coating_surrogate
      bison_region: coating barrier margin and hydrogen-attack monitor
      notes: primary region for coating_barrier_margin_proxy

  - id: 106
    name: coolant_channel_liner
    topology: QUAD4
    material_role: refractory_coolant_channel_liner
    radial_range: [0.005250, 0.005700]
    axial_range: [0.080000, 1.760000]
    nominal_elements: 3456
    source_coupling:
      mcnp_material: M5
      bison_region: refractory hot-channel liner
      notes: receives coolant pressure and high-temperature hydrogen exposure

  - id: 107
    name: hot_face_skin
    topology: QUAD4
    material_role: hot_hydrogen_exposed_skin
    radial_range: [0.005700, 0.006000]
    axial_range: [0.000000, 1.800000]
    nominal_elements: 4608
    source_coupling:
      mcnp_material: M5_surface_fraction_proxy
      bison_region: channel_hot_wall adjacent surface layer
      notes: highest thermal gradient and hydrogen inventory boundary

  - id: 108
    name: refractory_web
    topology: QUAD4
    material_role: structural_refractory_web_proxy
    radial_ranges:
      - [0.004700, 0.006000]
    axial_ranges:
      - [0.000000, 0.120000]
      - [1.700000, 1.800000]
    nominal_elements: 1152
    source_coupling:
      mcnp_material: M5
      bison_region: support land / end web structural surrogate
      notes: support-grid and inlet/outlet structural transition region

  - id: 109
    name: tie_tube_lattice_proxy
    topology: QUAD4
    material_role: neighboring_tie_tube_or_structural_lattice_smear
    radial_range: [0.000000, 0.001250]
    axial_ranges:
      - [0.000000, 0.180000]
      - [1.620000, 1.800000]
    nominal_elements: 768
    source_coupling:
      mcnp_material: structural_tie_tube_proxy
      bison_region: end-region stiffness and thermal sink proxy
      notes: included for visual and parser continuity with structural discussions

  - id: 201
    name: axial_segment_A
    topology: QUAD4
    material_role: active_fuel_axial_segment_low_to_mid
    radial_range: [0.000000, 0.004700]
    axial_range: [0.180000, 0.720000]
    nominal_elements: 5760
    source_coupling:
      mcnp_tally: F4:N
      bison_function: axial_power_shape_function
      notes: MCNP low-axial power-map bin / startup heating region

  - id: 202
    name: axial_segment_B
    topology: QUAD4
    material_role: active_fuel_axial_segment_peak
    radial_range: [0.000000, 0.004700]
    axial_range: [0.720000, 1.260000]
    nominal_elements: 5760
    source_coupling:
      mcnp_tally: F14:N
      bison_function: axial_power_shape_function
      notes: nominal peak power and restart thermal-margin region

  - id: 203
    name: axial_segment_C
    topology: QUAD4
    material_role: active_fuel_axial_segment_outlet
    radial_range: [0.000000, 0.004700]
    axial_range: [1.260000, 1.620000]
    nominal_elements: 3840
    source_coupling:
      mcnp_tally: F24:N
      bison_function: axial_power_shape_function
      notes: outlet-side high coolant-temperature region

# ----------------------------------------------------------------------
# Exodus-style side sets
# ----------------------------------------------------------------------
side_sets:
  - id: 1
    name: symmetry_axis
    alias: left
    boundary_role: radial_displacement_symmetry
    coordinate_constraint: r = 0.000000
    bison_bc_hint:
      variable: disp_r
      type: DirichletBC
      value: 0.0

  - id: 2
    name: channel_hot_wall
    alias: right
    boundary_role: hydrogen_coolant_heat_transfer_wall
    coordinate_constraint: r = 0.006000
    bison_bc_hint:
      variable: temp
      type: convective_flux
      functions:
        T_infinity: coolant_bulk_temperature_profile
        heat_transfer_coefficient: coolant_htc_profile
    coupled_state_hints:
      pressure_function: channel_pressure_profile
      hydrogen_inventory_function: hydrogen_surface_inventory_profile

  - id: 3
    name: channel_inlet_end
    alias: bottom
    boundary_role: lower_axial_inlet_reference
    coordinate_constraint: z = 0.000000
    bison_bc_hint:
      variable: disp_z
      type: DirichletBC
      value: 0.0
    thermal_hint:
      function: coolant_bulk_temperature_profile
      interpretation: conservative inlet reference temperature for scaffold model

  - id: 4
    name: channel_exit_end
    alias: top
    boundary_role: upper_axial_outlet_reference
    coordinate_constraint: z = 1.800000
    thermal_hint:
      function: coolant_bulk_temperature_profile
      interpretation: outlet-side hot hydrogen reference / postprocessor boundary

  - id: 5
    name: outer_ligament_symmetry
    boundary_role: reflected_unit_cell_or_neighbor_channel_symmetry
    coordinate_constraint: application-specific radial partition line
    bison_bc_hint:
      variable: temp
      type: NeumannBC
      value: 0.0

  - id: 6
    name: fuel_element_seat
    boundary_role: lower_element_mechanical_seat
    coordinate_constraint: z in [0.000000, 0.080000]
    mechanics_hint:
      function: grid_pressure_drop_profile
      interpretation: support preload and grid loading proxy

  - id: 7
    name: upper_support_land
    boundary_role: upper_support_grid_contact_proxy
    coordinate_constraint: z in [1.700000, 1.800000]
    mechanics_hint:
      function: grid_pressure_drop_profile
      interpretation: support-grid pressure drop and axial load transfer proxy

  - id: 8
    name: lower_support_land
    boundary_role: lower_support_grid_contact_proxy
    coordinate_constraint: z in [0.000000, 0.120000]
    mechanics_hint:
      variable: disp_z
      type: axial_anchor_or_contact_proxy

  - id: 9
    name: coating_hot_interface
    boundary_role: coating_to_liner_interface
    coordinate_constraint: r = 0.005250
    review_hint: monitor coating_barrier_margin_proxy and hydrogen_attack_margin_proxy

  - id: 10
    name: fuel_to_coating_interface
    boundary_role: fuel_compact_to_coating_interface
    coordinate_constraint: r = 0.004700
    review_hint: thermal stress concentration and coating adhesion surrogate

# ----------------------------------------------------------------------
# Node sets
# ----------------------------------------------------------------------
node_sets:
  - id: 11
    name: centerline_nodes
    selector: r = 0.000000
    role: RZ symmetry axis

  - id: 12
    name: channel_wall_nodes
    selector: r = 0.006000
    role: coolant wall temperature and hydrogen inventory sampling

  - id: 13
    name: peak_power_axial_band_nodes
    selector: z in [0.960000, 1.320000]
    role: axial power peak / restart thermal margin monitoring

  - id: 14
    name: inlet_support_nodes
    selector: z in [0.000000, 0.120000]
    role: inlet support land and lower grid contact proxy

  - id: 15
    name: outlet_support_nodes
    selector: z in [1.700000, 1.800000]
    role: outlet support land and upper grid contact proxy

  - id: 16
    name: coating_barrier_nodes
    selector: r in [0.004700, 0.005250]
    role: coating failure and hydrogen attack margin sampling

# ----------------------------------------------------------------------
# Element variables expected by downstream visualization / parser panels
# ----------------------------------------------------------------------
element_variable_catalog:
  thermal:
    - temp
    - thermal_conductivity
    - volumetric_heat_source
    - decay_heat_fraction
    - reflector_gamma_heat_fraction
  mechanics:
    - disp_r
    - disp_z
    - stress_xx
    - stress_yy
    - stress_zz
    - vonmises_stress
    - hydrostatic_stress
    - elastic_strain_xx
    - elastic_strain_yy
    - elastic_strain_zz
  fuel_performance:
    - burnup_proxy
    - damage_index
    - hydrogen_inventory
    - coating_barrier_margin_proxy
    - hydrogen_attack_margin_proxy
  coupled_system_context:
    - normalized_core_power
    - iodine_inventory_proxy
    - xenon_inventory_proxy
    - control_drum_angle_proxy
    - aux_poison_insertion_proxy
    - rocets_mass_flow_proxy
    - turbine_tap_fraction_proxy
    - ledinegg_margin_proxy
    - ledinegg_status_proxy
    - thermal_margin_proxy
    - grid_pressure_drop_proxy
    - gimbal_bleed_proxy
    - keff_restart_memory_proxy

# ----------------------------------------------------------------------
# Postprocessor and line-sampler locations
# ----------------------------------------------------------------------
sampling_paths:
  - name: axial_temperature_profile
    type: line
    variable: temp
    start_point: [0.003000, 0.000000, 0.000000]
    end_point: [0.003000, 1.800000, 0.000000]
    num_points: 80
    sort_by: z

  - name: hot_wall_hydrogen_profile
    type: line
    variable: hydrogen_inventory
    start_point: [0.006000, 0.000000, 0.000000]
    end_point: [0.006000, 1.800000, 0.000000]
    num_points: 80
    sort_by: z

  - name: coating_interface_temperature_profile
    type: line
    variable: temp
    start_point: [0.004700, 0.000000, 0.000000]
    end_point: [0.004700, 1.800000, 0.000000]
    num_points: 80
    sort_by: z

  - name: peak_power_radial_profile
    type: line
    variable: temp
    start_point: [0.000000, 1.120000, 0.000000]
    end_point: [0.006000, 1.120000, 0.000000]
    num_points: 64
    sort_by: r

# ----------------------------------------------------------------------
# Cross-code provenance tags
# ----------------------------------------------------------------------
provenance:
  generated_for: ntp-sys-console
  paired_bison_input: ntp.bison.i
  paired_metadata: ntp.bison.metadata.json
  source_inputs:
    mcnp_fixed_source: ntp_mcnp.inp
    mcnp_criticality_burnup: ntp_crit.inp
    moose_thermal_system: ntp_moose.inp
    rocets_system: ntp_rocet.inp
  mission_profile: deep_space_restart_demo
  mission_time_window_s: [0.0, 900.0]
  power_profile: core_power_profile
  coolant_temperature_profile: coolant_bulk_temperature_profile
  coolant_htc_profile: coolant_htc_profile
  pressure_profile: channel_pressure_profile
  decay_heat_profile: decay_heat_profile
  reflector_gamma_profile: reflector_gamma_heat_profile
  stability_margin_profile: ledinegg_margin_profile
  support_grid_profile: grid_pressure_drop_profile
  gimbal_bleed_profile: gimbal_bleed_profile

# ----------------------------------------------------------------------
# Mesh QA notes
# ----------------------------------------------------------------------
qa_records:
  - id: qa-mesh-001
    title: block and side-set naming continuity
    status: planned
    acceptance: all names in ntp.bison.metadata.json expectedBlocksForFutureMesh and expectedBoundariesForFutureMesh are represented here

  - id: qa-mesh-002
    title: RZ geometry unit consistency
    status: planned
    acceptance: radial and axial dimensions are in meters and consistent with BISON coord_type = RZ

  - id: qa-mesh-003
    title: channel-wall refinement
    status: planned
    acceptance: minimum radial element spacing occurs near channel_hot_wall and coating_barrier

  - id: qa-mesh-004
    title: power-map conservation readiness
    status: planned
    acceptance: axial_segment_A/B/C regions are adequate for conservative MCNP tally-to-BISON heat-source mapping

  - id: qa-mesh-005
    title: generated-to-exodus migration
    status: planned
    acceptance: binary Exodus replacement preserves block, side-set, and node-set names listed in this manifest

# ----------------------------------------------------------------------
# Validation posture
# ----------------------------------------------------------------------
validation_limitations:
  - This text fixture is not a binary Exodus-II mesh.
  - Element counts and block populations are credible design targets, not generated connectivity.
  - No node coordinate table or element connectivity table is included.
  - No material calibration, benchmark comparison, or mesh convergence result is implied.
  - Use this file for parser display, mesh planning, review panels, and provenance continuity only.

recommended_next_steps:
  - Generate a real Exodus-II mesh from this manifest using Cubit, Gmsh, or MOOSE mesh generators.
  - Verify block and side-set names against ntp.bison.i and ntp.bison.metadata.json.
  - Add mesh-convergence cases for peak fuel temperature, peak coating temperature, and thermal stress.
  - Replace synthetic power shapes with a conservative MCNP-to-BISON heat-source map.
  - Attach material-property provenance before any validation language is used.

# ======================================================================
# END NTP_ROCKET.E TEXT MANIFEST
# ======================================================================