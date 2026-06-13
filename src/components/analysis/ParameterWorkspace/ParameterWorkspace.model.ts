import type {EngineInputs} from '../../../types/EngineState';
import type {AnalysisBoundary, EngineeringValueSource, NumericInputKey} from '../analysisTypes';
import type {CalculationNodeId} from '../../../physics/calculationTrace';

export interface ParameterDefinition {
    readonly key: NumericInputKey;
    readonly label: string;
    readonly unit: string;
    readonly minimum: number;
    readonly maximum: number;
    readonly step: number;
    readonly source: EngineeringValueSource;
    readonly dependentCalculationNodeIds: readonly CalculationNodeId[];
}

export interface ParameterWorkspaceModel {
    readonly values: EngineInputs;
    readonly definitions: readonly ParameterDefinition[];
    readonly boundary: AnalysisBoundary;
}

export function buildParameterWorkspaceModel(
    values: EngineInputs,
    overrides: Partial<ParameterWorkspaceModel> = {},
): ParameterWorkspaceModel {
    return {
        values,
        definitions: [
            {key: 'thermalPowerMw', label: 'Thermal power', unit: 'MWth', minimum: 80, maximum: 700, step: 5, source: 'operator', dependentCalculationNodeIds: ['outlet-temperature']},
            {key: 'massFlowKgPerSec', label: 'Hydrogen mass flow', unit: 'kg/s', minimum: 4, maximum: 24, step: 0.1, source: 'operator', dependentCalculationNodeIds: ['outlet-temperature', 'thrust', 'pressure-drop']},
            {key: 'controlDrumAngleDeg', label: 'Control drum angle', unit: 'deg', minimum: 0, maximum: 90, step: 1, source: 'operator', dependentCalculationNodeIds: ['fuel-temperature', 'stability-score']},
            {key: 'fuelTemperatureLimitK', label: 'Historical comparison temperature', unit: 'K', minimum: 2400, maximum: 3300, step: 10, source: 'operator', dependentCalculationNodeIds: []},
            {key: 'channelWallCriterionK', label: 'Channel wall criterion', unit: 'K', minimum: 2200, maximum: 3300, step: 10, source: 'operator', dependentCalculationNodeIds: ['thermal-margin']},
            {key: 'chamberPressureMpa', label: 'Chamber pressure', unit: 'MPa', minimum: 1.5, maximum: 12, step: 0.1, source: 'operator', dependentCalculationNodeIds: ['pressure-drop']},
            {key: 'nozzleExpansionRatio', label: 'Nozzle expansion ratio', unit: ':1', minimum: 20, maximum: 250, step: 1, source: 'operator', dependentCalculationNodeIds: ['exhaust-velocity']},
            {key: 'inletTemperatureK', label: 'Inlet temperature', unit: 'K', minimum: 20, maximum: 300, step: 5, source: 'operator', dependentCalculationNodeIds: ['outlet-temperature']},
            {key: 'shieldingMassFraction', label: 'Shielding mass fraction', unit: '', minimum: 0, maximum: 0.3, step: 0.01, source: 'operator', dependentCalculationNodeIds: []},
            {key: 'thermalCouplingEfficiency', label: 'Thermal coupling efficiency', unit: '', minimum: 0.5, maximum: 1, step: 0.005, source: 'operator', dependentCalculationNodeIds: ['outlet-temperature']},
            {key: 'channelLengthM', label: 'Channel length', unit: 'm', minimum: 0.5, maximum: 2.5, step: 0.01, source: 'operator', dependentCalculationNodeIds: ['fuel-temperature', 'pressure-drop']},
            {key: 'channelHydraulicDiameterM', label: 'Hydraulic diameter', unit: 'm', minimum: 0.001, maximum: 0.01, step: 0.0001, source: 'operator', dependentCalculationNodeIds: ['fuel-temperature', 'pressure-drop']},
            {key: 'channelCount', label: 'Channel count', unit: '', minimum: 500, maximum: 12000, step: 1, source: 'operator', dependentCalculationNodeIds: ['fuel-temperature', 'pressure-drop']},
            {key: 'nozzleEfficiency', label: 'Nozzle performance factor', unit: '', minimum: 0.7, maximum: 1, step: 0.005, source: 'operator', dependentCalculationNodeIds: ['exhaust-velocity', 'thrust']},
            {key: 'ambientPressureKpa', label: 'Ambient pressure', unit: 'kPa', minimum: 0, maximum: 101.325, step: 0.1, source: 'operator', dependentCalculationNodeIds: ['thrust']},
        ],
        boundary: {
            scope: 'Projects editable case parameters and records what-if edit intent.',
            owns: ['parameter metadata', 'draft values', 'edit provenance', 'validation messages'],
            excludes: ['solver evidence mutation', 'output calculation', 'chart rendering'],
        },
        ...overrides,
    };
}
