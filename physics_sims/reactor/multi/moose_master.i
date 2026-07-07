# ======================================================================
# NTP-SYS-CONSOLE COUPLED MOOSE MASTER FIXTURE
# ----------------------------------------------------------------------
# Coordinates MCNP-style power evidence, a BISON-style fuel-performance
# subapp, and a MARMOT-style microstructure closure carried by BISON.
#
# This is a synthetic coupling deck for parser/workflow development.  It
# is not a validated MOOSE execution input, reactor design, or safety
# analysis.
# ======================================================================

[Mesh]
  [macro_core_mesh]
    type = FileMeshGenerator
    file = ../meshes/macro_bison_mesh.e
  []
[]

[Variables]
  [power_density]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []
  [fuel_temperature]
    initial_condition = 850.0
  []
[]

[AuxVariables]
  [mcnp_keff_restart_memory_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []
  [rocets_mass_flow_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []
  [marmot_thermal_conductivity_closure]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 24.0
  []
  [marmot_void_fraction_closure]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []
[]

[MultiApps]
  [mcnp_power_app]
    type = TransientMultiApp
    input_files = 'mcnp_wrapper.i'
    execute_on = 'TIMESTEP_BEGIN'
  []
  [bison_fuel_app]
    type = TransientMultiApp
    input_files = 'bison_sub.i'
    execute_on = 'TIMESTEP_END'
  []
[]

[Transfers]
  [get_power_from_mcnp]
    type = MultiAppCopyTransfer
    from_multi_app = mcnp_power_app
    source_variable = mcnp_fission_heat
    variable = power_density
  []
  [get_restart_memory_from_mcnp]
    type = MultiAppCopyTransfer
    from_multi_app = mcnp_power_app
    source_variable = keff_restart_memory_proxy
    variable = mcnp_keff_restart_memory_proxy
  []
  [send_power_to_bison]
    type = MultiAppCopyTransfer
    to_multi_app = bison_fuel_app
    source_variable = power_density
    variable = power_density
  []
  [send_restart_memory_to_bison]
    type = MultiAppCopyTransfer
    to_multi_app = bison_fuel_app
    source_variable = mcnp_keff_restart_memory_proxy
    variable = keff_restart_memory_proxy
  []
  [get_temperature_from_bison]
    type = MultiAppCopyTransfer
    from_multi_app = bison_fuel_app
    source_variable = temp
    variable = fuel_temperature
  []
  [get_marmot_conductivity_from_bison]
    type = MultiAppCopyTransfer
    from_multi_app = bison_fuel_app
    source_variable = effective_thermal_conductivity
    variable = marmot_thermal_conductivity_closure
  []
  [send_temperature_back_to_mcnp]
    type = MultiAppCopyTransfer
    to_multi_app = mcnp_power_app
    source_variable = fuel_temperature
    variable = fuel_temperature
  []
[]

[Functions]
  [rocets_mass_flow_profile]
    type = PiecewiseLinear
    x = '0 25 90 210 520 560 650 900'
    y = '0.0 4.6 8.0 8.0 0.0 5.72 6.45 0.0'
  []
[]

[AuxKernels]
  [rocets_mass_flow_aux]
    type = FunctionAux
    variable = rocets_mass_flow_proxy
    function = rocets_mass_flow_profile
    execute_on = 'initial timestep_end'
  []
[]

[Executioner]
  type = Transient
  solve_type = PJFNK
  start_time = 0.0
  end_time = 900.0
  dt = 0.5
  dtmin = 1.0e-4
  dtmax = 10.0
  fixed_point_max_its = 4
  fixed_point_rel_tol = 1.0e-5
[]

[Outputs]
  console = true
  csv = true
  file_base = ../output/moose_master
[]

[ParserMetadata]
  case_id = ntp-coupled-moose-master-001
  fixture_posture = synthetic_non_operational
  mcnp_source = ../../../src/fixtures/mcnp/ntp_mcnp.inp
  mcnp_burnup_source = ../../../src/fixtures/mcnp/ntp_crit.inp
  rocets_pairing = ../../RoCETS/engine.run
  bison_subapp = bison_sub.i
  marmot_subapp = marmot_sub.i
[]
