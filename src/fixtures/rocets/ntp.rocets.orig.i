# ======================================================================
# ROCETS-LIKE NTP SYSTEM INPUT
# Nuclear thermal propulsion transient and restart model
# Synthetic, non-validated engineering input fixture
# ======================================================================

CASE baseline-ntp-rocets-002
TITLE "NTP breadboard: LH2 feed, reactor kinetics, turbine loop, nozzle"
UNITS SI

# ----------------------------------------------------------------------
# Numerical controls
# ----------------------------------------------------------------------
TIME_CONTROL
  mode        = transient
  start_time  = 0.0        # s
  stop_time   = 900.0      # s; includes shutdown dwell and restart
  initial_dt  = 1.0e-3     # s
  max_dt      = 0.25       # s
  min_dt      = 1.0e-6     # s
END

SOLVER_CONTROL
  nonlinear_solver     = newton
  linear_solver        = sparse_direct
  relative_tolerance   = 1.0e-6
  absolute_tolerance   = 1.0e-8
  max_nonlinear_iters  = 35
  max_time_cuts        = 12
  steady_init          = true
  mass_balance_check   = strict
  energy_balance_check = report
  reactivity_check     = bounded_fixture_only
END

# ----------------------------------------------------------------------
# Fluids and pseudo-property packages
# ----------------------------------------------------------------------
FLUID lh2
  species        = H2
  phase_model    = cryogenic_real_fluid
  property_table = props/h2_cryo_to_superheated.tbl
  viscosity      = table
  conductivity   = table
  cp             = table
END

FLUID hot_h2
  species        = H2
  phase_model    = high_temperature_equilibrium
  property_table = props/h2_hot_core_exit.tbl
  viscosity      = table
  conductivity   = table
  cp             = table
END

# ----------------------------------------------------------------------
# Mission profile
# ----------------------------------------------------------------------
MISSION_PROFILE deep_space_restart_demo
  phase startup_ramp
    start = 0.0
    stop  = 90.0
    mode  = startup
  END
  phase rated_burn
    start = 90.0
    stop  = 210.0
    mode  = steady_power_hold
  END
  phase shutdown_soak
    start = 210.0
    stop  = 520.0
    mode  = decay_heat_and_tank_heat_leak
  END
  phase restart_ramp
    start = 520.0
    stop  = 650.0
    mode  = conservative_restart_demonstration
  END
  phase cooldown
    start = 650.0
    stop  = 900.0
    mode  = post_burn_cooldown
  END
END

# ----------------------------------------------------------------------
# Network nodes
# ----------------------------------------------------------------------
NODE n_lh2_tank_outlet
NODE n_boost_pump_inlet
NODE n_turbopump_inlet
NODE n_turbopump_discharge
NODE n_regen_inlet
NODE n_regen_exit
NODE n_spin_converter_exit
NODE n_core_inlet_plenum
NODE n_core_midplane
NODE n_core_exit_plenum
NODE n_turbine_inlet
NODE n_turbine_exit
NODE n_chamber
NODE n_nozzle_exit
NODE n_ambient
NODE n_tvc_bleed_inlet
NODE n_tvc_bleed_return
NODE n_tvc_hyd_pressure
NODE n_tvc_hyd_return
NODE n_nozzle_gimbal_mount

# ----------------------------------------------------------------------
# Boundaries
# ----------------------------------------------------------------------
BOUNDARY lh2_supply_tank
  type              = cryogenic_stagnation_reservoir
  fluid             = lh2
  pressure          = schedule(tank_pressure_profile)
  temperature       = schedule(tank_temperature_profile)
  para_fraction     = schedule(tank_para_fraction_profile)
  ullage_model      = prescribed
  shield_heat_input = state(internal_shield.tank_heat_leak)
  outlet            = n_lh2_tank_outlet
END

BOUNDARY space_ambient
  type        = pressure_sink
  fluid       = hot_h2
  pressure    = 0.0
  temperature = 3.0
  inlet       = n_ambient
END

# ----------------------------------------------------------------------
# LH2 feed system
# ----------------------------------------------------------------------
COMPONENT tank_isolation_valve valve
  fluid          = lh2
  inlet          = n_lh2_tank_outlet
  outlet         = n_boost_pump_inlet
  area           = 3.2e-3
  cv             = schedule(tank_isolation_cv)
  leakage_cv     = 1.0e-7
  fail_position  = closed
END

COMPONENT boost_pump pump
  fluid        = lh2
  inlet        = n_boost_pump_inlet
  outlet       = n_turbopump_inlet
  shaft        = electric_start_motor_shaft
  speed        = schedule(boost_pump_speed_profile)
  map          = boost_pump_map
  efficiency   = schedule(boost_pump_efficiency_profile)
END

COMPONENT electric_start_motor motor
  shaft        = electric_start_motor_shaft
  command      = schedule(start_motor_command)
  max_power    = 2.0e5
  cutoff_speed = 1800.0
END

COMPONENT main_turbopump pump
  fluid            = lh2
  inlet            = n_turbopump_inlet
  outlet           = n_turbopump_discharge
  shaft            = main_turbomachinery_shaft
  speed            = state(main_turbomachinery_shaft.speed)
  map              = main_pump_map
  efficiency       = schedule(main_pump_efficiency_profile)
  design_mdot      = 8.0
  design_dp        = 6.0e6
  cavitation_check = report
END

COMPONENT discharge_manifold line
  fluid      = lh2
  inlet      = n_turbopump_discharge
  outlet     = n_regen_inlet
  length     = 2.10
  diameter   = 0.060
  roughness  = 8.0e-6
  loss_model = darcy_weisbach
END

# ----------------------------------------------------------------------
# Regenerative cooling and spin-isomer conditioning
# ----------------------------------------------------------------------
COMPONENT nozzle_regen_jacket heat_exchanger
  cold_fluid       = lh2
  cold_inlet       = n_regen_inlet
  cold_outlet      = n_regen_exit
  hot_boundary     = nozzle_wall_thermal_proxy
  heat_rate        = schedule(regen_heat_pickup_profile)
  pressure_drop    = map(regen_pressure_loss_map)
  wall_temperature = state(nozzle_wall_thermal_proxy.temperature)
  metal_temperature_limit = 1100.0
