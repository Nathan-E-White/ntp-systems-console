export type MissionMode = 'startup' | 'steadyBurn' | 'shutdown' | 'cooldown';

export interface EngineInputs {
  thermalPowerMw: number;
  massFlowKgPerSec: number;
  inletTemperatureK: number;
  chamberPressureMpa: number;
  nozzleExpansionRatio: number;
  controlDrumAngleDeg: number;
  fuelTemperatureLimitK: number;
  shieldingMassFraction: number;
  missionMode: MissionMode;
}

export interface EngineOutputs {
  outletTemperatureK: number;
  exhaustVelocityMPerSec: number;
  specificImpulseSec: number;
  thrustKn: number;
  fuelTemperatureK: number;
  thermalMarginK: number;
  pressureDropMpa: number;
  stabilityScore: number;
  stabilityStatus: 'nominal' | 'watch' | 'limit';
}

export interface EngineState {
  inputs: EngineInputs;
  outputs: EngineOutputs;
}
