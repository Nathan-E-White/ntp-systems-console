import type {EngineInputs} from "../types/EngineState";
import {
    FUEL_DRUM_PENALTY_K_PER_DEG,
    FUEL_PHASE_PENALTY_K,
    FUEL_TEMPERATURE_OFFSET_K,
    STABILITY_REFERENCE_DRUM_ANGLE_DEG,
} from './reducedOrderModelConstants';


export function estimateFuelTemperature(outletTemperatureK: number, controlDrumAngleDeg: number, missionMode: EngineInputs['missionMode']): number {
    const drumPenalty = Math.abs(controlDrumAngleDeg - STABILITY_REFERENCE_DRUM_ANGLE_DEG)
        * FUEL_DRUM_PENALTY_K_PER_DEG;
    return outletTemperatureK
        + FUEL_TEMPERATURE_OFFSET_K
        + drumPenalty
        + FUEL_PHASE_PENALTY_K[missionMode];
}