END

COMPONENT ortho_para_converter fluid_conditioner
  fluid            = lh2
  inlet            = n_regen_exit
  outlet           = n_spin_converter_exit
  model            = first_order_spin_isomer_proxy
  para_fraction_in = state(lh2_supply_tank.para_fraction)
  equilibrium      = schedule(para_equilibrium_profile)
  enthalpy_coupling= conservative_report_only
  catalyst         = none
END

COMPONENT core_inlet_line line
  fluid      = lh2
  inlet      = n_spin_converter_exit
  outlet     = n_core_inlet_plenum
  length     = 0.85
  diameter   = 0.052
  roughness  = 6.0e-6
  loss_model = minor_loss
  k_loss     = 0.75
END

# ----------------------------------------------------------------------
# Reactor assembly: abstract neutronics and conservative thermal coupling
# ----------------------------------------------------------------------
COMPONENT internal_shield radiation_shield
  model            = lumped_attenuation_proxy
  coupled_tank     = lh2_supply_tank
  heat_leak        = schedule(shield_tank_heat_leak_profile)
  dose_metric      = report_only
  design_claim     = none
END

COMPONENT reactor_neutronics point_kinetics
  model            = six_group_lumped_proxy
  control_input    = state(control_drum_bank.net_worth)
  override_input   = state(auxiliary_poison_bank.override_worth)
  poison_input     = state(fission_product_poisoning.net_worth)
  decay_heat       = state(decay_heat_model.thermal_power)
  iodine_state     = state(fission_product_poisoning.i135_inventory)
  xenon_state      = state(fission_product_poisoning.xe135_inventory)
  kinetics_margin  = state(fission_product_poisoning.reactivity_margin)
  safety_posture   = bounded_non_design_fixture
END

COMPONENT fission_product_poisoning iodine_xenon_proxy
  model              = lumped_i135_xe135_restart_memory
  source_power       = state(reactor_core.power)
  iodine_inventory   = schedule(iodine_inventory_proxy_profile)
  xenon_inventory    = schedule(xenon_inventory_proxy_profile)
  net_worth          = schedule(xenon_poison_worth_profile)
  reactivity_margin  = schedule(poisoned_reactivity_margin_profile)
  restart_memory     = schedule(xenon_restart_memory_profile)
  iodine_yield_proxy = 0.063
  xenon_yield_proxy  = 0.003
  removal_model      = decay_burnout_proxy
END

COMPONENT decay_heat_model decay_heat_proxy
  model            = lumped_shutdown_heat_memory
  source_power     = state(reactor_core.power)
  thermal_power    = schedule(decay_heat_proxy_profile)
  sink_component   = reactor_core
  coupling_mode    = post_shutdown_core_thermal_load
END

COMPONENT reactor_reflector reflector
  material         = graphite_composite_placeholder
  geometry         = annular_reflector_proxy
  drum_set         = control_drum_bank
  gamma_heating    = state(reflector_gamma_heating.thermal_power)
END

COMPONENT reflector_gamma_heating gamma_heat_proxy
  model            = lumped_reflector_gamma_heat
  source_power     = state(reactor_core.power)
  thermal_power    = schedule(reflector_heat_proxy_profile)
  sink_component   = reactor_reflector
  coupling_mode    = reflector_thermal_load
END

COMPONENT control_drum_bank control_drums
  count            = 12
  angle            = schedule(control_drum_angle_profile)
  shutdown_angle   = 0.0
  run_angle        = 92.0
  worth_model      = cosine_proxy
  net_worth        = schedule(control_drum_worth_profile)
END

COMPONENT auxiliary_poison_bank poison_override
  mode             = conservative_restart_hold_down
  insertion        = schedule(aux_poison_insertion_profile)
  override_worth   = schedule(aux_poison_worth_profile)
  actuation_model  = slow_bounded_proxy
END

COMPONENT reactor_core multi_channel_core
  fluid                    = hot_h2
  inlet                    = n_core_inlet_plenum
  midpoint                 = n_core_midplane
  outlet                   = n_core_exit_plenum
  power                    = schedule(core_power_profile)
  neutronics               = reactor_neutronics
  decay_heat_model         = decay_heat_model
  channel_model            = core_channel_bundle
  channel_count            = state(core_channel_bundle.channel_count)
  channel_groups           = state(core_channel_bundle.channel_groups)
  axial_shape              = schedule(core_axial_shape_profile)
  radial_peaking           = schedule(core_radial_peaking_profile)
  pressure_drop            = map(core_pressure_loss_map)
  thermal_mass             = 1.8e5
  fuel_form                = hexagonal_fuel_element_channel_bundle
  representative_channel  = core_mid_channel
  channel_stability_model  = ledinegg_instability_switch
  flow_stability_check     = state(ledinegg_instability_switch.status)
  ledinegg_margin          = state(ledinegg_instability_switch.margin)
  fuel_temperature_initial = 850.0
  fuel_temperature_limit   = 2850.0
END

COMPONENT core_channel_bundle multi_channel_abstraction
  parent                 = reactor_core
  channel_count          = 96
  channel_groups         = inner,mid,outer,bypass
  group_power_shape      = schedule(channel_group_power_shape_profile)
  group_flow_split       = schedule(channel_group_flow_split_profile)
  representative_flow    = schedule(channel_representative_flow_profile)
  hydraulic_diameter     = schedule(channel_hydraulic_diameter_profile)
  heated_length          = schedule(channel_heated_length_profile)
  model_scope            = reduced_order_channel_bundle
END

COMPONENT core_inner_channel representative_channel
  parent                 = core_channel_bundle
  group                  = inner
  power_shape            = state(core_channel_bundle.group_power_shape.inner)
  flow_split             = state(core_channel_bundle.group_flow_split.inner)
  stability_margin       = state(ledinegg_instability_switch.margin)
