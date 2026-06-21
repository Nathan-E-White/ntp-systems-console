# ======================================================================
# NTP-SYS-CONSOLE: BISON/MOOSE FUEL-PERFORMANCE SCAFFOLD
# ----------------------------------------------------------------------
# File:        ntp.bison.i
# Pairing:     ntp.bison.metadata.json
# Mesh posture: generated RZ unit-cell surrogate for check-input use
# Source context: ntp_mcnp.inp, ntp_crit.inp, ntp_moose.inp,
#                 ntp_rocet.inp, ntp_rocket.e
# ----------------------------------------------------------------------
# Intent
#   This deck is the executable-facing half of the BISON split discussed
#   in review.  It keeps parser/app metadata out of the BISON input and
#   expresses only physics-style objects that belong in the analysis deck.
#
# Scope
#   - 2-D RZ representative fuel-channel ligament surrogate
#   - transient heat conduction with synthetic fission/decay/gamma source
#   - coolant-wall convection and pressure/load history placeholders
#   - finite-strain thermomechanics scaffold
#   - scalar hydrogen-ingress, burnup, and damage-index surrogates
#   - restart mission timeline from the companion ROCETS/MOOSE fixtures
#
# Verification status
#   This is an executable-lite scaffold for parser, review, and future
#   check-input work.  It is not a validated BISON model, not a design
#   basis, and not a reactor safety calculation.  Validation evidence,
#   material calibration, mesh QA, and benchmark comparisons are tracked
#   in ntp.bison.metadata.json.
# ======================================================================

[Problem]
  type = FEProblem
  coord_type = RZ
[]

# ----------------------------------------------------------------------
# Mesh
# ----------------------------------------------------------------------
# A GeneratedMesh is used here so the file can be checked without the
# external Exodus mesh.  The companion metadata maps this surrogate to the
# app-side ntp_rocket.e / fuel-channel unit-cell concept.  For a higher
# fidelity run, replace this block with:
#
#   [Mesh]
#     type = FileMesh
#     file = ntp_rocket.e
#   []
#
# and update boundary/block selectors after Exodus mesh QA.
[Mesh]
  type = GeneratedMesh
  dim = 2
  nx = 48
  ny = 144
  xmin = 0.0
  xmax = 0.006
  ymin = 0.0
  ymax = 1.80
  elem_type = QUAD4
[]

[GlobalParams]
  displacements = 'disp_r disp_z'
  temperature = temp
[]

# ----------------------------------------------------------------------
# Primary variables
# ----------------------------------------------------------------------
[Variables]
  [temp]
    family = LAGRANGE
    order = FIRST
    initial_condition = 300.0
  []

  [disp_r]
    family = LAGRANGE
    order = FIRST
    initial_condition = 0.0
  []

  [disp_z]
    family = LAGRANGE
    order = FIRST
    initial_condition = 0.0
  []

  [hydrogen_inventory]
    family = LAGRANGE
    order = FIRST
    initial_condition = 0.0
    scaling = 1.0e6
  []

  [burnup_proxy]
    family = LAGRANGE
    order = FIRST
    initial_condition = 0.0
    scaling = 1.0e4
  []

  [damage_index]
    family = LAGRANGE
    order = FIRST
    initial_condition = 0.0
    scaling = 1.0e4
  []
[]

