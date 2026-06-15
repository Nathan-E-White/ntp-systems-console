export type MissionMode = 'startup' | 'steadyBurn' | 'shutdown' | 'cooldown';
export type ThermalCouplingMode = 'benchmarkClosure' | 'fixedEfficiency';
export type EngineModelProfileId = 'peweeInspired' | 'thermalInvestigation';

export interface EngineInputs {
  modelProfileId: EngineModelProfileId;
  thermalPowerMw: number;
  massFlowKgPerSec: number;
  inletTemperatureK: number;
  chamberPressureMpa: number;
  nozzleExpansionRatio: number;
  controlDrumAngleDeg: number;
  fuelTemperatureLimitK: number;
  shieldingMassFraction: number;
  missionMode: MissionMode;
  thermalCouplingMode: ThermalCouplingMode;
  thermalCouplingEfficiency: number;
  channelLengthM: number;
  channelHydraulicDiameterM: number;
  channelCount: number;
  channelRoughnessM: number;
  channelInletLossCoefficient: number;
  channelExitLossCoefficient: number;
  channelWallCriterionK: number;
  nozzleEfficiency: number;
  ambientPressureKpa: number;
  overrideRationale: string;
}

export interface ReferenceControlledEngineOutputs {
  outletTemperatureK: number;
  exhaustVelocityMPerSec: number;
  specificImpulseSec: number;
  thrustKn: number;
  peakChannelWallTemperatureK: number;
  channelWallCriterionMarginK: number;
  pressureDropMpa: number;
  basisCompletenessPercent: number;
  reviewPosture: 'nominal' | 'watch' | 'limit';
}

export type EngineOutputs = ReferenceControlledEngineOutputs;

export interface EngineState {
  inputs: EngineInputs;
  outputs: EngineOutputs;
}