END

COMPONENT core_mid_channel representative_channel
  parent                 = core_channel_bundle
  group                  = mid
  power_shape            = state(core_channel_bundle.group_power_shape.mid)
  flow_split             = state(core_channel_bundle.group_flow_split.mid)
  stability_margin       = state(ledinegg_instability_switch.margin)
END

COMPONENT core_outer_channel representative_channel
  parent                 = core_channel_bundle
  group                  = outer
  power_shape            = state(core_channel_bundle.group_power_shape.outer)
  flow_split             = state(core_channel_bundle.group_flow_split.outer)
  stability_margin       = state(ledinegg_instability_switch.margin)
END

COMPONENT ledinegg_instability_switch stability_guard
  parent               = reactor_core
  model                = ledinegg_channel_stability_proxy
  monitored_inlet      = n_core_inlet_plenum
  monitored_outlet     = n_core_exit_plenum
  monitored_flow       = state(main_turbopump.mass_flow)
  monitored_power      = state(reactor_core.power)
  monitored_channels   = state(core_channel_bundle.channel_groups)
  margin               = schedule(ledinegg_margin_profile)
  status               = schedule(ledinegg_status_profile)
  switch_mode          = advisory
  action               = flag_channel_instability_risk
END

COMPONENT core_exit_plenum volume
  fluid               = hot_h2
  inlet               = n_core_exit_plenum
  outlet              = n_chamber
  branch_outlet       = n_turbine_inlet
  volume              = 0.045
  initial_pressure    = 2.0e5
  initial_temperature = 650.0
END

# ----------------------------------------------------------------------
# Turbine drive loop and shaft coupling
# Cleaner topology: exit plenum -> tap -> chamber path + turbine bypass.
# ----------------------------------------------------------------------
COMPONENT turbine_tap splitter
  fluid            = hot_h2
  inlet            = n_core_exit_plenum
  outlet_primary   = n_chamber
  outlet_secondary = n_turbine_inlet
  split_fraction   = schedule(turbine_tap_fraction_profile)
END

COMPONENT drive_turbine turbine
  fluid        = hot_h2
  inlet        = n_turbine_inlet
  outlet       = n_turbine_exit
  shaft        = main_turbomachinery_shaft
  map          = drive_turbine_map
  efficiency   = schedule(turbine_efficiency_profile)
  design_pr    = 1.7
  design_power = 1.5e6
END

COMPONENT turbine_exhaust_mixer mixer
  fluid        = hot_h2
  inlet_1      = n_turbine_exit
  inlet_2      = n_chamber
  inlet_3      = n_tvc_bleed_return
  outlet       = n_chamber
  mixing_model = enthalpy_balance_proxy
END

COMPONENT main_turbomachinery_shaft rotating_shaft
  inertia       = 9.5
  initial_speed = 450.0
  speed_limit   = 7200.0
  torque_losses = map(main_shaft_loss_map)
END

COMPONENT electric_start_motor_shaft rotating_shaft
  inertia       = 1.8
  initial_speed = 0.0
  speed_limit   = 2500.0
  torque_losses = map(start_shaft_loss_map)
END

# ----------------------------------------------------------------------
# Chamber, baseline nozzle, and optional deep-space nozzle preset
# ----------------------------------------------------------------------
COMPONENT thrust_chamber volume
  fluid               = hot_h2
  inlet               = n_chamber
  outlet              = n_nozzle_exit
  volume              = 0.095
  wall_heat_capacity  = 2.4e4
  initial_pressure    = 2.0e5
  initial_temperature = 650.0
END

COMPONENT bell_nozzle expansion_nozzle
  variant               = baseline_demo
  fluid                 = hot_h2
  inlet                 = n_nozzle_exit
  outlet_boundary       = space_ambient
  throat_area           = 0.020
  area_ratio            = 38.0
  discharge_coefficient = 0.985
  divergence_efficiency = 0.970
  frozen_flow           = false
  performance_model     = equilibrium_proxy
  gimbal_mount          = nozzle_gimbal_joint
  pitch_angle           = state(nozzle_gimbal_joint.pitch_angle)
  yaw_angle             = state(nozzle_gimbal_joint.yaw_angle)
  tvc_efficiency_penalty= schedule(tvc_nozzle_efficiency_penalty_profile)
END

COMPONENT deep_space_bell_nozzle expansion_nozzle_preset
  variant               = optional_deep_space_high_expansion
  enabled               = false
  parent                = bell_nozzle
  area_ratio            = 150.0
  divergence_efficiency = 0.955
  use_case              = vacuum_restart_visualization
END

# ----------------------------------------------------------------------
# Thrust vector control: turbine-exhaust bleed driven hydraulic gimbal
# ----------------------------------------------------------------------
COMPONENT tvc_controller thrust_vector_controller
  mode                = dual_axis_closed_loop_proxy
  pitch_command       = schedule(tvc_pitch_command_profile)
  yaw_command         = schedule(tvc_yaw_command_profile)
  rate_command        = schedule(tvc_gimbal_rate_command_profile)
  authority_limit     = schedule(tvc_authority_limit_profile)
  bleed_command       = schedule(tvc_bleed_valve_cv_profile)
END

COMPONENT tvc_hot_gas_bleed_valve valve
  fluid               = hot_h2
  inlet               = n_turbine_exit
  outlet              = n_tvc_bleed_inlet
  source_component    = drive_turbine
  cv                  = schedule(tvc_bleed_valve_cv_profile)
  mass_flow           = schedule(tvc_parasitic_bleed_flow_profile)
  commanded_by        = tvc_controller
END

