import type {MissionMode} from '../types/EngineState';

export const HYDROGEN_CP_J_PER_KG_K = 14_300;
export const G0_M_PER_S2 = 9.80665;
export const GAMMA_H2 = 1.405;
export const GAS_CONSTANT_H2_J_PER_KG_K = 4_124;
export const MODEL_EFFICIENCY = 0.82;
export const OUTLET_TEMPERATURE_CAP_K = 3_200;

export const EXPANSION_GAIN_BASE = 0.86;
export const EXPANSION_GAIN_LOG_COEFFICIENT = 0.035;
export const EXPANSION_GAIN_MINIMUM = 0.82;
export const EXPANSION_GAIN_MAXIMUM = 1.08;

export const FUEL_TEMPERATURE_OFFSET_K = 340;
export const FUEL_DRUM_PENALTY_K_PER_DEG = 2.6;
export const FUEL_PHASE_PENALTY_K: Readonly<Record<MissionMode, number>> = {
    startup: 140,
    steadyBurn: 40,
    shutdown: 90,
    cooldown: -180,
};

export const PRESSURE_DROP_FLOW_COEFFICIENT = 0.018;
export const PRESSURE_DROP_FLOW_EXPONENT = 1.35;
export const PRESSURE_DROP_CHAMBER_COEFFICIENT = 0.015;
export const PRESSURE_DROP_MINIMUM_MPA = 0.05;
export const PRESSURE_DROP_MAXIMUM_MPA = 3.5;

export const STABILITY_REFERENCE_DRUM_ANGLE_DEG = 45;
export const STABILITY_DRUM_PENALTY_PER_DEG = 0.9;
export const STABILITY_PRESSURE_WATCH_MPA = 1.4;
export const STABILITY_PRESSURE_PENALTY_PER_MPA = 12;
export const STABILITY_MARGIN_WATCH_K = 180;
export const STABILITY_MARGIN_PENALTY_PER_K = 0.16;
export const STABILITY_PHASE_PENALTY: Readonly<Record<MissionMode, number>> = {
    startup: 10,
    steadyBurn: 0,
    shutdown: 7,
    cooldown: 0,
};

export const STABILITY_LIMIT_SCORE = 58;
export const STABILITY_WATCH_SCORE = 78;
export const THERMAL_LIMIT_MARGIN_K = 80;
export const THERMAL_WATCH_MARGIN_K = 220;

export const TRANSIENT_DURATION_SECONDS = 200;
export const TRANSIENT_STEP_SECONDS = 5;
export const TRANSIENT_POINT_COUNT = 41;
export const TRANSIENT_DRUM_OFFSET_DEG = 18;
