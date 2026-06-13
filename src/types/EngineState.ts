export type MissionMode = 'startup' | 'steadyBurn' | 'shutdown' | 'cooldown';
export type ThermalCouplingMode = 'benchmarkClosure' | 'fixedEfficiency';
export type EngineModelProfileId = 'peweeInspired' | 'thermalInvestigation' | 'legacyDemo';

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

/**
 * Temporary compatibility aliases for legacy components and regression fixtures.
 * New application surfaces must use the reference-controlled names above.
 */
export interface LegacyEngineOutputAliases {
  fuelTemperatureK: number;
  thermalMarginK: number;
  stabilityScore: number;
  stabilityStatus: 'nominal' | 'watch' | 'limit';
}

export type EngineOutputs = ReferenceControlledEngineOutputs & LegacyEngineOutputAliases;

export function withLegacyEngineOutputAliases(
  outputs: ReferenceControlledEngineOutputs,
): EngineOutputs {
  return {
    ...outputs,
    fuelTemperatureK: outputs.peakChannelWallTemperatureK,
    thermalMarginK: outputs.channelWallCriterionMarginK,
    stabilityScore: outputs.basisCompletenessPercent,
    stabilityStatus: outputs.reviewPosture,
  };
}

export interface EngineState {
  inputs: EngineInputs;
  outputs: EngineOutputs;
}