COMPONENT tvc_hydraulic_power_unit hydraulic_power_unit
  hot_gas_inlet       = n_tvc_bleed_inlet
  hot_gas_return      = n_tvc_bleed_return
  hydraulic_outlet    = n_tvc_hyd_pressure
  hydraulic_return    = n_tvc_hyd_return
  driven_by           = tvc_hot_gas_bleed_valve
  shaft_power         = schedule(tvc_hydraulic_power_profile)
  parasitic_mass_flow = schedule(tvc_parasitic_bleed_flow_profile)
  pressure_supply     = schedule(tvc_hydraulic_pressure_profile)
  pressure_return     = schedule(tvc_hydraulic_return_pressure_profile)
END

COMPONENT tvc_hydraulic_accumulator hydraulic_accumulator
  inlet               = n_tvc_hyd_pressure
  outlet              = n_tvc_hyd_pressure
  precharge_pressure  = 8.0e6
  stored_energy       = schedule(tvc_accumulator_energy_profile)
  demand_buffer       = schedule(tvc_accumulator_draw_profile)
END

COMPONENT tvc_actuator_ring dual_axis_hydraulic_actuator
  parent              = bell_nozzle
  mount               = nozzle_gimbal_joint
  hydraulic_supply    = n_tvc_hyd_pressure
  hydraulic_return    = n_tvc_hyd_return
  pitch_command       = state(tvc_controller.pitch_command)
  yaw_command         = state(tvc_controller.yaw_command)
  pitch_angle         = schedule(tvc_pitch_response_profile)
  yaw_angle           = schedule(tvc_yaw_response_profile)
  torque_demand       = schedule(tvc_torque_demand_profile)
  structural_torque   = schedule(tvc_structural_torque_profile)
  slew_rate_limit     = schedule(tvc_slew_rate_limit_profile)
  hydraulic_power_demand = schedule(tvc_hydraulic_power_demand_profile)
END

COMPONENT nozzle_gimbal_joint gimbal_mount
  parent              = thrust_chamber
  child               = bell_nozzle
  actuator            = tvc_actuator_ring
  pitch_angle         = state(tvc_actuator_ring.pitch_angle)
  yaw_angle           = state(tvc_actuator_ring.yaw_angle)
  pitch_rate          = schedule(tvc_pitch_rate_profile)
  yaw_rate            = schedule(tvc_yaw_rate_profile)
  structural_load     = schedule(tvc_structural_torque_profile)
END

# ----------------------------------------------------------------------
# Solver variables and residuals for credible system-solve posture
# ----------------------------------------------------------------------
SOLVER_VARIABLE shaft_speed
  type    = independent
  target  = main_turbomachinery_shaft.speed
  bounds  = 0.0,7200.0
  guess   = schedule(shaft_speed_guess_profile)
END

SOLVER_VARIABLE turbine_split_fraction
  type    = independent
  target  = turbine_tap.split_fraction
  bounds  = 0.0,0.12
  guess   = schedule(turbine_tap_fraction_profile)
END

SOLVER_VARIABLE control_drum_angle
  type    = independent
  target  = control_drum_bank.angle
  bounds  = 0.0,110.0
  guess   = schedule(control_drum_angle_profile)
END

SOLVER_RESIDUAL shaft_power_balance
  target      = 0.0
  expression  = drive_turbine.power - main_turbopump.shaft_power
  tolerance   = 5.0e3
END

SOLVER_RESIDUAL chamber_pressure_target
  target      = schedule(chamber_pressure_target_profile)
  expression  = thrust_chamber.pressure
  tolerance   = 5.0e4
END

SOLVER_RESIDUAL core_power_tracking
  target      = schedule(core_power_profile)
  expression  = reactor_neutronics.thermal_power_proxy
  tolerance   = 2.5e6
END

SOLVER_RESIDUAL mass_flow_closure
  target      = 0.0
  expression  = main_turbopump.mass_flow - bell_nozzle.mass_flow
  tolerance   = 5.0e-2
END

SOLVER_RESIDUAL tvc_hydraulic_power_balance
  target      = 0.0
  expression  = tvc_hydraulic_power_unit.shaft_power - tvc_actuator_ring.hydraulic_power_demand
  tolerance   = 2.5e3
END

SOLVER_RESIDUAL tvc_parasitic_flow_accounting
  target      = 0.0
  expression  = drive_turbine.mass_flow - turbine_exhaust_mixer.mass_flow - tvc_hot_gas_bleed_valve.mass_flow
  tolerance   = 2.5e-2
END

SOLVER_RESIDUAL tvc_gimbal_tracking_error
  target      = 0.0
  expression  = tvc_controller.pitch_command - tvc_actuator_ring.pitch_angle
  tolerance   = 0.05
END

# ----------------------------------------------------------------------
# Instrumentation points
# ----------------------------------------------------------------------
SENSOR s_tank_pressure pressure_sensor
  target   = lh2_supply_tank.pressure
  units    = Pa
END

SENSOR s_pump_speed tachometer
  target   = main_turbomachinery_shaft.speed
  units    = rpm
END

SENSOR s_core_exit_temperature temperature_sensor
  target   = n_core_exit_plenum.temperature
  units    = K
END

SENSOR s_neutronics_margin scalar_sensor
  target   = reactor_neutronics.bounded_margin_proxy
  units    = dimensionless
END

SENSOR s_chamber_pressure pressure_sensor
  target   = thrust_chamber.pressure
  units    = Pa
END

SENSOR s_thrust thrust_proxy_sensor
  target   = bell_nozzle.ideal_thrust
  units    = N
END

