[Mesh]
  [micro_mesh]
    type = GeneratedMeshGenerator
    dim = 2
    nx = 50
    ny = 50
  []
[]

[Variables]
  # Phase field variable representing gas bubbles or voids
  [void_phase]
    initial_condition = 0.0
  []
[]

[AuxVariables]
  # This receives the temperature from BISON via the Transfer block
  [local_macro_temperature]
  []
[]

[Kernels]
  # MARMOT uses Allen-Cahn or Cahn-Hilliard equations for microstructure
  [void_evolution]
    type = AllenCahn
    variable = void_phase
    mob_name = mobility
    f_name = bulk_energy
  []
[]

[Materials]
  [marmot_properties]
    type = GasBubbleMaterial
    # MARMOT mobility values depend directly on the temperature sent by BISON
    temperature = local_macro_temperature
    fission_rate = 1.2e19
  []
  [uo2_conductivity]
    type = MARMOTUO2ThermalConductivity
    temperature = local_macro_temperature
    bubble_volume_fraction = void_phase
  []
[]

# ==============================================================================
# POSTPROCESSORS: Reduces micro-data into a single macroscopic value
# ==============================================================================
[Postprocessors]
  [computed_thermal_conductivity]
    type = ElementAverageMaterialProperty
    mat_prop = thermal_conductivity
  []
[]

[Executioner]
  type = Transient
  dt = 1.0  # MARMOT often takes smaller time steps than BISON
  num_steps = 100
[]
