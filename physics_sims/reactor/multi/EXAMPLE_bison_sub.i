[Mesh]
  [mesh_gen]
    type = GeneratedMeshGenerator
    dim = 2
    nx = 10
    ny = 20
  []
[]

[Variables]
  [temperature]
    initial_condition = 600.0  # Kelvin
  []
[]

[Kernels]
  # Standard BISON heat conduction
  [heat_conduction]
    type = HeatConduction
    variable = temperature
  []
  [heat_source]
    type = HeatSource
    variable = temperature
    value = 1.0e8  # W/m^3 (Normally from MCNP)
  []
[]

[Materials]
  [fuel_thermal]
    type = HeatConductionMaterial
    # This variable is updated dynamically by MARMOT at every time step
    thermal_conductivity = 3.0
  []
[]

[Executioner]
  type = Transient
  dt = 100.0
  num_steps = 5
[]

# ==============================================================================
# MULTIAPP SYSTEM: This block launches and controls MARMOT
# ==============================================================================
[MultiApps]
  [marmot_subapp]
    type = TransientMultiApp
    input_files = 'marmot_sub.i'
    # Executes MARMOT at every quadrature point or specified mesh element
    app_type = MarmotApp
    execute_on = 'TIMESTEP_END'
  []
[]

# ==============================================================================
# TRANSFERS: Moving data between the macroscopic and mesoscopic scales
# ==============================================================================
[Transfers]
  [send_temp_to_marmot]
    type = MultiAppVariableValueSampleTransfer
    to_multi_app = marmot_subapp
    source_variable = temperature
    variable = local_macro_temperature
  []

  [get_conductivity_from_marmot]
    type = MultiAppPostprocessorInterpolationTransfer
    from_multi_app = marmot_subapp
    postprocessor = computed_thermal_conductivity
    variable = thermal_conductivity
  []
[]

[Outputs]
  exodus = true
[]