# ----------------------------------------------------------------------
# Connectivity
# ----------------------------------------------------------------------
CONNECT lh2_supply_tank.outlet -> tank_isolation_valve.inlet
CONNECT tank_isolation_valve.outlet -> boost_pump.inlet
CONNECT boost_pump.outlet -> main_turbopump.inlet
CONNECT main_turbopump.outlet -> discharge_manifold.inlet
CONNECT discharge_manifold.outlet -> nozzle_regen_jacket.cold_inlet
CONNECT nozzle_regen_jacket.cold_outlet -> ortho_para_converter.inlet
CONNECT ortho_para_converter.outlet -> core_inlet_line.inlet
CONNECT core_inlet_line.outlet -> reactor_core.inlet
CONNECT reactor_neutronics.output -> reactor_core.neutronics
CONNECT fission_product_poisoning.output -> reactor_neutronics.poison_input
CONNECT decay_heat_model.output -> reactor_neutronics.decay_heat
CONNECT decay_heat_model.output -> reactor_core.decay_heat_model
CONNECT core_channel_bundle.output -> reactor_core.channel_model
CONNECT core_inner_channel.output -> core_channel_bundle.inner
CONNECT core_mid_channel.output -> core_channel_bundle.mid
CONNECT core_outer_channel.output -> core_channel_bundle.outer
CONNECT reflector_gamma_heating.output -> reactor_reflector.gamma_heating
CONNECT control_drum_bank.output -> reactor_neutronics.control_input
CONNECT auxiliary_poison_bank.output -> reactor_neutronics.override_input
CONNECT internal_shield.heat_leak -> lh2_supply_tank.shield_heat_input
CONNECT core_channel_bundle.output -> ledinegg_instability_switch.monitored_channels
CONNECT ledinegg_instability_switch.output -> reactor_core.flow_stability_check
CONNECT reactor_core.outlet -> core_exit_plenum.inlet
CONNECT core_exit_plenum.outlet -> turbine_tap.inlet
CONNECT turbine_tap.outlet_primary -> thrust_chamber.inlet
CONNECT turbine_tap.outlet_secondary -> drive_turbine.inlet
CONNECT drive_turbine.outlet -> turbine_exhaust_mixer.inlet_1
CONNECT drive_turbine.outlet -> tvc_hot_gas_bleed_valve.inlet
CONNECT tvc_hot_gas_bleed_valve.outlet -> tvc_hydraulic_power_unit.hot_gas_inlet
CONNECT tvc_hydraulic_power_unit.hot_gas_return -> turbine_exhaust_mixer.inlet_3
CONNECT tvc_hydraulic_power_unit.hydraulic_outlet -> tvc_hydraulic_accumulator.inlet
CONNECT tvc_hydraulic_accumulator.outlet -> tvc_actuator_ring.hydraulic_supply
CONNECT tvc_actuator_ring.hydraulic_return -> tvc_hydraulic_power_unit.hydraulic_return
CONNECT tvc_controller.output -> tvc_hot_gas_bleed_valve.commanded_by
CONNECT tvc_controller.output -> tvc_actuator_ring.pitch_command
CONNECT tvc_actuator_ring.output -> nozzle_gimbal_joint.actuator
CONNECT nozzle_gimbal_joint.output -> bell_nozzle.gimbal_mount
CONNECT turbine_exhaust_mixer.outlet -> thrust_chamber.inlet
CONNECT thrust_chamber.outlet -> bell_nozzle.inlet
CONNECT bell_nozzle.outlet -> space_ambient.inlet
# ----------------------------------------------------------------------
# Performance and loss maps
# ----------------------------------------------------------------------
MAP boost_pump_map columns=speed,flow,head,efficiency
  250.0   0.50   2.0e4   0.18
  900.0   2.00   1.2e5   0.42
  1800.0  4.00   3.5e5   0.56
  2400.0  5.25   4.8e5   0.52
END

MAP main_pump_map columns=speed,flow,head,efficiency
  500.0   1.0   1.0e5   0.20
  2500.0  4.0   2.0e6   0.55
  5200.0  8.0   6.0e6   0.70
  7200.0  9.5   7.2e6   0.63
END

MAP drive_turbine_map columns=pressure_ratio,flow,power,efficiency
  1.10  0.20  1.0e4   0.35
  1.35  0.45  4.5e5   0.62
  1.70  0.80  1.5e6   0.71
  2.05  0.95  1.9e6   0.66
END

MAP core_pressure_loss_map columns=mass_flow,delta_p
  1.0   2.0e4
  4.0   2.5e5
  8.0   8.5e5
  10.0  1.35e6
END

MAP regen_pressure_loss_map columns=mass_flow,delta_p
  1.0   1.0e4
  4.0   1.1e5
  8.0   4.2e5
  10.0  6.5e5
END

MAP main_shaft_loss_map columns=speed,loss_torque
  450.0   2.0
  2500.0  20.0
  5200.0  82.0
  7200.0  145.0
END

MAP start_shaft_loss_map columns=speed,loss_torque
  0.0     0.0
  500.0   3.0
  1800.0  18.0
  2500.0  32.0
END

# ----------------------------------------------------------------------
# Transient schedules and restart-state profiles
# ----------------------------------------------------------------------
SCHEDULE tank_pressure_profile columns=time,value units=s,Pa
  0.0    1.35e6
  90.0   1.24e6
  210.0  1.10e6
  520.0  1.05e6
  650.0  9.70e5
  900.0  9.20e5
END

SCHEDULE tank_temperature_profile columns=time,value units=s,K
  0.0    22.5
  210.0  25.0
  520.0  27.0
  900.0  29.0
END

SCHEDULE tank_para_fraction_profile columns=time,value
  0.0    0.998
  210.0  0.985
  520.0  0.970
  900.0  0.960
END

SCHEDULE para_equilibrium_profile columns=time,value
  0.0    0.998
  90.0   0.920
  210.0  0.880
  520.0  0.900
  650.0  0.870
  900.0  0.940
END

SCHEDULE tank_isolation_cv columns=time,value
  0.0    0.00
  2.0    0.10
  6.0    0.55
  12.0   1.00
  210.0  1.00
  225.0  0.00
  520.0  0.00
  530.0  0.60
  545.0  1.00
  900.0  0.00
END

SCHEDULE boost_pump_speed_profile columns=time,value units=s,rpm
  0.0    0.0
  1.0    250.0
  6.0    1400.0
  18.0   2200.0
  90.0   1800.0
  225.0  0.0
  520.0  0.0
  540.0  1800.0
  650.0  1600.0
  900.0  0.0
END

