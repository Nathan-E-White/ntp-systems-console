import type {EngineInputs} from "../types/EngineState";


export function estimateFuelTemperature(outletTemperatureK: number, controlDrumAngleDeg: number, missionMode: EngineInputs['missionMode']): number {

    const drumPenalty = Math.abs(controlDrumAngleDeg - 45) * 2.6;
    const transientPenalty = missionMode === 'startup' ? 140 : missionMode === 'shutdown' ? 90 : missionMode === 'cooldown' ? -180 : 40;
    return outletTemperatureK + 340 + drumPenalty + transientPenalty;
}