import type { EngineInputs, EngineOutputs } from '../types/EngineState';

const HYDROGEN_CP_J_PER_KG_K = 14_300;
const G0 = 9.80665;
const GAMMA_H2 = 1.405;
const GAS_CONSTANT_H2 = 4_124;
const MODEL_EFFICIENCY = 0.82;

export function computeEngineOutputs(inputs: EngineInputs): EngineOutputs {
  const powerW = inputs.thermalPowerMw * 1_000_000;
  const deltaT = (MODEL_EFFICIENCY * powerW) / (inputs.massFlowKgPerSec * HYDROGEN_CP_J_PER_KG_K);
  const outletTemperatureK = clamp(inputs.inletTemperatureK + deltaT, inputs.inletTemperatureK, 3_200);

  const exhaustVelocityMPerSec = estimateExhaustVelocity(outletTemperatureK, inputs.nozzleExpansionRatio);
  const specificImpulseSec = exhaustVelocityMPerSec / G0;
  const thrustKn = (inputs.massFlowKgPerSec * exhaustVelocityMPerSec) / 1_000;
  const fuelTemperatureK = estimateFuelTemperature(outletTemperatureK, inputs.controlDrumAngleDeg, inputs.missionMode);
  const thermalMarginK = inputs.fuelTemperatureLimitK - fuelTemperatureK;
  const pressureDropMpa = estimatePressureDrop(inputs.massFlowKgPerSec, inputs.chamberPressureMpa);
  const stabilityScore = estimateStabilityScore(inputs, thermalMarginK, pressureDropMpa);

  return {
    outletTemperatureK,
    exhaustVelocityMPerSec,
    specificImpulseSec,
    thrustKn,
    fuelTemperatureK,
    thermalMarginK,
    pressureDropMpa,
    stabilityScore,
    stabilityStatus: classifyStability(stabilityScore, thermalMarginK),
  };
}

function estimateExhaustVelocity(outletTemperatureK: number, expansionRatio: number): number {
  const expansionGain = 0.86 + 0.035 * Math.log(Math.max(expansionRatio, 1));
  const idealVelocity = Math.sqrt((2 * GAMMA_H2 * GAS_CONSTANT_H2 * outletTemperatureK) / (GAMMA_H2 - 1));
  return idealVelocity * clamp(expansionGain, 0.82, 1.08);
}

function estimateFuelTemperature(outletTemperatureK: number, controlDrumAngleDeg: number, missionMode: EngineInputs['missionMode']): number {
  const drumPenalty = Math.abs(controlDrumAngleDeg - 45) * 2.6;
  const transientPenalty = missionMode === 'startup' ? 140 : missionMode === 'shutdown' ? 90 : missionMode === 'cooldown' ? -180 : 40;
  return outletTemperatureK + 340 + drumPenalty + transientPenalty;
}

function estimatePressureDrop(massFlowKgPerSec: number, chamberPressureMpa: number): number {
  return clamp(0.018 * massFlowKgPerSec ** 1.35 + 0.015 * chamberPressureMpa, 0.05, 3.5);
}

function estimateStabilityScore(inputs: EngineInputs, thermalMarginK: number, pressureDropMpa: number): number {
  const drumPenalty = Math.abs(inputs.controlDrumAngleDeg - 45) * 0.9;
  const pressurePenalty = Math.max(0, pressureDropMpa - 1.4) * 12;
  const marginPenalty = Math.max(0, 180 - thermalMarginK) * 0.16;
  const transientPenalty = inputs.missionMode === 'startup' ? 10 : inputs.missionMode === 'shutdown' ? 7 : 0;
  return Math.round(clamp(100 - drumPenalty - pressurePenalty - marginPenalty - transientPenalty, 0, 100));
}

function classifyStability(score: number, marginK: number): EngineOutputs['stabilityStatus'] {
  if (score < 58 || marginK < 80) return 'limit';
  if (score < 78 || marginK < 220) return 'watch';
  return 'nominal';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