SCHEDULE start_motor_command columns=time,value
  0.0    1.0
  28.0   0.0
  520.0  1.0
  555.0  0.0
  900.0  0.0
END

SCHEDULE core_power_profile columns=time,value units=s,W
  0.0    0.0
  8.0    1.0e6
  25.0   6.0e7
  90.0   3.5e8
  210.0  3.5e8
  260.0  2.5e7
  520.0  1.5e7
  650.0  2.5e8
  760.0  2.5e8
  900.0  5.0e7
END

SCHEDULE decay_heat_proxy_profile columns=time,value units=s,W
  0.0    0.0
  210.0  1.8e7
  320.0  1.0e7
  520.0  4.0e6
  650.0  1.2e7
  900.0  2.5e6
END

SCHEDULE iodine_inventory_proxy_profile columns=time,value units=s,arb
  0.0    0.00
  25.0   0.10
  90.0   0.38
  210.0  0.84
  320.0  0.92
  520.0  0.70
  650.0  0.78
  760.0  0.72
  900.0  0.42
END

SCHEDULE xenon_inventory_proxy_profile columns=time,value units=s,arb
  0.0    0.00
  25.0   0.02
  90.0   0.12
  210.0  0.45
  320.0  0.74
  520.0  0.88
  650.0  0.58
  760.0  0.46
  900.0  0.35
END

SCHEDULE xenon_poison_worth_profile columns=time,value units=s,delta_k_over_k
  0.0    0.000
  25.0  -0.001
  90.0  -0.002
  210.0 -0.006
  320.0 -0.010
  520.0 -0.012
  650.0 -0.007
  760.0 -0.005
  900.0 -0.004
END

SCHEDULE poisoned_reactivity_margin_profile columns=time,value units=s,delta_k_over_k
  0.0    0.020
  25.0   0.015
  90.0   0.009
  210.0  0.006
  320.0  0.002
  520.0  0.001
  650.0  0.006
  760.0  0.008
  900.0  0.012
END

SCHEDULE xenon_restart_memory_profile columns=time,value
  0.0    fresh
  90.0   accumulating
  210.0  shutdown_growth
  320.0  post_shutdown_peak
  520.0  restart_penalty
  650.0  burnout_recovery
  900.0  cooled_down
END

SCHEDULE reflector_heat_proxy_profile columns=time,value units=s,W
  0.0    0.0
  90.0   1.5e6
  210.0  1.5e6
  520.0  2.0e5
  650.0  1.0e6
  900.0  1.0e5
END

SCHEDULE shield_tank_heat_leak_profile columns=time,value units=s,W
  0.0    1.0e2
  90.0   3.5e3
  210.0  3.5e3
  520.0  7.5e2
  650.0  2.8e3
  900.0  4.0e2
END

SCHEDULE control_drum_angle_profile columns=time,value units=s,deg
  0.0    0.0
  8.0    15.0
  25.0   55.0
  90.0   92.0
  210.0  92.0
  235.0  0.0
  520.0  10.0
  560.0  70.0
  650.0  86.0
  900.0  0.0
END

SCHEDULE control_drum_worth_profile columns=time,value units=s,delta_k_over_k
  0.0    -0.080
  25.0   -0.020
  90.0    0.000
  210.0   0.000
  235.0  -0.080
  520.0  -0.060
  650.0  -0.010
  900.0  -0.080
END

SCHEDULE aux_poison_insertion_profile columns=time,value
  0.0    0.00
  210.0  0.00
  235.0  0.35
  520.0  0.35
  560.0  0.12
  650.0  0.00
  900.0  0.35
END

SCHEDULE aux_poison_worth_profile columns=time,value units=s,delta_k_over_k
  0.0    0.000
  235.0 -0.012
  520.0 -0.012
  560.0 -0.004
  650.0  0.000
  900.0 -0.012
END

SCHEDULE regen_heat_pickup_profile columns=time,value units=s,W
  0.0    0.0
  25.0   8.0e5
  90.0   4.5e6
  210.0  4.5e6
  520.0  4.0e5
  650.0  3.4e6
  900.0  6.0e5
END

SCHEDULE turbine_tap_fraction_profile columns=time,value
  0.0    0.00
  10.0   0.02
  35.0   0.055
  90.0   0.050
  210.0  0.050
  520.0  0.000
  560.0  0.045
  650.0  0.040
  900.0  0.000
END

SCHEDULE main_pump_efficiency_profile columns=time,value
  0.0    0.20
  25.0   0.55
  90.0   0.70
  210.0  0.68
  520.0  0.20
  650.0  0.64
  900.0  0.20
END

SCHEDULE boost_pump_efficiency_profile columns=time,value
  0.0    0.10
  6.0    0.40
  18.0   0.56
  90.0   0.50
  520.0  0.10
  650.0  0.45
  900.0  0.10
END

SCHEDULE turbine_efficiency_profile columns=time,value
  0.0    0.20
  25.0   0.60
  90.0   0.71
  210.0  0.69
  520.0  0.20
  650.0  0.66
  900.0  0.20
END

SCHEDULE shaft_speed_guess_profile columns=time,value units=s,rpm
  0.0    450.0
  90.0   5200.0
  210.0  5200.0
  520.0  450.0
  650.0  4800.0
  900.0  450.0
END

SCHEDULE chamber_pressure_target_profile columns=time,value units=s,Pa
  0.0    2.0e5
  90.0   5.0e6
  210.0  5.0e6
  520.0  2.0e5
  650.0  4.2e6
  900.0  2.0e5
END

SCHEDULE core_axial_shape_profile columns=position,value
  0.00   0.45
  0.20   0.85
  0.50   1.18
  0.80   0.92
  1.00   0.50
END

SCHEDULE core_radial_peaking_profile columns=radius_fraction,value
  0.00   1.05
  0.35   1.10
  0.70   0.98
  1.00   0.72
END

SCHEDULE channel_group_power_shape_profile columns=group,value
  inner   1.10
  mid     1.02
  outer   0.88
  bypass  0.20
