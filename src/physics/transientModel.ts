import type { EngineInputs } from '../types/EngineState';
import type { TransientPoint } from '../types/TransientPoint';
import type {TransientPointEvaluation} from './calculationTrace';
import {evaluateEngineCase} from './evaluateEngineCase';
import {derivePeweeClosureEfficiency} from './representativeChannelModel';
import {
  TRANSIENT_DRUM_OFFSET_DEG,
  TRANSIENT_POINT_COUNT,
  TRANSIENT_STEP_SECONDS,
} from './reducedOrderModelConstants';

export function generateTransient(inputs: EngineInputs): TransientPoint[] {
  return generateTransientEvaluation(inputs).map(({timeSec, generatedInputs, evaluation}) => ({
    timeSec,
    powerMw: generatedInputs.thermalPowerMw,
    outletTemperatureK: evaluation.outputs.outletTemperatureK,
    thrustKn: evaluation.outputs.thrustKn,
    channelWallCriterionMarginK: evaluation.outputs.channelWallCriterionMarginK,
    basisCompletenessPercent: evaluation.outputs.basisCompletenessPercent,
  }));
}

export function generateTransientEvaluation(inputs: EngineInputs): TransientPointEvaluation[] {
  const fixedTransientEfficiency = inputs.thermalCouplingMode === 'benchmarkClosure'
    ? derivePeweeClosureEfficiency(inputs) ?? inputs.thermalCouplingEfficiency
    : inputs.thermalCouplingEfficiency;
  return Array.from({ length: TRANSIENT_POINT_COUNT }, (_, index) => {
    const timeSec = index * TRANSIENT_STEP_SECONDS;
    const ramp = smoothRamp(timeSec, inputs.missionMode);
    const generatedInputs: EngineInputs = {
      ...inputs,
      thermalPowerMw: inputs.thermalPowerMw * ramp,
      controlDrumAngleDeg: inputs.controlDrumAngleDeg + (1 - ramp) * TRANSIENT_DRUM_OFFSET_DEG,
      thermalCouplingMode: 'fixedEfficiency',
      thermalCouplingEfficiency: fixedTransientEfficiency,
    };
    return {
      timeSec,
      rampFraction: ramp,
      generatedInputs,
      evaluation: evaluateEngineCase(generatedInputs),
    };
  });
}

function smoothRamp(timeSec: number, mode: EngineInputs['missionMode']): number {
  const x = timeSec / 200;
  if (mode === 'startup') return 0.08 + 0.92 * smootherStep(x);
  if (mode === 'shutdown') return 1 - 0.82 * smootherStep(x);
  if (mode === 'cooldown') return 0.16 * (1 - smootherStep(x));
  return 0.96 + 0.04 * Math.sin(timeSec / 28);
}

function smootherStep(x: number): number {
  const t = Math.min(Math.max(x, 0), 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}