# ----------------------------------------------------------------------
# App-facing imported states kept as AuxVariables, not top-level metadata
# ----------------------------------------------------------------------
[AuxVariables]
  [normalized_core_power]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [decay_heat_fraction]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [iodine_inventory_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [xenon_inventory_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [control_drum_angle_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [aux_poison_insertion_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []

  [rocets_mass_flow_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [turbine_tap_fraction_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [reflector_gamma_heat_fraction]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [ledinegg_margin_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []

  [ledinegg_status_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [thermal_margin_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []

  [grid_pressure_drop_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [gimbal_bleed_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []

  [coating_barrier_margin_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []

  [hydrogen_attack_margin_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []

  [keff_restart_memory_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []
[]

# ----------------------------------------------------------------------
# Mission and boundary-condition schedules
# ----------------------------------------------------------------------
[Functions]
  [core_power_profile]
    type = PiecewiseLinear
    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '0.0 0.08 0.55 1.00 1.00 0.08 0.02 0.62 0.82 0.05'
  []

  [decay_heat_profile]
    type = PiecewiseLinear
    x = '0.0 90.0 210.0 225.0 300.0 520.0 650.0 900.0'
    y = '0.0 0.012 0.015 0.070 0.034 0.018 0.022 0.010'
  []

  [iodine_inventory_profile]
    type = PiecewiseLinear
    x = '0.0 90.0 210.0 300.0 520.0 650.0 900.0'
    y = '0.0 0.35 0.82 0.96 0.72 0.86 0.40'
  []

  [xenon_inventory_profile]
    type = PiecewiseLinear
    x = '0.0 90.0 210.0 300.0 520.0 650.0 900.0'
    y = '0.0 0.12 0.35 0.78 1.00 0.86 0.55'
  []

  [control_drum_angle_profile]
    type = PiecewiseLinear
    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '0.0 18.0 64.0 92.0 92.0 8.0 0.0 58.0 80.0 0.0'
  []

  [aux_poison_insertion_profile]
    type = PiecewiseLinear
    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 900.0'
    y = '1.00 0.30 0.05 0.05 0.85 0.90 0.25 1.00'
  []

  [mass_flow_profile]
    type = PiecewiseLinear
    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '0.0 1.2 5.6 8.0 8.0 0.4 0.2 5.2 6.9 0.1'
  []

  [turbine_tap_fraction_profile]
    type = PiecewiseLinear
    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '0.00 0.06 0.085 0.085 0.02 0.02 0.075 0.080 0.00'
  []

  [reflector_gamma_heat_profile]
    type = PiecewiseLinear
    x = '0.0 45.0 90.0 210.0 225.0 520.0 650.0 900.0'
    y = '0.000 0.006 0.015 0.015 0.004 0.002 0.010 0.001'
  []

  [ledinegg_margin_profile]
    type = PiecewiseLinear
    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '1.00 0.92 0.78 0.74 0.76 0.95 0.98 0.81 0.79 1.00'
  []

  [ledinegg_status_profile]
    type = PiecewiseLinear
    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '0.0 0.0 1.0 1.0 0.0 0.0 0.0 1.0 0.0'
  []

  [thermal_margin_profile]
    type = PiecewiseLinear
    x = '0.0 45.0 90.0 210.0 225.0 520.0 650.0 900.0'
    y = '1.00 0.88 0.76 0.74 0.91 0.93 0.80 0.98'
  []

  [grid_pressure_drop_profile]
    type = PiecewiseLinear
    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '0.00 2.10e6 7.00e6 7.00e6 0.55e6 0.20e6 5.40e6 6.40e6 0.10e6'
  []

  [gimbal_bleed_profile]
    type = PiecewiseLinear
    x = '0.0 90.0 130.0 150.0 210.0 520.0 560.0 590.0 650.0 900.0'
    y = '0.00 0.00 0.018 0.006 0.00 0.00 0.014 0.004 0.00 0.00'
  []

  [coolant_bulk_temperature_profile]
    type = PiecewiseLinear
    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '90.0 130.0 520.0 2350.0 2700.0 850.0 210.0 1850.0 2500.0 120.0'
  []

  [coolant_htc_profile]
    type = PiecewiseLinear
    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '250.0 1800.0 7500.0 24000.0 24000.0 3000.0 1200.0 18000.0 21000.0 500.0'
  []

  [channel_pressure_profile]
    type = PiecewiseLinear
    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '0.15e6 2.5e6 6.5e6 6.5e6 0.45e6 0.25e6 4.9e6 5.8e6 0.12e6'
  []

  [radial_power_shape_function]
    type = ParsedFunction
    expression = '1.0 + 0.10 * x / 0.006'
  []

  [axial_power_shape_function]
    type = ParsedFunction
    expression = '0.58 + 0.70 * exp(-pow((y - 1.20) / 1.30, 2))'
  []

  [fuel_heat_source]
    type = ParsedFunction
    symbol_names = 'power decay gamma axial radial'
    symbol_values = 'core_power_profile decay_heat_profile reflector_gamma_heat_profile axial_power_shape_function radial_power_shape_function'
    expression = '2.80e9 * (power * axial * radial + decay + gamma)'
  []

  [hydrogen_surface_inventory_profile]
    type = ParsedFunction
    symbol_names = 'mdot tbulk'
    symbol_values = 'mass_flow_profile coolant_bulk_temperature_profile'
    expression = '1.0e-5 * mdot * exp(-6000.0 / max(tbulk, 300.0))'
  []

  [burnup_source_profile]
    type = ParsedFunction
    symbol_names = 'power'
    symbol_values = 'core_power_profile'
    expression = '2.0e-4 * power'
  []

  [damage_source_profile]
    type = ParsedFunction
    symbol_names = 'power gamma margin'
    symbol_values = 'core_power_profile reflector_gamma_heat_profile thermal_margin_profile'
    expression = '1.0e-8 * (power + 0.25 * gamma) / max(margin, 0.20)'
  []

  [coating_barrier_margin_profile]
    type = PiecewiseLinear
    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '1.00 0.88 0.70 0.68 0.86 0.92 0.76 0.72 0.98'
  []

  [hydrogen_attack_margin_profile]
    type = PiecewiseLinear
    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'
    y = '1.00 0.90 0.74 0.72 0.88 0.94 0.80 0.78 0.99'
  []

  [keff_restart_memory_profile]
    type = PiecewiseLinear
    x = '0.0 90.0 210.0 300.0 520.0 650.0 900.0'
    y = '1.000 1.012 1.006 0.996 0.990 1.002 1.000'
  []
[]

# ----------------------------------------------------------------------
# Thermal, hydrogen, burnup, and damage kernels
# ----------------------------------------------------------------------
[Kernels]
  [temp_time]
    type = HeatConductionTimeDerivative
    variable = temp
  []

  [temp_conduction]
    type = HeatConduction
    variable = temp
  []

  [volumetric_fuel_heating]
    type = BodyForce
    variable = temp
    function = fuel_heat_source
  []

  [hydrogen_time]
    type = TimeDerivative
    variable = hydrogen_inventory
  []

  [hydrogen_diffusion]
    type = MatDiffusion
    variable = hydrogen_inventory
    diffusivity = hydrogen_diffusivity
  []

  [burnup_time]
    type = TimeDerivative
    variable = burnup_proxy
  []

  [burnup_source]
    type = BodyForce
    variable = burnup_proxy
    function = burnup_source_profile
  []

  [damage_time]
    type = TimeDerivative
    variable = damage_index
  []

  [damage_source]
    type = BodyForce
    variable = damage_index
    function = damage_source_profile
  []
[]

# ----------------------------------------------------------------------
# Mechanics scaffold
# ----------------------------------------------------------------------
[Modules]
  [TensorMechanics]
    [Master]
      [fuel_ligament]
        add_variables = false
        strain = FINITE
        generate_output = 'stress_xx stress_yy stress_zz vonmises_stress hydrostatic_stress elastic_strain_xx elastic_strain_yy elastic_strain_zz'
      []
    []
  []
[]

# ----------------------------------------------------------------------
# Imported-state AuxKernels
# ----------------------------------------------------------------------
[AuxKernels]
  [set_normalized_core_power]
    type = FunctionAux
    variable = normalized_core_power
    function = core_power_profile
    execute_on = 'initial timestep_end'
  []

  [set_decay_heat_fraction]
    type = FunctionAux
    variable = decay_heat_fraction
    function = decay_heat_profile
    execute_on = 'initial timestep_end'
  []

  [set_iodine_inventory]
    type = FunctionAux
    variable = iodine_inventory_proxy
    function = iodine_inventory_profile
    execute_on = 'initial timestep_end'
  []

  [set_xenon_inventory]
    type = FunctionAux
    variable = xenon_inventory_proxy
    function = xenon_inventory_profile
    execute_on = 'initial timestep_end'
  []

  [set_control_drum_angle]
    type = FunctionAux
    variable = control_drum_angle_proxy
    function = control_drum_angle_profile
    execute_on = 'initial timestep_end'
  []

  [set_aux_poison_insertion]
    type = FunctionAux
    variable = aux_poison_insertion_proxy
    function = aux_poison_insertion_profile
    execute_on = 'initial timestep_end'
  []

  [set_rocets_mass_flow]
    type = FunctionAux
    variable = rocets_mass_flow_proxy
    function = mass_flow_profile
    execute_on = 'initial timestep_end'
  []

  [set_turbine_tap_fraction]
    type = FunctionAux
    variable = turbine_tap_fraction_proxy
    function = turbine_tap_fraction_profile
    execute_on = 'initial timestep_end'
  []

  [set_reflector_gamma_heat]
    type = FunctionAux
    variable = reflector_gamma_heat_fraction
    function = reflector_gamma_heat_profile
    execute_on = 'initial timestep_end'
  []

  [set_ledinegg_margin]
    type = FunctionAux
    variable = ledinegg_margin_proxy
    function = ledinegg_margin_profile
    execute_on = 'initial timestep_end'
  []

  [set_ledinegg_status]
    type = FunctionAux
    variable = ledinegg_status_proxy
    function = ledinegg_status_profile
    execute_on = 'initial timestep_end'
  []

  [set_thermal_margin]
    type = FunctionAux
    variable = thermal_margin_proxy
    function = thermal_margin_profile
    execute_on = 'initial timestep_end'
  []

  [set_grid_pressure_drop]
    type = FunctionAux
    variable = grid_pressure_drop_proxy
    function = grid_pressure_drop_profile
    execute_on = 'initial timestep_end'
  []

  [set_gimbal_bleed]
    type = FunctionAux
    variable = gimbal_bleed_proxy
    function = gimbal_bleed_profile
    execute_on = 'initial timestep_end'
  []

  [set_coating_barrier_margin]
    type = FunctionAux
    variable = coating_barrier_margin_proxy
    function = coating_barrier_margin_profile
    execute_on = 'initial timestep_end'
  []

  [set_hydrogen_attack_margin]
    type = FunctionAux
    variable = hydrogen_attack_margin_proxy
    function = hydrogen_attack_margin_profile
    execute_on = 'initial timestep_end'
  []

  [set_keff_restart_memory]
    type = FunctionAux
    variable = keff_restart_memory_proxy
    function = keff_restart_memory_profile
    execute_on = 'initial timestep_end'
  []
[]

# ----------------------------------------------------------------------
# Materials
# ----------------------------------------------------------------------
[Materials]
  [fuel_thermal]
    type = HeatConductionMaterial
    thermal_conductivity = 24.0
    specific_heat = 1050.0
  []

  [fuel_density]
    type = GenericConstantMaterial
    prop_names = 'density hydrogen_diffusivity'
    prop_values = '3000.0 2.0e-9'
  []

  [fuel_elasticity]
    type = ComputeIsotropicElasticityTensor
    youngs_modulus = 4.2e10
    poissons_ratio = 0.22
  []

  [fuel_thermal_expansion]
    type = ComputeThermalExpansionEigenstrain
    thermal_expansion_coeff = 5.2e-6
    temperature = temp
    stress_free_temperature = 300.0
    eigenstrain_name = fuel_thermal_eigenstrain
  []

  [fuel_stress]
    type = ComputeFiniteStrainElasticStress
    eigenstrain_names = fuel_thermal_eigenstrain
  []
[]

# ----------------------------------------------------------------------
# Boundary conditions
# ----------------------------------------------------------------------
[BCs]
  [centerline_symmetry]
    type = DirichletBC
    variable = disp_r
    boundary = left
    value = 0.0
  []

  [lower_axial_anchor]
    type = DirichletBC
    variable = disp_z
    boundary = bottom
    value = 0.0
  []

  [hot_channel_convection]
    type = ConvectiveFluxFunction
    variable = temp
    boundary = right
    T_infinity = coolant_bulk_temperature_profile
    heat_transfer_coefficient = coolant_htc_profile
  []

  [inlet_reference_temperature]
    type = FunctionDirichletBC
    variable = temp
    boundary = bottom
    function = coolant_bulk_temperature_profile
  []

  [hydrogen_wall_inventory]
    type = FunctionDirichletBC
    variable = hydrogen_inventory
    boundary = right
    function = hydrogen_surface_inventory_profile
  []
[]

# ----------------------------------------------------------------------
# Postprocessors for app panels and regression tests
# ----------------------------------------------------------------------
[Postprocessors]
  [peak_fuel_temperature]
    type = NodalExtremeValue
    variable = temp
    value_type = max
    execute_on = 'initial timestep_end final'
  []

  [average_fuel_temperature]
    type = ElementAverageValue
    variable = temp
    execute_on = 'initial timestep_end final'
  []

  [average_hydrogen_inventory]
    type = ElementAverageValue
    variable = hydrogen_inventory
    execute_on = 'initial timestep_end final'
  []

  [average_burnup_proxy]
    type = ElementAverageValue
    variable = burnup_proxy
    execute_on = 'initial timestep_end final'
  []

  [maximum_damage_index]
    type = ElementExtremeValue
    variable = damage_index
    value_type = max
    execute_on = 'initial timestep_end final'
  []

  [minimum_ledinegg_margin]
    type = ElementExtremeValue
    variable = ledinegg_margin_proxy
    value_type = min
    execute_on = 'initial timestep_end final'
  []

  [mean_thermal_margin]
    type = ElementAverageValue
    variable = thermal_margin_proxy
    execute_on = 'initial timestep_end final'
  []

  [mean_grid_pressure_drop]
    type = ElementAverageValue
    variable = grid_pressure_drop_proxy
    execute_on = 'initial timestep_end final'
  []

  [mean_gimbal_bleed]
    type = ElementAverageValue
    variable = gimbal_bleed_proxy
    execute_on = 'initial timestep_end final'
  []

  [mean_coating_barrier_margin]
    type = ElementAverageValue
    variable = coating_barrier_margin_proxy
    execute_on = 'initial timestep_end final'
  []

  [mean_hydrogen_attack_margin]
    type = ElementAverageValue
    variable = hydrogen_attack_margin_proxy
    execute_on = 'initial timestep_end final'
  []

  [restart_memory_index]
    type = ElementAverageValue
    variable = keff_restart_memory_proxy
    execute_on = 'initial timestep_end final'
  []
[]

[VectorPostprocessors]
  [axial_temperature_profile]
    type = LineValueSampler
    variable = temp
    start_point = '0.003 0.0 0.0'
    end_point = '0.003 1.8 0.0'
    num_points = 80
    sort_by = y
    execute_on = 'timestep_end final'
  []

  [hot_wall_hydrogen_profile]
    type = LineValueSampler
    variable = hydrogen_inventory
    start_point = '0.006 0.0 0.0'
    end_point = '0.006 1.8 0.0'
    num_points = 80
    sort_by = y
    execute_on = 'timestep_end final'
  []
[]

# ----------------------------------------------------------------------
# Solver
# ----------------------------------------------------------------------
[Executioner]
  type = Transient
  solve_type = NEWTON
  start_time = 0.0
  end_time = 900.0
  dt = 1.0e-3
  dtmin = 1.0e-7
  dtmax = 0.50
  nl_rel_tol = 1.0e-6
  nl_abs_tol = 1.0e-8
  l_tol = 1.0e-5
  automatic_scaling = true

  [TimeStepper]
    type = IterationAdaptiveDT
    dt = 1.0e-3
    optimal_iterations = 8
    iteration_window = 3
    growth_factor = 1.25
    cutback_factor = 0.50
  []
[]

[Preconditioning]
  [smp]
    type = SMP
    full = true
  []
[]

[Outputs]
  exodus = true
  csv = true
  perf_graph = true
  execute_on = 'initial timestep_end final'
[]

