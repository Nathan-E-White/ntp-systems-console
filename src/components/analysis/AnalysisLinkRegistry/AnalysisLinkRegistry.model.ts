import type {ParserFamily} from '../../../parser/parserTypes';
import type {AnalysisBoundary, NumericInputKey, NumericOutputKey} from '../analysisTypes';

export interface AnalysisLink {
    readonly id: string;
    readonly fixtureFamilies: readonly ParserFamily[];
    readonly inputKeys: readonly NumericInputKey[];
    readonly outputKeys: readonly NumericOutputKey[];
    readonly chartSeriesIds: readonly string[];
    readonly visualizationTargetIds: readonly string[];
    readonly interpretation: string;
}

export interface AnalysisLinkRegistryModel {
    readonly links: readonly AnalysisLink[];
    readonly boundary: AnalysisBoundary;
}

export function buildAnalysisLinkRegistryModel(
    overrides: Partial<AnalysisLinkRegistryModel> = {},
): AnalysisLinkRegistryModel {
    return {
        links: [
            {
                id: 'thermal-margin',
                fixtureFamilies: ['mcnp', 'bison', 'moose'],
                inputKeys: ['thermalPowerMw', 'massFlowKgPerSec', 'fuelTemperatureLimitK'],
                outputKeys: ['peakChannelWallTemperatureK', 'channelWallCriterionMarginK'],
                chartSeriesIds: ['reduced-order-transient'],
                visualizationTargetIds: ['reactor-assembly', 'nozzle-assembly'],
                interpretation: 'Connect power-shape, fuel-performance, and thermomechanical context to the reduced-order margin.',
            },
            {
                id: 'propulsion-stability',
                fixtureFamilies: ['rocets'],
                inputKeys: ['massFlowKgPerSec', 'chamberPressureMpa'],
                outputKeys: ['thrustKn', 'pressureDropMpa', 'basisCompletenessPercent'],
                chartSeriesIds: ['reduced-order-transient'],
                visualizationTargetIds: ['feed-system-assembly', 'power-conversion-assembly', 'flow-path-overlay'],
                interpretation: 'Connect system transient evidence to flow, pressure-drop, thrust, and stability posture.',
            },
        ],
        boundary: {
            scope: 'Declares traceable links among fixtures, inputs, outputs, charts, and visualization targets.',
            owns: ['cross-domain identifiers', 'link descriptions', 'selection propagation contract'],
            excludes: ['numerical coupling', 'solver orchestration', 'component rendering'],
        },
        ...overrides,
    };
}
