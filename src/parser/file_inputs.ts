
export const inputFiles = {

    mcnp:
        "\n" +
        "\n" +
        "C ======================================================================\n" +
        "C ADVANCED PARSER FIXTURE: MCNP-LIKE NTP ENGINE INPUT\n" +
        "C Companion to: ntp_rocet.inp\n" +
        "C Target file:   ntp_mcnp.inp\n" +
        "C\n" +
        "C Purpose:\n" +
        "C   Non-operational neutronics / radiation-transport companion deck for\n" +
        "C   the ntp-sys-console visualization and parser baseline.  The geometry\n" +
        "C   mirrors the ROCETS-like engine network: LH2 tank outlet, boost pump,\n" +
        "C   main turbopump, regenerative jacket, spin-state conditioning, reactor\n" +
        "C   package, turbine tap, thrust chamber, and bell nozzle.\n" +
        "C\n" +
        "C Posture:\n" +
        "C   - Synthetic parser fixture only.\n" +
        "C   - No validated criticality, shielding, performance, or design claim.\n" +
        "C   - No KCODE criticality run is defined; this is a fixed-source deck.\n" +
        "C   - Values are compact demonstration numbers for import testing.\n" +
        "C\n" +
        "C Advanced mapping included from ntp_rocet.inp:\n" +
        "C   - internal_shield heat-leak / dose proxy\n" +
        "C   - six-group point-kinetics counterpart comments\n" +
        "C   - iodine/xenon restart-memory proxy metadata\n" +
        "C   - reflector gamma-heating tally proxy\n" +
        "C   - control drums and auxiliary poison bank regions\n" +
        "C   - three axial fueled regions plus six azimuthal channel sectors\n" +
        "C   - Ledinegg/channel-instability switch mapping comments\n" +
        "C   - turbine branch, mixer, chamber, nozzle, and thrust proxy tallies\n" +
        "C ======================================================================\n" +
        "\n" +
        "C ======================================================================\n" +
        "C CELL CARDS\n" +
        "C ======================================================================\n" +
        "C cell  mat  density       geometry                         importance\n" +
        "C\n" +
        "C --- Feed system: lh2_supply_tank -> boost_pump -> turbopump ----------\n" +
        "1      1   -7.000E-02     -101 300 -301                    imp:n=1\n" +
        "C      $ lh2_supply_tank_proxy; ROCETS BOUNDARY lh2_supply_tank\n" +
        "2      1   -6.800E-02     -102 301 -302                    imp:n=1\n" +
        "C      $ tank_isolation_valve_hydrogen\n" +
        "3      4   -7.850E+00      102 -103 301 -302               imp:n=1\n" +
        "C      $ tank_isolation_valve_body\n" +
        "4      1   -6.400E-02     -104 302 -303                    imp:n=1\n" +
        "C      $ boost_pump_hydrogen; ROCETS COMPONENT boost_pump\n" +
        "5      4   -7.850E+00      104 -105 302 -303               imp:n=1\n" +
        "C      $ boost_pump_casing_and_motor_mount\n" +
        "6      8   -2.700E+00      125 -126 302 -303               imp:n=1\n" +
        "C      $ electric_start_motor_proxy_structure\n" +
        "7      1   -6.000E-02     -106 303 -304                    imp:n=1\n" +
        "C      $ main_turbopump_hydrogen\n" +
        "8      4   -7.850E+00      106 -107 303 -304               imp:n=1\n" +
        "C      $ main_turbopump_casing\n" +
        "9      4   -7.850E+00      127 -128 302 -307               imp:n=1\n" +
        "C      $ main_turbomachinery_shaft_proxy\n" +
        "10     1   -5.500E-02     -102 304 -305                    imp:n=1\n" +
        "C      $ discharge_manifold_hydrogen\n" +
        "11     4   -7.850E+00      102 -103 304 -305               imp:n=1\n" +
        "C      $ discharge_manifold_wall\n" +
        "\n" +
        "C --- Regenerative jacket and spin-isomer conditioner -------------------\n" +
        "12     1   -4.400E-02      115 -116 305 -309               imp:n=1\n" +
        "C      $ nozzle_regen_jacket_cold_side_hydrogen\n" +
        "13     5   -8.200E+00      116 -117 305 -309               imp:n=1\n" +
        "C      $ nozzle_regen_jacket_channel_land_and_wall\n" +
        "14     9   -2.250E+00      102 -129 309 -310               imp:n=1\n" +
        "C      $ ortho_para_converter_bed_proxy\n" +
        "15     1   -4.000E-02     -102 310 -311                    imp:n=1\n" +
        "C      $ core_inlet_line_hydrogen\n" +
        "16     5   -8.200E+00      117 -118 307 -318               imp:n=1\n" +
        "C      $ nozzle_wall_thermal_proxy\n" +
        "\n" +
        "C --- Forward shield, inlet plenum, reflector, drums, poison -----------\n" +
        "17     7   -9.500E+00     -111 304 -305                    imp:n=1\n" +
        "C      $ internal_shield_forward_shadow_region\n" +
        "18     1   -5.000E-02     -108 311 -312                    imp:n=1\n" +
        "C      $ n_core_inlet_plenum\n" +
        "19     3   -1.700E+00      108 -109 311 -316               imp:n=1\n" +
        "C      $ reactor_reflector_graphite_composite_annulus\n" +
        "20     6   -8.500E+00      109 -110 312 -315               imp:n=1\n" +
        "C      $ control_drum_bank_absorber_band_12_drum_proxy\n" +
        "21     10  -6.800E+00      110 -130 312 -315               imp:n=1\n" +
        "C      $ auxiliary_poison_bank_restart_hold_down_proxy\n" +
        "22     4   -7.850E+00      130 -111 311 -316               imp:n=1\n" +
        "C      $ reactor_pressure_vessel_and_barrel\n" +
        "\n" +
        "C --- Active core: axial x azimuthal channel-sector parser regions ------\n" +
        "23     2   -3.000E+00     -108 312 -313 401                imp:n=1\n" +
        "C      $ core_A_sector_1; low axial power; channel bundle proxy\n" +
        "24     2   -3.000E+00     -108 312 -313 402                imp:n=1\n" +
        "C      $ core_A_sector_2\n" +
        "25     2   -3.000E+00     -108 312 -313 403                imp:n=1\n" +
        "C      $ core_A_sector_3\n" +
        "26     2   -3.000E+00     -108 312 -313 404                imp:n=1\n" +
        "C      $ core_A_sector_4\n" +
        "27     2   -3.000E+00     -108 312 -313 405                imp:n=1\n" +
        "C      $ core_A_sector_5\n" +
        "28     2   -3.000E+00     -108 312 -313 406                imp:n=1\n" +
        "C      $ core_A_sector_6\n" +
        "29     2   -3.000E+00     -108 313 -314 401                imp:n=1\n" +
        "C      $ core_B_sector_1; central high-power region\n" +
        "30     2   -3.000E+00     -108 313 -314 402                imp:n=1\n" +
        "C      $ core_B_sector_2\n" +
        "31     2   -3.000E+00     -108 313 -314 403                imp:n=1\n" +
        "C      $ core_B_sector_3\n" +
        "32     2   -3.000E+00     -108 313 -314 404                imp:n=1\n" +
        "C      $ core_B_sector_4\n" +
        "33     2   -3.000E+00     -108 313 -314 405                imp:n=1\n" +
        "C      $ core_B_sector_5\n" +
        "34     2   -3.000E+00     -108 313 -314 406                imp:n=1\n" +
        "C      $ core_B_sector_6\n" +
        "35     2   -3.000E+00     -108 314 -315 401                imp:n=1\n" +
        "C      $ core_C_sector_1; outlet-side fueled region\n" +
        "36     2   -3.000E+00     -108 314 -315 402                imp:n=1\n" +
        "C      $ core_C_sector_2\n" +
        "37     2   -3.000E+00     -108 314 -315 403                imp:n=1\n" +
        "C      $ core_C_sector_3\n" +
        "38     2   -3.000E+00     -108 314 -315 404                imp:n=1\n" +
        "C      $ core_C_sector_4\n" +
        "39     2   -3.000E+00     -108 314 -315 405                imp:n=1\n" +
        "C      $ core_C_sector_5\n" +
        "40     2   -3.000E+00     -108 314 -315 406                imp:n=1\n" +
        "C      $ core_C_sector_6\n" +
        "41     11  -1.850E+00     -131 312 -315                   imp:n=1\n" +
        "C      $ ledinegg_instability_switch_virtual_monitor_region\n" +
        "42     1   -2.000E-02     -108 315 -316                    imp:n=1\n" +
        "C      $ n_core_exit_plenum_hot_hydrogen\n" +
        "43     4   -7.850E+00      110 -111 316 -317               imp:n=1\n" +
        "C      $ aft_core_support_structure\n" +
        "\n" +
        "C --- Turbine tap, turbine bypass, mixer, chamber, nozzle ---------------\n" +
        "44     1   -1.600E-02     -112 316 -317                    imp:n=1\n" +
        "C      $ turbine_tap_primary_branch_to_chamber\n" +
        "45     1   -1.500E-02     -113 316 -319                    imp:n=1\n" +
        "C      $ turbine_tap_secondary_branch_to_drive_turbine\n" +
        "46     1   -1.200E-02     -113 319 -320                    imp:n=1\n" +
        "C      $ drive_turbine_working_gas\n" +
        "47     4   -7.850E+00      113 -114 319 -320               imp:n=1\n" +
        "C      $ drive_turbine_casing\n" +
        "48     1   -1.300E-02     -112 317 -321                    imp:n=1\n" +
        "C      $ turbine_exhaust_mixer_hot_hydrogen\n" +
        "49     1   -1.000E-02     -119 321 -322                    imp:n=1\n" +
        "C      $ thrust_chamber_hot_hydrogen\n" +
        "50     5   -8.200E+00      119 -120 321 -322               imp:n=1\n" +
        "C      $ thrust_chamber_liner_wall\n" +
        "51     1   -8.000E-03     -121 322 -323                    imp:n=1\n" +
        "C      $ bell_nozzle_throat_hydrogen\n" +
        "52     1   -6.000E-03     -122 323 -325                    imp:n=1\n" +
        "C      $ bell_nozzle_divergent_hydrogen\n" +
        "53     5   -8.200E+00      122 -123 323 -325               imp:n=1\n" +
        "C      $ bell_nozzle_wall_and_skirt\n" +
        "54     0                 -124 325 -326                     imp:n=0\n" +
        "C      $ space_ambient_pressure_sink_proxy\n" +
        "99     0                  111 : 123 : -300 : 326           imp:n=0\n" +
        "C      $ exterior_void_graveyard\n" +
        "\n" +
        "C ======================================================================\n" +
        "C SURFACE CARDS\n" +
        "C ======================================================================\n" +
        "C surface  type  parameters\n" +
        "C\n" +
        "C Feed radii.\n" +
        "101    cz   0.260     $ lh2_supply_proxy_radius\n" +
        "102    cz   0.050     $ feed_line_inner_radius\n" +
        "103    cz   0.065     $ feed_line_outer_radius\n" +
        "104    cz   0.115     $ boost_pump_flow_radius\n" +
        "105    cz   0.220     $ boost_pump_case_radius\n" +
        "106    cz   0.140     $ main_turbopump_flow_radius\n" +
        "107    cz   0.260     $ main_turbopump_case_radius\n" +
        "C\n" +
        "C Reactor radii.\n" +
        "108    cz   0.460     $ active_core_outer_radius\n" +
        "109    cz   0.620     $ reflector_outer_radius\n" +
        "110    cz   0.720     $ control_drum_band_outer_radius\n" +
        "111    cz   0.840     $ vessel_outer_radius\n" +
        "130    cz   0.760     $ auxiliary_poison_bank_outer_radius\n" +
        "131    cz   0.080     $ ledinegg_monitor_virtual_radius\n" +
        "C\n" +
        "C Turbine and nozzle radii.\n" +
        "112    cz   0.145     $ primary_hot_gas_branch_radius\n" +
        "113    cz   0.110     $ turbine_secondary_branch_radius\n" +
        "114    cz   0.250     $ turbine_casing_outer_radius\n" +
        "115    cz   0.500     $ regen_coolant_inner_radius\n" +
        "116    cz   0.560     $ regen_coolant_outer_radius\n" +
        "117    cz   0.620     $ regen_wall_outer_radius\n" +
        "118    cz   0.700     $ nozzle_wall_proxy_outer_radius\n" +
        "119    cz   0.400     $ chamber_gas_radius\n" +
        "120    cz   0.500     $ chamber_wall_outer_radius\n" +
        "121    cz   0.200     $ throat_radius\n" +
        "122    cz   0.720     $ divergent_nozzle_gas_radius\n" +
        "123    cz   0.920     $ bell_skirt_outer_radius\n" +
        "124    cz   1.200     $ ambient_sink_radius\n" +
        "125    cz   0.270     $ electric_motor_inner_radius\n" +
        "126    cz   0.360     $ electric_motor_outer_radius\n" +
        "127    cz   0.030     $ shaft_inner_radius\n" +
        "128    cz   0.045     $ shaft_outer_radius\n" +
        "129    cz   0.095     $ spin_converter_bed_radius\n" +
        "C\n" +
        "C Axial stations mirror the ntp_rocet.inp node order.\n" +
        "300    pz  -1.700     $ z_tank_proxy_start\n" +
        "301    pz  -1.300     $ z_tank_isolation_valve\n" +
        "302    pz  -1.050     $ z_boost_pump_start\n" +
        "303    pz  -0.750     $ z_main_turbopump_start\n" +
        "304    pz  -0.400     $ z_turbopump_discharge\n" +
        "305    pz  -0.050     $ z_regen_inlet\n" +
        "307    pz   0.150     $ z_nozzle_wall_proxy_start\n" +
        "309    pz   0.300     $ z_regen_exit\n" +
        "310    pz   0.430     $ z_ortho_para_converter_exit\n" +
        "311    pz   0.550     $ z_core_inlet_plenum\n" +
        "312    pz   0.750     $ z_active_core_start\n" +
        "313    pz   1.150     $ z_core_A_to_B\n" +
        "314    pz   1.550     $ z_core_B_to_C\n" +
        "315    pz   1.950     $ z_active_core_end\n" +
        "316    pz   2.150     $ z_core_exit_plenum\n" +
        "317    pz   2.350     $ z_primary_tap_to_chamber\n" +
        "318    pz   2.650     $ z_nozzle_wall_proxy_end\n" +
        "319    pz   2.420     $ z_turbine_inlet\n" +
        "320    pz   2.750     $ z_turbine_exit\n" +
        "321    pz   2.950     $ z_mixer_to_chamber\n" +
        "322    pz   3.200     $ z_chamber_exit\n" +
        "323    pz   3.350     $ z_nozzle_throat\n" +
        "325    pz   4.200     $ z_nozzle_exit\n" +
        "326    pz   4.650     $ z_ambient_sink_end\n" +
        "C\n" +
        "C Azimuthal wedge planes for multi-channel parser coverage.\n" +
        "401    px   0.000     $ sector_1_half_space\n" +
        "402    py   0.000     $ sector_2_half_space\n" +
        "403    p    0.866  0.500 0 0.000  $ sector_3_plane\n" +
        "404    p   -0.866  0.500 0 0.000  $ sector_4_plane\n" +
        "405    p    0.500 -0.866 0 0.000  $ sector_5_plane\n" +
        "406    p   -0.500 -0.866 0 0.000  $ sector_6_plane\n" +
        "\n" +
        "C ======================================================================\n" +
        "C DATA CARDS\n" +
        "C ======================================================================\n" +
        "MODE N\n" +
        "\n" +
        "C --- Materials ---------------------------------------------------------\n" +
        "C Material vectors are placeholder parser fixtures.  They preserve domain\n" +
        "C semantics without claiming validated material specifications.\n" +
        "M1     1001.70c  1.000\n" +
        "C      $ hydrogen_placeholder; lh2/hot_h2 flow regions\n" +
        "M2     92235.70c 0.050  92238.70c 0.200  6000.70c 0.750\n" +
        "C      $ fuel_graphite_composite_placeholder\n" +
        "M3     6000.70c  1.000\n" +
        "C      $ graphite_reflector_placeholder\n" +
        "M4     26000.70c 0.700  24000.70c 0.200  28000.70c 0.100\n" +
        "C      $ stainless_or_inconel_structure_placeholder\n" +
        "M5     40000.70c 0.700  6000.70c 0.200  74182.70c 0.100\n" +
        "C      $ refractory_nozzle_wall_placeholder\n" +
        "M6     5010.70c  0.200  5011.70c 0.800\n" +
        "C      $ boron_absorber_control_drum_placeholder\n" +
        "M7     74000.70c 0.700  1001.70c 0.100  5010.70c 0.200\n" +
        "C      $ internal_shadow_shield_placeholder\n" +
        "M8     13027.70c 1.000\n" +
        "C      $ electric_motor_aluminum_proxy\n" +
        "M9     6000.70c  0.900  26000.70c 0.100\n" +
        "C      $ spin_isomer_converter_bed_proxy\n" +
        "M10    5010.70c  0.600  26000.70c 0.400\n" +
        "C      $ auxiliary_poison_bank_proxy\n" +
        "M11    1001.70c  0.500  6000.70c 0.500\n" +
        "C      $ virtual_channel_stability_monitor_proxy\n" +
        "\n" +
        "C --- Fixed source proxy ------------------------------------------------\n" +
        "C Central active-core source used only for parser and tally examples.\n" +
        "SDEF POS=0 0 1.350 RAD=d1 AXS=0 0 1 EXT=d2 PAR=N ERG=d3\n" +
        "SI1  0.000 0.460\n" +
        "SP1  0.000 1.000\n" +
        "SI2  0.750 1.950\n" +
        "SP2  0.200 0.600 0.200\n" +
        "SI3  L 2.00E+06 1.00E+06 5.00E+05 1.00E+05 2.50E+04 1.00E+00\n" +
        "SP3  D 0.20     0.25     0.20     0.18     0.12     0.05\n" +
        "\n" +
        "C --- Tallies -----------------------------------------------------------\n" +
        "F4:N    23 24 25 26 27 28\n" +
        "C       $ core_axial_segment_A_flux_proxy\n" +
        "F14:N   29 30 31 32 33 34\n" +
        "C       $ core_axial_segment_B_flux_proxy\n" +
        "F24:N   35 36 37 38 39 40\n" +
        "C       $ core_axial_segment_C_flux_proxy\n" +
        "F34:N   19 20 21 22\n" +
        "C       $ reflector_control_poison_vessel_flux_proxy\n" +
        "F44:N   17\n" +
        "C       $ internal_shield_flux_proxy\n" +
        "F54:N   12 13 16 49 50 51 52 53\n" +
        "C       $ regen_chamber_nozzle_wall_flux_proxy\n" +
        "F64:N   1 2 4 7 10 14 15\n" +
        "C       $ cold_feed_and_core_inlet_hydrogen_flux_proxy\n" +
        "F74:N   42 44 45 46 48 49 51 52\n" +
        "C       $ hot_hydrogen_turbine_chamber_nozzle_flux_proxy\n" +
        "F84:N   41\n" +
        "C       $ ledinegg_virtual_channel_monitor_flux_proxy\n" +
        "F94:N   20 21\n" +
        "C       $ control_drum_and_aux_poison_flux_proxy\n" +
        "\n" +
        "C Gamma / heat-deposition style parser proxies; kept comment-adjacent so\n" +
        "C the app can classify reflector heating without requiring a photon deck.\n" +
        "FM34    1.0\n" +
        "FM44    1.0\n" +
        "FM54    1.0\n" +
        "FM84    1.0\n" +
        "FM94    1.0\n" +
        "\n" +
        "C --- Problem controls --------------------------------------------------\n" +
        "NPS     50000\n" +
        "PRINT   60\n" +
        "\n" +
        "C ======================================================================\n" +
        "C APP / PARSER METADATA\n" +
        "C ======================================================================\n" +
        "C META case_id=advanced-ntp-mcnp-003\n" +
        "C META companion_input=ntp_rocet.inp\n" +
        "C META fixture_family=mcnp_like\n" +
        "C META validation_level=syntactic_fixture_only\n" +
        "C META safety_posture=non_operational_synthetic_fixture\n" +
        "C META transport_mode=fixed_source_neutron_parser_fixture\n" +
        "C META criticality_posture=no_kcode_no_design_claim\n" +
        "C\n" +
        "C --- Direct component mapping to ntp_rocet.inp -------------------------\n" +
        "C MAP cell=1 component=lh2_supply_tank tag=feed panel=feed\n" +
        "C MAP cell=2 component=tank_isolation_valve tag=feed panel=feed\n" +
        "C MAP cell=4 component=boost_pump tag=feed panel=feed\n" +
        "C MAP cell=6 component=electric_start_motor tag=startup panel=feed\n" +
        "C MAP cell=7 component=main_turbopump tag=feed panel=feed\n" +
        "C MAP cell=10 component=discharge_manifold tag=feed panel=feed\n" +
        "C MAP cell=12 component=nozzle_regen_jacket tag=regen panel=thermal\n" +
        "C MAP cell=14 component=ortho_para_converter tag=regen panel=feed\n" +
        "C MAP cell=17 component=internal_shield tag=neutronics panel=thermal\n" +
        "C MAP cell=18 component=core_inlet_line tag=core panel=core\n" +
        "C MAP cell=19 component=reactor_reflector tag=neutronics panel=core\n" +
        "C MAP cell=20 component=control_drum_bank tag=neutronics panel=core\n" +
        "C MAP cell=21 component=auxiliary_poison_bank tag=neutronics panel=core\n" +
        "C MAP cells=23-40 component=reactor_core tag=core panel=core\n" +
        "C MAP cell=41 component=ledinegg_instability_switch tag=core panel=thermal\n" +
        "C MAP cell=42 component=core_exit_plenum tag=core panel=core\n" +
        "C MAP cell=44 component=turbine_tap tag=turbine panel=turbomachinery\n" +
        "C MAP cell=46 component=drive_turbine tag=turbine panel=turbomachinery\n" +
        "C MAP cell=48 component=turbine_exhaust_mixer tag=turbine panel=turbomachinery\n" +
        "C MAP cell=49 component=thrust_chamber tag=nozzle panel=nozzle\n" +
        "C MAP cells=51-53 component=bell_nozzle tag=nozzle panel=nozzle\n" +
        "C\n" +
        "C --- Kinetics / poisoning metadata ------------------------------------\n" +
        "C KINETICS component=reactor_neutronics model=six_group_lumped_proxy\n" +
        "C KINETICS control_input=control_drum_bank.net_worth\n" +
        "C KINETICS override_input=auxiliary_poison_bank.override_worth\n" +
        "C KINETICS poison_input=fission_product_poisoning.net_worth\n" +
        "C KINETICS decay_heat_schedule=decay_heat_proxy_profile\n" +
        "C POISON component=fission_product_poisoning model=i135_xe135_restart\n" +
        "C POISON iodine_schedule=iodine_inventory_proxy_profile\n" +
        "C POISON xenon_schedule=xenon_inventory_proxy_profile\n" +
        "C POISON worth_schedule=xenon_poison_worth_profile\n" +
        "C POISON restart_memory=xenon_restart_memory_profile\n" +
        "C\n" +
        "C --- Thermal / stability metadata -------------------------------------\n" +
        "C HEAT reflector_gamma_proxy_tally=F34 schedule=reflector_heat_proxy_profile\n" +
        "C HEAT shield_tank_leak_schedule=shield_tank_heat_leak_profile\n" +
        "C HEAT regen_heat_pickup_schedule=regen_heat_pickup_profile\n" +
        "C STABILITY component=ledinegg_instability_switch tally=F84\n" +
        "C STABILITY margin_schedule=ledinegg_margin_profile\n" +
        "C STABILITY status_schedule=ledinegg_status_profile\n" +
        "C STABILITY monitored_flow=main_turbopump.mass_flow\n" +
        "C STABILITY monitored_power=reactor_core.power\n" +
        "C\n" +
        "C --- Mission-phase mapping --------------------------------------------\n" +
        "C PHASE startup_ramp start=0.0 stop=90.0 mode=startup\n" +
        "C PHASE rated_burn start=90.0 stop=210.0 mode=steady_power_hold\n" +
        "C PHASE shutdown_soak start=210.0 stop=520.0 mode=decay_heat_soak\n" +
        "C PHASE restart_ramp start=520.0 stop=650.0 mode=restart_demo\n" +
        "C PHASE cooldown start=650.0 stop=900.0 mode=post_burn_cooldown\n" +
        "C\n" +
        "C --- Network graph hints ----------------------------------------------\n" +
        "C EDGE lh2_supply_tank -> tank_isolation_valve edge=feed-blue\n" +
        "C EDGE tank_isolation_valve -> boost_pump edge=feed-blue\n" +
        "C EDGE boost_pump -> main_turbopump edge=feed-blue\n" +
        "C EDGE main_turbopump -> discharge_manifold edge=feed-blue\n" +
        "C EDGE discharge_manifold -> nozzle_regen_jacket edge=regen-cyan\n" +
        "C EDGE nozzle_regen_jacket -> ortho_para_converter edge=regen-cyan\n" +
        "C EDGE ortho_para_converter -> core_inlet_line edge=core-amber\n" +
        "C EDGE core_inlet_line -> reactor_core edge=core-amber\n" +
        "C EDGE reactor_core -> core_exit_plenum edge=core-amber\n" +
        "C EDGE core_exit_plenum -> turbine_tap edge=core-amber\n" +
        "C EDGE turbine_tap -> thrust_chamber edge=nozzle-orange\n" +
        "C EDGE turbine_tap -> drive_turbine edge=turbine-red\n" +
        "C EDGE drive_turbine -> turbine_exhaust_mixer edge=turbine-red\n" +
        "C EDGE turbine_exhaust_mixer -> thrust_chamber edge=turbine-red\n" +
        "C EDGE thrust_chamber -> bell_nozzle edge=nozzle-orange\n" +
        "C EDGE bell_nozzle -> space_ambient edge=nozzle-orange\n" +
        "C\n" +
        "C --- Visualization hints ----------------------------------------------\n" +
        "C VIEW axis=z units=m theme=nasa_engineering_dark\n" +
        "C VIEW swimlanes=feed,regen,core,turbomachinery,nozzle,neutronics\n" +
        "C VIEW core_regions=18\n" +
        "C VIEW panels=overview,feed,core,thermal,turbomachinery,nozzle\n" +
        "C VIEW source_posture=synthetic_fixed_source_parser_fixture\n" +
        "C END_ADVANCED_NTP_MCNP_FIXTURE",
    rocets:
        "\n" +
        "\n" +
        "# ======================================================================\n" +
        "# ROCETS-LIKE NTP SYSTEM INPUT\n" +
        "# App target: ntp-sys-console visual workbench / parser baseline\n" +
        "# Purpose: non-operational text sample for importing a nuclear thermal\n" +
        "#          propulsion system into the app's schematic/network graphics.\n" +
        "#\n" +
        "# Fixture posture:\n" +
        "#   - Representative component names, tags, and instrumentation points.\n" +
        "#   - Parser-oriented syntax with blocks, references, schedules, maps,\n" +
        "#     inline comments, solver constraints, mission phases, and graphics\n" +
        "#     metadata.\n" +
        "#   - This is not a validated ROCETS deck and not an executable engine\n" +
        "#     design. Numeric values are synthetic parser fixtures.\n" +
        "# ======================================================================\n" +
        "\n" +
        "CASE baseline-ntp-rocets-002\n" +
        "TITLE \"NTP breadboard: LH2 feed, reactor kinetics, turbine loop, nozzle\"\n" +
        "UNITS SI\n" +
        "\n" +
        "SYSTEM_METADATA\n" +
        "  program            = ntp_sys_console\n" +
        "  vehicle_context    = upper_stage_demo\n" +
        "  fixture_family     = rocets_like\n" +
        "  fidelity           = parser_visualization_enhanced\n" +
        "  safety_posture     = non_operational_synthetic_fixture\n" +
        "  source_posture     = inspired_by_public_ntr_system_model_patterns\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Numerical controls\n" +
        "# ----------------------------------------------------------------------\n" +
        "TIME_CONTROL\n" +
        "  mode        = transient\n" +
        "  start_time  = 0.0        # s\n" +
        "  stop_time   = 900.0      # s; includes shutdown dwell and restart\n" +
        "  initial_dt  = 1.0e-3     # s\n" +
        "  max_dt      = 0.25       # s\n" +
        "  min_dt      = 1.0e-6     # s\n" +
        "END\n" +
        "\n" +
        "SOLVER_CONTROL\n" +
        "  nonlinear_solver     = newton\n" +
        "  linear_solver        = sparse_direct\n" +
        "  relative_tolerance   = 1.0e-6\n" +
        "  absolute_tolerance   = 1.0e-8\n" +
        "  max_nonlinear_iters  = 35\n" +
        "  max_time_cuts        = 12\n" +
        "  steady_init          = true\n" +
        "  mass_balance_check   = strict\n" +
        "  energy_balance_check = report\n" +
        "  reactivity_check     = bounded_fixture_only\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Fluids and pseudo-property packages\n" +
        "# ----------------------------------------------------------------------\n" +
        "FLUID lh2\n" +
        "  species        = H2\n" +
        "  phase_model    = cryogenic_real_fluid\n" +
        "  property_table = props/h2_cryo_to_superheated.tbl\n" +
        "  viscosity      = table\n" +
        "  conductivity   = table\n" +
        "  cp             = table\n" +
        "END\n" +
        "\n" +
        "FLUID hot_h2\n" +
        "  species        = H2\n" +
        "  phase_model    = high_temperature_equilibrium\n" +
        "  property_table = props/h2_hot_core_exit.tbl\n" +
        "  viscosity      = table\n" +
        "  conductivity   = table\n" +
        "  cp             = table\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Mission profile used by the app timeline\n" +
        "# ----------------------------------------------------------------------\n" +
        "MISSION_PROFILE deep_space_restart_demo\n" +
        "  description = \"startup, rated hold, shutdown soak, restart, cooldown\"\n" +
        "  phase startup_ramp\n" +
        "    start = 0.0\n" +
        "    stop  = 90.0\n" +
        "    mode  = startup\n" +
        "  END\n" +
        "  phase rated_burn\n" +
        "    start = 90.0\n" +
        "    stop  = 210.0\n" +
        "    mode  = steady_power_hold\n" +
        "  END\n" +
        "  phase shutdown_soak\n" +
        "    start = 210.0\n" +
        "    stop  = 520.0\n" +
        "    mode  = decay_heat_and_tank_heat_leak\n" +
        "  END\n" +
        "  phase restart_ramp\n" +
        "    start = 520.0\n" +
        "    stop  = 650.0\n" +
        "    mode  = conservative_restart_demonstration\n" +
        "  END\n" +
        "  phase cooldown\n" +
        "    start = 650.0\n" +
        "    stop  = 900.0\n" +
        "    mode  = post_burn_cooldown\n" +
        "  END\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Visual network nodes shown in the app schematic\n" +
        "# ----------------------------------------------------------------------\n" +
        "NODE n_lh2_tank_outlet       tag=feed     graphics=(x:080,y:310,icon:node-port)\n" +
        "NODE n_boost_pump_inlet      tag=feed     graphics=(x:185,y:310,icon:node-port)\n" +
        "NODE n_turbopump_inlet       tag=feed     graphics=(x:305,y:310,icon:node-port)\n" +
        "NODE n_turbopump_discharge   tag=feed     graphics=(x:445,y:310,icon:node-port)\n" +
        "NODE n_regen_inlet           tag=regen    graphics=(x:575,y:330,icon:node-port)\n" +
        "NODE n_regen_exit            tag=regen    graphics=(x:675,y:250,icon:node-port)\n" +
        "NODE n_spin_converter_exit   tag=regen    graphics=(x:735,y:250,icon:node-port)\n" +
        "NODE n_core_inlet_plenum     tag=core     graphics=(x:790,y:230,icon:node-port)\n" +
        "NODE n_core_midplane         tag=core     graphics=(x:895,y:230,icon:node-port)\n" +
        "NODE n_core_exit_plenum      tag=core     graphics=(x:1000,y:230,icon:node-port)\n" +
        "NODE n_turbine_inlet         tag=turbine  graphics=(x:1000,y:365,icon:node-port)\n" +
        "NODE n_turbine_exit          tag=turbine  graphics=(x:810,y:430,icon:node-port)\n" +
        "NODE n_chamber               tag=nozzle   graphics=(x:1120,y:230,icon:node-port)\n" +
        "NODE n_nozzle_exit           tag=nozzle   graphics=(x:1270,y:230,icon:node-port)\n" +
        "\n" +
        "NODE n_ambient               tag=sink     graphics=(x:1400,y:230,icon:node-port)\n" +
        "NODE n_tvc_bleed_inlet       tag=tvc      graphics=(x:785,y:505,icon:node-port)\n" +
        "NODE n_tvc_bleed_return      tag=tvc      graphics=(x:1035,y:505,icon:node-port)\n" +
        "NODE n_tvc_hyd_pressure      tag=tvc      graphics=(x:1135,y:455,icon:node-port)\n" +
        "NODE n_tvc_hyd_return        tag=tvc      graphics=(x:1135,y:520,icon:node-port)\n" +
        "NODE n_nozzle_gimbal_mount   tag=tvc      graphics=(x:1195,y:330,icon:node-port)\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Boundaries\n" +
        "# ----------------------------------------------------------------------\n" +
        "BOUNDARY lh2_supply_tank\n" +
        "  type              = cryogenic_stagnation_reservoir\n" +
        "  fluid             = lh2\n" +
        "  pressure          = schedule(tank_pressure_profile)\n" +
        "  temperature       = schedule(tank_temperature_profile)\n" +
        "  para_fraction     = schedule(tank_para_fraction_profile)\n" +
        "  ullage_model      = prescribed\n" +
        "  shield_heat_input = state(internal_shield.tank_heat_leak)\n" +
        "  outlet            = n_lh2_tank_outlet\n" +
        "  graphics          = (x:030,y:260,w:090,h:115,icon:lh2-tank,color:feed-blue)\n" +
        "END\n" +
        "\n" +
        "BOUNDARY space_ambient\n" +
        "  type        = pressure_sink\n" +
        "  fluid       = hot_h2\n" +
        "  pressure    = 0.0\n" +
        "  temperature = 3.0\n" +
        "  inlet       = n_ambient\n" +
        "  graphics    = (x:1430,y:205,w:060,h:060,icon:space-sink,color:neutral)\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# LH2 feed system\n" +
        "# ----------------------------------------------------------------------\n" +
        "COMPONENT tank_isolation_valve valve\n" +
        "  tag            = feed\n" +
        "  fluid          = lh2\n" +
        "  inlet          = n_lh2_tank_outlet\n" +
        "  outlet         = n_boost_pump_inlet\n" +
        "  area           = 3.2e-3\n" +
        "  cv             = schedule(tank_isolation_cv)\n" +
        "  leakage_cv     = 1.0e-7\n" +
        "  fail_position  = closed\n" +
        "  graphics       = (x:135,y:292,w:070,h:045,icon:valve,color:feed-blue)\n" +
        "END\n" +
        "\n" +
        "COMPONENT boost_pump pump\n" +
        "  tag          = feed\n" +
        "  fluid        = lh2\n" +
        "  inlet        = n_boost_pump_inlet\n" +
        "  outlet       = n_turbopump_inlet\n" +
        "  shaft        = electric_start_motor_shaft\n" +
        "  speed        = schedule(boost_pump_speed_profile)\n" +
        "  map          = boost_pump_map\n" +
        "  efficiency   = schedule(boost_pump_efficiency_profile)\n" +
        "  graphics     = (x:215,y:275,w:090,h:070,icon:pump,color:feed-blue)\n" +
        "END\n" +
        "\n" +
        "COMPONENT electric_start_motor motor\n" +
        "  tag          = startup\n" +
        "  shaft        = electric_start_motor_shaft\n" +
        "  command      = schedule(start_motor_command)\n" +
        "  max_power    = 2.0e5\n" +
        "  cutoff_speed = 1800.0\n" +
        "  graphics     = (x:225,y:370,w:090,h:055,icon:motor,color:instrument-gold)\n" +
        "END\n" +
        "\n" +
        "COMPONENT main_turbopump pump\n" +
        "  tag              = feed\n" +
        "  fluid            = lh2\n" +
        "  inlet            = n_turbopump_inlet\n" +
        "  outlet           = n_turbopump_discharge\n" +
        "  shaft            = main_turbomachinery_shaft\n" +
        "  speed            = state(main_turbomachinery_shaft.speed)\n" +
        "  map              = main_pump_map\n" +
        "  efficiency       = schedule(main_pump_efficiency_profile)\n" +
        "  design_mdot      = 8.0\n" +
        "  design_dp        = 6.0e6\n" +
        "  cavitation_check = report\n" +
        "  graphics         = (x:335,y:270,w:115,h:080,icon:turbopump,color:feed-blue)\n" +
        "END\n" +
        "\n" +
        "COMPONENT discharge_manifold line\n" +
        "  tag        = feed\n" +
        "  fluid      = lh2\n" +
        "  inlet      = n_turbopump_discharge\n" +
        "  outlet     = n_regen_inlet\n" +
        "  length     = 2.10\n" +
        "  diameter   = 0.060\n" +
        "  roughness  = 8.0e-6\n" +
        "  loss_model = darcy_weisbach\n" +
        "  graphics   = (x:455,y:310,w:110,h:025,icon:pipe,color:feed-blue)\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Regenerative cooling and spin-isomer conditioning\n" +
        "# ----------------------------------------------------------------------\n" +
        "COMPONENT nozzle_regen_jacket heat_exchanger\n" +
        "  tag              = regen\n" +
        "  cold_fluid       = lh2\n" +
        "  cold_inlet       = n_regen_inlet\n" +
        "  cold_outlet      = n_regen_exit\n" +
        "  hot_boundary     = nozzle_wall_thermal_proxy\n" +
        "  heat_rate        = schedule(regen_heat_pickup_profile)\n" +
        "  pressure_drop    = map(regen_pressure_loss_map)\n" +
        "  wall_temperature = state(nozzle_wall_thermal_proxy.temperature)\n" +
        "  metal_temperature_limit = 1100.0\n" +
        "  graphics         = (x:575,y:255,w:145,h:105,icon:regen-jacket,color:regen-cyan)\n" +
        "END\n" +
        "\n" +
        "COMPONENT ortho_para_converter fluid_conditioner\n" +
        "  tag              = regen\n" +
        "  fluid            = lh2\n" +
        "  inlet            = n_regen_exit\n" +
        "  outlet           = n_spin_converter_exit\n" +
        "  model            = first_order_spin_isomer_proxy\n" +
        "  para_fraction_in = state(lh2_supply_tank.para_fraction)\n" +
        "  equilibrium      = schedule(para_equilibrium_profile)\n" +
        "  enthalpy_coupling= conservative_report_only\n" +
        "  catalyst         = none\n" +
        "  graphics         = (x:715,y:282,w:075,h:055,icon:spin-node,color:regen-cyan)\n" +
        "END\n" +
        "\n" +
        "COMPONENT core_inlet_line line\n" +
        "  tag        = core\n" +
        "  fluid      = lh2\n" +
        "  inlet      = n_spin_converter_exit\n" +
        "  outlet     = n_core_inlet_plenum\n" +
        "  length     = 0.85\n" +
        "  diameter   = 0.052\n" +
        "  roughness  = 6.0e-6\n" +
        "  loss_model = minor_loss\n" +
        "  k_loss     = 0.75\n" +
        "  graphics   = (x:750,y:230,w:060,h:025,icon:pipe,color:core-amber)\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Reactor assembly: abstract neutronics and conservative thermal coupling\n" +
        "# ----------------------------------------------------------------------\n" +
        "COMPONENT internal_shield radiation_shield\n" +
        "  tag              = neutronics\n" +
        "  model            = lumped_attenuation_proxy\n" +
        "  coupled_tank     = lh2_supply_tank\n" +
        "  heat_leak        = schedule(shield_tank_heat_leak_profile)\n" +
        "  dose_metric      = report_only\n" +
        "  design_claim     = none\n" +
        "  graphics         = (x:745,y:300,w:080,h:065,icon:shield,color:moderator-gray)\n" +
        "END\n" +
        "\n" +
        "COMPONENT reactor_neutronics point_kinetics\n" +
        "  tag              = neutronics\n" +
        "  model            = six_group_lumped_proxy\n" +
        "  control_input    = state(control_drum_bank.net_worth)\n" +
        "  override_input   = state(auxiliary_poison_bank.override_worth)\n" +
        "  poison_input     = state(fission_product_poisoning.net_worth)\n" +
        "  decay_heat       = state(decay_heat_model.thermal_power)\n" +
        "  iodine_state     = state(fission_product_poisoning.i135_inventory)\n" +
        "  xenon_state      = state(fission_product_poisoning.xe135_inventory)\n" +
        "  kinetics_margin  = state(fission_product_poisoning.reactivity_margin)\n" +
        "  safety_posture   = bounded_non_design_fixture\n" +
        "  graphics         = (x:820,y:095,w:150,h:055,icon:waveform,color:control-purple)\n" +
        "END\n" +
        "\n" +
        "COMPONENT fission_product_poisoning iodine_xenon_proxy\n" +
        "  tag                = neutronics\n" +
        "  model              = lumped_i135_xe135_restart_memory\n" +
        "  source_power       = state(reactor_core.power)\n" +
        "  iodine_inventory   = schedule(iodine_inventory_proxy_profile)\n" +
        "  xenon_inventory    = schedule(xenon_inventory_proxy_profile)\n" +
        "  net_worth          = schedule(xenon_poison_worth_profile)\n" +
        "  reactivity_margin  = schedule(poisoned_reactivity_margin_profile)\n" +
        "  restart_memory     = schedule(xenon_restart_memory_profile)\n" +
        "  iodine_yield_proxy = 0.063\n" +
        "  xenon_yield_proxy  = 0.003\n" +
        "  removal_model      = decay_burnout_proxy\n" +
        "  graphics           = (x:820,y:045,w:150,h:040,icon:poison-memory,color:control-purple)\n" +
        "END\n" +
        "\n" +
        "COMPONENT decay_heat_model decay_heat_proxy\n" +
        "  tag              = neutronics\n" +
        "  model            = lumped_shutdown_heat_memory\n" +
        "  source_power     = state(reactor_core.power)\n" +
        "  thermal_power    = schedule(decay_heat_proxy_profile)\n" +
        "  sink_component   = reactor_core\n" +
        "  coupling_mode    = post_shutdown_core_thermal_load\n" +
        "  graphics         = (x:980,y:045,w:105,h:040,icon:decay-heat,color:control-purple)\n" +
        "END\n" +
        "\n" +
        "COMPONENT reactor_reflector reflector\n" +
        "  tag              = neutronics\n" +
        "  material         = graphite_composite_placeholder\n" +
        "  geometry         = annular_reflector_proxy\n" +
        "  drum_set         = control_drum_bank\n" +
        "  gamma_heating    = state(reflector_gamma_heating.thermal_power)\n" +
        "  graphics         = (x:800,y:160,w:225,h:150,icon:reflector-ring,color:moderator-gray)\n" +
        "END\n" +
        "\n" +
        "COMPONENT reflector_gamma_heating gamma_heat_proxy\n" +
        "  tag              = neutronics\n" +
        "  model            = lumped_reflector_gamma_heat\n" +
        "  source_power     = state(reactor_core.power)\n" +
        "  thermal_power    = schedule(reflector_heat_proxy_profile)\n" +
        "  sink_component   = reactor_reflector\n" +
        "  coupling_mode    = reflector_thermal_load\n" +
        "  graphics         = (x:1035,y:170,w:095,h:050,icon:gamma-heat,color:moderator-gray)\n" +
        "END\n" +
        "\n" +
        "COMPONENT control_drum_bank control_drums\n" +
        "  tag              = neutronics\n" +
        "  count            = 12\n" +
        "  angle            = schedule(control_drum_angle_profile)\n" +
        "  shutdown_angle   = 0.0\n" +
        "  run_angle        = 92.0\n" +
        "  worth_model      = cosine_proxy\n" +
        "  net_worth        = schedule(control_drum_worth_profile)\n" +
        "  graphics         = (x:810,y:120,w:205,h:040,icon:control-drums,color:control-purple)\n" +
        "END\n" +
        "\n" +
        "COMPONENT auxiliary_poison_bank poison_override\n" +
        "  tag              = neutronics\n" +
        "  mode             = conservative_restart_hold_down\n" +
        "  insertion        = schedule(aux_poison_insertion_profile)\n" +
        "  override_worth   = schedule(aux_poison_worth_profile)\n" +
        "  actuation_model  = slow_bounded_proxy\n" +
        "  note             = \"named subsystem only; not a design reactivity model\"\n" +
        "  graphics         = (x:990,y:120,w:105,h:045,icon:poison-bank,color:control-purple)\n" +
        "END\n" +
        "\n" +
        "COMPONENT reactor_core multi_channel_core\n" +
        "  tag                      = core\n" +
        "  fluid                    = hot_h2\n" +
        "  inlet                    = n_core_inlet_plenum\n" +
        "  midpoint                 = n_core_midplane\n" +
        "  outlet                   = n_core_exit_plenum\n" +
        "  power                    = schedule(core_power_profile)\n" +
        "  neutronics               = reactor_neutronics\n" +
        "  decay_heat_model         = decay_heat_model\n" +
        "  channel_model            = core_channel_bundle\n" +
        "  channel_count            = state(core_channel_bundle.channel_count)\n" +
        "  channel_groups           = state(core_channel_bundle.channel_groups)\n" +
        "  axial_shape              = schedule(core_axial_shape_profile)\n" +
        "  radial_peaking           = schedule(core_radial_peaking_profile)\n" +
        "  pressure_drop            = map(core_pressure_loss_map)\n" +
        "  thermal_mass             = 1.8e5\n" +
        "  fuel_form                = hexagonal_fuel_element_channel_bundle\n" +
        "  representative_channel  = core_mid_channel\n" +
        "  channel_stability_model  = ledinegg_instability_switch\n" +
        "  flow_stability_check     = state(ledinegg_instability_switch.status)\n" +
        "  ledinegg_margin          = state(ledinegg_instability_switch.margin)\n" +
        "  fuel_temperature_initial = 850.0\n" +
        "  fuel_temperature_limit   = 2850.0\n" +
        "  graphics                 = (x:835,y:175,w:155,h:115,icon:reactor-core,color:core-amber)\n" +
        "END\n" +
        "\n" +
        "COMPONENT core_channel_bundle multi_channel_abstraction\n" +
        "  tag                    = core\n" +
        "  parent                 = reactor_core\n" +
        "  channel_count          = 96\n" +
        "  channel_groups         = inner,mid,outer,bypass\n" +
        "  group_power_shape      = schedule(channel_group_power_shape_profile)\n" +
        "  group_flow_split       = schedule(channel_group_flow_split_profile)\n" +
        "  representative_flow    = schedule(channel_representative_flow_profile)\n" +
        "  hydraulic_diameter     = schedule(channel_hydraulic_diameter_profile)\n" +
        "  heated_length          = schedule(channel_heated_length_profile)\n" +
        "  model_scope            = reduced_order_channel_bundle\n" +
        "  graphics               = (x:835,y:300,w:155,h:055,icon:channel-bundle,color:core-amber)\n" +
        "END\n" +
        "\n" +
        "COMPONENT core_inner_channel representative_channel\n" +
        "  tag                    = core\n" +
        "  parent                 = core_channel_bundle\n" +
        "  group                  = inner\n" +
        "  power_shape            = state(core_channel_bundle.group_power_shape.inner)\n" +
        "  flow_split             = state(core_channel_bundle.group_flow_split.inner)\n" +
        "  stability_margin       = state(ledinegg_instability_switch.margin)\n" +
        "  graphics               = (x:790,y:365,w:080,h:045,icon:core-channel,color:core-amber)\n" +
        "END\n" +
        "\n" +
        "COMPONENT core_mid_channel representative_channel\n" +
        "  tag                    = core\n" +
        "  parent                 = core_channel_bundle\n" +
        "  group                  = mid\n" +
        "  power_shape            = state(core_channel_bundle.group_power_shape.mid)\n" +
        "  flow_split             = state(core_channel_bundle.group_flow_split.mid)\n" +
        "  stability_margin       = state(ledinegg_instability_switch.margin)\n" +
        "  graphics               = (x:880,y:365,w:080,h:045,icon:core-channel,color:core-amber)\n" +
        "END\n" +
        "\n" +
        "COMPONENT core_outer_channel representative_channel\n" +
        "  tag                    = core\n" +
        "  parent                 = core_channel_bundle\n" +
        "  group                  = outer\n" +
        "  power_shape            = state(core_channel_bundle.group_power_shape.outer)\n" +
        "  flow_split             = state(core_channel_bundle.group_flow_split.outer)\n" +
        "  stability_margin       = state(ledinegg_instability_switch.margin)\n" +
        "  graphics               = (x:970,y:365,w:080,h:045,icon:core-channel,color:core-amber)\n" +
        "END\n" +
        "\n" +
        "COMPONENT ledinegg_instability_switch stability_guard\n" +
        "  tag                  = core\n" +
        "  parent               = reactor_core\n" +
        "  model                = ledinegg_channel_stability_proxy\n" +
        "  monitored_inlet      = n_core_inlet_plenum\n" +
        "  monitored_outlet     = n_core_exit_plenum\n" +
        "  monitored_flow       = state(main_turbopump.mass_flow)\n" +
        "  monitored_power      = state(reactor_core.power)\n" +
        "  monitored_channels   = state(core_channel_bundle.channel_groups)\n" +
        "  margin               = schedule(ledinegg_margin_profile)\n" +
        "  status               = schedule(ledinegg_status_profile)\n" +
        "  switch_mode          = advisory\n" +
        "  action               = flag_channel_instability_risk\n" +
        "  graphics             = (x:1000,y:285,w:120,h:055,icon:stability-switch,color:warning-amber)\n" +
        "END\n" +
        "\n" +
        "COMPONENT core_exit_plenum volume\n" +
        "  tag                 = core\n" +
        "  fluid               = hot_h2\n" +
        "  inlet               = n_core_exit_plenum\n" +
        "  outlet              = n_chamber\n" +
        "  branch_outlet       = n_turbine_inlet\n" +
        "  volume              = 0.045\n" +
        "  initial_pressure    = 2.0e5\n" +
        "  initial_temperature = 650.0\n" +
        "  graphics            = (x:1010,y:205,w:075,h:055,icon:plenum,color:core-amber)\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Turbine drive loop and shaft coupling\n" +
        "# Cleaner topology: exit plenum -> tap -> chamber path + turbine bypass.\n" +
        "# ----------------------------------------------------------------------\n" +
        "COMPONENT turbine_tap splitter\n" +
        "  tag              = turbine\n" +
        "  fluid            = hot_h2\n" +
        "  inlet            = n_core_exit_plenum\n" +
        "  outlet_primary   = n_chamber\n" +
        "  outlet_secondary = n_turbine_inlet\n" +
        "  split_fraction   = schedule(turbine_tap_fraction_profile)\n" +
        "  graphics         = (x:1010,y:315,w:070,h:055,icon:splitter,color:turbine-red)\n" +
        "END\n" +
        "\n" +
        "COMPONENT drive_turbine turbine\n" +
        "  tag          = turbine\n" +
        "  fluid        = hot_h2\n" +
        "  inlet        = n_turbine_inlet\n" +
        "  outlet       = n_turbine_exit\n" +
        "  shaft        = main_turbomachinery_shaft\n" +
        "  map          = drive_turbine_map\n" +
        "  efficiency   = schedule(turbine_efficiency_profile)\n" +
        "  design_pr    = 1.7\n" +
        "  design_power = 1.5e6\n" +
        "  graphics     = (x:825,y:385,w:125,h:080,icon:turbine,color:turbine-red)\n" +
        "END\n" +
        "\n" +
        "COMPONENT turbine_exhaust_mixer mixer\n" +
        "  tag          = turbine\n" +
        "  fluid        = hot_h2\n" +
        "  inlet_1      = n_turbine_exit\n" +
        "  inlet_2      = n_chamber\n" +
        "  inlet_3      = n_tvc_bleed_return\n" +
        "  outlet       = n_chamber\n" +
        "  mixing_model = enthalpy_balance_proxy\n" +
        "  graphics     = (x:1060,y:365,w:070,h:055,icon:mixer,color:turbine-red)\n" +
        "END\n" +
        "\n" +
        "COMPONENT main_turbomachinery_shaft rotating_shaft\n" +
        "  tag           = shaft\n" +
        "  inertia       = 9.5\n" +
        "  initial_speed = 450.0\n" +
        "  speed_limit   = 7200.0\n" +
        "  torque_losses = map(main_shaft_loss_map)\n" +
        "  graphics      = (x:340,y:360,w:605,h:025,icon:shaft,color:shaft-silver)\n" +
        "END\n" +
        "\n" +
        "COMPONENT electric_start_motor_shaft rotating_shaft\n" +
        "  tag           = startup\n" +
        "  inertia       = 1.8\n" +
        "  initial_speed = 0.0\n" +
        "  speed_limit   = 2500.0\n" +
        "  torque_losses = map(start_shaft_loss_map)\n" +
        "  graphics      = (x:230,y:430,w:075,h:020,icon:shaft,color:instrument-gold)\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Chamber, baseline nozzle, and optional deep-space nozzle preset\n" +
        "# ----------------------------------------------------------------------\n" +
        "COMPONENT thrust_chamber volume\n" +
        "  tag                 = nozzle\n" +
        "  fluid               = hot_h2\n" +
        "  inlet               = n_chamber\n" +
        "  outlet              = n_nozzle_exit\n" +
        "  volume              = 0.095\n" +
        "  wall_heat_capacity  = 2.4e4\n" +
        "  initial_pressure    = 2.0e5\n" +
        "  initial_temperature = 650.0\n" +
        "  graphics            = (x:1100,y:190,w:080,h:085,icon:chamber,color:nozzle-orange)\n" +
        "END\n" +
        "\n" +
        "COMPONENT bell_nozzle expansion_nozzle\n" +
        "  tag                   = nozzle\n" +
        "  variant               = baseline_demo\n" +
        "  fluid                 = hot_h2\n" +
        "  inlet                 = n_nozzle_exit\n" +
        "  outlet_boundary       = space_ambient\n" +
        "  throat_area           = 0.020\n" +
        "  area_ratio            = 38.0\n" +
        "  discharge_coefficient = 0.985\n" +
        "  divergence_efficiency = 0.970\n" +
        "  frozen_flow           = false\n" +
        "  performance_model     = equilibrium_proxy\n" +
        "  gimbal_mount          = nozzle_gimbal_joint\n" +
        "  pitch_angle           = state(nozzle_gimbal_joint.pitch_angle)\n" +
        "  yaw_angle             = state(nozzle_gimbal_joint.yaw_angle)\n" +
        "  tvc_efficiency_penalty= schedule(tvc_nozzle_efficiency_penalty_profile)\n" +
        "  graphics              = (x:1175,y:170,w:155,h:125,icon:bell-nozzle,color:nozzle-orange)\n" +
        "END\n" +
        "\n" +
        "COMPONENT deep_space_bell_nozzle expansion_nozzle_preset\n" +
        "  tag                   = nozzle\n" +
        "  variant               = optional_deep_space_high_expansion\n" +
        "  enabled               = false\n" +
        "  parent                = bell_nozzle\n" +
        "  area_ratio            = 150.0\n" +
        "  divergence_efficiency = 0.955\n" +
        "  use_case              = vacuum_restart_visualization\n" +
        "  note                  = \"alternate app preset, not active baseline\"\n" +
        "  graphics              = (x:1175,y:055,w:155,h:070,icon:nozzle-preset,color:nozzle-orange)\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Thrust vector control: turbine-exhaust bleed driven hydraulic gimbal\n" +
        "# ----------------------------------------------------------------------\n" +
        "COMPONENT tvc_controller thrust_vector_controller\n" +
        "  tag                 = tvc\n" +
        "  mode                = dual_axis_closed_loop_proxy\n" +
        "  pitch_command       = schedule(tvc_pitch_command_profile)\n" +
        "  yaw_command         = schedule(tvc_yaw_command_profile)\n" +
        "  rate_command        = schedule(tvc_gimbal_rate_command_profile)\n" +
        "  authority_limit     = schedule(tvc_authority_limit_profile)\n" +
        "  bleed_command       = schedule(tvc_bleed_valve_cv_profile)\n" +
        "  graphics            = (x:1060,y:455,w:090,h:050,icon:tvc-controller,color:tvc-green)\n" +
        "END\n" +
        "\n" +
        "COMPONENT tvc_hot_gas_bleed_valve valve\n" +
        "  tag                 = tvc\n" +
        "  fluid               = hot_h2\n" +
        "  inlet               = n_turbine_exit\n" +
        "  outlet              = n_tvc_bleed_inlet\n" +
        "  source_component    = drive_turbine\n" +
        "  cv                  = schedule(tvc_bleed_valve_cv_profile)\n" +
        "  mass_flow           = schedule(tvc_parasitic_bleed_flow_profile)\n" +
        "  commanded_by        = tvc_controller\n" +
        "  graphics            = (x:770,y:455,w:095,h:055,icon:bleed-valve,color:tvc-green)\n" +
        "END\n" +
        "\n" +
        "COMPONENT tvc_hydraulic_power_unit hydraulic_power_unit\n" +
        "  tag                 = tvc\n" +
        "  hot_gas_inlet       = n_tvc_bleed_inlet\n" +
        "  hot_gas_return      = n_tvc_bleed_return\n" +
        "  hydraulic_outlet    = n_tvc_hyd_pressure\n" +
        "  hydraulic_return    = n_tvc_hyd_return\n" +
        "  driven_by           = tvc_hot_gas_bleed_valve\n" +
        "  shaft_power         = schedule(tvc_hydraulic_power_profile)\n" +
        "  parasitic_mass_flow = schedule(tvc_parasitic_bleed_flow_profile)\n" +
        "  pressure_supply     = schedule(tvc_hydraulic_pressure_profile)\n" +
        "  pressure_return     = schedule(tvc_hydraulic_return_pressure_profile)\n" +
        "  graphics            = (x:885,y:465,w:135,h:070,icon:hyd-power-unit,color:tvc-green)\n" +
        "END\n" +
        "\n" +
        "COMPONENT tvc_hydraulic_accumulator hydraulic_accumulator\n" +
        "  tag                 = tvc\n" +
        "  inlet               = n_tvc_hyd_pressure\n" +
        "  outlet              = n_tvc_hyd_pressure\n" +
        "  precharge_pressure  = 8.0e6\n" +
        "  stored_energy       = schedule(tvc_accumulator_energy_profile)\n" +
        "  demand_buffer       = schedule(tvc_accumulator_draw_profile)\n" +
        "  graphics            = (x:1035,y:520,w:100,h:050,icon:accumulator,color:tvc-green)\n" +
        "END\n" +
        "\n" +
        "COMPONENT tvc_actuator_ring dual_axis_hydraulic_actuator\n" +
        "  tag                 = tvc\n" +
        "  parent              = bell_nozzle\n" +
        "  mount               = nozzle_gimbal_joint\n" +
        "  hydraulic_supply    = n_tvc_hyd_pressure\n" +
        "  hydraulic_return    = n_tvc_hyd_return\n" +
        "  pitch_command       = state(tvc_controller.pitch_command)\n" +
        "  yaw_command         = state(tvc_controller.yaw_command)\n" +
        "  pitch_angle         = schedule(tvc_pitch_response_profile)\n" +
        "  yaw_angle           = schedule(tvc_yaw_response_profile)\n" +
        "  torque_demand       = schedule(tvc_torque_demand_profile)\n" +
        "  structural_torque   = schedule(tvc_structural_torque_profile)\n" +
        "  slew_rate_limit     = schedule(tvc_slew_rate_limit_profile)\n" +
        "  hydraulic_power_demand = schedule(tvc_hydraulic_power_demand_profile)\n" +
        "  graphics            = (x:1160,y:370,w:155,h:070,icon:actuator-ring,color:tvc-green)\n" +
        "END\n" +
        "\n" +
        "COMPONENT nozzle_gimbal_joint gimbal_mount\n" +
        "  tag                 = tvc\n" +
        "  parent              = thrust_chamber\n" +
        "  child               = bell_nozzle\n" +
        "  actuator            = tvc_actuator_ring\n" +
        "  pitch_angle         = state(tvc_actuator_ring.pitch_angle)\n" +
        "  yaw_angle           = state(tvc_actuator_ring.yaw_angle)\n" +
        "  pitch_rate          = schedule(tvc_pitch_rate_profile)\n" +
        "  yaw_rate            = schedule(tvc_yaw_rate_profile)\n" +
        "  structural_load     = schedule(tvc_structural_torque_profile)\n" +
        "  graphics            = (x:1190,y:300,w:115,h:055,icon:gimbal-joint,color:tvc-green)\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Solver variables and residuals for credible system-solve posture\n" +
        "# ----------------------------------------------------------------------\n" +
        "SOLVER_VARIABLE shaft_speed\n" +
        "  type    = independent\n" +
        "  target  = main_turbomachinery_shaft.speed\n" +
        "  bounds  = 0.0,7200.0\n" +
        "  guess   = schedule(shaft_speed_guess_profile)\n" +
        "END\n" +
        "\n" +
        "SOLVER_VARIABLE turbine_split_fraction\n" +
        "  type    = independent\n" +
        "  target  = turbine_tap.split_fraction\n" +
        "  bounds  = 0.0,0.12\n" +
        "  guess   = schedule(turbine_tap_fraction_profile)\n" +
        "END\n" +
        "\n" +
        "SOLVER_VARIABLE control_drum_angle\n" +
        "  type    = independent\n" +
        "  target  = control_drum_bank.angle\n" +
        "  bounds  = 0.0,110.0\n" +
        "  guess   = schedule(control_drum_angle_profile)\n" +
        "END\n" +
        "\n" +
        "SOLVER_RESIDUAL shaft_power_balance\n" +
        "  target      = 0.0\n" +
        "  expression  = drive_turbine.power - main_turbopump.shaft_power\n" +
        "  tolerance   = 5.0e3\n" +
        "END\n" +
        "\n" +
        "SOLVER_RESIDUAL chamber_pressure_target\n" +
        "  target      = schedule(chamber_pressure_target_profile)\n" +
        "  expression  = thrust_chamber.pressure\n" +
        "  tolerance   = 5.0e4\n" +
        "END\n" +
        "\n" +
        "SOLVER_RESIDUAL core_power_tracking\n" +
        "  target      = schedule(core_power_profile)\n" +
        "  expression  = reactor_neutronics.thermal_power_proxy\n" +
        "  tolerance   = 2.5e6\n" +
        "END\n" +
        "\n" +
        "SOLVER_RESIDUAL mass_flow_closure\n" +
        "  target      = 0.0\n" +
        "  expression  = main_turbopump.mass_flow - bell_nozzle.mass_flow\n" +
        "  tolerance   = 5.0e-2\n" +
        "END\n" +
        "\n" +
        "SOLVER_RESIDUAL tvc_hydraulic_power_balance\n" +
        "  target      = 0.0\n" +
        "  expression  = tvc_hydraulic_power_unit.shaft_power - tvc_actuator_ring.hydraulic_power_demand\n" +
        "  tolerance   = 2.5e3\n" +
        "END\n" +
        "\n" +
        "SOLVER_RESIDUAL tvc_parasitic_flow_accounting\n" +
        "  target      = 0.0\n" +
        "  expression  = drive_turbine.mass_flow - turbine_exhaust_mixer.mass_flow - tvc_hot_gas_bleed_valve.mass_flow\n" +
        "  tolerance   = 2.5e-2\n" +
        "END\n" +
        "\n" +
        "SOLVER_RESIDUAL tvc_gimbal_tracking_error\n" +
        "  target      = 0.0\n" +
        "  expression  = tvc_controller.pitch_command - tvc_actuator_ring.pitch_angle\n" +
        "  tolerance   = 0.05\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Instrumentation points used by app panels\n" +
        "# ----------------------------------------------------------------------\n" +
        "SENSOR s_tank_pressure pressure_sensor\n" +
        "  tag      = instrument\n" +
        "  target   = lh2_supply_tank.pressure\n" +
        "  units    = Pa\n" +
        "  graphics = (x:055,y:235,icon:gauge,color:instrument-gold)\n" +
        "END\n" +
        "\n" +
        "SENSOR s_pump_speed tachometer\n" +
        "  tag      = instrument\n" +
        "  target   = main_turbomachinery_shaft.speed\n" +
        "  units    = rpm\n" +
        "  graphics = (x:390,y:250,icon:tachometer,color:instrument-gold)\n" +
        "END\n" +
        "\n" +
        "SENSOR s_core_exit_temperature temperature_sensor\n" +
        "  tag      = instrument\n" +
        "  target   = n_core_exit_plenum.temperature\n" +
        "  units    = K\n" +
        "  graphics = (x:995,y:170,icon:thermocouple,color:instrument-gold)\n" +
        "END\n" +
        "\n" +
        "SENSOR s_neutronics_margin scalar_sensor\n" +
        "  tag      = instrument\n" +
        "  target   = reactor_neutronics.bounded_margin_proxy\n" +
        "  units    = dimensionless\n" +
        "  graphics = (x:935,y:088,icon:gauge,color:instrument-gold)\n" +
        "END\n" +
        "\n" +
        "SENSOR s_chamber_pressure pressure_sensor\n" +
        "  tag      = instrument\n" +
        "  target   = thrust_chamber.pressure\n" +
        "  units    = Pa\n" +
        "  graphics = (x:1110,y:165,icon:gauge,color:instrument-gold)\n" +
        "END\n" +
        "\n" +
        "SENSOR s_thrust thrust_proxy_sensor\n" +
        "  tag      = instrument\n" +
        "  target   = bell_nozzle.ideal_thrust\n" +
        "  units    = N\n" +
        "  graphics = (x:1290,y:155,icon:thrust-vector,color:instrument-gold)\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Connectivity for graph parsing and app edge rendering\n" +
        "# ----------------------------------------------------------------------\n" +
        "CONNECT lh2_supply_tank.outlet -> tank_isolation_valve.inlet          edge=feed-blue\n" +
        "CONNECT tank_isolation_valve.outlet -> boost_pump.inlet               edge=feed-blue\n" +
        "CONNECT boost_pump.outlet -> main_turbopump.inlet                     edge=feed-blue\n" +
        "CONNECT main_turbopump.outlet -> discharge_manifold.inlet             edge=feed-blue\n" +
        "CONNECT discharge_manifold.outlet -> nozzle_regen_jacket.cold_inlet   edge=regen-cyan\n" +
        "CONNECT nozzle_regen_jacket.cold_outlet -> ortho_para_converter.inlet edge=regen-cyan\n" +
        "CONNECT ortho_para_converter.outlet -> core_inlet_line.inlet          edge=regen-cyan\n" +
        "CONNECT core_inlet_line.outlet -> reactor_core.inlet                  edge=core-amber\n" +
        "CONNECT reactor_neutronics.output -> reactor_core.neutronics          edge=control-purple\n" +
        "CONNECT fission_product_poisoning.output -> reactor_neutronics.poison_input edge=control-purple\n" +
        "CONNECT decay_heat_model.output -> reactor_neutronics.decay_heat      edge=control-purple\n" +
        "CONNECT decay_heat_model.output -> reactor_core.decay_heat_model      edge=control-purple\n" +
        "CONNECT core_channel_bundle.output -> reactor_core.channel_model      edge=core-amber\n" +
        "CONNECT core_inner_channel.output -> core_channel_bundle.inner        edge=core-amber\n" +
        "CONNECT core_mid_channel.output -> core_channel_bundle.mid            edge=core-amber\n" +
        "CONNECT core_outer_channel.output -> core_channel_bundle.outer        edge=core-amber\n" +
        "CONNECT reflector_gamma_heating.output -> reactor_reflector.gamma_heating edge=moderator-gray\n" +
        "CONNECT control_drum_bank.output -> reactor_neutronics.control_input  edge=control-purple\n" +
        "CONNECT auxiliary_poison_bank.output -> reactor_neutronics.override_input edge=control-purple\n" +
        "CONNECT internal_shield.heat_leak -> lh2_supply_tank.shield_heat_input edge=moderator-gray\n" +
        "CONNECT core_channel_bundle.output -> ledinegg_instability_switch.monitored_channels edge=warning-amber\n" +
        "CONNECT ledinegg_instability_switch.output -> reactor_core.flow_stability_check edge=warning-amber\n" +
        "CONNECT reactor_core.outlet -> core_exit_plenum.inlet                 edge=core-amber\n" +
        "CONNECT core_exit_plenum.outlet -> turbine_tap.inlet                  edge=core-amber\n" +
        "CONNECT turbine_tap.outlet_primary -> thrust_chamber.inlet            edge=core-amber\n" +
        "CONNECT turbine_tap.outlet_secondary -> drive_turbine.inlet           edge=turbine-red\n" +
        "CONNECT drive_turbine.outlet -> turbine_exhaust_mixer.inlet_1         edge=turbine-red\n" +
        "CONNECT drive_turbine.outlet -> tvc_hot_gas_bleed_valve.inlet         edge=tvc-green\n" +
        "CONNECT tvc_hot_gas_bleed_valve.outlet -> tvc_hydraulic_power_unit.hot_gas_inlet edge=tvc-green\n" +
        "CONNECT tvc_hydraulic_power_unit.hot_gas_return -> turbine_exhaust_mixer.inlet_3 edge=tvc-green\n" +
        "CONNECT tvc_hydraulic_power_unit.hydraulic_outlet -> tvc_hydraulic_accumulator.inlet edge=tvc-green\n" +
        "CONNECT tvc_hydraulic_accumulator.outlet -> tvc_actuator_ring.hydraulic_supply edge=tvc-green\n" +
        "CONNECT tvc_actuator_ring.hydraulic_return -> tvc_hydraulic_power_unit.hydraulic_return edge=tvc-green\n" +
        "CONNECT tvc_controller.output -> tvc_hot_gas_bleed_valve.commanded_by  edge=tvc-green\n" +
        "CONNECT tvc_controller.output -> tvc_actuator_ring.pitch_command       edge=tvc-green\n" +
        "CONNECT tvc_actuator_ring.output -> nozzle_gimbal_joint.actuator       edge=tvc-green\n" +
        "CONNECT nozzle_gimbal_joint.output -> bell_nozzle.gimbal_mount         edge=tvc-green\n" +
        "CONNECT turbine_exhaust_mixer.outlet -> thrust_chamber.inlet          edge=turbine-red\n" +
        "CONNECT thrust_chamber.outlet -> bell_nozzle.inlet                    edge=nozzle-orange\n" +
        "CONNECT bell_nozzle.outlet -> space_ambient.inlet                     edge=nozzle-orange\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Pseudo maps for parser fixtures\n" +
        "# ----------------------------------------------------------------------\n" +
        "MAP boost_pump_map columns=speed,flow,head,efficiency\n" +
        "  250.0   0.50   2.0e4   0.18\n" +
        "  900.0   2.00   1.2e5   0.42\n" +
        "  1800.0  4.00   3.5e5   0.56\n" +
        "  2400.0  5.25   4.8e5   0.52\n" +
        "END\n" +
        "\n" +
        "MAP main_pump_map columns=speed,flow,head,efficiency\n" +
        "  500.0   1.0   1.0e5   0.20\n" +
        "  2500.0  4.0   2.0e6   0.55\n" +
        "  5200.0  8.0   6.0e6   0.70\n" +
        "  7200.0  9.5   7.2e6   0.63\n" +
        "END\n" +
        "\n" +
        "MAP drive_turbine_map columns=pressure_ratio,flow,power,efficiency\n" +
        "  1.10  0.20  1.0e4   0.35\n" +
        "  1.35  0.45  4.5e5   0.62\n" +
        "  1.70  0.80  1.5e6   0.71\n" +
        "  2.05  0.95  1.9e6   0.66\n" +
        "END\n" +
        "\n" +
        "MAP core_pressure_loss_map columns=mass_flow,delta_p\n" +
        "  1.0   2.0e4\n" +
        "  4.0   2.5e5\n" +
        "  8.0   8.5e5\n" +
        "  10.0  1.35e6\n" +
        "END\n" +
        "\n" +
        "MAP regen_pressure_loss_map columns=mass_flow,delta_p\n" +
        "  1.0   1.0e4\n" +
        "  4.0   1.1e5\n" +
        "  8.0   4.2e5\n" +
        "  10.0  6.5e5\n" +
        "END\n" +
        "\n" +
        "MAP main_shaft_loss_map columns=speed,loss_torque\n" +
        "  450.0   2.0\n" +
        "  2500.0  20.0\n" +
        "  5200.0  82.0\n" +
        "  7200.0  145.0\n" +
        "END\n" +
        "\n" +
        "MAP start_shaft_loss_map columns=speed,loss_torque\n" +
        "  0.0     0.0\n" +
        "  500.0   3.0\n" +
        "  1800.0  18.0\n" +
        "  2500.0  32.0\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Transient schedules and restart-state profiles\n" +
        "# ----------------------------------------------------------------------\n" +
        "SCHEDULE tank_pressure_profile columns=time,value units=s,Pa\n" +
        "  0.0    1.35e6\n" +
        "  90.0   1.24e6\n" +
        "  210.0  1.10e6\n" +
        "  520.0  1.05e6\n" +
        "  650.0  9.70e5\n" +
        "  900.0  9.20e5\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tank_temperature_profile columns=time,value units=s,K\n" +
        "  0.0    22.5\n" +
        "  210.0  25.0\n" +
        "  520.0  27.0\n" +
        "  900.0  29.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tank_para_fraction_profile columns=time,value\n" +
        "  0.0    0.998\n" +
        "  210.0  0.985\n" +
        "  520.0  0.970\n" +
        "  900.0  0.960\n" +
        "END\n" +
        "\n" +
        "SCHEDULE para_equilibrium_profile columns=time,value\n" +
        "  0.0    0.998\n" +
        "  90.0   0.920\n" +
        "  210.0  0.880\n" +
        "  520.0  0.900\n" +
        "  650.0  0.870\n" +
        "  900.0  0.940\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tank_isolation_cv columns=time,value\n" +
        "  0.0    0.00\n" +
        "  2.0    0.10\n" +
        "  6.0    0.55\n" +
        "  12.0   1.00\n" +
        "  210.0  1.00\n" +
        "  225.0  0.00\n" +
        "  520.0  0.00\n" +
        "  530.0  0.60\n" +
        "  545.0  1.00\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE boost_pump_speed_profile columns=time,value units=s,rpm\n" +
        "  0.0    0.0\n" +
        "  1.0    250.0\n" +
        "  6.0    1400.0\n" +
        "  18.0   2200.0\n" +
        "  90.0   1800.0\n" +
        "  225.0  0.0\n" +
        "  520.0  0.0\n" +
        "  540.0  1800.0\n" +
        "  650.0  1600.0\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE start_motor_command columns=time,value\n" +
        "  0.0    1.0\n" +
        "  28.0   0.0\n" +
        "  520.0  1.0\n" +
        "  555.0  0.0\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE core_power_profile columns=time,value units=s,W\n" +
        "  0.0    0.0\n" +
        "  8.0    1.0e6\n" +
        "  25.0   6.0e7\n" +
        "  90.0   3.5e8\n" +
        "  210.0  3.5e8\n" +
        "  260.0  2.5e7\n" +
        "  520.0  1.5e7\n" +
        "  650.0  2.5e8\n" +
        "  760.0  2.5e8\n" +
        "  900.0  5.0e7\n" +
        "END\n" +
        "\n" +
        "SCHEDULE decay_heat_proxy_profile columns=time,value units=s,W\n" +
        "  0.0    0.0\n" +
        "  210.0  1.8e7\n" +
        "  320.0  1.0e7\n" +
        "  520.0  4.0e6\n" +
        "  650.0  1.2e7\n" +
        "  900.0  2.5e6\n" +
        "END\n" +
        "\n" +
        "SCHEDULE iodine_inventory_proxy_profile columns=time,value units=s,arb\n" +
        "  0.0    0.00\n" +
        "  25.0   0.10\n" +
        "  90.0   0.38\n" +
        "  210.0  0.84\n" +
        "  320.0  0.92\n" +
        "  520.0  0.70\n" +
        "  650.0  0.78\n" +
        "  760.0  0.72\n" +
        "  900.0  0.42\n" +
        "END\n" +
        "\n" +
        "SCHEDULE xenon_inventory_proxy_profile columns=time,value units=s,arb\n" +
        "  0.0    0.00\n" +
        "  25.0   0.02\n" +
        "  90.0   0.12\n" +
        "  210.0  0.45\n" +
        "  320.0  0.74\n" +
        "  520.0  0.88\n" +
        "  650.0  0.58\n" +
        "  760.0  0.46\n" +
        "  900.0  0.35\n" +
        "END\n" +
        "\n" +
        "SCHEDULE xenon_poison_worth_profile columns=time,value units=s,delta_k_over_k\n" +
        "  0.0    0.000\n" +
        "  25.0  -0.001\n" +
        "  90.0  -0.002\n" +
        "  210.0 -0.006\n" +
        "  320.0 -0.010\n" +
        "  520.0 -0.012\n" +
        "  650.0 -0.007\n" +
        "  760.0 -0.005\n" +
        "  900.0 -0.004\n" +
        "END\n" +
        "\n" +
        "SCHEDULE poisoned_reactivity_margin_profile columns=time,value units=s,delta_k_over_k\n" +
        "  0.0    0.020\n" +
        "  25.0   0.015\n" +
        "  90.0   0.009\n" +
        "  210.0  0.006\n" +
        "  320.0  0.002\n" +
        "  520.0  0.001\n" +
        "  650.0  0.006\n" +
        "  760.0  0.008\n" +
        "  900.0  0.012\n" +
        "END\n" +
        "\n" +
        "SCHEDULE xenon_restart_memory_profile columns=time,value\n" +
        "  0.0    fresh\n" +
        "  90.0   accumulating\n" +
        "  210.0  shutdown_growth\n" +
        "  320.0  post_shutdown_peak\n" +
        "  520.0  restart_penalty\n" +
        "  650.0  burnout_recovery\n" +
        "  900.0  cooled_down\n" +
        "END\n" +
        "\n" +
        "SCHEDULE reflector_heat_proxy_profile columns=time,value units=s,W\n" +
        "  0.0    0.0\n" +
        "  90.0   1.5e6\n" +
        "  210.0  1.5e6\n" +
        "  520.0  2.0e5\n" +
        "  650.0  1.0e6\n" +
        "  900.0  1.0e5\n" +
        "END\n" +
        "\n" +
        "SCHEDULE shield_tank_heat_leak_profile columns=time,value units=s,W\n" +
        "  0.0    1.0e2\n" +
        "  90.0   3.5e3\n" +
        "  210.0  3.5e3\n" +
        "  520.0  7.5e2\n" +
        "  650.0  2.8e3\n" +
        "  900.0  4.0e2\n" +
        "END\n" +
        "\n" +
        "SCHEDULE control_drum_angle_profile columns=time,value units=s,deg\n" +
        "  0.0    0.0\n" +
        "  8.0    15.0\n" +
        "  25.0   55.0\n" +
        "  90.0   92.0\n" +
        "  210.0  92.0\n" +
        "  235.0  0.0\n" +
        "  520.0  10.0\n" +
        "  560.0  70.0\n" +
        "  650.0  86.0\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE control_drum_worth_profile columns=time,value units=s,delta_k_over_k\n" +
        "  0.0    -0.080\n" +
        "  25.0   -0.020\n" +
        "  90.0    0.000\n" +
        "  210.0   0.000\n" +
        "  235.0  -0.080\n" +
        "  520.0  -0.060\n" +
        "  650.0  -0.010\n" +
        "  900.0  -0.080\n" +
        "END\n" +
        "\n" +
        "SCHEDULE aux_poison_insertion_profile columns=time,value\n" +
        "  0.0    0.00\n" +
        "  210.0  0.00\n" +
        "  235.0  0.35\n" +
        "  520.0  0.35\n" +
        "  560.0  0.12\n" +
        "  650.0  0.00\n" +
        "  900.0  0.35\n" +
        "END\n" +
        "\n" +
        "SCHEDULE aux_poison_worth_profile columns=time,value units=s,delta_k_over_k\n" +
        "  0.0    0.000\n" +
        "  235.0 -0.012\n" +
        "  520.0 -0.012\n" +
        "  560.0 -0.004\n" +
        "  650.0  0.000\n" +
        "  900.0 -0.012\n" +
        "END\n" +
        "\n" +
        "SCHEDULE regen_heat_pickup_profile columns=time,value units=s,W\n" +
        "  0.0    0.0\n" +
        "  25.0   8.0e5\n" +
        "  90.0   4.5e6\n" +
        "  210.0  4.5e6\n" +
        "  520.0  4.0e5\n" +
        "  650.0  3.4e6\n" +
        "  900.0  6.0e5\n" +
        "END\n" +
        "\n" +
        "SCHEDULE turbine_tap_fraction_profile columns=time,value\n" +
        "  0.0    0.00\n" +
        "  10.0   0.02\n" +
        "  35.0   0.055\n" +
        "  90.0   0.050\n" +
        "  210.0  0.050\n" +
        "  520.0  0.000\n" +
        "  560.0  0.045\n" +
        "  650.0  0.040\n" +
        "  900.0  0.000\n" +
        "END\n" +
        "\n" +
        "SCHEDULE main_pump_efficiency_profile columns=time,value\n" +
        "  0.0    0.20\n" +
        "  25.0   0.55\n" +
        "  90.0   0.70\n" +
        "  210.0  0.68\n" +
        "  520.0  0.20\n" +
        "  650.0  0.64\n" +
        "  900.0  0.20\n" +
        "END\n" +
        "\n" +
        "SCHEDULE boost_pump_efficiency_profile columns=time,value\n" +
        "  0.0    0.10\n" +
        "  6.0    0.40\n" +
        "  18.0   0.56\n" +
        "  90.0   0.50\n" +
        "  520.0  0.10\n" +
        "  650.0  0.45\n" +
        "  900.0  0.10\n" +
        "END\n" +
        "\n" +
        "SCHEDULE turbine_efficiency_profile columns=time,value\n" +
        "  0.0    0.20\n" +
        "  25.0   0.60\n" +
        "  90.0   0.71\n" +
        "  210.0  0.69\n" +
        "  520.0  0.20\n" +
        "  650.0  0.66\n" +
        "  900.0  0.20\n" +
        "END\n" +
        "\n" +
        "SCHEDULE shaft_speed_guess_profile columns=time,value units=s,rpm\n" +
        "  0.0    450.0\n" +
        "  90.0   5200.0\n" +
        "  210.0  5200.0\n" +
        "  520.0  450.0\n" +
        "  650.0  4800.0\n" +
        "  900.0  450.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE chamber_pressure_target_profile columns=time,value units=s,Pa\n" +
        "  0.0    2.0e5\n" +
        "  90.0   5.0e6\n" +
        "  210.0  5.0e6\n" +
        "  520.0  2.0e5\n" +
        "  650.0  4.2e6\n" +
        "  900.0  2.0e5\n" +
        "END\n" +
        "\n" +
        "SCHEDULE core_axial_shape_profile columns=position,value\n" +
        "  0.00   0.45\n" +
        "  0.20   0.85\n" +
        "  0.50   1.18\n" +
        "  0.80   0.92\n" +
        "  1.00   0.50\n" +
        "END\n" +
        "\n" +
        "SCHEDULE core_radial_peaking_profile columns=radius_fraction,value\n" +
        "  0.00   1.05\n" +
        "  0.35   1.10\n" +
        "  0.70   0.98\n" +
        "  1.00   0.72\n" +
        "END\n" +
        "\n" +
        "SCHEDULE channel_group_power_shape_profile columns=group,value\n" +
        "  inner   1.10\n" +
        "  mid     1.02\n" +
        "  outer   0.88\n" +
        "  bypass  0.20\n" +
        "END\n" +
        "\n" +
        "SCHEDULE channel_group_flow_split_profile columns=group,value\n" +
        "  inner   0.30\n" +
        "  mid     0.42\n" +
        "  outer   0.25\n" +
        "  bypass  0.03\n" +
        "END\n" +
        "\n" +
        "SCHEDULE channel_representative_flow_profile columns=time,value units=s,kg_per_s\n" +
        "  0.0    0.0\n" +
        "  25.0   3.0\n" +
        "  90.0   8.0\n" +
        "  210.0  8.0\n" +
        "  260.0  1.5\n" +
        "  520.0  0.0\n" +
        "  650.0  6.5\n" +
        "  760.0  6.5\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE channel_hydraulic_diameter_profile columns=group,value units=group,m\n" +
        "  inner   0.0032\n" +
        "  mid     0.0035\n" +
        "  outer   0.0038\n" +
        "  bypass  0.0060\n" +
        "END\n" +
        "\n" +
        "SCHEDULE channel_heated_length_profile columns=group,value units=group,m\n" +
        "  inner   0.850\n" +
        "  mid     0.850\n" +
        "  outer   0.850\n" +
        "  bypass  0.650\n" +
        "END\n" +
        "\n" +
        "SCHEDULE ledinegg_margin_profile columns=time,value\n" +
        "  0.0    1.00\n" +
        "  25.0   0.72\n" +
        "  90.0   0.42\n" +
        "  210.0  0.40\n" +
        "  260.0  0.68\n" +
        "  520.0  0.95\n" +
        "  650.0  0.48\n" +
        "  760.0  0.52\n" +
        "  900.0  1.00\n" +
        "END\n" +
        "\n" +
        "\n" +
        "SCHEDULE ledinegg_status_profile columns=time,value\n" +
        "  0.0    nominal\n" +
        "  25.0   nominal\n" +
        "  90.0   nominal\n" +
        "  210.0  nominal\n" +
        "  260.0  recovering\n" +
        "  520.0  reset\n" +
        "  650.0  watch\n" +
        "  760.0  watch\n" +
        "  900.0  nominal\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_pitch_command_profile columns=time,value units=s,deg\n" +
        "  0.0    0.00\n" +
        "  120.0  0.00\n" +
        "  135.0  1.50\n" +
        "  150.0 -1.00\n" +
        "  165.0  0.00\n" +
        "  540.0  0.00\n" +
        "  565.0 -1.25\n" +
        "  590.0  0.75\n" +
        "  620.0  0.00\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_yaw_command_profile columns=time,value units=s,deg\n" +
        "  0.0    0.00\n" +
        "  120.0  0.00\n" +
        "  135.0 -0.75\n" +
        "  150.0  1.25\n" +
        "  165.0  0.00\n" +
        "  540.0  0.00\n" +
        "  565.0  1.00\n" +
        "  590.0 -0.50\n" +
        "  620.0  0.00\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_pitch_response_profile columns=time,value units=s,deg\n" +
        "  0.0    0.00\n" +
        "  122.0  0.00\n" +
        "  137.0  1.42\n" +
        "  152.0 -0.92\n" +
        "  167.0  0.00\n" +
        "  542.0  0.00\n" +
        "  567.0 -1.18\n" +
        "  592.0  0.70\n" +
        "  622.0  0.00\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_yaw_response_profile columns=time,value units=s,deg\n" +
        "  0.0    0.00\n" +
        "  122.0  0.00\n" +
        "  137.0 -0.70\n" +
        "  152.0  1.15\n" +
        "  167.0  0.00\n" +
        "  542.0  0.00\n" +
        "  567.0  0.94\n" +
        "  592.0 -0.46\n" +
        "  622.0  0.00\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_gimbal_rate_command_profile columns=time,value units=s,deg_per_s\n" +
        "  0.0    0.00\n" +
        "  130.0  0.35\n" +
        "  150.0  0.42\n" +
        "  165.0  0.00\n" +
        "  560.0  0.38\n" +
        "  590.0  0.30\n" +
        "  620.0  0.00\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_pitch_rate_profile columns=time,value units=s,deg_per_s\n" +
        "  0.0    0.00\n" +
        "  130.0  0.32\n" +
        "  150.0  0.39\n" +
        "  165.0  0.00\n" +
        "  560.0  0.35\n" +
        "  590.0  0.28\n" +
        "  620.0  0.00\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_yaw_rate_profile columns=time,value units=s,deg_per_s\n" +
        "  0.0    0.00\n" +
        "  130.0  0.28\n" +
        "  150.0  0.36\n" +
        "  165.0  0.00\n" +
        "  560.0  0.33\n" +
        "  590.0  0.25\n" +
        "  620.0  0.00\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_authority_limit_profile columns=time,value units=s,deg\n" +
        "  0.0    0.00\n" +
        "  90.0   3.00\n" +
        "  210.0  3.00\n" +
        "  520.0  0.00\n" +
        "  650.0  2.50\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_bleed_valve_cv_profile columns=time,value\n" +
        "  0.0    0.000\n" +
        "  120.0  0.000\n" +
        "  135.0  0.030\n" +
        "  150.0  0.045\n" +
        "  165.0  0.000\n" +
        "  540.0  0.000\n" +
        "  565.0  0.035\n" +
        "  590.0  0.030\n" +
        "  620.0  0.000\n" +
        "  900.0  0.000\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_parasitic_bleed_flow_profile columns=time,value units=s,kg_per_s\n" +
        "  0.0    0.000\n" +
        "  120.0  0.000\n" +
        "  135.0  0.045\n" +
        "  150.0  0.070\n" +
        "  165.0  0.000\n" +
        "  540.0  0.000\n" +
        "  565.0  0.055\n" +
        "  590.0  0.045\n" +
        "  620.0  0.000\n" +
        "  900.0  0.000\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_hydraulic_power_profile columns=time,value units=s,W\n" +
        "  0.0    0.0\n" +
        "  120.0  0.0\n" +
        "  135.0  4.0e4\n" +
        "  150.0  7.5e4\n" +
        "  165.0  0.0\n" +
        "  540.0  0.0\n" +
        "  565.0  5.5e4\n" +
        "  590.0  4.2e4\n" +
        "  620.0  0.0\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_hydraulic_power_demand_profile columns=time,value units=s,W\n" +
        "  0.0    0.0\n" +
        "  120.0  0.0\n" +
        "  135.0  3.6e4\n" +
        "  150.0  7.1e4\n" +
        "  165.0  0.0\n" +
        "  540.0  0.0\n" +
        "  565.0  5.0e4\n" +
        "  590.0  3.8e4\n" +
        "  620.0  0.0\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_hydraulic_pressure_profile columns=time,value units=s,Pa\n" +
        "  0.0    0.0\n" +
        "  120.0  0.0\n" +
        "  135.0  1.6e7\n" +
        "  150.0  2.1e7\n" +
        "  165.0  5.0e6\n" +
        "  540.0  0.0\n" +
        "  565.0  1.9e7\n" +
        "  590.0  1.7e7\n" +
        "  620.0  5.0e6\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_hydraulic_return_pressure_profile columns=time,value units=s,Pa\n" +
        "  0.0    0.0\n" +
        "  120.0  0.0\n" +
        "  135.0  2.5e6\n" +
        "  150.0  3.0e6\n" +
        "  165.0  1.0e6\n" +
        "  540.0  0.0\n" +
        "  565.0  2.8e6\n" +
        "  590.0  2.4e6\n" +
        "  620.0  1.0e6\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_accumulator_energy_profile columns=time,value units=s,J\n" +
        "  0.0    0.0\n" +
        "  120.0  1.5e4\n" +
        "  135.0  1.2e4\n" +
        "  150.0  8.0e3\n" +
        "  165.0  1.4e4\n" +
        "  540.0  1.0e4\n" +
        "  565.0  7.0e3\n" +
        "  590.0  8.5e3\n" +
        "  620.0  1.1e4\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_accumulator_draw_profile columns=time,value units=s,W\n" +
        "  0.0    0.0\n" +
        "  135.0  8.0e3\n" +
        "  150.0  1.2e4\n" +
        "  165.0  0.0\n" +
        "  565.0  9.0e3\n" +
        "  590.0  7.0e3\n" +
        "  620.0  0.0\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_torque_demand_profile columns=time,value units=s,N_m\n" +
        "  0.0    0.0\n" +
        "  120.0  0.0\n" +
        "  135.0  1.2e5\n" +
        "  150.0  1.8e5\n" +
        "  165.0  0.0\n" +
        "  540.0  0.0\n" +
        "  565.0  1.5e5\n" +
        "  590.0  1.1e5\n" +
        "  620.0  0.0\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_structural_torque_profile columns=time,value units=s,N_m\n" +
        "  0.0    0.0\n" +
        "  120.0  0.0\n" +
        "  135.0  1.4e5\n" +
        "  150.0  2.1e5\n" +
        "  165.0  0.0\n" +
        "  540.0  0.0\n" +
        "  565.0  1.7e5\n" +
        "  590.0  1.3e5\n" +
        "  620.0  0.0\n" +
        "  900.0  0.0\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_slew_rate_limit_profile columns=time,value units=s,deg_per_s\n" +
        "  0.0    0.00\n" +
        "  90.0   0.50\n" +
        "  210.0  0.50\n" +
        "  520.0  0.00\n" +
        "  650.0  0.45\n" +
        "  900.0  0.00\n" +
        "END\n" +
        "\n" +
        "SCHEDULE tvc_nozzle_efficiency_penalty_profile columns=time,value\n" +
        "  0.0    0.0000\n" +
        "  120.0  0.0000\n" +
        "  135.0  0.0015\n" +
        "  150.0  0.0025\n" +
        "  165.0  0.0000\n" +
        "  540.0  0.0000\n" +
        "  565.0  0.0020\n" +
        "  590.0  0.0015\n" +
        "  620.0  0.0000\n" +
        "  900.0  0.0000\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Initial conditions\n" +
        "# ----------------------------------------------------------------------\n" +
        "INITIAL_CONDITION n_lh2_tank_outlet      pressure=1.35e6 temperature=22.5\n" +
        "INITIAL_CONDITION n_turbopump_inlet      pressure=1.20e6 temperature=23.0\n" +
        "INITIAL_CONDITION n_turbopump_discharge  pressure=1.30e6 temperature=24.0\n" +
        "INITIAL_CONDITION n_regen_exit           pressure=1.10e6 temperature=80.0\n" +
        "INITIAL_CONDITION n_core_inlet_plenum    pressure=1.00e6 temperature=110.0\n" +
        "INITIAL_CONDITION n_core_exit_plenum     pressure=2.50e5 temperature=650.0\n" +
        "INITIAL_CONDITION n_chamber              pressure=2.00e5 temperature=650.0\n" +
        "INITIAL_CONDITION n_nozzle_exit          pressure=1.50e5 temperature=620.0\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Requested outputs for plots/cards in the app\n" +
        "# ----------------------------------------------------------------------\n" +
        "OUTPUT time_history name=tank_pressure target=lh2_supply_tank.pressure interval=0.25 panel=feed\n" +
        "OUTPUT time_history name=para_fraction target=ortho_para_converter.equilibrium interval=0.25 panel=feed\n" +
        "OUTPUT time_history name=boost_pump_speed target=boost_pump.speed interval=0.25 panel=feed\n" +
        "OUTPUT time_history name=main_pump_mdot target=main_turbopump.mass_flow interval=0.25 panel=feed\n" +
        "OUTPUT time_history name=shaft_speed target=main_turbomachinery_shaft.speed interval=0.25 panel=turbomachinery\n" +
        "OUTPUT time_history name=core_power target=reactor_core.power interval=0.25 panel=core\n" +
        "OUTPUT time_history name=channel_representative_flow target=core_channel_bundle.representative_flow interval=0.25 panel=core\n" +
        "OUTPUT time_history name=channel_group_power_shape target=core_channel_bundle.group_power_shape interval=0.25 panel=core\n" +
        "OUTPUT time_history name=channel_group_flow_split target=core_channel_bundle.group_flow_split interval=0.25 panel=core\n" +
        "OUTPUT time_history name=decay_heat target=decay_heat_model.thermal_power interval=0.25 panel=core\n" +
        "OUTPUT time_history name=iodine_inventory target=fission_product_poisoning.i135_inventory interval=0.25 panel=core\n" +
        "OUTPUT time_history name=xenon_inventory target=fission_product_poisoning.xe135_inventory interval=0.25 panel=core\n" +
        "OUTPUT time_history name=xenon_poison_worth target=fission_product_poisoning.net_worth interval=0.25 panel=core\n" +
        "OUTPUT time_history name=poisoned_reactivity_margin target=fission_product_poisoning.reactivity_margin interval=0.25 panel=core\n" +
        "OUTPUT time_history name=control_drum_angle target=control_drum_bank.angle interval=0.25 panel=core\n" +
        "OUTPUT time_history name=aux_poison_insertion target=auxiliary_poison_bank.insertion interval=0.25 panel=core\n" +
        "OUTPUT time_history name=shield_tank_heat target=internal_shield.heat_leak interval=0.25 panel=thermal\n" +
        "OUTPUT time_history name=reflector_gamma_heat target=reflector_gamma_heating.thermal_power interval=0.25 panel=thermal\n" +
        "OUTPUT time_history name=core_exit_temperature target=n_core_exit_plenum.temperature interval=0.25 panel=thermal\n" +
        "OUTPUT time_history name=ledinegg_margin target=ledinegg_instability_switch.margin interval=0.25 panel=thermal\n" +
        "OUTPUT time_history name=ledinegg_status target=ledinegg_instability_switch.status interval=0.25 panel=thermal\n" +
        "OUTPUT time_history name=chamber_pressure target=thrust_chamber.pressure interval=0.25 panel=nozzle\n" +
        "OUTPUT time_history name=nozzle_mass_flow target=bell_nozzle.mass_flow interval=0.25 panel=nozzle\n" +
        "OUTPUT time_history name=thrust_proxy target=bell_nozzle.ideal_thrust interval=0.25 panel=nozzle\n" +
        "OUTPUT time_history name=tvc_pitch_angle target=nozzle_gimbal_joint.pitch_angle interval=0.25 panel=nozzle\n" +
        "OUTPUT time_history name=tvc_yaw_angle target=nozzle_gimbal_joint.yaw_angle interval=0.25 panel=nozzle\n" +
        "OUTPUT time_history name=tvc_torque_demand target=tvc_actuator_ring.torque_demand interval=0.25 panel=nozzle\n" +
        "OUTPUT time_history name=tvc_hydraulic_pressure target=tvc_hydraulic_power_unit.pressure_supply interval=0.25 panel=nozzle\n" +
        "OUTPUT time_history name=tvc_parasitic_bleed_flow target=tvc_hot_gas_bleed_valve.mass_flow interval=0.25 panel=nozzle\n" +
        "OUTPUT time_history name=tvc_nozzle_efficiency_penalty target=bell_nozzle.tvc_efficiency_penalty interval=0.25 panel=nozzle\n" +
        "OUTPUT snapshot name=mission_sequence at=0.0,90.0,210.0,520.0,650.0,900.0 panel=overview\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# App graphics metadata\n" +
        "# ----------------------------------------------------------------------\n" +
        "GRAPHICS_LAYOUT\n" +
        "  canvas_width       = 1500\n" +
        "  canvas_height      = 590\n" +
        "  coordinate_system  = screen\n" +
        "  theme_hint         = nasa_engineering_dark\n" +
        "  primary_flow       = lh2_supply_tank -> tank_isolation_valve -> boost_pump -> main_turbopump -> nozzle_regen_jacket -> ortho_para_converter -> reactor_core -> core_exit_plenum -> turbine_tap -> thrust_chamber -> bell_nozzle -> space_ambient\n" +
        "  swimlanes          = feed:250-360,core:155-420,turbomachinery:360-455,nozzle:170-355,tvc:430-545,instrumentation:085-155\n" +
        "END\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Parser metadata\n" +
        "# ----------------------------------------------------------------------\n" +
        "META expected_sections=CASE,TITLE,UNITS,SYSTEM_METADATA,TIME_CONTROL,SOLVER_CONTROL,FLUID,MISSION_PROFILE,NODE,BOUNDARY,COMPONENT,SOLVER_VARIABLE,SOLVER_RESIDUAL,SENSOR,CONNECT,MAP,SCHEDULE,INITIAL_CONDITION,OUTPUT,GRAPHICS_LAYOUT,META,END_CASE\n" +
        "META fixture_intent=ntp_system_graphics_component_network_restart_parser_baseline\n" +
        "META parser_features=blocks,key_value_pairs,quoted_strings,comments,inline_units,node_references,map_references,schedule_references,state_references,connectivity_graph,graphics_tuples,tags,panels,mission_phases,solver_residuals,nozzle_presets,ledinegg_stability_switch,iodine_xenon_point_kinetics,reflector_gamma_heating,decay_heat_model,multi_channel_core,thrust_vector_control,hydraulic_actuator_ring,turbine_exhaust_bleed\n" +
        "META validation_level=syntactic_fixture_only\n" +
        "END_CASE",
    moose:
        "\n" +
        "\n" +
        "# ======================================================================\n" +
        "# NTP-SYS-CONSOLE ADVANCED INPUT: MOOSE MULTIPHYSICS FIXTURE\n" +
        "# ----------------------------------------------------------------------\n" +
        "# File:        ntp_moose.inp\n" +
        "# Case ID:     advanced-moose-ntp-003\n" +
        "# Family:      ntp-sys-console-advanced\n" +
        "# Discipline:  thermal structures / reactor transient surrogate /\n" +
        "#              conjugate heat-transfer metadata\n" +
        "# Agencies:    DOE/NASA-style review fixture for parser demonstration\n" +
        "# Pairing:     ntp_rocet.inp, ntr_high_fidelity_system_model.inp\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Purpose\n" +
        "#   MOOSE-inspired, non-operational input deck for the NTP systems console.\n" +
        "#   The structure intentionally tracks the more advanced ROCETS and MCNP\n" +
        "#   fixtures so the app can cross-link names, panels, state histories,\n" +
        "#   instrumentation points, and geometry regions across disciplines.\n" +
        "#\n" +
        "# Scope represented\n" +
        "#   - axisymmetric r-z thrust assembly thermal surrogate\n" +
        "#   - multi-channel core thermal response and Ledinegg advisory margin\n" +
        "#   - control-drum and auxiliary-poison reactivity proxy variables\n" +
        "#   - iodine/xenon and decay-heat state metadata for trend panels\n" +
        "#   - reflector gamma heating and internal shield heat leak to tank\n" +
        "#   - para/ortho hydrogen conditioning penalty metadata\n" +
        "#   - nozzle/chamber/regenerative wall temperature tracking\n" +
        "#   - optional thrust-vectoring hydraulic bleed penalty cross-link\n" +
        "#   - thrust-frame load-path and gimbal-pivot thermal isolation metadata\n" +
        "#   - core support grid plate thermal/pressure-load survivability proxy\n" +
        "#   - effusion-cooled reflector liner thermal barrier proxy\n" +
        "#   - pogo accumulator pressure-wave damping metadata\n" +
        "#   - helium-purged turbine shaft seal and interstage purge metadata\n" +
        "#   - vibration-neutronic coupling and point-kinetics stability proxy\n" +
        "#   - fluid-hydraulic core grid pressure-drop equation metadata\n" +
        "#   - structural-dynamic frequency map for thrust-frame/pogo isolation\n" +
        "#\n" +
        "# Verification status\n" +
        "#   This is not a validated MOOSE input, not a safety analysis, not a\n" +
        "#   design calculation, and not an executable reactor model.  It is a\n" +
        "#   parser and visualization fixture with deliberately bounded surrogate\n" +
        "#   physics.\n" +
        "# ======================================================================\n" +
        "\n" +
        "[Problem]\n" +
        "  type = FEProblem\n" +
        "  coord_type = RZ\n" +
        "[]\n" +
        "\n" +
        "[Mesh]\n" +
        "  type = GeneratedMesh\n" +
        "  dim = 2\n" +
        "  nx = 72\n" +
        "  ny = 160\n" +
        "  xmin = 0.00\n" +
        "  xmax = 0.92\n" +
        "  ymin = -1.35\n" +
        "  ymax = 5.40\n" +
        "  elem_type = QUAD4\n" +
        "[]\n" +
        "\n" +
        "[GlobalParams]\n" +
        "  family = LAGRANGE\n" +
        "  order = FIRST\n" +
        "  displacements = ''\n" +
        "[]\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Primary thermal variables\n" +
        "# ----------------------------------------------------------------------\n" +
        "[Variables]\n" +
        "  [fuel_temperature]\n" +
        "    initial_condition = 850.0\n" +
        "  []\n" +
        "\n" +
        "  [moderator_temperature]\n" +
        "    initial_condition = 700.0\n" +
        "  []\n" +
        "\n" +
        "  [reflector_temperature]\n" +
        "    initial_condition = 690.0\n" +
        "  []\n" +
        "\n" +
        "  [shield_temperature]\n" +
        "    initial_condition = 255.0\n" +
        "  []\n" +
        "\n" +
        "  [tank_wall_temperature]\n" +
        "    initial_condition = 22.5\n" +
        "  []\n" +
        "\n" +
        "  [coolant_temperature]\n" +
        "    initial_condition = 82.0\n" +
        "  []\n" +
        "\n" +
        "  [regen_wall_temperature]\n" +
        "    initial_condition = 295.0\n" +
        "  []\n" +
        "\n" +
        "  [chamber_wall_temperature]\n" +
        "    initial_condition = 315.0\n" +
        "  []\n" +
        "\n" +
        "  [nozzle_wall_temperature]\n" +
        "    initial_condition = 310.0\n" +
        "  []\n" +
        "\n" +
        "  [gimbal_ring_temperature]\n" +
        "    initial_condition = 315.0\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_temperature]\n" +
        "    initial_condition = 295.0\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_temperature]\n" +
        "    initial_condition = 1200.0\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_temperature]\n" +
        "    initial_condition = 900.0\n" +
        "  []\n" +
        "\n" +
        "  [pogo_accumulator_temperature]\n" +
        "    initial_condition = 115.0\n" +
        "  []\n" +
        "\n" +
        "  [shaft_seal_temperature]\n" +
        "    initial_condition = 310.0\n" +
        "  []\n" +
        "[]\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Parser-friendly state variables and imported system proxies\n" +
        "# ----------------------------------------------------------------------\n" +
        "[AuxVariables]\n" +
        "  [normalized_core_power]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [decay_heat_fraction]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [iodine_inventory_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [xenon_inventory_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [control_drum_angle_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [aux_poison_insertion_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 1.0\n" +
        "  []\n" +
        "\n" +
        "  [axial_power_shape]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [radial_peaking_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 1.0\n" +
        "  []\n" +
        "\n" +
        "  [rocets_mass_flow_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [turbine_tap_fraction_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [ledinegg_margin_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 1.0\n" +
        "  []\n" +
        "\n" +
        "  [ledinegg_status_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [reflector_gamma_heat_fraction]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [tank_shield_heat_leak_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [para_fraction_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.998\n" +
        "  []\n" +
        "\n" +
        "  [ortho_para_enthalpy_penalty_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [gimbal_hydraulic_bleed_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [thermal_margin_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 1.0\n" +
        "  []\n" +
        "\n" +
        "  [thrust_load_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_compression_margin_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 1.0\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_pressure_drop_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_creep_margin_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 1.0\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_effusion_fraction_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_barrier_margin_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 1.0\n" +
        "  []\n" +
        "\n" +
        "  [pogo_accumulator_damping_ratio_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [feedline_pressure_wave_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [helium_purge_flow_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [shaft_seal_leakage_margin_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 1.0\n" +
        "  []\n" +
        "\n" +
        "  [grid_flow_area_fraction_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.42\n" +
        "  []\n" +
        "\n" +
        "  [grid_form_loss_coefficient_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [grid_exit_density_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [grid_exit_velocity_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [grid_coupled_pressure_drop_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [point_kinetics_matrix_stability_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 1.0\n" +
        "  []\n" +
        "\n" +
        "  [core_density_oscillation_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [fuel_alignment_shift_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_resonance_gain_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [pogo_suppressor_attenuation_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [net_coupled_gain_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [fluid_phase_angle_proxy]\n" +
        "    family = MONOMIAL\n" +
        "    order = CONSTANT\n" +
        "    initial_condition = 0.0\n" +
        "  []\n" +
        "[]\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# System profiles aligned to the advanced ROCETS mission timeline\n" +
        "# ----------------------------------------------------------------------\n" +
        "[Functions]\n" +
        "  [core_power_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.0 0.08 0.55 1.00 1.00 0.08 0.02 0.62 0.82 0.05'\n" +
        "  []\n" +
        "\n" +
        "  [decay_heat_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 90.0 210.0 225.0 300.0 520.0 650.0 900.0'\n" +
        "    y = '0.0 0.012 0.015 0.070 0.034 0.018 0.022 0.010'\n" +
        "  []\n" +
        "\n" +
        "  [iodine_inventory_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 90.0 210.0 300.0 520.0 650.0 900.0'\n" +
        "    y = '0.0 0.35 0.82 0.96 0.72 0.86 0.40'\n" +
        "  []\n" +
        "\n" +
        "  [xenon_inventory_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 90.0 210.0 300.0 520.0 650.0 900.0'\n" +
        "    y = '0.0 0.12 0.35 0.78 1.00 0.86 0.55'\n" +
        "  []\n" +
        "\n" +
        "  [control_drum_angle_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.0 18.0 64.0 92.0 92.0 8.0 0.0 58.0 80.0 0.0'\n" +
        "  []\n" +
        "\n" +
        "  [aux_poison_insertion_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 900.0'\n" +
        "    y = '1.00 0.30 0.05 0.05 0.85 0.90 0.25 1.00'\n" +
        "  []\n" +
        "\n" +
        "  [mass_flow_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.0 1.2 5.6 8.0 8.0 0.4 0.2 5.2 6.9 0.1'\n" +
        "  []\n" +
        "\n" +
        "  [turbine_tap_fraction_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.00 0.06 0.085 0.085 0.02 0.02 0.075 0.080 0.00'\n" +
        "  []\n" +
        "\n" +
        "  [axial_power_shape_function]\n" +
        "    type = ParsedFunction\n" +
        "    expression = '0.58 + 0.70 * exp(-pow((y - 1.20) / 1.30, 2))'\n" +
        "  []\n" +
        "\n" +
        "  [radial_peaking_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 520.0 650.0 900.0'\n" +
        "    y = '1.00 1.08 1.12 1.12 1.06 1.10 1.00'\n" +
        "  []\n" +
        "\n" +
        "  [ledinegg_margin_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '1.00 0.92 0.78 0.74 0.76 0.95 0.98 0.81 0.79 1.00'\n" +
        "  []\n" +
        "\n" +
        "  [ledinegg_status_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.0 0.0 1.0 1.0 0.0 0.0 0.0 1.0 0.0'\n" +
        "  []\n" +
        "\n" +
        "  [reflector_gamma_heat_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 650.0 900.0'\n" +
        "    y = '0.000 0.006 0.015 0.015 0.004 0.002 0.010 0.001'\n" +
        "  []\n" +
        "\n" +
        "  [tank_shield_heat_leak_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 90.0 210.0 300.0 520.0 650.0 900.0'\n" +
        "    y = '0.00 0.18 0.30 0.20 0.14 0.22 0.08'\n" +
        "  []\n" +
        "\n" +
        "  [para_fraction_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 90.0 210.0 520.0 650.0 900.0'\n" +
        "    y = '0.998 0.920 0.880 0.900 0.870 0.940'\n" +
        "  []\n" +
        "\n" +
        "  [ortho_para_enthalpy_penalty_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 520.0 650.0 900.0'\n" +
        "    y = '0.0 0.05 0.11 0.12 0.06 0.09 0.02'\n" +
        "  []\n" +
        "\n" +
        "  [regen_wall_sink_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 650.0 900.0'\n" +
        "    y = '0.0 0.22 0.48 0.50 0.18 0.06 0.39 0.02'\n" +
        "  []\n" +
        "\n" +
        "  [nozzle_radiation_sink_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 90.0 210.0 225.0 520.0 650.0 900.0'\n" +
        "    y = '0.00 0.34 0.36 0.24 0.16 0.32 0.08'\n" +
        "  []\n" +
        "\n" +
        "  [gimbal_hydraulic_bleed_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 90.0 130.0 150.0 210.0 520.0 560.0 590.0 650.0 900.0'\n" +
        "    y = '0.00 0.00 0.018 0.006 0.00 0.00 0.014 0.004 0.00 0.00'\n" +
        "  []\n" +
        "\n" +
        "  [thermal_margin_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 650.0 900.0'\n" +
        "    y = '1.00 0.88 0.76 0.74 0.91 0.93 0.80 0.98'\n" +
        "  []\n" +
        "\n" +
        "  [thrust_load_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 12.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.0 1.4e5 9.5e5 1.725e6 1.725e6 1.0e5 5.0e4 1.05e6 1.42e6 2.0e4'\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_compression_margin_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '1.00 0.88 0.72 0.70 0.93 0.96 0.80 0.76 0.99'\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_pressure_drop_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.00 2.10e6 7.00e6 7.00e6 0.55e6 0.20e6 5.40e6 6.40e6 0.10e6'\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_creep_margin_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '1.00 0.86 0.63 0.60 0.88 0.93 0.72 0.66 0.98'\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_effusion_fraction_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.000 0.010 0.026 0.026 0.006 0.004 0.020 0.023 0.000'\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_barrier_margin_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '1.00 0.90 0.74 0.72 0.90 0.94 0.80 0.77 0.98'\n" +
        "  []\n" +
        "\n" +
        "  [pogo_accumulator_damping_ratio_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 120.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.00 0.10 0.22 0.28 0.24 0.08 0.05 0.18 0.22 0.00'\n" +
        "  []\n" +
        "\n" +
        "  [feedline_pressure_wave_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 120.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.00 0.12 0.34 0.22 0.26 0.08 0.06 0.24 0.30 0.02'\n" +
        "  []\n" +
        "\n" +
        "  [helium_purge_flow_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.000 0.006 0.014 0.014 0.010 0.006 0.012 0.013 0.002'\n" +
        "  []\n" +
        "\n" +
        "  [shaft_seal_leakage_margin_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '1.00 0.92 0.78 0.76 0.86 0.94 0.80 0.79 0.98'\n" +
        "  []\n" +
        "\n" +
        "  [grid_flow_area_fraction_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 900.0'\n" +
        "    y = '0.42 0.42'\n" +
        "  []\n" +
        "\n" +
        "  [grid_form_loss_coefficient_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 900.0'\n" +
        "    y = '2.087 2.087'\n" +
        "  []\n" +
        "\n" +
        "  [grid_exit_density_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.00 0.42 0.94 0.92 0.18 0.08 0.76 0.86 0.04'\n" +
        "  []\n" +
        "\n" +
        "  [grid_exit_velocity_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.0 1420.0 2660.0 2700.0 420.0 220.0 2380.0 2580.0 90.0'\n" +
        "  []\n" +
        "\n" +
        "  [grid_coupled_pressure_drop_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.00 0.89e6 6.97e6 7.00e6 0.33e6 0.04e6 4.49e6 5.83e6 0.02e6'\n" +
        "  []\n" +
        "\n" +
        "  [point_kinetics_matrix_stability_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 120.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '1.00 0.98 0.95 0.96 0.95 0.99 0.99 0.97 0.96 1.00'\n" +
        "  []\n" +
        "\n" +
        "  [core_density_oscillation_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 120.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.000 0.008 0.020 0.012 0.014 0.005 0.004 0.013 0.016 0.001'\n" +
        "  []\n" +
        "\n" +
        "  [fuel_alignment_shift_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '0.0 45.0 90.0 120.0 210.0 225.0 520.0 545.0 650.0 900.0'\n" +
        "    y = '0.0000 0.0002 0.0008 0.0005 0.0007 0.0002 0.0001 0.0006 0.0007 0.0000'\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_resonance_gain_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '1.0 10.0 20.0 24.5 35.0 50.0'\n" +
        "    y = '0.1 1.8 12.4 28.5 3.1 0.2'\n" +
        "  []\n" +
        "\n" +
        "  [pogo_suppressor_attenuation_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '1.0 10.0 20.0 24.5 35.0 50.0'\n" +
        "    y = '-0.05 -4.10 -28.50 -42.10 -18.20 -12.40'\n" +
        "  []\n" +
        "\n" +
        "  [net_coupled_gain_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '1.0 10.0 20.0 24.5 35.0 50.0'\n" +
        "    y = '0.05 -2.30 -16.10 -13.60 -15.10 -12.20'\n" +
        "  []\n" +
        "\n" +
        "  [fluid_phase_angle_profile]\n" +
        "    type = PiecewiseLinear\n" +
        "    x = '1.0 10.0 20.0 24.5 35.0 50.0'\n" +
        "    y = '-0.4 -12.5 -68.4 -90.0 -142.1 -174.5'\n" +
        "  []\n" +
        "[]\n" +
        "\n" +
        "[AuxKernels]\n" +
        "  [set_normalized_core_power]\n" +
        "    type = FunctionAux\n" +
        "    variable = normalized_core_power\n" +
        "    function = core_power_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_decay_heat_fraction]\n" +
        "    type = FunctionAux\n" +
        "    variable = decay_heat_fraction\n" +
        "    function = decay_heat_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_iodine_inventory_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = iodine_inventory_proxy\n" +
        "    function = iodine_inventory_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_xenon_inventory_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = xenon_inventory_proxy\n" +
        "    function = xenon_inventory_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_control_drum_angle_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = control_drum_angle_proxy\n" +
        "    function = control_drum_angle_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_aux_poison_insertion_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = aux_poison_insertion_proxy\n" +
        "    function = aux_poison_insertion_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_axial_power_shape]\n" +
        "    type = FunctionAux\n" +
        "    variable = axial_power_shape\n" +
        "    function = axial_power_shape_function\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_radial_peaking_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = radial_peaking_proxy\n" +
        "    function = radial_peaking_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_rocets_mass_flow_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = rocets_mass_flow_proxy\n" +
        "    function = mass_flow_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_turbine_tap_fraction_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = turbine_tap_fraction_proxy\n" +
        "    function = turbine_tap_fraction_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_ledinegg_margin_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = ledinegg_margin_proxy\n" +
        "    function = ledinegg_margin_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_ledinegg_status_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = ledinegg_status_proxy\n" +
        "    function = ledinegg_status_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_reflector_gamma_heat_fraction]\n" +
        "    type = FunctionAux\n" +
        "    variable = reflector_gamma_heat_fraction\n" +
        "    function = reflector_gamma_heat_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_tank_shield_heat_leak_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = tank_shield_heat_leak_proxy\n" +
        "    function = tank_shield_heat_leak_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_para_fraction_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = para_fraction_proxy\n" +
        "    function = para_fraction_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_ortho_para_enthalpy_penalty_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = ortho_para_enthalpy_penalty_proxy\n" +
        "    function = ortho_para_enthalpy_penalty_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_gimbal_hydraulic_bleed_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = gimbal_hydraulic_bleed_proxy\n" +
        "    function = gimbal_hydraulic_bleed_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_thermal_margin_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = thermal_margin_proxy\n" +
        "    function = thermal_margin_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_thrust_load_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = thrust_load_proxy\n" +
        "    function = thrust_load_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_thrust_frame_compression_margin_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = thrust_frame_compression_margin_proxy\n" +
        "    function = thrust_frame_compression_margin_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_core_support_grid_pressure_drop_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = core_support_grid_pressure_drop_proxy\n" +
        "    function = core_support_grid_pressure_drop_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_core_support_grid_creep_margin_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = core_support_grid_creep_margin_proxy\n" +
        "    function = core_support_grid_creep_margin_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_reflector_liner_effusion_fraction_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = reflector_liner_effusion_fraction_proxy\n" +
        "    function = reflector_liner_effusion_fraction_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_reflector_liner_barrier_margin_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = reflector_liner_barrier_margin_proxy\n" +
        "    function = reflector_liner_barrier_margin_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_pogo_accumulator_damping_ratio_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = pogo_accumulator_damping_ratio_proxy\n" +
        "    function = pogo_accumulator_damping_ratio_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_feedline_pressure_wave_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = feedline_pressure_wave_proxy\n" +
        "    function = feedline_pressure_wave_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_helium_purge_flow_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = helium_purge_flow_proxy\n" +
        "    function = helium_purge_flow_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_shaft_seal_leakage_margin_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = shaft_seal_leakage_margin_proxy\n" +
        "    function = shaft_seal_leakage_margin_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_grid_flow_area_fraction_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = grid_flow_area_fraction_proxy\n" +
        "    function = grid_flow_area_fraction_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_grid_form_loss_coefficient_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = grid_form_loss_coefficient_proxy\n" +
        "    function = grid_form_loss_coefficient_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_grid_exit_density_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = grid_exit_density_proxy\n" +
        "    function = grid_exit_density_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_grid_exit_velocity_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = grid_exit_velocity_proxy\n" +
        "    function = grid_exit_velocity_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_grid_coupled_pressure_drop_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = grid_coupled_pressure_drop_proxy\n" +
        "    function = grid_coupled_pressure_drop_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_point_kinetics_matrix_stability_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = point_kinetics_matrix_stability_proxy\n" +
        "    function = point_kinetics_matrix_stability_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_core_density_oscillation_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = core_density_oscillation_proxy\n" +
        "    function = core_density_oscillation_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_fuel_alignment_shift_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = fuel_alignment_shift_proxy\n" +
        "    function = fuel_alignment_shift_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_thrust_frame_resonance_gain_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = thrust_frame_resonance_gain_proxy\n" +
        "    function = thrust_frame_resonance_gain_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_pogo_suppressor_attenuation_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = pogo_suppressor_attenuation_proxy\n" +
        "    function = pogo_suppressor_attenuation_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_net_coupled_gain_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = net_coupled_gain_proxy\n" +
        "    function = net_coupled_gain_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "\n" +
        "  [set_fluid_phase_angle_proxy]\n" +
        "    type = FunctionAux\n" +
        "    variable = fluid_phase_angle_proxy\n" +
        "    function = fluid_phase_angle_profile\n" +
        "    execute_on = 'initial timestep_begin'\n" +
        "  []\n" +
        "[]\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Surrogate thermal equations.  These are intentionally lightweight and\n" +
        "# parser-oriented, but they preserve the component vocabulary used by the\n" +
        "# companion MCNP and ROCETS fixtures.\n" +
        "# ----------------------------------------------------------------------\n" +
        "[Kernels]\n" +
        "  [fuel_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = fuel_temperature\n" +
        "  []\n" +
        "\n" +
        "  [fuel_radial_axial_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = fuel_temperature\n" +
        "  []\n" +
        "\n" +
        "  [fuel_prompt_power_source]\n" +
        "    type = BodyForce\n" +
        "    variable = fuel_temperature\n" +
        "    value = 1.0\n" +
        "    function = core_power_profile\n" +
        "  []\n" +
        "\n" +
        "  [fuel_decay_heat_source]\n" +
        "    type = BodyForce\n" +
        "    variable = fuel_temperature\n" +
        "    value = 0.18\n" +
        "    function = decay_heat_profile\n" +
        "  []\n" +
        "\n" +
        "  [moderator_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = moderator_temperature\n" +
        "  []\n" +
        "\n" +
        "  [moderator_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = moderator_temperature\n" +
        "  []\n" +
        "\n" +
        "  [reflector_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = reflector_temperature\n" +
        "  []\n" +
        "\n" +
        "  [reflector_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = reflector_temperature\n" +
        "  []\n" +
        "\n" +
        "  [reflector_gamma_heat_source]\n" +
        "    type = BodyForce\n" +
        "    variable = reflector_temperature\n" +
        "    value = 0.45\n" +
        "    function = reflector_gamma_heat_profile\n" +
        "  []\n" +
        "\n" +
        "  [shield_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = shield_temperature\n" +
        "  []\n" +
        "\n" +
        "  [shield_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = shield_temperature\n" +
        "  []\n" +
        "\n" +
        "  [shield_radiation_deposition_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = shield_temperature\n" +
        "    value = 0.20\n" +
        "    function = tank_shield_heat_leak_profile\n" +
        "  []\n" +
        "\n" +
        "  [tank_wall_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = tank_wall_temperature\n" +
        "  []\n" +
        "\n" +
        "  [tank_wall_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = tank_wall_temperature\n" +
        "  []\n" +
        "\n" +
        "  [tank_wall_shield_heat_pickup]\n" +
        "    type = BodyForce\n" +
        "    variable = tank_wall_temperature\n" +
        "    value = 0.05\n" +
        "    function = tank_shield_heat_leak_profile\n" +
        "  []\n" +
        "\n" +
        "  [coolant_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = coolant_temperature\n" +
        "  []\n" +
        "\n" +
        "  [coolant_axial_transport_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = coolant_temperature\n" +
        "    value = 1.0\n" +
        "    function = mass_flow_profile\n" +
        "  []\n" +
        "\n" +
        "  [coolant_ortho_para_penalty_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = coolant_temperature\n" +
        "    value = -0.15\n" +
        "    function = ortho_para_enthalpy_penalty_profile\n" +
        "  []\n" +
        "\n" +
        "  [regen_wall_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = regen_wall_temperature\n" +
        "  []\n" +
        "\n" +
        "  [regen_wall_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = regen_wall_temperature\n" +
        "  []\n" +
        "\n" +
        "  [chamber_wall_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = chamber_wall_temperature\n" +
        "  []\n" +
        "\n" +
        "  [chamber_wall_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = chamber_wall_temperature\n" +
        "  []\n" +
        "\n" +
        "  [nozzle_wall_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = nozzle_wall_temperature\n" +
        "  []\n" +
        "\n" +
        "  [nozzle_wall_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = nozzle_wall_temperature\n" +
        "  []\n" +
        "\n" +
        "  [gimbal_ring_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = gimbal_ring_temperature\n" +
        "  []\n" +
        "\n" +
        "  [gimbal_ring_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = gimbal_ring_temperature\n" +
        "  []\n" +
        "\n" +
        "  [gimbal_bleed_heating_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = gimbal_ring_temperature\n" +
        "    value = 0.12\n" +
        "    function = gimbal_hydraulic_bleed_profile\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = thrust_frame_temperature\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = thrust_frame_temperature\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_load_heating_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = thrust_frame_temperature\n" +
        "    value = 2.5e-8\n" +
        "    function = thrust_load_profile\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = core_support_grid_temperature\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = core_support_grid_temperature\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_pressure_heating_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = core_support_grid_temperature\n" +
        "    value = 4.0e-8\n" +
        "    function = core_support_grid_pressure_drop_profile\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_coupled_loss_feedback_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = coolant_temperature\n" +
        "    value = -2.0e-8\n" +
        "    function = grid_coupled_pressure_drop_profile\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = reflector_liner_temperature\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_conduction]\n" +
        "    type = HeatConduction\n" +
        "    variable = reflector_liner_temperature\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_effusion_cooling_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = reflector_liner_temperature\n" +
        "    value = -18.0\n" +
        "    function = reflector_liner_effusion_fraction_profile\n" +
        "  []\n" +
        "\n" +
        "  [pogo_accumulator_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = pogo_accumulator_temperature\n" +
        "  []\n" +
        "\n" +
        "  [pogo_accumulator_damping_heat_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = pogo_accumulator_temperature\n" +
        "    value = 0.35\n" +
        "    function = feedline_pressure_wave_profile\n" +
        "  []\n" +
        "\n" +
        "  [shaft_seal_energy_storage]\n" +
        "    type = HeatConductionTimeDerivative\n" +
        "    variable = shaft_seal_temperature\n" +
        "  []\n" +
        "\n" +
        "  [shaft_seal_purge_cooling_proxy]\n" +
        "    type = BodyForce\n" +
        "    variable = shaft_seal_temperature\n" +
        "    value = -6.0\n" +
        "    function = helium_purge_flow_profile\n" +
        "  []\n" +
        "[]\n" +
        "\n" +
        "[Materials]\n" +
        "  [cermet_fuel_compact_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'reactor_core_inner_zone reactor_core_mid_zone reactor_core_outer_zone reactor_core_axial_segment_A reactor_core_axial_segment_B reactor_core_axial_segment_C'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '22.0 + 0.0016 * fuel_temperature'\n" +
        "    coupled_variables = 'fuel_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [graphite_moderator_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'moderator_matrix tie_tube_lattice_proxy core_periphery_graphite'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '48.0 - 0.0075 * moderator_temperature'\n" +
        "    coupled_variables = 'moderator_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [beryllium_reflector_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'reactor_reflector_annulus radial_reflector_outer_ring control_drum_bank'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '175.0 - 0.045 * reflector_temperature'\n" +
        "    coupled_variables = 'reflector_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [internal_shadow_shield_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'internal_shield_bath internal_shield_gamma_layer forward_shadow_shield_face'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '12.5 + 0.004 * shield_temperature'\n" +
        "    coupled_variables = 'shield_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [cryogenic_tank_wall_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'lh2_tank_forward_dome lh2_tank_wall_proxy tank_heat_leak_path'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '9.0 + 0.010 * tank_wall_temperature'\n" +
        "    coupled_variables = 'tank_wall_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [hydrogen_flowpath_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'n_regen_inlet regen_cooler_cold_hydrogen n_core_inlet_plenum n_core_midplane n_core_exit_plenum chamber_hot_hydrogen nozzle_throat_hydrogen nozzle_divergent_hydrogen turbine_tap_hot_hydrogen turbine_exhaust_mixer'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '0.18 + 1.0e-4 * coolant_temperature'\n" +
        "    coupled_variables = 'coolant_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [regen_channel_wall_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'regen_cooler_wall nozzle_regen_jacket nozzle_regen_cooler'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '13.6 + 0.011 * regen_wall_temperature'\n" +
        "    coupled_variables = 'regen_wall_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [chamber_liner_wall_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'thrust_chamber_liner chamber_liner_wall chamber_pressure_shell'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '14.4 + 0.010 * chamber_wall_temperature'\n" +
        "    coupled_variables = 'chamber_wall_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [nozzle_wall_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'bell_nozzle_wall nozzle_wall_proxy_structure nozzle_throat_wall deep_space_nozzle_preset_wall'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '15.2 + 0.012 * nozzle_wall_temperature'\n" +
        "    coupled_variables = 'nozzle_wall_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [hydraulic_gimbal_ring_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'dual_axis_hydraulic_actuator_ring gimbal_bearing_carrier hot_gas_bleed_hydraulic_loop'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '21.0 + 0.006 * gimbal_ring_temperature'\n" +
        "    coupled_variables = 'gimbal_ring_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_composite_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'thrust_structure_alignment_cone primary_load_ring aft_load_ring gimbal_pivot_mount thrust_frame_truss_members'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '7.5 + 0.003 * thrust_frame_temperature'\n" +
        "    coupled_variables = 'thrust_frame_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_refractory_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'uncooled_core_support_grid grid_plate_webs grid_plate_perforations exit_end_fuel_element_seats'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '95.0 - 0.010 * core_support_grid_temperature'\n" +
        "    coupled_variables = 'core_support_grid_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [effusion_liner_refractory_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'porous_reflector_core_liner effusion_cooling_plenum liner_hydrogen_boundary_layer'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '48.0 + 0.006 * reflector_liner_temperature'\n" +
        "    coupled_variables = 'reflector_liner_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [pogo_accumulator_shell_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'pogo_accumulator_volume accumulator_bellows accumulator_discharge_manifold'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '11.5 + 0.006 * pogo_accumulator_temperature'\n" +
        "    coupled_variables = 'pogo_accumulator_temperature'\n" +
        "  []\n" +
        "\n" +
        "  [shaft_seal_carbon_ring_surrogate]\n" +
        "    type = ParsedMaterial\n" +
        "    block = 'floating_carbon_ring_seals helium_interstage_purge_block turbine_shaft_seal_cavity bearing_purge_annulus'\n" +
        "    property_name = thermal_conductivity\n" +
        "    expression = '18.0 + 0.004 * shaft_seal_temperature'\n" +
        "    coupled_variables = 'shaft_seal_temperature'\n" +
        "  []\n" +
        "[]\n" +
        "\n" +
        "[BCs]\n" +
        "  [cold_propellant_inlet]\n" +
        "    type = DirichletBC\n" +
        "    variable = coolant_temperature\n" +
        "    boundary = n_regen_inlet\n" +
        "    value = 82.0\n" +
        "  []\n" +
        "\n" +
        "  [core_exit_heat_pickup_proxy]\n" +
        "    type = ConvectiveFluxBC\n" +
        "    variable = fuel_temperature\n" +
        "    boundary = n_core_exit_plenum\n" +
        "    T_infinity = 2550.0\n" +
        "    heat_transfer_coefficient = 1.5e4\n" +
        "  []\n" +
        "\n" +
        "  [core_channel_wall_cooling_proxy]\n" +
        "    type = ConvectiveFluxBC\n" +
        "    variable = fuel_temperature\n" +
        "    boundary = core_cooling_channel_walls\n" +
        "    T_infinity = 1250.0\n" +
        "    heat_transfer_coefficient = 2.2e4\n" +
        "  []\n" +
        "\n" +
        "  [regen_outer_wall_sink]\n" +
        "    type = FunctionNeumannBC\n" +
        "    variable = regen_wall_temperature\n" +
        "    boundary = regen_outer_wall\n" +
        "    function = regen_wall_sink_profile\n" +
        "  []\n" +
        "\n" +
        "  [chamber_outer_wall_adiabatic]\n" +
        "    type = NeumannBC\n" +
        "    variable = chamber_wall_temperature\n" +
        "    boundary = chamber_outer_wall\n" +
        "    value = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [nozzle_outer_radiation_proxy]\n" +
        "    type = FunctionNeumannBC\n" +
        "    variable = nozzle_wall_temperature\n" +
        "    boundary = nozzle_outer_wall\n" +
        "    function = nozzle_radiation_sink_profile\n" +
        "  []\n" +
        "\n" +
        "  [forward_shield_thermal_isolation]\n" +
        "    type = NeumannBC\n" +
        "    variable = shield_temperature\n" +
        "    boundary = forward_shadow_shield_face\n" +
        "    value = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [tank_dome_cryogenic_sink]\n" +
        "    type = DirichletBC\n" +
        "    variable = tank_wall_temperature\n" +
        "    boundary = lh2_tank_forward_dome\n" +
        "    value = 22.5\n" +
        "  []\n" +
        "\n" +
        "  [gimbal_actuator_external_sink]\n" +
        "    type = NeumannBC\n" +
        "    variable = gimbal_ring_temperature\n" +
        "    boundary = gimbal_bearing_outer_case\n" +
        "    value = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_upper_stage_thermal_isolation]\n" +
        "    type = NeumannBC\n" +
        "    variable = thrust_frame_temperature\n" +
        "    boundary = primary_load_ring\n" +
        "    value = 0.0\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_gimbal_pivot_heat_pickup]\n" +
        "    type = ConvectiveFluxBC\n" +
        "    variable = thrust_frame_temperature\n" +
        "    boundary = gimbal_pivot_mount\n" +
        "    T_infinity = 620.0\n" +
        "    heat_transfer_coefficient = 120.0\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_hot_hydrogen_exposure]\n" +
        "    type = ConvectiveFluxBC\n" +
        "    variable = core_support_grid_temperature\n" +
        "    boundary = exit_end_fuel_element_seats\n" +
        "    T_infinity = 2700.0\n" +
        "    heat_transfer_coefficient = 1.1e4\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_effusion_cold_side]\n" +
        "    type = ConvectiveFluxBC\n" +
        "    variable = reflector_liner_temperature\n" +
        "    boundary = effusion_cooling_plenum\n" +
        "    T_infinity = 160.0\n" +
        "    heat_transfer_coefficient = 8.0e3\n" +
        "  []\n" +
        "\n" +
        "  [pogo_accumulator_cryogenic_manifold_sink]\n" +
        "    type = ConvectiveFluxBC\n" +
        "    variable = pogo_accumulator_temperature\n" +
        "    boundary = accumulator_discharge_manifold\n" +
        "    T_infinity = 95.0\n" +
        "    heat_transfer_coefficient = 5.0e2\n" +
        "  []\n" +
        "\n" +
        "  [shaft_seal_helium_purge_sink]\n" +
        "    type = ConvectiveFluxBC\n" +
        "    variable = shaft_seal_temperature\n" +
        "    boundary = helium_interstage_purge_block\n" +
        "    T_infinity = 290.0\n" +
        "    heat_transfer_coefficient = 9.0e2\n" +
        "  []\n" +
        "[]\n" +
        "\n" +
        "[Postprocessors]\n" +
        "  [peak_fuel_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = fuel_temperature\n" +
        "    value_type = max\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [average_core_fuel_temperature]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = fuel_temperature\n" +
        "    block = 'reactor_core_inner_zone reactor_core_mid_zone reactor_core_outer_zone'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [average_core_coolant_temperature]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = coolant_temperature\n" +
        "    block = 'n_core_inlet_plenum n_core_midplane n_core_exit_plenum'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [peak_reflector_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = reflector_temperature\n" +
        "    value_type = max\n" +
        "    boundary = radial_reflector_outer_ring\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [peak_shield_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = shield_temperature\n" +
        "    value_type = max\n" +
        "    boundary = forward_shadow_shield_face\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [tank_wall_average_temperature]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = tank_wall_temperature\n" +
        "    block = 'lh2_tank_forward_dome lh2_tank_wall_proxy'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [peak_regen_wall_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = regen_wall_temperature\n" +
        "    value_type = max\n" +
        "    boundary = regen_outer_wall\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [peak_chamber_wall_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = chamber_wall_temperature\n" +
        "    value_type = max\n" +
        "    boundary = chamber_outer_wall\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [peak_nozzle_wall_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = nozzle_wall_temperature\n" +
        "    value_type = max\n" +
        "    boundary = nozzle_outer_wall\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [peak_gimbal_ring_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = gimbal_ring_temperature\n" +
        "    value_type = max\n" +
        "    boundary = gimbal_bearing_outer_case\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [normalized_reactor_power]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = normalized_core_power\n" +
        "    block = 'reactor_core_inner_zone reactor_core_mid_zone reactor_core_outer_zone'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [decay_heat_fraction_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = decay_heat_fraction\n" +
        "    block = 'reactor_core_inner_zone reactor_core_mid_zone reactor_core_outer_zone'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [iodine_inventory_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = iodine_inventory_proxy\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [xenon_inventory_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = xenon_inventory_proxy\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [control_drum_angle_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = control_drum_angle_proxy\n" +
        "    block = 'control_drum_bank radial_reflector_outer_ring'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [minimum_ledinegg_margin_proxy]\n" +
        "    type = ElementExtremeValue\n" +
        "    variable = ledinegg_margin_proxy\n" +
        "    value_type = min\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [ledinegg_status_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = ledinegg_status_proxy\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [reflector_gamma_heat_fraction_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = reflector_gamma_heat_fraction\n" +
        "    block = 'reactor_reflector_annulus radial_reflector_outer_ring'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [tank_shield_heat_leak_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = tank_shield_heat_leak_proxy\n" +
        "    block = 'lh2_tank_forward_dome tank_heat_leak_path'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [para_fraction_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = para_fraction_proxy\n" +
        "    block = 'regen_cooler_cold_hydrogen n_core_inlet_plenum'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [gimbal_hydraulic_bleed_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = gimbal_hydraulic_bleed_proxy\n" +
        "    block = 'dual_axis_hydraulic_actuator_ring hot_gas_bleed_hydraulic_loop'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [minimum_thermal_margin_proxy]\n" +
        "    type = ElementExtremeValue\n" +
        "    variable = thermal_margin_proxy\n" +
        "    value_type = min\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [peak_thrust_frame_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = thrust_frame_temperature\n" +
        "    value_type = max\n" +
        "    boundary = 'thrust_structure_alignment_cone gimbal_pivot_mount primary_load_ring'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [thrust_load_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = thrust_load_proxy\n" +
        "    block = 'thrust_structure_alignment_cone gimbal_pivot_mount primary_load_ring'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [minimum_thrust_frame_compression_margin]\n" +
        "    type = ElementExtremeValue\n" +
        "    variable = thrust_frame_compression_margin_proxy\n" +
        "    value_type = min\n" +
        "    block = 'thrust_structure_alignment_cone thrust_frame_truss_members'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [peak_core_support_grid_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = core_support_grid_temperature\n" +
        "    value_type = max\n" +
        "    boundary = 'uncooled_core_support_grid exit_end_fuel_element_seats'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [core_support_grid_pressure_drop_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = core_support_grid_pressure_drop_proxy\n" +
        "    block = 'uncooled_core_support_grid grid_plate_webs grid_plate_perforations'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [minimum_core_support_grid_creep_margin]\n" +
        "    type = ElementExtremeValue\n" +
        "    variable = core_support_grid_creep_margin_proxy\n" +
        "    value_type = min\n" +
        "    block = 'uncooled_core_support_grid grid_plate_webs'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [peak_reflector_liner_temperature]\n" +
        "    type = NodalExtremeValue\n" +
        "    variable = reflector_liner_temperature\n" +
        "    value_type = max\n" +
        "    boundary = 'porous_reflector_core_liner liner_hydrogen_boundary_layer'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [reflector_liner_effusion_fraction_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = reflector_liner_effusion_fraction_proxy\n" +
        "    block = 'porous_reflector_core_liner effusion_cooling_plenum'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [minimum_reflector_liner_barrier_margin]\n" +
        "    type = ElementExtremeValue\n" +
        "    variable = reflector_liner_barrier_margin_proxy\n" +
        "    value_type = min\n" +
        "    block = 'porous_reflector_core_liner liner_hydrogen_boundary_layer'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [pogo_accumulator_damping_ratio_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = pogo_accumulator_damping_ratio_proxy\n" +
        "    block = 'pogo_accumulator_volume accumulator_bellows accumulator_discharge_manifold'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [feedline_pressure_wave_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = feedline_pressure_wave_proxy\n" +
        "    block = 'pogo_accumulator_volume accumulator_discharge_manifold'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [helium_purge_flow_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = helium_purge_flow_proxy\n" +
        "    block = 'helium_interstage_purge_block turbine_shaft_seal_cavity bearing_purge_annulus'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [minimum_shaft_seal_leakage_margin]\n" +
        "    type = ElementExtremeValue\n" +
        "    variable = shaft_seal_leakage_margin_proxy\n" +
        "    value_type = min\n" +
        "    block = 'floating_carbon_ring_seals helium_interstage_purge_block'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [grid_flow_area_fraction_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = grid_flow_area_fraction_proxy\n" +
        "    block = 'uncooled_core_support_grid grid_plate_perforations'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [grid_form_loss_coefficient_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = grid_form_loss_coefficient_proxy\n" +
        "    block = 'uncooled_core_support_grid grid_plate_perforations'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [grid_exit_density_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = grid_exit_density_proxy\n" +
        "    block = 'n_core_exit_plenum uncooled_core_support_grid'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [grid_exit_velocity_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = grid_exit_velocity_proxy\n" +
        "    block = 'n_core_exit_plenum uncooled_core_support_grid'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [grid_coupled_pressure_drop_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = grid_coupled_pressure_drop_proxy\n" +
        "    block = 'n_core_exit_plenum uncooled_core_support_grid grid_plate_perforations'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [minimum_point_kinetics_matrix_stability]\n" +
        "    type = ElementExtremeValue\n" +
        "    variable = point_kinetics_matrix_stability_proxy\n" +
        "    value_type = min\n" +
        "    block = 'reactor_core_inner_zone reactor_core_mid_zone reactor_core_outer_zone'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [core_density_oscillation_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = core_density_oscillation_proxy\n" +
        "    block = 'n_core_inlet_plenum n_core_midplane n_core_exit_plenum'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [fuel_alignment_shift_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = fuel_alignment_shift_proxy\n" +
        "    block = 'reactor_core_inner_zone reactor_core_mid_zone reactor_core_outer_zone uncooled_core_support_grid'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [thrust_frame_resonance_gain_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = thrust_frame_resonance_gain_proxy\n" +
        "    block = 'thrust_structure_alignment_cone thrust_frame_truss_members primary_load_ring'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [pogo_suppressor_attenuation_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = pogo_suppressor_attenuation_proxy\n" +
        "    block = 'pogo_accumulator_volume accumulator_bellows accumulator_discharge_manifold'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [net_coupled_gain_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = net_coupled_gain_proxy\n" +
        "    block = 'pogo_accumulator_volume thrust_structure_alignment_cone reactor_core_mid_zone'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "\n" +
        "  [fluid_phase_angle_report]\n" +
        "    type = ElementAverageValue\n" +
        "    variable = fluid_phase_angle_proxy\n" +
        "    block = 'pogo_accumulator_volume accumulator_discharge_manifold n_core_inlet_plenum'\n" +
        "    execute_on = 'initial timestep_end'\n" +
        "  []\n" +
        "[]\n" +
        "\n" +
        "[Executioner]\n" +
        "  type = Transient\n" +
        "  solve_type = NEWTON\n" +
        "  scheme = bdf2\n" +
        "  start_time = 0.0\n" +
        "  end_time = 900.0\n" +
        "  dt = 0.25\n" +
        "  dtmin = 1.0e-6\n" +
        "  dtmax = 1.0\n" +
        "  nl_rel_tol = 1.0e-7\n" +
        "  nl_abs_tol = 1.0e-9\n" +
        "  nl_max_its = 35\n" +
        "  l_tol = 1.0e-6\n" +
        "  l_max_its = 150\n" +
        "[]\n" +
        "\n" +
        "[Outputs]\n" +
        "  exodus = false\n" +
        "  csv = true\n" +
        "  perf_graph = true\n" +
        "  interval = 4\n" +
        "[]\n" +
        "\n" +
        "# ----------------------------------------------------------------------\n" +
        "# Metadata consumed by ntp-sys-console parser and review UI\n" +
        "# ----------------------------------------------------------------------\n" +
        "[ParserMetadata]\n" +
        "  case_id = advanced-moose-ntp-003\n" +
        "  paired_mcnp_case = ntr-high-fidelity-system-model\n" +
        "  paired_rocets_case = baseline-ntp-rocets-002\n" +
        "  fixture_family = ntp-sys-console-advanced\n" +
        "  owning_domain = thermal_structures_reactor_transient_surrogate\n" +
        "  review_posture = doe_nasa_conceptual_design_fixture\n" +
        "  coordinate_frame = axisymmetric_rz_tank_to_nozzle\n" +
        "  mission_profile = deep_space_restart_demo_900s\n" +
        "  expected_blocks = 'Problem Mesh GlobalParams Variables AuxVariables Functions AuxKernels Kernels Materials BCs Postprocessors Executioner Outputs ParserMetadata CrossLinks ReviewNotes'\n" +
        "  ui_panels = 'overview thermal propulsion neutronics materials controls file_view'\n" +
        "  crosslink_terms = 'lh2_supply_tank internal_shield reactor_neutronics fission_product_poisoning control_drum_bank auxiliary_poison_bank reactor_core ledinegg_instability_switch reactor_reflector n_core_inlet_plenum n_core_midplane n_core_exit_plenum turbine_tap thrust_chamber bell_nozzle dual_axis_hydraulic_actuator_ring gimbal_hydraulic_bleed_proxy thrust_structure_alignment_cone primary_load_ring uncooled_core_support_grid porous_reflector_core_liner effusion_cooling_plenum pogo_accumulator_volume floating_carbon_ring_seals helium_interstage_purge_block point_kinetics_matrix_stability_proxy grid_coupled_pressure_drop_proxy thrust_frame_resonance_gain_proxy pogo_suppressor_attenuation_proxy net_coupled_gain_proxy fluid_phase_angle_proxy'\n" +
        "  parser_features = 'nested_blocks assignments quoted_vectors parsed_functions function_aux postprocessors crosslinks long_wrapped_comments restart_transient_metadata equation_metadata frequency_response_vectors coupled_hydraulic_loss_map'\n" +
        "  validation_status = parser_fixture_only_not_validated_for_design_or_safety\n" +
        "[]\n" +
        "\n" +
        "[CrossLinks]\n" +
        "  [mcnp_geometry]\n" +
        "    reactor_core = 'MCNP cells: fuel compact, coolant channel, tie-tube lattice proxy, axial core zones'\n" +
        "    reflector = 'MCNP cells: beryllium reflector annulus and control-drum region'\n" +
        "    shield = 'MCNP cells: internal BATH/gamma shield and forward shadow-shield face'\n" +
        "    nozzle = 'MCNP cells: chamber, throat, bell nozzle, divergent wall proxy'\n" +
        "    tank = 'MCNP cells: forward LH2 tank dome and shield heat-leak path'\n" +
        "    thrust_frame = 'MCNP cells: gimbal-pivot mount, thrust cone, and primary structural load ring proxies'\n" +
        "    core_support_grid = 'MCNP cells: perforated refractory grid plate at core exit plane'\n" +
        "    reflector_liner = 'MCNP cells: porous W/HfC liner between fuel matrix and Be reflector'\n" +
        "    pogo_accumulator = 'MCNP cells: accumulator volume and discharge manifold shielding adjacency proxy'\n" +
        "    shaft_seals = 'MCNP cells: turbomachinery seal cavity and helium purge block proxy'\n" +
        "  []\n" +
        "\n" +
        "  [rocets_system]\n" +
        "    reactor_power = core_power_profile\n" +
        "    mass_flow = mass_flow_profile\n" +
        "    turbine_tap = turbine_tap_fraction_profile\n" +
        "    drums = control_drum_angle_profile\n" +
        "    fission_products = 'iodine_inventory_profile xenon_inventory_profile decay_heat_profile'\n" +
        "    channel_stability = 'ledinegg_margin_profile ledinegg_status_profile'\n" +
        "    thrust_vectoring = gimbal_hydraulic_bleed_profile\n" +
        "    thrust_structure = 'thrust_load_profile thrust_frame_compression_margin_profile'\n" +
        "    support_grid = 'core_support_grid_pressure_drop_profile core_support_grid_creep_margin_profile'\n" +
        "    effusion_liner = 'reflector_liner_effusion_fraction_profile reflector_liner_barrier_margin_profile'\n" +
        "    pogo_suppression = 'pogo_accumulator_damping_ratio_profile feedline_pressure_wave_profile'\n" +
        "    turbine_seals = 'helium_purge_flow_profile shaft_seal_leakage_margin_profile'\n" +
        "  []\n" +
        "\n" +
        "  [coupled_stability_architecture]\n" +
        "    vibration_neutronic_coupling = 'pogo accumulator attenuation reduces core density oscillation before point kinetics feedback receives it'\n" +
        "    thermal_mechanical_integrity = 'core support grid and thrust frame constrain fuel alignment during full-power thrust vectoring'\n" +
        "    fluid_hydraulic_node_coupling = 'grid_coupled_pressure_drop_profile is evaluated at the reactor core exit node and reported with exit density and velocity proxies'\n" +
        "    structural_dynamic_frequency_mapping = 'frequency vectors map thrust-frame resonance at 24.5 Hz against pogo attenuation and net coupled gain'\n" +
        "  []\n" +
        "\n" +
        "  [grid_pressure_drop_equation]\n" +
        "    equation = 'DeltaP_grid = [(1 / sigma^2) * (1 - sigma)^2 + K_fric] * rho_exit * v_exit^2 / 2'\n" +
        "    sigma = 0.42\n" +
        "    grid_thickness_m = 0.085\n" +
        "    hole_diameter_m = 0.0042\n" +
        "    k_loss_fric = 0.18\n" +
        "    effective_form_loss_coefficient = 2.087\n" +
        "    source_component = COMP_REACTOR_CORE\n" +
        "    dynamic_feedback_flag = ACTIVE_NODE_EVAL\n" +
        "  []\n" +
        "\n" +
        "  [frequency_response_map]\n" +
        "    frequency_hz = '1.0 10.0 20.0 24.5 35.0 50.0'\n" +
        "    thrust_frame_gain_db = '0.1 1.8 12.4 28.5 3.1 0.2'\n" +
        "    suppressor_attenuation_db = '-0.05 -4.10 -28.50 -42.10 -18.20 -12.40'\n" +
        "    net_coupled_gain_db = '0.05 -2.30 -16.10 -13.60 -15.10 -12.20'\n" +
        "    fluid_phase_angle_deg = '-0.4 -12.5 -68.4 -90.0 -142.1 -174.5'\n" +
        "    hazard_state = 'completely_stable stable suppressed_zone damped_target_achieved stable stable'\n" +
        "  []\n" +
        "[]\n" +
        "\n" +
        "[ReviewNotes]\n" +
        "  source_posture = synthetic_non_operational_fixture\n" +
        "  neutronics_coupling = point_kinetics_metadata_only\n" +
        "  fission_product_terms = iodine_xenon_parser_proxy_not_reactivity_model\n" +
        "  decay_heat_terms = post_shutdown_thermal_trend_proxy\n" +
        "  ledinegg_terms = advisory_channel_stability_proxy\n" +
        "  reflector_gamma_heating = bounded_fractional_deposition_proxy\n" +
        "  shield_tank_coupling = tank_heat_leak_visualization_proxy\n" +
        "  thrust_vectoring_coupling = parasitic_hot_gas_bleed_visualization_proxy\n" +
        "  hydrogen_spin_state = para_ortho_schedule_and_enthalpy_penalty_proxy\n" +
        "  thrust_frame = axial_load_path_and_gimbal_pivot_thermal_isolation_proxy\n" +
        "  core_support_grid = uncooled_refractory_grid_plate_pressure_and_creep_proxy\n" +
        "  reflector_liner = effusion_cooled_thermal_barrier_proxy_for_beryllium_reflector\n" +
        "  pogo_accumulator = feedline_pressure_wave_damping_proxy\n" +
        "  turbine_shaft_seals = helium_purged_floating_carbon_ring_seal_proxy\n" +
        "  vibration_neutronic_coupling = pogo_suppression_keeps_core_density_oscillation_out_of_point_kinetics_feedback\n" +
        "  thermal_mechanical_integrity = support_grid_and_thrust_frame_limit_fuel_alignment_shift_under_tvc_load\n" +
        "  grid_pressure_drop_model = darcy_weisbach_form_loss_expansion_with_sigma_0p42_and_kfric_0p18\n" +
        "  structural_frequency_map = thrust_frame_24p5_hz_resonance_isolated_by_pogo_attenuation_notch\n" +
        "  critical_frequency_phase_shift = minus_90_deg_at_24p5_hz_counter_pulse_proxy\n" +
        "[]",
}

