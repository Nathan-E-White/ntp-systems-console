import type {EngineInputs} from "../types/EngineState";
import {
    STABILITY_DRUM_PENALTY_PER_DEG,
    STABILITY_MARGIN_PENALTY_PER_K,
    STABILITY_MARGIN_WATCH_K,
    STABILITY_PHASE_PENALTY,
    STABILITY_PRESSURE_PENALTY_PER_MPA,
    STABILITY_PRESSURE_WATCH_MPA,
    STABILITY_REFERENCE_DRUM_ANGLE_DEG,
} from './reducedOrderModelConstants';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export function estimateStabilityScore(
    inputs: EngineInputs,
    thermalMarginK: number,
    pressureDropMpa: number
): number {
    const drumPenalty = Math.abs(inputs.controlDrumAngleDeg - STABILITY_REFERENCE_DRUM_ANGLE_DEG)
        * STABILITY_DRUM_PENALTY_PER_DEG;
    const pressurePenalty = Math.max(0, pressureDropMpa - STABILITY_PRESSURE_WATCH_MPA)
        * STABILITY_PRESSURE_PENALTY_PER_MPA;
    const marginPenalty = Math.max(0, STABILITY_MARGIN_WATCH_K - thermalMarginK)
        * STABILITY_MARGIN_PENALTY_PER_K;
    const transientPenalty = STABILITY_PHASE_PENALTY[inputs.missionMode];
    return Math.round(clamp(100 - drumPenalty - pressurePenalty - marginPenalty - transientPenalty, 0, 100));
}