END

SCHEDULE channel_group_flow_split_profile columns=group,value
  inner   0.30
  mid     0.42
  outer   0.25
  bypass  0.03
END

SCHEDULE channel_representative_flow_profile columns=time,value units=s,kg_per_s
  0.0    0.0
  25.0   3.0
  90.0   8.0
  210.0  8.0
  260.0  1.5
  520.0  0.0
  650.0  6.5
  760.0  6.5
  900.0  0.0
END

SCHEDULE channel_hydraulic_diameter_profile columns=group,value units=group,m
  inner   0.0032
  mid     0.0035
  outer   0.0038
  bypass  0.0060
END

SCHEDULE channel_heated_length_profile columns=group,value units=group,m
  inner   0.850
  mid     0.850
  outer   0.850
  bypass  0.650
END

SCHEDULE ledinegg_margin_profile columns=time,value
  0.0    1.00
  25.0   0.72
  90.0   0.42
  210.0  0.40
  260.0  0.68
  520.0  0.95
  650.0  0.48
  760.0  0.52
  900.0  1.00
END

SCHEDULE ledinegg_status_profile columns=time,value
  0.0    nominal
  25.0   nominal
  90.0   nominal
  210.0  nominal
  260.0  recovering
  520.0  reset
  650.0  watch
  760.0  watch
  900.0  nominal
END

SCHEDULE tvc_pitch_command_profile columns=time,value units=s,deg
  0.0    0.00
  120.0  0.00
  135.0  1.50
  150.0 -1.00
  165.0  0.00
  540.0  0.00
  565.0 -1.25
  590.0  0.75
  620.0  0.00
  900.0  0.00
END

SCHEDULE tvc_yaw_command_profile columns=time,value units=s,deg
  0.0    0.00
  120.0  0.00
  135.0 -0.75
  150.0  1.25
  165.0  0.00
  540.0  0.00
  565.0  1.00
  590.0 -0.50
  620.0  0.00
  900.0  0.00
END

SCHEDULE tvc_pitch_response_profile columns=time,value units=s,deg
  0.0    0.00
  122.0  0.00
  137.0  1.42
  152.0 -0.92
  167.0  0.00
  542.0  0.00
  567.0 -1.18
  592.0  0.70
  622.0  0.00
  900.0  0.00
END

SCHEDULE tvc_yaw_response_profile columns=time,value units=s,deg
  0.0    0.00
  122.0  0.00
  137.0 -0.70
  152.0  1.15
  167.0  0.00
  542.0  0.00
  567.0  0.94
  592.0 -0.46
  622.0  0.00
  900.0  0.00
END

SCHEDULE tvc_gimbal_rate_command_profile columns=time,value units=s,deg_per_s
  0.0    0.00
  130.0  0.35
  150.0  0.42
  165.0  0.00
  560.0  0.38
  590.0  0.30
  620.0  0.00
  900.0  0.00
END

SCHEDULE tvc_pitch_rate_profile columns=time,value units=s,deg_per_s
  0.0    0.00
  130.0  0.32
  150.0  0.39
  165.0  0.00
  560.0  0.35
  590.0  0.28
  620.0  0.00
  900.0  0.00
END

SCHEDULE tvc_yaw_rate_profile columns=time,value units=s,deg_per_s
  0.0    0.00
  130.0  0.28
  150.0  0.36
  165.0  0.00
  560.0  0.33
  590.0  0.25
  620.0  0.00
  900.0  0.00
END

SCHEDULE tvc_authority_limit_profile columns=time,value units=s,deg
  0.0    0.00
  90.0   3.00
  210.0  3.00
  520.0  0.00
  650.0  2.50
  900.0  0.00
END

SCHEDULE tvc_bleed_valve_cv_profile columns=time,value
  0.0    0.000
  120.0  0.000
  135.0  0.030
  150.0  0.045
  165.0  0.000
  540.0  0.000
  565.0  0.035
  590.0  0.030
  620.0  0.000
  900.0  0.000
END

SCHEDULE tvc_parasitic_bleed_flow_profile columns=time,value units=s,kg_per_s
  0.0    0.000
  120.0  0.000
  135.0  0.045
  150.0  0.070
  165.0  0.000
  540.0  0.000
  565.0  0.055
  590.0  0.045
  620.0  0.000
  900.0  0.000
END

SCHEDULE tvc_hydraulic_power_profile columns=time,value units=s,W
  0.0    0.0
  120.0  0.0
  135.0  4.0e4
  150.0  7.5e4
  165.0  0.0
  540.0  0.0
  565.0  5.5e4
  590.0  4.2e4
  620.0  0.0
  900.0  0.0
END

SCHEDULE tvc_hydraulic_power_demand_profile columns=time,value units=s,W
  0.0    0.0
  120.0  0.0
  135.0  3.6e4
  150.0  7.1e4
  165.0  0.0
  540.0  0.0
  565.0  5.0e4
  590.0  3.8e4
  620.0  0.0
  900.0  0.0
END

SCHEDULE tvc_hydraulic_pressure_profile columns=time,value units=s,Pa
  0.0    0.0
  120.0  0.0
  135.0  1.6e7
  150.0  2.1e7
  165.0  5.0e6
  540.0  0.0
  565.0  1.9e7
  590.0  1.7e7
  620.0  5.0e6
  900.0  0.0
END

SCHEDULE tvc_hydraulic_return_pressure_profile columns=time,value units=s,Pa
  0.0    0.0
  120.0  0.0
  135.0  2.5e6
  150.0  3.0e6
  165.0  1.0e6
  540.0  0.0
  565.0  2.8e6
  590.0  2.4e6
  620.0  1.0e6
  900.0  0.0
END

SCHEDULE tvc_accumulator_energy_profile columns=time,value units=s,J
  0.0    0.0
  120.0  1.5e4
  135.0  1.2e4
  150.0  8.0e3
  165.0  1.4e4
  540.0  1.0e4
  565.0  7.0e3
  590.0  8.5e3
  620.0  1.1e4
  900.0  0.0
