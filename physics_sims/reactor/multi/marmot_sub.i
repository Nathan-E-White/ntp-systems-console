# ======================================================================
# NTP MARMOT-STYLE MICROSTRUCTURE SUBAPP FIXTURE
# ----------------------------------------------------------------------
# Mesoscale closure for a representative fuel compact cell.  The micro
# mesh is a text-mode Exodus-style manifest in ../meshes/micro_marmot_mesh.e.
# This is synthetic parser/workflow evidence, not a calibrated material
# evolution model.
# ======================================================================

[Mesh]
  [micro_cell_mesh]
    type = FileMeshGenerator
    file = ../meshes/micro_marmot_mesh.e
  []
[]

[Variables]
  [void_phase]
    initial_condition = 0.015
  []
  [grain_boundary_damage]
    initial_condition = 0.0
  []
  [fission_gas_fraction]
    initial_condition = 0.0
  []
[]

[AuxVariables]
  [local_macro_temperature]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 850.0
  []
  [local_fission_rate_proxy]
    family = MONOMIAL
    order = CONSTANT
    initial_condition = 1.2e19
  []
[]

[Kernels]
  [void_phase_time]
    type = TimeDerivative
    variable = void_phase
  []
  [void_phase_evolution]
    type = AllenCahn
    variable = void_phase
    mob_name = void_mobility
    f_name = void_bulk_energy
  []
  [damage_time]
    type = TimeDerivative
    variable = grain_boundary_damage
  []
  [fission_gas_time]
    type = TimeDerivative
    variable = fission_gas_fraction
  []
[]

[Materials]
  [microstructure_free_energy]
    type = DerivativeParsedMaterial
    property_name = void_bulk_energy
    coupled_variables = 'void_phase grain_boundary_damage'
    expression = '0.5*void_phase^2*(1-void_phase)^2 + 0.05*grain_boundary_damage'
  []
  [void_mobility_material]
    type = GenericConstantMaterial
    prop_names = 'void_mobility'
    prop_values = '2.5e-14'
  []
  [conductivity_closure_material]
    type = ParsedMaterial
    property_name = thermal_conductivity
    coupled_variables = 'void_phase grain_boundary_damage local_macro_temperature'
    expression = '24.0*(1 - 0.55*void_phase - 0.18*grain_boundary_damage)*(850.0/local_macro_temperature)^0.18'
  []
[]

[Postprocessors]
  [computed_thermal_conductivity]
    type = ElementAverageMaterialProperty
    mat_prop = thermal_conductivity
  []
  [average_void_fraction]
    type = ElementAverageValue
    variable = void_phase
  []
  [maximum_micro_damage]
    type = ElementExtremeValue
    variable = grain_boundary_damage
    value_type = max
  []
  [average_fission_gas_fraction]
    type = ElementAverageValue
    variable = fission_gas_fraction
  []
[]

[Executioner]
  type = Transient
  solve_type = NEWTON
  start_time = 0.0
  end_time = 900.0
  dt = 0.05
  dtmin = 1.0e-6
  dtmax = 1.0
  nl_abs_tol = 1.0e-9
  nl_rel_tol = 1.0e-7
[]

[Outputs]
  console = true
  csv = true
  exodus = true
  file_base = ../output/marmot_sub
[]

[ParserMetadata]
  case_id = ntp-marmot-micro-cell-001
  fixture_posture = synthetic_microstructure_closure
  closure_outputs = 'computed_thermal_conductivity average_void_fraction maximum_micro_damage'
  parent_app = bison_sub.i
[]
