import type {EngineInputs} from "../types/EngineState";

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export function estimateStabilityScore(
    inputs: EngineInputs,
    thermalMarginK: number,
    pressureDropMpa: number
): number {
    const drumPenalty = Math.abs(inputs.controlDrumAngleDeg - 45) * 0.9;
    const pressurePenalty = Math.max(0, pressureDropMpa - 1.4) * 12;
    const marginPenalty = Math.max(0, 180 - thermalMarginK) * 0.16;
    const transientPenalty = inputs.missionMode === 'startup' ? 10 : inputs.missionMode === 'shutdown' ? 7 : 0;
    return Math.round(clamp(100 - drumPenalty - pressurePenalty - marginPenalty - transientPenalty, 0, 100));
}