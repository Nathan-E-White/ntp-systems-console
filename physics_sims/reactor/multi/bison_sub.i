# ======================================================================
# NTP BISON-STYLE FUEL PERFORMANCE SUBAPP FIXTURE
# ----------------------------------------------------------------------
# Engineering-scale fuel-channel surrogate.  Receives power/restart
# proxies from the master app and requests a MARMOT-like microstructure
# closure for effective thermal conductivity and void fraction.
# ======================================================================

[Problem]
  type = FEProblem
  coord_type = RZ
[]

[Mesh]
  type = GeneratedMesh
  dim = 2
  nx = 48
  ny = 144
  xmin = 0.0
  xmax = 0.006
  ymin = 0.0
  ymax = 1.800
  elem_type = QUAD4
[]

[GlobalParams]
  displacements = 'disp_r disp_z'
  temperature = temp
[]

[Variables]
  [temp]
    initial_condition = 300.0
  []
  [disp_r]
    initial_condition = 0.0
  []
  [disp_z]
    initial_condition = 0.0
  []
  [hydrogen_inventory]
    initial_condition = 0.0
    scaling = 1.0e6
  []
  [burnup_proxy]
    initial_condition = 0.0
    scaling = 1.0e4
  []
  [damage_index]
    initial_condition = 0.0
    scaling = 1.0e4
  []
[]

[AuxVariables]
  [power_density]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []
  [keff_restart_memory_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []
  [effective_thermal_conductivity]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 24.0
  []
  [marmot_void_fraction]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []
  [ledinegg_margin_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []
[]

[Functions]
  [coolant_wall_temperature]
    type = PiecewiseLinear
    x = '0 25 90 210 520 650 900'
    y = '22.5 145 330 348 149 311 171'
  []
  [fuel_heat_source_profile]
    type = PiecewiseLinear
    x = '0 25 90 210 260 520 560 650 900'
    y = '0.0 1.35e8 7.85e8 7.85e8 5.0e7 3.4e7 2.7e8 5.6e8 6.0e7'
  []
  [ledinegg_margin_profile]
    type = PiecewiseLinear
    x = '0 25 90 210 520 650 900'
    y = '1.00 0.72 0.78 0.71 0.84 0.66 0.89'
  []
[]

[Kernels]
  [temp_time]
    type = HeatConductionTimeDerivative
    variable = temp
  []
  [temp_conduction]
    type = HeatConduction
    variable = temp
  []
  [fission_heat_source]
    type = BodyForce
    variable = temp
    value = 1.0
    function = fuel_heat_source_profile
  []
  [hydrogen_time]
    type = TimeDerivative
    variable = hydrogen_inventory
  []
  [burnup_time]
    type = TimeDerivative
    variable = burnup_proxy
  []
  [damage_time]
    type = TimeDerivative
    variable = damage_index
  []
[]

[Materials]
  [fuel_thermal]
    type = HeatConductionMaterial
    thermal_conductivity = 24.0
    specific_heat = 710.0
  []
  [fuel_density]
    type = GenericConstantMaterial
    prop_names = 'density'
    prop_values = '1850.0'
  []
  [fuel_elasticity]
    type = ComputeIsotropicElasticityTensor
    youngs_modulus = 9.0e9
    poissons_ratio = 0.20
  []
[]

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
  [channel_wall_cooling]
    type = ConvectiveFluxFunction
    variable = temp
    boundary = right
    T_infinity = coolant_wall_temperature
    coefficient = 1.8e4
  []
[]

[MultiApps]
  [marmot_micro_app]
    type = TransientMultiApp
    app_type = MarmotApp
    input_files = 'marmot_sub.i'
    execute_on = 'TIMESTEP_END'
  []
[]

[Transfers]
  [send_temperature_to_marmot]
    type = MultiAppVariableValueSampleTransfer
    to_multi_app = marmot_micro_app
    source_variable = temp
    variable = local_macro_temperature
  []
  [send_fission_rate_to_marmot]
    type = MultiAppCopyTransfer
    to_multi_app = marmot_micro_app
    source_variable = power_density
    variable = local_fission_rate_proxy
  []
  [get_conductivity_from_marmot]
    type = MultiAppPostprocessorInterpolationTransfer
    from_multi_app = marmot_micro_app
    postprocessor = computed_thermal_conductivity
    variable = effective_thermal_conductivity
  []
  [get_void_fraction_from_marmot]
    type = MultiAppPostprocessorInterpolationTransfer
    from_multi_app = marmot_micro_app
    postprocessor = average_void_fraction
    variable = marmot_void_fraction
  []
[]

[Postprocessors]
  [peak_fuel_temperature]
    type = ElementExtremeValue
    variable = temp
    value_type = max
  []
  [average_hydrogen_inventory]
    type = ElementAverageValue
    variable = hydrogen_inventory
  []
  [maximum_damage_index]
    type = ElementExtremeValue
    variable = damage_index
    value_type = max
  []
  [marmot_effective_k]
    type = ElementAverageValue
    variable = effective_thermal_conductivity
  []
[]

[Executioner]
  type = Transient
  solve_type = NEWTON
  start_time = 0.0
  end_time = 900.0
  dt = 0.25
  dtmin = 1.0e-6
  dtmax = 0.5
  nl_abs_tol = 1.0e-8
  nl_rel_tol = 1.0e-6
[]

[Outputs]
  console = true
  csv = true
  exodus = true
  file_base = ../output/bison_sub
[]

[ParserMetadata]
  case_id = ntp-bison-marmot-subapp-001
  fixture_posture = synthetic_fuel_performance_scaffold
  macro_mesh_posture = generated_unit_cell_until_macro_bison_mesh_is_QA_reviewed
  marmot_closure = effective_thermal_conductivity_and_void_fraction
[]
