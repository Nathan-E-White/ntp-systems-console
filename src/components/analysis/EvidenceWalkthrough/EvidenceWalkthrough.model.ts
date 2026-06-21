import type {SceneCutawayMode} from '../../visualization';
import type {SceneComponentId} from '../../visualization/GuidedInvestigation/GuidedInvestigation.model';

export type EvidenceWalkthroughStepId =
    | 'moose-thermal-response'
    | 'rocets-feed-turbomachinery'
    | 'rocets-nozzle-performance'
    | 'rocets-stability';

export interface EvidenceWalkthroughStep {
    readonly id: EvidenceWalkthroughStepId;
    readonly label: string;
    readonly evidenceId: string;
    readonly evidenceViewId: string;
    readonly datasetId: string;
    readonly componentId: SceneComponentId;
    readonly cutawayMode: SceneCutawayMode;
    readonly analysisLinkId: 'thermal-margin' | 'propulsion-stability';
    readonly scenePresetId: 'reactor' | 'flow-path' | 'nozzle' | 'fit-engine';
    readonly tableIds: readonly string[];
    readonly interpretation: string;
}

export interface EvidenceWalkthroughModel {
    readonly steps: readonly EvidenceWalkthroughStep[];
}

export function buildEvidenceWalkthroughModel(): EvidenceWalkthroughModel {
    return {
        steps: [
            step(
                'moose-thermal-response',
                'MOOSE thermal response',
                'moose-output',
                'thermal-margin',
                'moose-thermal-history',
                'thermal-margin',
                'thermal',
                'thermal-margin',
                'reactor',
                ['postprocessor-history', 'final-postprocessor-values', 'coupling-history', 'residual-history', 'materials-history', 'warnings'],
                'Inspect the MOOSE-like temperature history, postprocessor values, coupling proxies, and warnings behind the channel-wall criterion margin.',
            ),
            step(
                'rocets-feed-turbomachinery',
                'RoCETS feed and turbomachinery',
                'rocets-output',
                'feed-system',
                'rocets-feed-history',
                'main-turbopump',
                'flow',
                'propulsion-stability',
                'flow-path',
                ['feed-turbomachinery-history', 'mission-phases', 'solver-residuals', 'advisory-diagnostics', 'warnings'],
                'Follow mass flow, pump pressure rise, shaft speed, turbine power, and advisory diagnostics through the RoCETS-like system history.',
            ),
            step(
                'rocets-nozzle-performance',
                'RoCETS nozzle performance',
                'rocets-output',
                'nozzle-performance',
                'rocets-nozzle-history',
                'nozzle-performance',
                'flow',
                'propulsion-stability',
                'nozzle',
                ['nozzle-performance-history', 'mission-phases', 'output-requests', 'warnings'],
                'Review chamber pressure, nozzle mass flow, specific impulse, and thrust proxy without implying a fresh solver run.',
            ),
            step(
                'rocets-stability',
                'RoCETS stability interval',
                'rocets-output',
                'propulsion-stability',
                'rocets-stability-history',
                'propulsion-stability',
                'evidence',
                'propulsion-stability',
                'flow-path',
                ['transient-log', 'overview-snapshots', 'advisory-diagnostics', 'warnings'],
                'Connect the stability event log and overview snapshots to the selected propulsion stability concern.',
            ),
        ],
    };
}

function step(
    id: EvidenceWalkthroughStepId,
    label: string,
    evidenceId: string,
    evidenceViewId: string,
    datasetId: string,
    componentId: SceneComponentId,
    cutawayMode: SceneCutawayMode,
    analysisLinkId: EvidenceWalkthroughStep['analysisLinkId'],
    scenePresetId: EvidenceWalkthroughStep['scenePresetId'],
    tableIds: readonly string[],
    interpretation: string,
): EvidenceWalkthroughStep {
    return {
        id,
        label,
        evidenceId,
        evidenceViewId,
        datasetId,
        componentId,
        cutawayMode,
        analysisLinkId,
        scenePresetId,
        tableIds,
        interpretation,
    };
}
