import type {NumericInputKey, NumericOutputKey} from '../../analysis';
import type {ParserFamily} from '../../../parser/parserTypes';
import type {Vector3Tuple, VisualizationBoundary} from '../visualizationTypes';

export type SceneComponentId =
    | 'engine-overview'
    | 'reactor-transport'
    | 'reactor-criticality'
    | 'fuel-performance'
    | 'thermal-margin'
    | 'feed-system'
    | 'main-turbopump'
    | 'power-conversion'
    | 'nozzle-performance'
    | 'propulsion-stability';

export interface SceneComponentDescriptor {
    readonly id: SceneComponentId;
    readonly label: string;
    readonly discipline: string;
    readonly targetIds: readonly string[];
    readonly analysisLinkId: 'thermal-margin' | 'propulsion-stability' | null;
    readonly evidenceViewId: string;
    readonly fixtureFamilies: readonly ParserFamily[];
    readonly fixtureIds: readonly string[];
    readonly inputKeys: readonly NumericInputKey[];
    readonly outputKeys: readonly NumericOutputKey[];
    readonly anchor: Vector3Tuple;
    readonly claimBoundary: string;
}

export interface SceneSelectionState {
    readonly selectedComponentId: SceneComponentId;
    readonly owner: 'user' | 'theatre';
}

export interface GuidedInvestigationModel {
    readonly components: readonly SceneComponentDescriptor[];
    readonly boundary: VisualizationBoundary;
}

export function buildGuidedInvestigationModel(): GuidedInvestigationModel {
    return {
        components: [
            descriptor('engine-overview', 'Integrated engine posture', 'Systems', ['engine-assembly'], null, 'reactor-transport', ['mcnp', 'bison', 'moose', 'rocets'], ['mcnp-output', 'mcnp-criticality-output', 'bison-output', 'moose-output', 'rocets-output'], ['thermalPowerMw', 'massFlowKgPerSec'], ['channelWallCriterionMarginK', 'thrustKn'], [0, 2.6, 0]),
            descriptor('reactor-transport', 'Reactor transport', 'Neutronics', ['reactor-assembly'], 'thermal-margin', 'reactor-transport', ['mcnp'], ['mcnp-output'], ['thermalPowerMw'], ['channelWallCriterionMarginK'], [-0.9, 0.45, 0.9]),
            descriptor('reactor-criticality', 'Criticality and restart memory', 'Reactor physics', ['reactor-assembly'], 'thermal-margin', 'reactor-criticality', ['mcnp'], ['mcnp-criticality-output'], ['controlDrumAngleDeg'], ['channelWallCriterionMarginK'], [0.85, 0.9, 0.8]),
            descriptor('fuel-performance', 'Fuel performance', 'Fuel materials', ['reactor-assembly'], 'thermal-margin', 'bison-fuel-performance', ['bison', 'mcnp', 'moose'], ['bison-output', 'mcnp-criticality-output', 'moose-output'], ['thermalPowerMw', 'massFlowKgPerSec', 'fuelTemperatureLimitK'], ['peakChannelWallTemperatureK', 'channelWallCriterionMarginK'], [0.2, 0.55, 1.18]),
            descriptor('thermal-margin', 'Channel wall criterion margin', 'Thermal hydraulics', ['reactor-assembly', 'nozzle-assembly'], 'thermal-margin', 'thermal-margin', ['moose'], ['moose-output'], ['thermalPowerMw', 'massFlowKgPerSec', 'channelWallCriterionK'], ['peakChannelWallTemperatureK', 'channelWallCriterionMarginK'], [0.9, 0.05, 0.9]),
            descriptor('feed-system', 'Hydrogen feed path', 'Propulsion', ['feed-system-assembly', 'flow-path-overlay'], 'propulsion-stability', 'feed-system', ['rocets'], ['rocets-output'], ['massFlowKgPerSec'], ['pressureDropMpa'], [-2.15, 0.95, 0.65]),
            descriptor('main-turbopump', 'Main turbopump', 'Turbomachinery', ['feed-system-assembly', 'flow-path-overlay'], 'propulsion-stability', 'feed-system', ['rocets'], ['rocets-output'], ['massFlowKgPerSec'], ['pressureDropMpa'], [-1.65, 0.7, 0.75]),
            descriptor('power-conversion', 'Turbine power branch', 'Turbomachinery', ['power-conversion-assembly', 'flow-path-overlay'], 'propulsion-stability', 'feed-system', ['rocets'], ['rocets-output'], ['massFlowKgPerSec', 'chamberPressureMpa'], ['thrustKn', 'basisCompletenessPercent'], [1.65, -0.55, 0.7]),
            descriptor('nozzle-performance', 'Nozzle performance', 'Propulsion', ['nozzle-assembly'], 'propulsion-stability', 'nozzle-performance', ['rocets'], ['rocets-output'], ['chamberPressureMpa', 'nozzleExpansionRatio'], ['thrustKn', 'pressureDropMpa'], [0.85, -2.55, 0.7]),
            descriptor('propulsion-stability', 'Flow stability', 'Engine systems', ['feed-system-assembly', 'power-conversion-assembly', 'flow-path-overlay'], 'propulsion-stability', 'propulsion-stability', ['rocets', 'moose'], ['rocets-output', 'moose-output'], ['massFlowKgPerSec', 'chamberPressureMpa'], ['pressureDropMpa', 'basisCompletenessPercent'], [-0.35, -0.75, 1.15]),
        ],
        boundary: {
            scope: 'Maps component selection to analysis links and immutable evidence views.',
            owns: ['component identity', 'selection ownership', 'evidence-view routing'],
            excludes: ['engineering calculations', 'fixture mutation', 'section navigation'],
        },
    };
}

function descriptor(
    id: SceneComponentId,
    label: string,
    discipline: string,
    targetIds: readonly string[],
    analysisLinkId: SceneComponentDescriptor['analysisLinkId'],
    evidenceViewId: string,
    fixtureFamilies: readonly ParserFamily[],
    fixtureIds: readonly string[],
    inputKeys: readonly NumericInputKey[],
    outputKeys: readonly NumericOutputKey[],
    anchor: Vector3Tuple,
): SceneComponentDescriptor {
    return {
        id,
        label,
        discipline,
        targetIds,
        analysisLinkId,
        evidenceViewId,
        fixtureFamilies,
        fixtureIds,
        inputKeys,
        outputKeys,
        anchor,
        claimBoundary: 'Synthetic evidence and representative geometry; not validated design analysis.',
    };
}
