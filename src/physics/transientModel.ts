import type { EngineInputs } from '../types/EngineState';
import type { TransientPoint } from '../types/TransientPoint';
import { computeEngineOutputs } from './propulsionModel';

export function generateTransient(inputs: EngineInputs): TransientPoint[] {
  return Array.from({ length: 41 }, (_, index) => {
    const timeSec = index * 5;
    const ramp = smoothRamp(timeSec, inputs.missionMode);
    const runInputs: EngineInputs = {
      ...inputs,
      thermalPowerMw: inputs.thermalPowerMw * ramp,
      controlDrumAngleDeg: inputs.controlDrumAngleDeg + (1 - ramp) * 18,
    };
    const outputs = computeEngineOutputs(runInputs);
    return {
      timeSec,
      powerMw: runInputs.thermalPowerMw,
      outletTemperatureK: outputs.outletTemperatureK,
      thrustKn: outputs.thrustKn,
      thermalMarginK: outputs.thermalMarginK,
      stabilityScore: outputs.stabilityScore,
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
