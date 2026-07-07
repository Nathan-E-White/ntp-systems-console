# ======================================================================
# MCNP WRAPPER FOR COUPLED MOOSE FIXTURE
# ----------------------------------------------------------------------
# This file does not replace or edit the MCNP fixtures.  It exposes a
# MOOSE-style surrogate app boundary that points at the existing MCNP-like
# input/output files in src/fixtures/mcnp.
# ======================================================================

[Mesh]
  type = GeneratedMesh
  dim = 2
  nx = 24
  ny = 96
  xmin = 0.0
  xmax = 0.006
  ymin = 0.0
  ymax = 1.800
  elem_type = QUAD4
[]

[AuxVariables]
  [mcnp_fission_heat]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 0.0
  []
  [keff_restart_memory_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.0
  []
  [fuel_temperature]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 850.0
  []
[]

[Functions]
  [mcnp_power_density_profile]
    type = PiecewiseLinear
    x = '0 25 90 210 260 520 560 650 900'
    y = '0.0 1.35e8 7.85e8 7.85e8 5.0e7 3.4e7 2.7e8 5.6e8 6.0e7'
  []
  [keff_restart_memory_profile]
    type = PiecewiseLinear
    x = '0 90 210 320 520 650 900'
    y = '1.000 1.012 1.006 0.996 0.990 1.002 1.000'
  []
[]

[AuxKernels]
  [fission_heat_aux]
    type = FunctionAux
    variable = mcnp_fission_heat
    function = mcnp_power_density_profile
    execute_on = 'initial timestep_begin'
  []
  [restart_memory_aux]
    type = FunctionAux
    variable = keff_restart_memory_proxy
    function = keff_restart_memory_profile
    execute_on = 'initial timestep_begin'
  []
[]

[Postprocessors]
  [fission_heat_average]
    type = ElementAverageValue
    variable = mcnp_fission_heat
  []
  [keff_restart_memory_average]
    type = ElementAverageValue
    variable = keff_restart_memory_proxy
  []
[]

[Executioner]
  type = Transient
  start_time = 0.0
  end_time = 900.0
  dt = 0.5
  solve_type = LINEAR
[]

[Outputs]
  console = true
  csv = true
  file_base = ../output/mcnp_wrapper
[]

[FixtureSources]
  fixed_source_input = ../../../src/fixtures/mcnp/ntp_mcnp.inp
  fixed_source_output = ../../../src/fixtures/mcnp/ntp_mcnp.out
  criticality_burnup_input = ../../../src/fixtures/mcnp/ntp_crit.inp
  criticality_burnup_output = ../../../src/fixtures/mcnp/ntp_crit.out
  posture = existing_mcnp_fixtures_as_is
[]
