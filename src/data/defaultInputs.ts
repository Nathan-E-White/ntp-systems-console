import type { EngineInputs } from '../types/EngineState';

export const defaultInputs: EngineInputs = {
  thermalPowerMw: 420,
  massFlowKgPerSec: 13.2,
  inletTemperatureK: 95,
  chamberPressureMpa: 5.8,
  nozzleExpansionRatio: 120,
  controlDrumAngleDeg: 42,
  fuelTemperatureLimitK: 2_850,
  shieldingMassFraction: 0.13,
  missionMode: 'startup',
};