END

SCHEDULE tvc_accumulator_draw_profile columns=time,value units=s,W
  0.0    0.0
  135.0  8.0e3
  150.0  1.2e4
  165.0  0.0
  565.0  9.0e3
  590.0  7.0e3
  620.0  0.0
  900.0  0.0
END

SCHEDULE tvc_torque_demand_profile columns=time,value units=s,N_m
  0.0    0.0
  120.0  0.0
  135.0  1.2e5
  150.0  1.8e5
  165.0  0.0
  540.0  0.0
  565.0  1.5e5
  590.0  1.1e5
  620.0  0.0
  900.0  0.0
END

SCHEDULE tvc_structural_torque_profile columns=time,value units=s,N_m
  0.0    0.0
  120.0  0.0
  135.0  1.4e5
  150.0  2.1e5
  165.0  0.0
  540.0  0.0
  565.0  1.7e5
  590.0  1.3e5
  620.0  0.0
  900.0  0.0
END

SCHEDULE tvc_slew_rate_limit_profile columns=time,value units=s,deg_per_s
  0.0    0.00
  90.0   0.50
  210.0  0.50
  520.0  0.00
  650.0  0.45
  900.0  0.00
END

SCHEDULE tvc_nozzle_efficiency_penalty_profile columns=time,value
  0.0    0.0000
  120.0  0.0000
  135.0  0.0015
  150.0  0.0025
  165.0  0.0000
  540.0  0.0000
  565.0  0.0020
  590.0  0.0015
  620.0  0.0000
  900.0  0.0000
END

# ----------------------------------------------------------------------
# Initial conditions
# ----------------------------------------------------------------------
INITIAL_CONDITION n_lh2_tank_outlet      pressure=1.35e6 temperature=22.5
INITIAL_CONDITION n_turbopump_inlet      pressure=1.20e6 temperature=23.0
INITIAL_CONDITION n_turbopump_discharge  pressure=1.30e6 temperature=24.0
INITIAL_CONDITION n_regen_exit           pressure=1.10e6 temperature=80.0
INITIAL_CONDITION n_core_inlet_plenum    pressure=1.00e6 temperature=110.0
INITIAL_CONDITION n_core_exit_plenum     pressure=2.50e5 temperature=650.0
INITIAL_CONDITION n_chamber              pressure=2.00e5 temperature=650.0
INITIAL_CONDITION n_nozzle_exit          pressure=1.50e5 temperature=620.0

# ----------------------------------------------------------------------
# Requested outputs
# ----------------------------------------------------------------------
OUTPUT time_history name=tank_pressure target=lh2_supply_tank.pressure interval=0.25
OUTPUT time_history name=para_fraction target=ortho_para_converter.equilibrium interval=0.25
OUTPUT time_history name=boost_pump_speed target=boost_pump.speed interval=0.25
OUTPUT time_history name=main_pump_mdot target=main_turbopump.mass_flow interval=0.25
OUTPUT time_history name=shaft_speed target=main_turbomachinery_shaft.speed interval=0.25
OUTPUT time_history name=core_power target=reactor_core.power interval=0.25
OUTPUT time_history name=channel_representative_flow target=core_channel_bundle.representative_flow interval=0.25
OUTPUT time_history name=channel_group_power_shape target=core_channel_bundle.group_power_shape interval=0.25
OUTPUT time_history name=channel_group_flow_split target=core_channel_bundle.group_flow_split interval=0.25
OUTPUT time_history name=decay_heat target=decay_heat_model.thermal_power interval=0.25
OUTPUT time_history name=iodine_inventory target=fission_product_poisoning.i135_inventory interval=0.25
OUTPUT time_history name=xenon_inventory target=fission_product_poisoning.xe135_inventory interval=0.25
OUTPUT time_history name=xenon_poison_worth target=fission_product_poisoning.net_worth interval=0.25
OUTPUT time_history name=poisoned_reactivity_margin target=fission_product_poisoning.reactivity_margin interval=0.25
OUTPUT time_history name=control_drum_angle target=control_drum_bank.angle interval=0.25
OUTPUT time_history name=aux_poison_insertion target=auxiliary_poison_bank.insertion interval=0.25
OUTPUT time_history name=shield_tank_heat target=internal_shield.heat_leak interval=0.25
OUTPUT time_history name=reflector_gamma_heat target=reflector_gamma_heating.thermal_power interval=0.25
OUTPUT time_history name=core_exit_temperature target=n_core_exit_plenum.temperature interval=0.25
OUTPUT time_history name=ledinegg_margin target=ledinegg_instability_switch.margin interval=0.25
OUTPUT time_history name=ledinegg_status target=ledinegg_instability_switch.status interval=0.25
OUTPUT time_history name=chamber_pressure target=thrust_chamber.pressure interval=0.25
OUTPUT time_history name=nozzle_mass_flow target=bell_nozzle.mass_flow interval=0.25
OUTPUT time_history name=thrust_proxy target=bell_nozzle.ideal_thrust interval=0.25
OUTPUT time_history name=tvc_pitch_angle target=nozzle_gimbal_joint.pitch_angle interval=0.25
OUTPUT time_history name=tvc_yaw_angle target=nozzle_gimbal_joint.yaw_angle interval=0.25
OUTPUT time_history name=tvc_torque_demand target=tvc_actuator_ring.torque_demand interval=0.25
OUTPUT time_history name=tvc_hydraulic_pressure target=tvc_hydraulic_power_unit.pressure_supply interval=0.25
OUTPUT time_history name=tvc_parasitic_bleed_flow target=tvc_hot_gas_bleed_valve.mass_flow interval=0.25
OUTPUT time_history name=tvc_nozzle_efficiency_penalty target=bell_nozzle.tvc_efficiency_penalty interval=0.25
OUTPUT snapshot name=mission_sequence at=0.0,90.0,210.0,520.0,650.0,900.0

END_CASE
