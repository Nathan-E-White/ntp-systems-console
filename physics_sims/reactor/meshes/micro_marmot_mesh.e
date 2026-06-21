# ======================================================================
# MICRO_MARMOT_MESH.E
# Text-mode Exodus-II-style micro-cell mesh manifest
# ----------------------------------------------------------------------
# Real Exodus-II files are binary NetCDF databases.  This fixture mirrors
# the mesh metadata expected by the MARMOT-style subapp without requiring
# a binary meshing tool in the repository.
# ======================================================================

exodus_manifest_version: 1
mesh_name: ntp_marmot_micro_cell_rve
mesh_family: ntp_graphite_cermet_microstructure_surrogate
validation_status: non_executable_mesh_manifest
intended_consumer: ../multi/marmot_sub.i
coordinate_system: cartesian_2d
units:
  length: micrometer
  temperature: K

geometry_concept:
  description: representative 2-D fuel compact cell for closure generation
  width_um: 250.0
  height_um: 250.0
  topology: QUAD4_structured_with_seeded_inclusions
  nx: 80
  ny: 80
  nominal_nodes: 6561
  nominal_elements: 6400

element_blocks:
  - id: 201
    name: graphite_matrix
    material_role: thermal_graphite_matrix
    nominal_elements: 4450
  - id: 202
    name: fuel_kernel_proxy
    material_role: dispersed_fuel_phase_proxy
    nominal_elements: 1280
  - id: 203
    name: coating_barrier_proxy
    material_role: diffusion_barrier_skin
    nominal_elements: 520
  - id: 204
    name: seeded_void_bubble_population
    material_role: fission_gas_void_seed
    nominal_elements: 150

side_sets:
  - id: 1
    name: x_minus_periodic
  - id: 2
    name: x_plus_periodic
  - id: 3
    name: y_minus_periodic
  - id: 4
    name: y_plus_periodic

initial_fields:
  void_phase:
    matrix_background: 0.015
    seeded_void_range: [0.15, 0.42]
  grain_boundary_damage:
    matrix_background: 0.0
    coating_interface_seed: 0.02
  fission_gas_fraction:
    initial_average: 0.0

closure_targets:
  - computed_thermal_conductivity
  - average_void_fraction
  - maximum_micro_damage
  - average_fission_gas_fraction

fixture_notes:
  - Synthetic mesh manifest for parser and workflow development.
  - Not a binary Exodus file.
  - Not calibrated to a specific NTP fuel composition or irradiation dataset.
