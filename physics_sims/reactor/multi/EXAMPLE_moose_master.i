[Mesh]
  [reactor_core]
    type = FileMeshGenerator
    file = full_core_mesh.e # Core mesh aligning all apps
  []
[]

[Variables]
  [power_density] # Received from MCNP, passed to BISON
  []
  [temperature]   # Received from BISON, passed to MCNP
  []
[]

[MultiApps]
  [mcnp_app]
    type = TransientMultiApp
    input_files = 'mcnp_wrapper.i'
    execute_on = 'TIMESTEP_BEGIN' # MCNP computes power first
  []
  [bison_app]
    type = TransientMultiApp
    input_files = 'bison_sibling.i'
    execute_on = 'TIMESTEP_END'   # BISON updates thermals using that power
  []
[]

[Transfers]
  # --- STEP 1: Get power from MCNP to Global Master ---
  [get_power_from_mcnp]
    type = MultiAppCopyTransfer
    from_multi_app = mcnp_app
    source_variable = mcnp_fission_heat
    variable = power_density
  []

  # --- STEP 2: Send that power to BISON ---
  [send_power_to_bison]
    type = MultiAppCopyTransfer
    to_multi_app = bison_app
    source_variable = power_density
    variable = power_density
  []

  # --- STEP 3: Get deformed temperatures back from BISON ---
  [get_temp_from_bison]
    type = MultiAppCopyTransfer
    from_multi_app = bison_app
    source_variable = temperature
    variable = temperature
  []

  # --- STEP 4: Send updated thermal/density states back to MCNP ---
  [send_temp_to_mcnp]
    type = MultiAppCopyTransfer
    to_multi_app = mcnp_app
    source_variable = temperature
    variable = temperature
  []
[]

[Executioner]
  type = Transient
  # Picard loops allow MCNP & BISON to settle on converged values per timestep
  fixed_point_max_its = 4
[]
