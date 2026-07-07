import type {EngineOutputs} from '../../../types/EngineState';
import type {AnalysisBoundary, EngineeringValueSource, NumericOutputKey} from '../analysisTypes';
import type {CalculationNodeId} from '../../../physics/calculationTrace';

export interface OutputDefinition {
    readonly key: NumericOutputKey;
    readonly label: string;
    readonly unit: string;
    readonly source: EngineeringValueSource;
    readonly precision: number;
    readonly rootCalculationNodeId: CalculationNodeId;
}

export interface OutputWorkspaceModel {
    readonly values: EngineOutputs;
    readonly definitions: readonly OutputDefinition[];
    readonly boundary: AnalysisBoundary;
}

export function buildOutputWorkspaceModel(
    values: EngineOutputs,
    overrides: Partial<OutputWorkspaceModel> = {},
): OutputWorkspaceModel {
    return {
        values,
        definitions: [
            {key: 'outletTemperatureK', label: 'Outlet temperature', unit: 'K', source: 'reduced-order', precision: 0, rootCalculationNodeId: 'outlet-temperature'},
            {key: 'exhaustVelocityMPerSec', label: 'Exhaust velocity', unit: 'm/s', source: 'reduced-order', precision: 0, rootCalculationNodeId: 'exhaust-velocity'},
            {key: 'specificImpulseSec', label: 'Specific impulse', unit: 's', source: 'derived', precision: 1, rootCalculationNodeId: 'specific-impulse'},
            {key: 'thrustKn', label: 'Thrust', unit: 'kN', source: 'derived', precision: 1, rootCalculationNodeId: 'thrust'},
            {key: 'peakChannelWallTemperatureK', label: 'Peak channel-wall temperature', unit: 'K', source: 'reduced-order', precision: 0, rootCalculationNodeId: 'fuel-temperature'},
            {key: 'channelWallCriterionMarginK', label: 'Channel wall criterion margin', unit: 'K', source: 'derived', precision: 0, rootCalculationNodeId: 'thermal-margin'},
            {key: 'pressureDropMpa', label: 'Pressure drop', unit: 'MPa', source: 'reduced-order', precision: 2, rootCalculationNodeId: 'pressure-drop'},
            {key: 'basisCompletenessPercent', label: 'Model-basis completeness', unit: '%', source: 'derived', precision: 0, rootCalculationNodeId: 'stability-score'},
        ],
        boundary: {
            scope: 'Exposes reduced-order outputs with source labels and presentation metadata.',
            owns: ['output formatting', 'source classification', 'selected output state'],
            excludes: ['output calculation', 'fixture metric substitution', 'chart implementation'],
        },
        ...overrides,
    };
}
