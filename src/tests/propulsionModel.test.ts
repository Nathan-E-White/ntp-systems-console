import { describe, expect, it } from 'vitest';
import { defaultInputs } from '../data/defaultInputs';
import { computeEngineOutputs } from '../physics/propulsionModel';

const round = (value: number) => Math.round(value * 100) / 100;

describe('computeEngineOutputs', () => {
  it('returns physically plausible positive propulsion outputs', () => {
    const outputs = computeEngineOutputs(defaultInputs);

    expect(outputs.outletTemperatureK).toBeGreaterThan(defaultInputs.inletTemperatureK);
    expect(outputs.specificImpulseSec).toBeGreaterThan(300);
    expect(outputs.thrustKn).toBeGreaterThan(0);
    expect(outputs.basisCompletenessPercent).toBeGreaterThanOrEqual(0);
    expect(outputs.basisCompletenessPercent).toBeLessThanOrEqual(100);
  });

  it('increases thrust when mass flow is increased for the same case', () => {
    const baseline = computeEngineOutputs(defaultInputs);
    const higherFlow = computeEngineOutputs({
      ...defaultInputs,
      thermalCouplingMode: 'fixedEfficiency',
      thermalCouplingEfficiency: 0.9295175369895565,
      massFlowKgPerSec: defaultInputs.massFlowKgPerSec + 4,
    });

    expect(round(higherFlow.thrustKn)).toBeGreaterThan(round(baseline.thrustKn));
  });
});
