import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import {estimateExhaustVelocity} from "./estimateExhaustVelocity";
import {estimateFuelTemperature} from "./estimateFuelTemperature";
import {estimatePressureDrop} from "./estimatePressureDrop";
import {estimateStabilityScore} from "./estimateStabilityScore";
import {classifyStability} from "./classifyStability";

const HYDROGEN_CP_J_PER_KG_K = 14_300;
const G0 = 9.80665;
const GAMMA_H2 = 1.405;
const GAS_CONSTANT_H2 = 4_124;
const MODEL_EFFICIENCY = 0.82;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

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