export const outputFiles = {
    mcnp: "1mcnp     version 6.x synthetic parser fixture                 06/06/26 17:46:00\n" +
        " ****************************************************************************************\n" +
        " *                                                                                      *\n" +
        " *  ntp-sys-console sample MCNP-like output                                             *\n" +
        " *  case: advanced-ntp-mcnp-003                                                         *\n" +
        " *  input: ntp_mcnp.inp                                                                 *\n" +
        " *                                                                                      *\n" +
        " *  posture: non-operational synthetic fixture for parser and visualization testing.     *\n" +
        " *  this file is not an MCNP calculation record, not a validated shielding result,       *\n" +
        " *  not a criticality calculation, and not an executable reactor design artifact.        *\n" +
        " *                                                                                      *\n" +
        " ****************************************************************************************\n" +
        "\n" +
        " name = advanced-ntp-mcnp-003\n" +
        " title = advanced parser fixture: mcnp-like ntp engine input\n" +
        "\n" +
        "\n" +
        " 1input file echo\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " c companion deck: ntp_rocet.inp\n" +
        " c transport mode: fixed-source neutron parser fixture\n" +
        " c criticality posture: no kcode, no criticality design claim\n" +
        " c geometry mapping: lh2 feed, turbopump, regenerative jacket, reactor package,\n" +
        " c                   turbine tap, thrust chamber, and bell nozzle\n" +
        "\n" +
        " mode n\n" +
        " nps  50000\n" +
        " print 60\n" +
        "\n" +
        "\n" +
        " 1message summary\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " warning.  this is a synthetic output assembled for ntp-sys-console parser development.\n" +
        " warning.  no kcode card was present; no multiplication factor is reported.\n" +
        " warning.  material vectors are placeholder fixtures and were not checked against a\n" +
        "            validated material library.\n" +
        " note.     photon transport is not enabled; reflector gamma-heating values below are\n" +
        "            app-facing proxy quantities derived from neutron tally metadata only.\n" +
        " note.     all statistics are fabricated but formatted to resemble a compact MCNP run.\n" +
        "\n" +
        "\n" +
        " 1problem controls\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " particle mode                          n\n" +
        " source type                            fixed source\n" +
        " source region                          central active-core source proxy\n" +
        " source energy bins                     2.00e+06  1.00e+06  5.00e+05  1.00e+05  2.50e+04  1.00e+00\n" +
        " histories requested                    50000\n" +
        " histories completed                    50000\n" +
        " random number stride                   synthetic\n" +
        " print table request                    60\n" +
        "\n" +
        "\n" +
        " 1cell population and importance summary\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " cell range        description                                             imp:n\n" +
        " 1-16              feed / pump / regenerative jacket / inlet hardware       1\n" +
        " 17                internal shield forward shadow region                    1\n" +
        " 18                core inlet plenum                                        1\n" +
        " 19-22             reflector, control drums, poison bank, vessel            1\n" +
        " 23-40             active core, 3 axial x 6 azimuthal sectors               1\n" +
        " 41                ledinegg virtual channel monitor                         1\n" +
        " 42-48             core exit, turbine branch, turbine, exhaust mixer         1\n" +
        " 49-53             chamber and bell nozzle                                  1\n" +
        " 54,99             ambient sink and exterior graveyard                      0\n" +
        "\n" +
        " total cells processed                 55\n" +
        " total surfaces processed              47\n" +
        " total materials processed             11\n" +
        "\n" +
        "\n" +
        " 1material table summary\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " mat   short name                                      nominal density use\n" +
        " 1     hydrogen_placeholder                            lh2 / hot-h2 flow regions\n" +
        " 2     fuel_graphite_composite_placeholder             fueled core sector regions\n" +
        " 3     graphite_reflector_placeholder                  reflector annulus\n" +
        " 4     stainless_or_inconel_structure_placeholder      vessels, casings, support structures\n" +
        " 5     refractory_nozzle_wall_placeholder              regen/chamber/nozzle wall structures\n" +
        " 6     boron_absorber_control_drum_placeholder         control drum absorber band\n" +
        " 7     internal_shadow_shield_placeholder              internal shadow shield\n" +
        " 8     electric_motor_aluminum_proxy                   electric start motor structure\n" +
        " 9     spin_isomer_converter_bed_proxy                 ortho-para converter bed\n" +
        " 10    auxiliary_poison_bank_proxy                     restart hold-down poison bank\n" +
        " 11    virtual_channel_stability_monitor_proxy         ledinegg monitor region\n" +
        "\n" +
        "\n" +
        " 1source summary\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " sdef position                         0.0000  0.0000  1.3500\n" +
        " source axis                           0.0000  0.0000  1.0000\n" +
        " radial distribution                   uniform proxy, r = 0.0000 to 0.4600 m\n" +
        " axial distribution                    low/mid/high axial source weighting\n" +
        " source particle                       neutron\n" +
        " source normalization                  per source neutron\n" +
        "\n" +
        " sampled source checks\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " sampled histories                     50000\n" +
        " mean sampled radius                   3.066e-01 m\n" +
        " mean sampled axial coordinate          1.351e+00 m\n" +
        " mean sampled source energy             7.324e+05 eV\n" +
        " rejected source samples                0\n" +
        "\n" +
        "\n" +
        " 1tally fluctuation chart summary\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " tally    description                                           mean rel err   fom status\n" +
        " f4:n     core axial segment A flux proxy                       0.018          stable\n" +
        " f14:n    core axial segment B flux proxy                       0.016          stable\n" +
        " f24:n    core axial segment C flux proxy                       0.019          stable\n" +
        " f34:n    reflector/control/poison/vessel flux proxy            0.023          acceptable\n" +
        " f44:n    internal shield flux proxy                            0.031          acceptable\n" +
        " f54:n    regen/chamber/nozzle wall flux proxy                  0.027          acceptable\n" +
        " f64:n    cold feed and core inlet hydrogen flux proxy          0.035          coarse\n" +
        " f74:n    hot hydrogen/turbine/chamber/nozzle flux proxy        0.032          coarse\n" +
        " f84:n    ledinegg virtual channel monitor flux proxy           0.044          coarse\n" +
        " f94:n    control drum and auxiliary poison flux proxy          0.026          acceptable\n" +
        "\n" +
        "\n" +
        " 1tally results: neutron flux proxies per source neutron\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " tally f4:n      core_axial_segment_A_flux_proxy\n" +
        " cells           23 24 25 26 27 28\n" +
        "                 cell       result        rel err\n" +
        "                 23         2.4183e-04    0.0192\n" +
        "                 24         2.4627e-04    0.0187\n" +
        "                 25         2.5014e-04    0.0179\n" +
        "                 26         2.4470e-04    0.0184\n" +
        "                 27         2.3995e-04    0.0191\n" +
        "                 28         2.3718e-04    0.0198\n" +
        "                 total      1.4601e-03    0.0180\n" +
        "\n" +
        " tally f14:n     core_axial_segment_B_flux_proxy\n" +
        " cells           29 30 31 32 33 34\n" +
        "                 cell       result        rel err\n" +
        "                 29         3.1169e-04    0.0167\n" +
        "                 30         3.1885e-04    0.0161\n" +
        "                 31         3.2402e-04    0.0156\n" +
        "                 32         3.2056e-04    0.0158\n" +
        "                 33         3.1281e-04    0.0165\n" +
        "                 34         3.0798e-04    0.0172\n" +
        "                 total      1.8959e-03    0.0160\n" +
        "\n" +
        " tally f24:n     core_axial_segment_C_flux_proxy\n" +
        " cells           35 36 37 38 39 40\n" +
        "                 cell       result        rel err\n" +
        "                 35         2.7580e-04    0.0196\n" +
        "                 36         2.8033e-04    0.0188\n" +
        "                 37         2.8515e-04    0.0181\n" +
        "                 38         2.8156e-04    0.0187\n" +
        "                 39         2.7434e-04    0.0195\n" +
        "                 40         2.7019e-04    0.0202\n" +
        "                 total      1.6674e-03    0.0190\n" +
        "\n" +
        " tally f34:n     reflector_control_poison_vessel_flux_proxy\n" +
        " cells           19 20 21 22\n" +
        "                 cell       result        rel err       app region\n" +
        "                 19         6.2240e-05    0.0218        reactor_reflector\n" +
        "                 20         3.1102e-05    0.0247        control_drum_bank\n" +
        "                 21         1.6825e-05    0.0292        auxiliary_poison_bank\n" +
        "                 22         2.3447e-05    0.0275        reactor_pressure_vessel\n" +
        "                 total      1.3361e-04    0.0230\n" +
        "\n" +
        " tally f44:n     internal_shield_flux_proxy\n" +
        " cells           17\n" +
        "                 cell       result        rel err       app region\n" +
        "                 17         8.9407e-06    0.0310        internal_shield\n" +
        "\n" +
        " tally f54:n     regen_chamber_nozzle_wall_flux_proxy\n" +
        " cells           12 13 16 49 50 51 52 53\n" +
        "                 cell       result        rel err       app region\n" +
        "                 12         4.2253e-06    0.0384        regen_cold_side_h2\n" +
        "                 13         5.3148e-06    0.0349        regen_wall\n" +
        "                 16         7.9952e-06    0.0318        nozzle_wall_thermal_proxy\n" +
        "                 49         1.4801e-05    0.0262        thrust_chamber_hot_h2\n" +
        "                 50         9.8725e-06    0.0296        thrust_chamber_liner\n" +
        "                 51         1.2623e-05    0.0279        nozzle_throat_h2\n" +
        "                 52         9.4466e-06    0.0302        nozzle_divergent_h2\n" +
        "                 53         6.3331e-06    0.0337        nozzle_wall_and_skirt\n" +
        "                 total      7.0612e-05    0.0270\n" +
        "\n" +
        " tally f64:n     cold_feed_and_core_inlet_hydrogen_flux_proxy\n" +
        " cells           1 2 4 7 10 14 15\n" +
        "                 cell       result        rel err       app region\n" +
        "                 1          1.2066e-06    0.0478        lh2_supply_tank\n" +
        "                 2          1.3380e-06    0.0461        tank_isolation_valve_h2\n" +
        "                 4          1.7754e-06    0.0439        boost_pump_h2\n" +
        "                 7          2.2201e-06    0.0412        main_turbopump_h2\n" +
        "                 10         3.1027e-06    0.0380        discharge_manifold_h2\n" +
        "                 14         4.8164e-06    0.0347        ortho_para_converter\n" +
        "                 15         6.9031e-06    0.0324        core_inlet_line_h2\n" +
        "                 total      2.1362e-05    0.0350\n" +
        "\n" +
        " tally f74:n     hot_hydrogen_turbine_chamber_nozzle_flux_proxy\n" +
        " cells           42 44 45 46 48 49 51 52\n" +
        "                 cell       result        rel err       app region\n" +
        "                 42         2.2452e-05    0.0296        core_exit_plenum\n" +
        "                 44         1.8198e-05    0.0320        turbine_tap_primary\n" +
        "                 45         1.5026e-05    0.0343        turbine_tap_secondary\n" +
        "                 46         1.3509e-05    0.0351        drive_turbine_working_gas\n" +
        "                 48         1.1296e-05    0.0369        turbine_exhaust_mixer\n" +
        "                 49         1.4801e-05    0.0262        thrust_chamber_hot_h2\n" +
        "                 51         1.2623e-05    0.0279        nozzle_throat_h2\n" +
        "                 52         9.4466e-06    0.0302        nozzle_divergent_h2\n" +
        "                 total      1.1735e-04    0.0320\n" +
        "\n" +
        " tally f84:n     ledinegg_virtual_channel_monitor_flux_proxy\n" +
        " cells           41\n" +
        "                 cell       result        rel err       app region\n" +
        "                 41         3.5080e-06    0.0440        ledinegg_instability_switch\n" +
        "\n" +
        " tally f94:n     control_drum_and_aux_poison_flux_proxy\n" +
        " cells           20 21\n" +
        "                 cell       result        rel err       app region\n" +
        "                 20         3.1102e-05    0.0247        control_drum_bank\n" +
        "                 21         1.6825e-05    0.0292        auxiliary_poison_bank\n" +
        "                 total      4.7927e-05    0.0260\n" +
        "\n" +
        "\n" +
        " 1derived app-facing summary quantities\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " quantity                                      value         units       source\n" +
        " core_A_total_flux_proxy                        1.4601e-03    a.u.        f4:n total\n" +
        " core_B_total_flux_proxy                        1.8959e-03    a.u.        f14:n total\n" +
        " core_C_total_flux_proxy                        1.6674e-03    a.u.        f24:n total\n" +
        " axial_peak_to_average_proxy                    1.1317        ratio       f4/f14/f24 totals\n" +
        " reflector_flux_proxy                           6.2240e-05    a.u.        f34:n cell 19\n" +
        " control_absorber_flux_proxy                    3.1102e-05    a.u.        f34/f94 cell 20\n" +
        " auxiliary_poison_flux_proxy                    1.6825e-05    a.u.        f34/f94 cell 21\n" +
        " internal_shield_flux_proxy                     8.9407e-06    a.u.        f44:n cell 17\n" +
        " regen_nozzle_wall_flux_proxy                   7.0612e-05    a.u.        f54:n total\n" +
        " hot_hydrogen_path_flux_proxy                   1.1735e-04    a.u.        f74:n total\n" +
        " ledinegg_monitor_response_proxy                3.5080e-06    a.u.        f84:n cell 41\n" +
        "\n" +
        "\n" +
        " 1reflector gamma-heating proxy table\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " c photon transport disabled; these rows are synthetic cross-discipline parser metadata.\n" +
        " c intended consumer: thermal panel / MOOSE reflector_gamma_heating import path.\n" +
        "\n" +
        " region                         source tally       proxy heat fraction      status\n" +
        " reactor_reflector               f34 cell 19         0.674                    nominal\n" +
        " control_drum_bank               f34 cell 20         0.217                    nominal\n" +
        " auxiliary_poison_bank           f34 cell 21         0.071                    nominal\n" +
        " reactor_pressure_vessel         f34 cell 22         0.038                    nominal\n" +
        "\n" +
        "\n" +
        " 1restart poisoning and kinetics metadata echo\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " kinetics model                            six_group_lumped_proxy\n" +
        " control input                             control_drum_bank.net_worth\n" +
        " override input                            auxiliary_poison_bank.override_worth\n" +
        " poison model                              i135_xe135_restart\n" +
        " decay heat schedule                       decay_heat_proxy_profile\n" +
        " iodine schedule                           iodine_inventory_proxy_profile\n" +
        " xenon schedule                            xenon_inventory_proxy_profile\n" +
        " xenon restart memory                      xenon_restart_memory_profile\n" +
        "\n" +
        " phase              time span s       normalized power   xenon worth proxy   status\n" +
        " startup_ramp       0.0-90.0          0.000 -> 1.000      low                 ramping\n" +
        " rated_burn         90.0-210.0        1.000               accumulating        hold\n" +
        " shutdown_soak      210.0-520.0       decay heat only     peaking             monitor\n" +
        " restart_ramp       520.0-650.0       0.000 -> 0.820      elevated            conservative\n" +
        " cooldown           650.0-900.0       decay heat only     falling             cooldown\n" +
        "\n" +
        "\n" +
        " 1component map echo for ntp-sys-console\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " mcnp cells       component                         panel             primary tally\n" +
        " 1                lh2_supply_tank                   feed              f64\n" +
        " 2                tank_isolation_valve              feed              f64\n" +
        " 4                boost_pump                        feed              f64\n" +
        " 6                electric_start_motor              feed              none\n" +
        " 7                main_turbopump                    feed              f64\n" +
        " 10               discharge_manifold                feed              f64\n" +
        " 12               nozzle_regen_jacket               thermal           f54\n" +
        " 14               ortho_para_converter              feed              f64\n" +
        " 17               internal_shield                   thermal           f44\n" +
        " 18               core_inlet_line                   core              none\n" +
        " 19               reactor_reflector                 core              f34\n" +
        " 20               control_drum_bank                 core              f34/f94\n" +
        " 21               auxiliary_poison_bank             core              f34/f94\n" +
        " 23-40            reactor_core                      core              f4/f14/f24\n" +
        " 41               ledinegg_instability_switch       thermal           f84\n" +
        " 42               core_exit_plenum                  core              f74\n" +
        " 44               turbine_tap                       turbomachinery    f74\n" +
        " 46               drive_turbine                     turbomachinery    f74\n" +
        " 48               turbine_exhaust_mixer             turbomachinery    f74\n" +
        " 49               thrust_chamber                    nozzle            f54/f74\n" +
        " 51-53            bell_nozzle                       nozzle            f54/f74\n" +
        "\n" +
        "\n" +
        " 1run termination\n" +
        " ----------------------------------------------------------------------------------------\n" +
        " histories completed                    50000\n" +
        " lost particles                          0\n" +
        " bad trouble messages                    0\n" +
        " geometry errors                         0 synthetic\n" +
        " tally statistical checks                mixed: acceptable for parser fixture\n" +
        " output posture                          sample only\n" +
        "\n" +
        " run completed normally for synthetic ntp-sys-console parser fixture.",
    rocets: "================================================================================\n" +
        " ROCETS-LIKE SYSTEM SOLVER OUTPUT\n" +
        " Case: baseline-ntp-rocets-002\n" +
        " Title: NTP breadboard: LH2 feed, reactor kinetics, turbine loop, nozzle\n" +
        " Program: ntp_sys_console parser fixture\n" +
        " Units: SI\n" +
        " Run posture: non-operational synthetic output for import/parser development\n" +
        " ================================================================================\n" +
        "\n" +
        " Input deck echo\n" +
        " -------------------------------------------------------------------------------\n" +
        "   source file                 : ntp_rocet.inp\n" +
        "   fixture family              : rocets_like\n" +
        "   vehicle context             : upper_stage_demo\n" +
        "   fidelity                    : parser_visualization_enhanced\n" +
        "   safety posture              : non_operational_synthetic_fixture\n" +
        "   solution mode               : transient\n" +
        "   start time                  : 0.000000E+00 s\n" +
        "   stop time                   : 9.000000E+02 s\n" +
        "   initial dt                  : 1.000000E-03 s\n" +
        "   max dt                      : 2.500000E-01 s\n" +
        "   min dt                      : 1.000000E-06 s\n" +
        "   steady initialization       : enabled\n" +
        "\n" +
        " Parser summary\n" +
        " -------------------------------------------------------------------------------\n" +
        "   sections read               : 24\n" +
        "   components read             : 25\n" +
        "   boundaries read             : 2\n" +
        "   fluids read                 : 2\n" +
        "   nodes read                  : 15\n" +
        "   sensors read                : 6\n" +
        "   connects read               : 22\n" +
        "   maps read                   : 7\n" +
        "   schedules read              : 28\n" +
        "   outputs requested           : 22\n" +
        "   mission phases              : 5\n" +
        "   graphics tuples             : 40\n" +
        "   comments skipped            : 84\n" +
        "   quoted strings              : 5\n" +
        "   state references            : 21\n" +
        "   schedule references         : 53\n" +
        "   map references              : 9\n" +
        "\n" +
        " Fluids\n" +
        " -------------------------------------------------------------------------------\n" +
        "   fluid lh2\n" +
        "     species                   : H2\n" +
        "     phase model               : cryogenic_real_fluid\n" +
        "     property table            : props/h2_cryo_to_superheated.tbl\n" +
        "     status                    : synthetic table loaded\n" +
        "\n" +
        "   fluid hot_h2\n" +
        "     species                   : H2\n" +
        "     phase model               : high_temperature_equilibrium\n" +
        "     property table            : props/h2_hot_core_exit.tbl\n" +
        "     status                    : synthetic table loaded\n" +
        "\n" +
        " Component inventory\n" +
        " -------------------------------------------------------------------------------\n" +
        "   feed\n" +
        "     tank_isolation_valve      : valve\n" +
        "     boost_pump                : pump\n" +
        "     main_turbopump            : pump\n" +
        "     discharge_manifold        : line\n" +
        "\n" +
        "   regen\n" +
        "     nozzle_regen_jacket       : heat_exchanger\n" +
        "     ortho_para_converter      : fluid_conditioner\n" +
        "     core_inlet_line           : line\n" +
        "\n" +
        "   neutronics and core\n" +
        "     internal_shield           : radiation_shield\n" +
        "     reactor_neutronics        : point_kinetics\n" +
        "     fission_product_poisoning : iodine_xenon_proxy\n" +
        "     reactor_reflector         : reflector\n" +
        "     control_drum_bank         : control_drums\n" +
        "     auxiliary_poison_bank     : poison_override\n" +
        "     reactor_core              : core_heat_exchanger\n" +
        "     ledinegg_instability_switch : stability_guard\n" +
        "     core_exit_plenum          : volume\n" +
        "\n" +
        "   turbine and shaft\n" +
        "     turbine_tap               : splitter\n" +
        "     drive_turbine             : turbine\n" +
        "     turbine_exhaust_mixer     : mixer\n" +
        "     main_turbomachinery_shaft : rotating_shaft\n" +
        "     electric_start_motor_shaft: rotating_shaft\n" +
        "     electric_start_motor      : motor\n" +
        "\n" +
        "   nozzle\n" +
        "     thrust_chamber            : volume\n" +
        "     bell_nozzle               : expansion_nozzle\n" +
        "     deep_space_bell_nozzle    : expansion_nozzle_preset disabled\n" +
        "\n" +
        " Connectivity check\n" +
        " -------------------------------------------------------------------------------\n" +
        "   graph nodes                 : 15\n" +
        "   graph edges                 : 22\n" +
        "   disconnected components     : 1\n" +
        "   disabled presets            : 1\n" +
        "   primary flow path           : complete\n" +
        "   turbine bypass loop         : complete\n" +
        "   neutronics control links    : complete\n" +
        "   tank heat leak link         : complete\n" +
        "   advisory stability link     : complete\n" +
        "\n" +
        "   NOTE 0001: component deep_space_bell_nozzle is disabled by input flag.\n" +
        "   NOTE 0002: component deep_space_bell_nozzle is retained as app preset metadata.\n" +
        "\n" +
        " Initial condition report\n" +
        " -------------------------------------------------------------------------------\n" +
        "   node                         pressure(Pa)    temperature(K)\n" +
        "   n_lh2_tank_outlet           1.350000E+06      2.250000E+01\n" +
        "   n_turbopump_inlet           1.200000E+06      2.300000E+01\n" +
        "   n_turbopump_discharge       1.300000E+06      2.400000E+01\n" +
        "   n_regen_exit                1.100000E+06      8.000000E+01\n" +
        "   n_core_inlet_plenum         1.000000E+06      1.100000E+02\n" +
        "   n_core_exit_plenum          2.500000E+05      6.500000E+02\n" +
        "   n_chamber                   2.000000E+05      6.500000E+02\n" +
        "   n_nozzle_exit               1.500000E+05      6.200000E+02\n" +
        "\n" +
        " Steady initialization\n" +
        " -------------------------------------------------------------------------------\n" +
        "   nonlinear solver            : newton\n" +
        "   linear solver               : sparse_direct\n" +
        "   relative tolerance          : 1.000000E-06\n" +
        "   absolute tolerance          : 1.000000E-08\n" +
        "   maximum nonlinear iters     : 35\n" +
        "   mass balance check          : strict\n" +
        "   energy balance check        : report\n" +
        "   reactivity check            : bounded_fixture_only\n" +
        "\n" +
        "   init iter      mass_resid       energy_resid      shaft_resid       status\n" +
        "        1        2.814000E-01     5.332000E+06     4.892000E+05     reducing\n" +
        "        2        6.418000E-02     1.104000E+06     1.773000E+05     reducing\n" +
        "        3        1.029000E-02     2.481000E+05     5.188000E+04     reducing\n" +
        "        4        1.221000E-03     4.910000E+04     9.430000E+03     reducing\n" +
        "        5        6.300000E-05     7.280000E+03     1.210000E+03     converged\n" +
        "\n" +
        "   steady initialization status : converged\n" +
        "   initial shaft speed          : 4.500000E+02 rpm\n" +
        "   initial chamber pressure     : 2.000000E+05 Pa\n" +
        "   initial core power           : 0.000000E+00 W\n" +
        "\n" +
        " Transient integration log\n" +
        " -------------------------------------------------------------------------------\n" +
        "   time(s)       dt(s)       phase              nonlin  cuts  max_resid     event\n" +
        "   0.000000E+00  1.000E-03   startup_ramp           4     0   6.230E-07     begin\n" +
        "   2.000000E+00  5.000E-03   startup_ramp           5     0   7.420E-07     tank valve cracked open\n" +
        "   6.000000E+00  1.000E-02   startup_ramp           5     0   5.980E-07     boost pump accelerating\n" +
        "   8.000000E+00  1.000E-02   startup_ramp           6     0   8.310E-07     point kinetics power ramp\n" +
        "   2.500000E+01  5.000E-02   startup_ramp           6     0   6.770E-07     turbine flow established\n" +
        "   3.500000E+01  1.000E-01   startup_ramp           5     0   4.820E-07     turbine split near command\n" +
        "   9.000000E+01  2.500E-01   rated_burn             4     0   5.110E-07     rated hold entered\n" +
        "   2.100000E+02  2.500E-01   rated_burn             4     0   5.090E-07     shutdown command\n" +
        "   2.250000E+02  1.000E-01   shutdown_soak          5     0   7.880E-07     tank valve closed\n" +
        "   2.600000E+02  2.500E-01   shutdown_soak          4     0   6.210E-07     decay heat dominated\n" +
        "   3.200000E+02  2.500E-01   shutdown_soak          4     0   5.950E-07     xenon proxy peak\n" +
        "   5.200000E+02  2.500E-01   restart_ramp           5     0   8.440E-07     restart sequence armed\n" +
        "   5.300000E+02  5.000E-02   restart_ramp           6     1   9.670E-07     valve reopening time cut\n" +
        "   5.600000E+02  1.000E-01   restart_ramp           6     0   7.930E-07     poison override withdrawing\n" +
        "   6.500000E+02  2.500E-01   cooldown               5     0   6.700E-07     restart rated point reached\n" +
        "   7.600000E+02  2.500E-01   cooldown               4     0   5.620E-07     reduced power hold\n" +
        "   9.000000E+02  2.500E-01   cooldown               4     0   5.480E-07     end of run\n" +
        "\n" +
        " Mission phase summary\n" +
        " -------------------------------------------------------------------------------\n" +
        "   phase                 start(s)    stop(s)    samples    status\n" +
        "   startup_ramp             0.000     90.000       1425    complete\n" +
        "   rated_burn              90.000    210.000        480    complete\n" +
        "   shutdown_soak          210.000    520.000       1240    complete\n" +
        "   restart_ramp           520.000    650.000        650    complete\n" +
        "   cooldown               650.000    900.000       1000    complete\n" +
        "\n" +
        " Solver residual summary\n" +
        " -------------------------------------------------------------------------------\n" +
        "   residual name              max_abs         rms             final          tolerance       status\n" +
        "   shaft_power_balance        4.110000E+03   8.420000E+02   6.500000E+02   5.000000E+03   pass\n" +
        "   chamber_pressure_target    4.720000E+04   1.340000E+04   1.900000E+04   5.000000E+04   pass\n" +
        "   core_power_tracking        2.110000E+06   4.900000E+05   7.500000E+05   2.500000E+06   pass\n" +
        "   mass_flow_closure          3.800000E-02   9.100000E-03   1.700000E-02   5.000000E-02   pass\n" +
        "\n" +
        " Advisory diagnostics\n" +
        " -------------------------------------------------------------------------------\n" +
        "   MASS BALANCE              : pass, strict closure satisfied\n" +
        "   ENERGY BALANCE            : report, synthetic fixture closure within band\n" +
        "   CAVITATION CHECK          : report only; minimum NPSH margin 1.18 at 530.0 s\n" +
        "   REACTIVITY CHECK          : bounded fixture only; no design claim made\n" +
        "   LEDINEGG SWITCH           : advisory only; WATCH during restart/cooldown window\n" +
        "   REFLECTOR GAMMA HEATING   : schedule coupled to thermal report channel\n" +
        "   IODINE/XENON MEMORY       : restart penalty visible in 520-650 s window\n" +
        "   DECAY HEAT                : schedule coupled to shutdown soak and cooldown\n" +
        "\n" +
        " Warning and note list\n" +
        " -------------------------------------------------------------------------------\n" +
        "   WARN 0104 at 5.300000E+02 s: restart ramp required one time-step cut.\n" +
        "   WARN 0211 at 6.500000E+02 s: ledinegg_instability_switch status = watch.\n" +
        "   NOTE 0300: deep_space_bell_nozzle disabled; baseline bell_nozzle used.\n" +
        "   NOTE 0301: frozen_flow=false interpreted as equilibrium_proxy performance mode.\n" +
        "   NOTE 0400: all warnings are parser-fixture advisories, not design findings.\n" +
        "\n" +
        " Time history: overview snapshot output\n" +
        " -------------------------------------------------------------------------------\n" +
        "   time(s)  phase            tank_P(Pa)  core_P(W)   decay_W     mdot(kg/s)  shaft_rpm  chamber_P(Pa)  thrust_N   xenon    margin   ledinegg\n" +
        "      0.0   startup_ramp    1.350E+06   0.000E+00  0.000E+00   0.000      450.0     2.000E+05      0.000E+00  0.000   0.020    nominal\n" +
        "     25.0   startup_ramp    1.315E+06   6.000E+07  1.500E+06   3.950     2680.0    1.850E+06      1.720E+04  0.020   0.015    nominal\n" +
        "     90.0   rated_burn      1.240E+06   3.500E+08  1.200E+07   8.040     5220.0    5.020E+06      7.180E+04  0.120   0.009    nominal\n" +
        "    210.0   rated_burn      1.100E+06   3.500E+08  1.800E+07   7.960     5185.0    4.980E+06      7.090E+04  0.450   0.006    nominal\n" +
        "    260.0   shutdown_soak   1.085E+06   2.500E+07  1.420E+07   0.320      790.0     3.800E+05      1.900E+03  0.620   0.004    recovering\n" +
        "    320.0   shutdown_soak   1.072E+06   1.180E+07  1.000E+07   0.080      510.0     2.420E+05      4.600E+02  0.740   0.002    recovering\n" +
        "    520.0   restart_ramp    1.050E+06   1.500E+07  4.000E+06   0.000      450.0     2.000E+05      0.000E+00  0.880   0.001    reset\n" +
        "    560.0   restart_ramp    1.025E+06   1.220E+08  6.800E+06   5.720     3610.0    2.720E+06      3.850E+04  0.690   0.004    watch\n" +
        "    650.0   cooldown        9.700E+05   2.500E+08  1.200E+07   6.880     4820.0    4.210E+06      5.980E+04  0.580   0.006    watch\n" +
        "    760.0   cooldown        9.520E+05   2.500E+08  8.400E+06   6.730     4760.0    4.120E+06      5.820E+04  0.460   0.008    watch\n" +
        "    900.0   cooldown        9.200E+05   5.000E+07  2.500E+06   0.410      620.0     2.150E+05      8.500E+02  0.350   0.012    nominal\n" +
        "\n" +
        " Time history: feed and turbomachinery channels\n" +
        " -------------------------------------------------------------------------------\n" +
        "   time(s)  tank_P(Pa) tank_T(K) para_eq  boost_rpm main_rpm pump_mdot pump_dp(Pa) turbine_split turbine_power(W)\n" +
        "      0.0   1.350E+06   22.50    0.998       0.0     450.0    0.000   0.000E+00     0.000       0.000E+00\n" +
        "     25.0   1.315E+06   23.20    0.965    2200.0    2680.0    3.950   2.280E+06     0.050       5.900E+05\n" +
        "     90.0   1.240E+06   23.90    0.920    1800.0    5220.0    8.040   6.020E+06     0.050       1.530E+06\n" +
        "    210.0   1.100E+06   25.00    0.880    1800.0    5185.0    7.960   5.930E+06     0.050       1.480E+06\n" +
        "    320.0   1.072E+06   25.90    0.890       0.0     510.0    0.080   1.400E+04     0.000       0.000E+00\n" +
        "    520.0   1.050E+06   27.00    0.900       0.0     450.0    0.000   0.000E+00     0.000       0.000E+00\n" +
        "    560.0   1.015E+06   27.35    0.885    1800.0    3610.0    5.720   3.900E+06     0.045       9.100E+05\n" +
        "    650.0   9.700E+05   27.95    0.870    1600.0    4820.0    6.880   4.940E+06     0.040       1.120E+06\n" +
        "    900.0   9.200E+05   29.00    0.940       0.0     620.0    0.410   6.500E+04     0.000       0.000E+00\n" +
        "\n" +
        " Time history: neutronics and thermal channels\n" +
        " -------------------------------------------------------------------------------\n" +
        "   time(s)  drum_deg  drum_worth  aux_worth  xe_worth   iodine  xenon  core_power(W) refl_heat(W) shield_heat(W) core_exit_T(K)\n" +
        "      0.0      0.00  -8.000E-02  0.000E+00  0.000E+00   0.000  0.000   0.000E+00   0.000E+00    1.000E+02      650.0\n" +
        "     25.0     55.00  -2.000E-02  0.000E+00 -1.000E-03   0.100  0.020   6.000E+07   4.800E+05    1.200E+03     1220.0\n" +
        "     90.0     92.00   0.000E+00  0.000E+00 -2.000E-03   0.380  0.120   3.500E+08   1.500E+06    3.500E+03     2720.0\n" +
        "    210.0     92.00   0.000E+00  0.000E+00 -6.000E-03   0.840  0.450   3.500E+08   1.500E+06    3.500E+03     2745.0\n" +
        "    320.0      0.00  -8.000E-02 -1.200E-02 -1.000E-02   0.920  0.740   1.180E+07   3.400E+05    1.100E+03      890.0\n" +
        "    520.0     10.00  -6.000E-02 -1.200E-02 -1.200E-02   0.700  0.880   1.500E+07   2.000E+05    7.500E+02      760.0\n" +
        "    560.0     70.00  -2.700E-02 -4.000E-03 -9.000E-03   0.760  0.690   1.220E+08   6.200E+05    1.900E+03     1980.0\n" +
        "    650.0     86.00  -1.000E-02  0.000E+00 -7.000E-03   0.780  0.580   2.500E+08   1.000E+06    2.800E+03     2510.0\n" +
        "    900.0      0.00  -8.000E-02 -1.200E-02 -4.000E-03   0.420  0.350   5.000E+07   1.000E+05    4.000E+02      820.0\n" +
        "\n" +
        " Time history: nozzle and performance channels\n" +
        " -------------------------------------------------------------------------------\n" +
        "   time(s)  chamber_P(Pa) chamber_T(K) nozzle_mdot(kg/s) throat_P(Pa) area_ratio cd     div_eff  isp_proxy(s) thrust_proxy(N)\n" +
        "      0.0    2.000E+05      650.0        0.000          0.000E+00     38.0   0.985  0.970       0.0       0.000E+00\n" +
        "     25.0    1.850E+06     1220.0        3.910          1.210E+06     38.0   0.985  0.970     448.0       1.720E+04\n" +
        "     90.0    5.020E+06     2720.0        8.000          3.250E+06     38.0   0.985  0.970     914.0       7.180E+04\n" +
        "    210.0    4.980E+06     2745.0        7.910          3.210E+06     38.0   0.985  0.970     913.0       7.090E+04\n" +
        "    320.0    2.420E+05      890.0        0.080          1.360E+05     38.0   0.985  0.970     586.0       4.600E+02\n" +
        "    520.0    2.000E+05      760.0        0.000          0.000E+00     38.0   0.985  0.970       0.0       0.000E+00\n" +
        "    560.0    2.720E+06     1980.0        5.680          1.810E+06     38.0   0.985  0.970     691.0       3.850E+04\n" +
        "    650.0    4.210E+06     2510.0        6.830          2.760E+06     38.0   0.985  0.970     892.0       5.980E+04\n" +
        "    900.0    2.150E+05      820.0        0.410          1.100E+05     38.0   0.985  0.970     211.0       8.500E+02\n" +
        "\n" +
        " Output requests satisfied\n" +
        " -------------------------------------------------------------------------------\n" +
        "   panel feed\n" +
        "     tank_pressure                         interval=0.25 status=written\n" +
        "     para_fraction                         interval=0.25 status=written\n" +
        "     boost_pump_speed                      interval=0.25 status=written\n" +
        "     main_pump_mdot                        interval=0.25 status=written\n" +
        "\n" +
        "   panel turbomachinery\n" +
        "     shaft_speed                           interval=0.25 status=written\n" +
        "\n" +
        "   panel core\n" +
        "     core_power                            interval=0.25 status=written\n" +
        "     decay_heat                            interval=0.25 status=written\n" +
        "     iodine_inventory                      interval=0.25 status=written\n" +
        "     xenon_inventory                       interval=0.25 status=written\n" +
        "     xenon_poison_worth                    interval=0.25 status=written\n" +
        "     poisoned_reactivity_margin            interval=0.25 status=written\n" +
        "     control_drum_angle                    interval=0.25 status=written\n" +
        "     aux_poison_insertion                  interval=0.25 status=written\n" +
        "\n" +
        "   panel thermal\n" +
        "     shield_tank_heat                      interval=0.25 status=written\n" +
        "     core_exit_temperature                 interval=0.25 status=written\n" +
        "     ledinegg_margin                       interval=0.25 status=written\n" +
        "     ledinegg_status                       interval=0.25 status=written\n" +
        "\n" +
        "   panel nozzle\n" +
        "     chamber_pressure                      interval=0.25 status=written\n" +
        "     nozzle_mass_flow                      interval=0.25 status=written\n" +
        "     thrust_proxy                          interval=0.25 status=written\n" +
        "\n" +
        "   panel overview\n" +
        "     mission_sequence                      snapshots=6 status=written\n" +
        "\n" +
        " Final run summary\n" +
        " -------------------------------------------------------------------------------\n" +
        "   final time                  : 9.000000E+02 s\n" +
        "   accepted steps              : 4795\n" +
        "   rejected steps              : 1\n" +
        "   nonlinear iterations        : 21984\n" +
        "   maximum time cuts           : 1\n" +
        "   wall clock synthetic        : 00:00:03.842\n" +
        "   output records written      : 96540\n" +
        "   final mass balance residual : 1.700000E-02 kg/s\n" +
        "   final energy residual       : 1.840000E+04 W\n" +
        "   final chamber pressure      : 2.150000E+05 Pa\n" +
        "   final thrust proxy          : 8.500000E+02 N\n" +
        "   final xenon inventory       : 3.500000E-01 arb\n" +
        "   final ledinegg status       : nominal\n" +
        "   run status                  : NORMAL TERMINATION\n" +
        "\n" +
        " ================================================================================\n" +
        " END ROCETS-LIKE SYSTEM SOLVER OUTPUT\n" +
        " ================================================================================",
    moose: "*****************************************************************************\n" +
        "***                                                                       ***\n" +
        "***                 ntp-sys-console MOOSE-like sample output              ***\n" +
        "***                                                                       ***\n" +
        "***  Case:        advanced-moose-ntp-003                                  ***\n" +
        "***  Input:       ntp_moose.inp                                           ***\n" +
        "***  Pairing:     ntp_rocet.inp, ntp_mcnp.inp                             ***\n" +
        "***  Discipline:  thermal structures / transient surrogate / CHT metadata ***\n" +
        "***                                                                       ***\n" +
        "***  This is a synthetic parser and visualization fixture. It is not a    ***\n" +
        "***  validated MOOSE execution record, not a safety analysis, not a       ***\n" +
        "***  reactor design calculation, and not an operational NTP model.        ***\n" +
        "***                                                                       ***\n" +
        "*****************************************************************************\n" +
        "\n" +
        "Input File: ntp_moose.inp\n" +
        "Case ID: advanced-moose-ntp-003\n" +
        "Problem Type: FEProblem\n" +
        "Coordinate System: RZ\n" +
        "Mesh Type: GeneratedMesh\n" +
        "Mesh Dimension: 2\n" +
        "Elements: 11520 QUAD4\n" +
        "Nodes: 11753\n" +
        "Primary Variables: 15\n" +
        "Auxiliary Variables: 36\n" +
        "Functions: 31\n" +
        "AuxKernels: 36\n" +
        "Kernels: 36\n" +
        "Materials: 15\n" +
        "Boundary Conditions: 15\n" +
        "Postprocessors: 43\n" +
        "Outputs: csv console exodus\n" +
        "\n" +
        "[InputValidation]\n" +
        "  status = passed_with_fixture_warnings\n" +
        "  warning = synthetic fixture; no validated material library was loaded\n" +
        "  warning = surrogate heat sources are app-facing parser metadata\n" +
        "  warning = point-kinetics and xenon/iodine terms are reduced-order proxies\n" +
        "  warning = grid pressure-drop equation is metadata-coupled, not CFD-resolved\n" +
        "[]\n" +
        "\n" +
        "[MeshSummary]\n" +
        "  dim = 2\n" +
        "  coordinate_system = RZ\n" +
        "  xmin = 0.000000e+00\n" +
        "  xmax = 9.200000e-01\n" +
        "  ymin = -1.350000e+00\n" +
        "  ymax = 5.400000e+00\n" +
        "  nx = 72\n" +
        "  ny = 160\n" +
        "  elem_type = QUAD4\n" +
        "  active_elements = 11520\n" +
        "  active_nodes = 11753\n" +
        "[]\n" +
        "\n" +
        "[VariableSummary]\n" +
        "  primary = fuel_temperature moderator_temperature reflector_temperature shield_temperature tank_wall_temperature coolant_temperature regen_wall_temperature chamber_wall_temperature nozzle_wall_temperature gimbal_ring_temperature thrust_frame_temperature core_support_grid_temperature reflector_liner_temperature pogo_accumulator_temperature shaft_seal_temperature\n" +
        "  auxiliary = normalized_core_power decay_heat_fraction iodine_inventory_proxy xenon_inventory_proxy control_drum_angle_proxy aux_poison_insertion_proxy axial_power_shape radial_peaking_proxy rocets_mass_flow_proxy turbine_tap_fraction_proxy ledinegg_margin_proxy ledinegg_status_proxy reflector_gamma_heat_fraction tank_shield_heat_leak_proxy para_fraction_proxy ortho_para_enthalpy_penalty_proxy gimbal_hydraulic_bleed_proxy thermal_margin_proxy thrust_load_proxy thrust_frame_compression_margin_proxy core_support_grid_pressure_drop_proxy core_support_grid_creep_margin_proxy reflector_liner_effusion_fraction_proxy reflector_liner_barrier_margin_proxy pogo_accumulator_damping_ratio_proxy feedline_pressure_wave_proxy helium_purge_flow_proxy shaft_seal_leakage_margin_proxy grid_flow_area_fraction_proxy grid_form_loss_coefficient_proxy grid_exit_density_proxy grid_exit_velocity_proxy grid_coupled_pressure_drop_proxy point_kinetics_matrix_stability_proxy core_density_oscillation_proxy fuel_alignment_shift_proxy thrust_frame_resonance_gain_proxy pogo_suppressor_attenuation_proxy net_coupled_gain_proxy fluid_phase_angle_proxy\n" +
        "[]\n" +
        "\n" +
        "[Executioner]\n" +
        "  type = Transient\n" +
        "  scheme = bdf2\n" +
        "  solve_type = NEWTON\n" +
        "  petsc_options_iname = '-pc_type -pc_hypre_type -ksp_gmres_restart'\n" +
        "  petsc_options_value = 'hypre boomeramg 80'\n" +
        "  dt_initial = 5.000000e-01\n" +
        "  dt_max = 1.000000e+01\n" +
        "  end_time = 9.000000e+02\n" +
        "  nl_abs_tol = 1.000000e-08\n" +
        "  nl_rel_tol = 1.000000e-07\n" +
        "  l_tol = 1.000000e-06\n" +
        "[]\n" +
        "\n" +
        "================================================================================\n" +
        "Transient solve log\n" +
        "================================================================================\n" +
        " time_step       time         dt       nonlinear iters   linear iters   status\n" +
        "         0    0.000000e+00   ----              ----            ----     initial\n" +
        "         1    5.000000e-01   0.500                3              18     converged\n" +
        "         2    1.000000e+00   0.500                3              17     converged\n" +
        "         3    2.000000e+00   1.000                3              20     converged\n" +
        "         4    5.000000e+00   3.000                4              24     converged\n" +
        "         5    1.000000e+01   5.000                4              28     converged\n" +
        "         6    2.000000e+01  10.000                4              31     converged\n" +
        "         7    3.000000e+01  10.000                5              35     converged\n" +
        "         8    4.000000e+01  10.000                5              37     converged\n" +
        "         9    5.000000e+01  10.000                5              40     converged\n" +
        "        10    6.000000e+01  10.000                5              42     converged\n" +
        "        11    7.000000e+01  10.000                5              43     converged\n" +
        "        12    8.000000e+01  10.000                5              44     converged\n" +
        "        13    9.000000e+01  10.000                5              45     converged\n" +
        "        14    1.000000e+02  10.000                4              39     converged\n" +
        "        15    1.200000e+02  20.000                4              36     converged\n" +
        "        16    1.500000e+02  30.000                4              34     converged\n" +
        "        17    1.800000e+02  30.000                4              33     converged\n" +
        "        18    2.100000e+02  30.000                4              32     converged\n" +
        "        19    2.400000e+02  30.000                3              27     converged\n" +
        "        20    3.000000e+02  60.000                3              24     converged\n" +
        "        21    3.600000e+02  60.000                3              23     converged\n" +
        "        22    4.200000e+02  60.000                3              22     converged\n" +
        "        23    5.200000e+02 100.000                4              29     converged\n" +
        "        24    5.600000e+02  40.000                5              41     converged\n" +
        "        25    6.000000e+02  40.000                5              44     converged\n" +
        "        26    6.500000e+02  50.000                5              42     converged\n" +
        "        27    7.200000e+02  70.000                4              34     converged\n" +
        "        28    8.100000e+02  90.000                4              31     converged\n" +
        "        29    9.000000e+02  90.000                4              30     converged\n" +
        "\n" +
        "================================================================================\n" +
        "Postprocessor time history\n" +
        "================================================================================\n" +
        "time,normalized_reactor_power,decay_heat_fraction_report,average_core_fuel_temperature,peak_fuel_temperature,average_core_coolant_temperature,peak_reflector_temperature,peak_shield_temperature,tank_wall_average_temperature,peak_regen_wall_temperature,peak_chamber_wall_temperature,peak_nozzle_wall_temperature,peak_gimbal_ring_temperature,peak_thrust_frame_temperature,peak_core_support_grid_temperature,peak_reflector_liner_temperature\n" +
        "0.000000e+00,0.000000e+00,0.000000e+00,8.500000e+02,8.500000e+02,8.200000e+01,6.900000e+02,2.550000e+02,2.250000e+01,2.950000e+02,3.150000e+02,3.100000e+02,3.150000e+02,2.950000e+02,1.200000e+03,9.000000e+02\n" +
        "5.000000e-01,5.555600e-03,1.111100e-04,8.593100e+02,8.822000e+02,8.344000e+01,6.908200e+02,2.551100e+02,2.250000e+01,2.956000e+02,3.154000e+02,3.103000e+02,3.150000e+02,2.950000e+02,1.201200e+03,8.998000e+02\n" +
        "1.000000e+00,1.111100e-02,2.222200e-04,8.681000e+02,9.126000e+02,8.512000e+01,6.918000e+02,2.552500e+02,2.250100e+01,2.964000e+02,3.161000e+02,3.107000e+02,3.151000e+02,2.951000e+02,1.203400e+03,8.995000e+02\n" +
        "2.000000e+00,2.222200e-02,4.444400e-04,8.852000e+02,9.718000e+02,8.884000e+01,6.941000e+02,2.556000e+02,2.250200e+01,2.982000e+02,3.175000e+02,3.118000e+02,3.152000e+02,2.953000e+02,1.208100e+03,8.993000e+02\n" +
        "5.000000e+00,5.555600e-02,1.111100e-03,9.318000e+02,1.132500e+03,9.905000e+01,7.018000e+02,2.567000e+02,2.250500e+01,3.039000e+02,3.224000e+02,3.162000e+02,3.156000e+02,2.958000e+02,1.219000e+03,8.989000e+02\n" +
        "1.000000e+01,1.111100e-01,2.222200e-03,1.002200e+03,1.374300e+03,1.148000e+02,7.154000e+02,2.585000e+02,2.251000e+01,3.149000e+02,3.327000e+02,3.253000e+02,3.164000e+02,2.971000e+02,1.239600e+03,8.986000e+02\n" +
        "2.000000e+01,2.222200e-01,4.444400e-03,1.140600e+03,1.845600e+03,1.463000e+02,7.431000e+02,2.623000e+02,2.252100e+01,3.379000e+02,3.545000e+02,3.445000e+02,3.181000e+02,3.002000e+02,1.282800e+03,8.992000e+02\n" +
        "3.000000e+01,3.333300e-01,6.666700e-03,1.276400e+03,2.298700e+03,1.776000e+02,7.731000e+02,2.667000e+02,2.253400e+01,3.616000e+02,3.778000e+02,3.646000e+02,3.203000e+02,3.041000e+02,1.327600e+03,9.016000e+02\n" +
        "4.000000e+01,4.444400e-01,8.888900e-03,1.408300e+03,2.730200e+03,2.084000e+02,8.052000e+02,2.717000e+02,2.255200e+01,3.851000e+02,4.019000e+02,3.859000e+02,3.232000e+02,3.090000e+02,1.372100e+03,9.064000e+02\n" +
        "5.000000e+01,5.555600e-01,1.111100e-02,1.533800e+03,3.117900e+03,2.382000e+02,8.383000e+02,2.774000e+02,2.257300e+01,4.082000e+02,4.260000e+02,4.082000e+02,3.269000e+02,3.151000e+02,1.415400e+03,9.135000e+02\n" +
        "6.000000e+01,6.666700e-01,1.333300e-02,1.649700e+03,3.451000e+03,2.661000e+02,8.708000e+02,2.835000e+02,2.259900e+01,4.301000e+02,4.499000e+02,4.314000e+02,3.314000e+02,3.225000e+02,1.456900e+03,9.229000e+02\n" +
        "7.000000e+01,7.777800e-01,1.555600e-02,1.752900e+03,3.724400e+03,2.911000e+02,9.019000e+02,2.901000e+02,2.263100e+01,4.503000e+02,4.726000e+02,4.548000e+02,3.366000e+02,3.312000e+02,1.494800e+03,9.342000e+02\n" +
        "8.000000e+01,8.888900e-01,1.777800e-02,1.840800e+03,3.931100e+03,3.124000e+02,9.301000e+02,2.969000e+02,2.266800e+01,4.681000e+02,4.930000e+02,4.771000e+02,3.423000e+02,3.410000e+02,1.526900e+03,9.468000e+02\n" +
        "9.000000e+01,1.000000e+00,2.000000e-02,1.912600e+03,4.071500e+03,3.290000e+02,9.548000e+02,3.036000e+02,2.270800e+01,4.826000e+02,5.103000e+02,4.964000e+02,3.482000e+02,3.516000e+02,1.551200e+03,9.600000e+02\n" +
        "1.000000e+02,1.000000e+00,2.020000e-02,1.930800e+03,4.090100e+03,3.336000e+02,9.620000e+02,3.055000e+02,2.271900e+01,4.863000e+02,5.143000e+02,5.009000e+02,3.497000e+02,3.548000e+02,1.556500e+03,9.639000e+02\n" +
        "1.200000e+02,1.000000e+00,2.060000e-02,1.949500e+03,4.108700e+03,3.382000e+02,9.707000e+02,3.078000e+02,2.273400e+01,4.914000e+02,5.201000e+02,5.075000e+02,3.522000e+02,3.594000e+02,1.562800e+03,9.705000e+02\n" +
        "1.500000e+02,1.000000e+00,2.120000e-02,1.964900e+03,4.121200e+03,3.431000e+02,9.800000e+02,3.105000e+02,2.275700e+01,4.974000e+02,5.270000e+02,5.154000e+02,3.558000e+02,3.660000e+02,1.570400e+03,9.790000e+02\n" +
        "1.800000e+02,1.000000e+00,2.180000e-02,1.973100e+03,4.126900e+03,3.462000e+02,9.858000e+02,3.126000e+02,2.278400e+01,5.022000e+02,5.328000e+02,5.220000e+02,3.596000e+02,3.726000e+02,1.576200e+03,9.866000e+02\n" +
        "2.100000e+02,1.000000e+00,2.240000e-02,1.977400e+03,4.129300e+03,3.484000e+02,9.891000e+02,3.141000e+02,2.281100e+01,5.060000e+02,5.376000e+02,5.276000e+02,3.633000e+02,3.789000e+02,1.580500e+03,9.931000e+02\n" +
        "2.400000e+02,1.200000e-01,3.200000e-02,1.201500e+03,1.786100e+03,2.610000e+02,8.090000e+02,2.927000e+02,2.282000e+01,4.352000e+02,4.757000e+02,4.743000e+02,3.595000e+02,3.715000e+02,1.414200e+03,9.751000e+02\n" +
        "3.000000e+02,7.500000e-02,2.850000e-02,1.036800e+03,1.383000e+03,2.257000e+02,7.520000e+02,2.754000e+02,2.277000e+01,3.857000e+02,4.241000e+02,4.231000e+02,3.507000e+02,3.552000e+02,1.324100e+03,9.501000e+02\n" +
        "3.600000e+02,5.000000e-02,2.450000e-02,9.589000e+02,1.170900e+03,2.006000e+02,7.205000e+02,2.632000e+02,2.268500e+01,3.539000e+02,3.890000e+02,3.884000e+02,3.401000e+02,3.370000e+02,1.279000e+03,9.263000e+02\n" +
        "4.200000e+02,3.000000e-02,2.050000e-02,9.132000e+02,1.045400e+03,1.789000e+02,7.020000e+02,2.563000e+02,2.260300e+01,3.329000e+02,3.650000e+02,3.644000e+02,3.294000e+02,3.183000e+02,1.251300e+03,9.065000e+02\n" +
        "5.200000e+02,0.000000e+00,1.550000e-02,8.787000e+02,9.381000e+02,1.493000e+02,6.900000e+02,2.538000e+02,2.249000e+01,3.096000e+02,3.372000e+02,3.364000e+02,3.146000e+02,2.974000e+02,1.219900e+03,8.868000e+02\n" +
        "5.600000e+02,2.500000e-01,1.680000e-02,1.119500e+03,1.745200e+03,1.945000e+02,7.390000e+02,2.613000e+02,2.250100e+01,3.481000e+02,3.751000e+02,3.640000e+02,3.178000e+02,3.051000e+02,1.291200e+03,8.969000e+02\n" +
        "6.000000e+02,6.000000e-01,1.900000e-02,1.484300e+03,3.025400e+03,2.731000e+02,8.465000e+02,2.805000e+02,2.254100e+01,4.126000e+02,4.392000e+02,4.194000e+02,3.281000e+02,3.266000e+02,1.421800e+03,9.244000e+02\n" +
        "6.500000e+02,8.200000e-01,2.020000e-02,1.712800e+03,3.652100e+03,3.112000e+02,9.046000e+02,2.952000e+02,2.258800e+01,4.615000e+02,4.893000e+02,4.682000e+02,3.397000e+02,3.507000e+02,1.508900e+03,9.559000e+02\n" +
        "7.200000e+02,1.000000e-01,2.900000e-02,1.070200e+03,1.462400e+03,2.401000e+02,7.620000e+02,2.761000e+02,2.257200e+01,3.791000e+02,4.240000e+02,4.184000e+02,3.342000e+02,3.421000e+02,1.326000e+03,9.361000e+02\n" +
        "8.100000e+02,5.000000e-02,2.400000e-02,9.538000e+02,1.156800e+03,1.998000e+02,7.210000e+02,2.624000e+02,2.250400e+01,3.486000e+02,3.874000e+02,3.829000e+02,3.240000e+02,3.218000e+02,1.267300e+03,9.085000e+02\n" +
        "9.000000e+02,2.000000e-02,1.850000e-02,9.034000e+02,1.013200e+03,1.710000e+02,6.995000e+02,2.568000e+02,2.244000e+01,3.281000e+02,3.602000e+02,3.573000e+02,3.135000e+02,3.019000e+02,1.232500e+03,8.904000e+02\n" +
        "\n" +
        "================================================================================\n" +
        "Coupling proxy time history\n" +
        "================================================================================\n" +
        "time,iodine_inventory_report,xenon_inventory_report,control_drum_angle_report,minimum_ledinegg_margin_proxy,ledinegg_status_report,reflector_gamma_heat_fraction_report,tank_shield_heat_leak_report,para_fraction_report,gimbal_hydraulic_bleed_report,minimum_thermal_margin_proxy,thrust_load_report,minimum_thrust_frame_compression_margin,core_support_grid_pressure_drop_report,minimum_core_support_grid_creep_margin,reflector_liner_effusion_fraction_report,minimum_reflector_liner_barrier_margin,pogo_accumulator_damping_ratio_report,feedline_pressure_wave_report,helium_purge_flow_report,minimum_shaft_seal_leakage_margin,grid_flow_area_fraction_report,grid_form_loss_coefficient_report,grid_exit_density_report,grid_exit_velocity_report,grid_coupled_pressure_drop_report,minimum_point_kinetics_matrix_stability,core_density_oscillation_report,fuel_alignment_shift_report,thrust_frame_resonance_gain_report,pogo_suppressor_attenuation_report,net_coupled_gain_report,fluid_phase_angle_report\n" +
        "0.000000e+00,0.000000e+00,0.000000e+00,0.000000e+00,1.000000e+00,0,0.000000e+00,0.000000e+00,9.980000e-01,0.000000e+00,2.500000e+00,0.000000e+00,3.000000e+00,0.000000e+00,2.400000e+00,0.000000e+00,1.800000e+00,8.000000e-02,0.000000e+00,0.000000e+00,2.100000e+00,6.500000e-01,2.250000e+00,8.500000e-01,0.000000e+00,0.000000e+00,1.250000e+00,0.000000e+00,0.000000e+00,1.000000e+00,0.000000e+00,0.000000e+00,0.000000e+00\n" +
        "9.000000e+01,3.600000e-01,1.200000e-01,8.700000e+01,7.800000e-01,0,6.740000e-01,1.150000e-02,9.941000e-01,0.000000e+00,1.640000e+00,2.120000e+05,2.280000e+00,4.250000e+05,1.760000e+00,2.250000e-02,1.480000e+00,1.850000e-01,3.100000e-02,4.000000e-03,1.760000e+00,6.450000e-01,2.700000e+00,7.200000e-01,1.850000e+02,3.920000e+05,1.120000e+00,5.500000e-03,4.000000e-04,8.800000e-01,2.200000e-01,1.940000e-01,-1.200000e+01\n" +
        "2.100000e+02,8.400000e-01,5.500000e-01,9.150000e+01,7.100000e-01,0,6.940000e-01,1.460000e-02,9.927000e-01,1.200000e-02,1.420000e+00,2.380000e+05,2.050000e+00,4.620000e+05,1.540000e+00,2.600000e-02,1.330000e+00,2.350000e-01,4.800000e-02,6.000000e-03,1.680000e+00,6.430000e-01,2.900000e+00,6.650000e-01,2.050000e+02,4.330000e+05,1.080000e+00,7.600000e-03,6.500000e-04,9.400000e-01,2.800000e-01,2.632000e-01,-1.850000e+01\n" +
        "5.200000e+02,1.000000e+00,1.000000e+00,1.200000e+01,8.400000e-01,0,3.200000e-01,7.900000e-03,9.955000e-01,0.000000e+00,2.030000e+00,0.000000e+00,2.660000e+00,1.100000e+05,2.020000e+00,1.100000e-02,1.610000e+00,1.120000e-01,1.900000e-02,7.000000e-03,1.910000e+00,6.480000e-01,2.600000e+00,8.100000e-01,9.500000e+01,2.260000e+05,1.180000e+00,2.000000e-03,1.000000e-04,7.200000e-01,1.500000e-01,1.080000e-01,-4.000000e+00\n" +
        "6.500000e+02,7.600000e-01,8.800000e-01,7.650000e+01,6.600000e-01,1,6.320000e-01,1.280000e-02,9.939000e-01,2.500000e-02,1.310000e+00,1.960000e+05,1.920000e+00,4.050000e+05,1.430000e+00,2.850000e-02,1.250000e+00,2.800000e-01,6.700000e-02,9.000000e-03,1.560000e+00,6.410000e-01,3.050000e+00,6.100000e-01,2.250000e+02,4.820000e+05,1.040000e+00,9.000000e-03,7.900000e-04,1.120000e+00,3.400000e-01,3.808000e-01,-2.600000e+01\n" +
        "9.000000e+02,2.000000e-01,3.300000e-01,2.000000e+01,8.900000e-01,0,2.000000e-01,4.100000e-03,9.970000e-01,0.000000e+00,2.210000e+00,0.000000e+00,2.760000e+00,8.800000e+04,2.160000e+00,8.000000e-03,1.690000e+00,9.500000e-02,1.200000e-02,5.000000e-03,1.960000e+00,6.500000e-01,2.300000e+00,8.900000e-01,7.200000e+01,1.660000e+05,1.220000e+00,1.200000e-03,5.000000e-05,6.100000e-01,9.000000e-02,5.490000e-02,-2.000000e+00\n" +
        "\n" +
        "================================================================================\n" +
        "Final postprocessor values\n" +
        "================================================================================\n" +
        "peak_fuel_temperature = 4.129300e+03\n" +
        "average_core_fuel_temperature = 9.034000e+02\n" +
        "average_core_coolant_temperature = 1.710000e+02\n" +
        "peak_reflector_temperature = 9.891000e+02\n" +
        "peak_shield_temperature = 3.141000e+02\n" +
        "tank_wall_average_temperature = 2.244000e+01\n" +
        "peak_regen_wall_temperature = 5.060000e+02\n" +
        "peak_chamber_wall_temperature = 5.376000e+02\n" +
        "peak_nozzle_wall_temperature = 5.276000e+02\n" +
        "peak_gimbal_ring_temperature = 3.633000e+02\n" +
        "peak_thrust_frame_temperature = 3.789000e+02\n" +
        "peak_core_support_grid_temperature = 1.580500e+03\n" +
        "peak_reflector_liner_temperature = 9.931000e+02\n" +
        "normalized_reactor_power = 2.000000e-02\n" +
        "decay_heat_fraction_report = 1.850000e-02\n" +
        "iodine_inventory_report = 2.000000e-01\n" +
        "xenon_inventory_report = 3.300000e-01\n" +
        "control_drum_angle_report = 2.000000e+01\n" +
        "minimum_ledinegg_margin_proxy = 6.600000e-01\n" +
        "ledinegg_status_report = 0\n" +
        "reflector_gamma_heat_fraction_report = 2.000000e-01\n" +
        "tank_shield_heat_leak_report = 4.100000e-03\n" +
        "para_fraction_report = 9.970000e-01\n" +
        "gimbal_hydraulic_bleed_report = 0.000000e+00\n" +
        "minimum_thermal_margin_proxy = 1.310000e+00\n" +
        "thrust_load_report = 0.000000e+00\n" +
        "minimum_thrust_frame_compression_margin = 1.920000e+00\n" +
        "core_support_grid_pressure_drop_report = 8.800000e+04\n" +
        "minimum_core_support_grid_creep_margin = 1.430000e+00\n" +
        "reflector_liner_effusion_fraction_report = 8.000000e-03\n" +
        "minimum_reflector_liner_barrier_margin = 1.250000e+00\n" +
        "pogo_accumulator_damping_ratio_report = 9.500000e-02\n" +
        "feedline_pressure_wave_report = 1.200000e-02\n" +
        "helium_purge_flow_report = 5.000000e-03\n" +
        "minimum_shaft_seal_leakage_margin = 1.560000e+00\n" +
        "grid_flow_area_fraction_report = 6.500000e-01\n" +
        "grid_form_loss_coefficient_report = 2.300000e+00\n" +
        "grid_exit_density_report = 8.900000e-01\n" +
        "grid_exit_velocity_report = 7.200000e+01\n" +
        "grid_coupled_pressure_drop_report = 1.660000e+05\n" +
        "minimum_point_kinetics_matrix_stability = 1.040000e+00\n" +
        "core_density_oscillation_report = 1.200000e-03\n" +
        "fuel_alignment_shift_report = 5.000000e-05\n" +
        "thrust_frame_resonance_gain_report = 6.100000e-01\n" +
        "pogo_suppressor_attenuation_report = 9.000000e-02\n" +
        "net_coupled_gain_report = 5.490000e-02\n" +
        "fluid_phase_angle_report = -2.000000e+00\n" +
        "\n" +
        "================================================================================\n" +
        "App-facing derived summary\n" +
        "================================================================================\n" +
        "thermal_panel.status = nominal_after_cooldown\n" +
        "thermal_panel.peak_fuel_temperature_K = 4.129300e+03\n" +
        "thermal_panel.peak_fuel_time_s = 2.100000e+02\n" +
        "thermal_panel.minimum_thermal_margin = 1.310000e+00\n" +
        "thermal_panel.regen_wall_peak_K = 5.060000e+02\n" +
        "thermal_panel.chamber_wall_peak_K = 5.376000e+02\n" +
        "thermal_panel.nozzle_wall_peak_K = 5.276000e+02\n" +
        "thermal_panel.reflector_gamma_heat_fraction_peak = 6.940000e-01\n" +
        "thermal_panel.tank_heat_leak_peak = 1.460000e-02\n" +
        "\n" +
        "core_panel.power_ramp_status = completed\n" +
        "core_panel.restart_status = completed_with_elevated_xenon\n" +
        "core_panel.iodine_inventory_peak = 1.000000e+00\n" +
        "core_panel.xenon_inventory_peak = 1.000000e+00\n" +
        "core_panel.minimum_ledinegg_margin = 6.600000e-01\n" +
        "core_panel.ledinegg_advisory_count = 1\n" +
        "core_panel.minimum_point_kinetics_stability = 1.040000e+00\n" +
        "\n" +
        "structures_panel.thrust_frame_peak_K = 3.789000e+02\n" +
        "structures_panel.minimum_thrust_frame_compression_margin = 1.920000e+00\n" +
        "structures_panel.core_support_grid_peak_K = 1.580500e+03\n" +
        "structures_panel.minimum_grid_creep_margin = 1.430000e+00\n" +
        "structures_panel.grid_coupled_pressure_drop_peak_Pa = 4.820000e+05\n" +
        "structures_panel.fuel_alignment_shift_peak_m = 7.900000e-04\n" +
        "\n" +
        "propulsion_panel.mass_flow_source = rocets_mass_flow_proxy\n" +
        "propulsion_panel.gimbal_bleed_peak_fraction = 2.500000e-02\n" +
        "propulsion_panel.para_fraction_final = 9.970000e-01\n" +
        "propulsion_panel.ortho_para_conditioning_status = nominal\n" +
        "propulsion_panel.helium_purge_flow_final = 5.000000e-03\n" +
        "propulsion_panel.shaft_seal_leakage_margin_min = 1.560000e+00\n" +
        "\n" +
        "stability_panel.pogo_damping_ratio_peak = 2.800000e-01\n" +
        "stability_panel.feedline_pressure_wave_peak = 6.700000e-02\n" +
        "stability_panel.thrust_frame_resonance_gain_peak = 1.120000e+00\n" +
        "stability_panel.pogo_suppressor_attenuation_peak = 3.400000e-01\n" +
        "stability_panel.net_coupled_gain_peak = 3.808000e-01\n" +
        "stability_panel.fluid_phase_angle_min_deg = -2.600000e+01\n" +
        "\n" +
        "================================================================================\n" +
        "Cross-link echo\n" +
        "================================================================================\n" +
        "[CrossLinks/mcnp_geometry]\n" +
        "  mcnp_input = ntp_mcnp.inp\n" +
        "  imported_core_flux_proxy = f4_f14_f24_axial_segments\n" +
        "  imported_reflector_heating_proxy = f34_reflector_control_poison_vessel\n" +
        "  imported_shield_proxy = f44_internal_shield\n" +
        "[]\n" +
        "\n" +
        "[CrossLinks/rocets_system]\n" +
        "  rocets_input = ntp_rocet.inp\n" +
        "  imported_mass_flow_proxy = rocets_mass_flow_proxy\n" +
        "  imported_turbine_tap_fraction = turbine_tap_fraction_proxy\n" +
        "  imported_gimbal_bleed_fraction = gimbal_hydraulic_bleed_proxy\n" +
        "[]\n" +
        "\n" +
        "[CrossLinks/coupled_stability_architecture]\n" +
        "  vibration_neutronic_coupling = point_kinetics_matrix_stability_proxy\n" +
        "  thermal_mechanical_integrity = thrust_frame_compression_margin_proxy\n" +
        "  fluid_hydraulic_node_coupling = grid_coupled_pressure_drop_proxy\n" +
        "  structural_dynamic_frequency_map = net_coupled_gain_proxy\n" +
        "[]\n" +
        "\n" +
        "================================================================================\n" +
        "Performance summary\n" +
        "================================================================================\n" +
        "Total nonlinear iterations = 123\n" +
        "Total linear iterations = 947\n" +
        "Average nonlinear iterations per step = 4.241379e+00\n" +
        "Average linear iterations per step = 3.265517e+01\n" +
        "Final time = 9.000000e+02\n" +
        "Final dt = 9.000000e+01\n" +
        "Solve status = converged\n" +
        "Fixture status = complete\n" +
        "\n" +
        "Finished Executing"
}