import type {SceneCutawayMode} from '../../visualization';
import type {SceneComponentId} from '../../visualization/GuidedInvestigation/GuidedInvestigation.model';

export type EvidenceWalkthroughStepId =
    | 'mcnp-burnup-restart'
    | 'bison-fuel-performance'
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
                'mcnp-burnup-restart',
                'MCNP burnup and restart memory',
                'mcnp-criticality-output',
                'reactor-criticality',
                'mcnp-criticality-burnup',
                'reactor-criticality',
                'evidence',
                'thermal-margin',
                'reactor',
                ['tallies', 'warnings', 'derived-quantities'],
                'Start with the MCNP-like criticality and burnup fixture: k-effective trend, xenon worth, and decay heat are parser evidence only.',
            ),
            step(
                'bison-fuel-performance',
                'BISON fuel performance',
                'bison-output',
                'bison-fuel-performance',
                'bison-fuel-performance-history',
                'fuel-performance',
                'thermal',
                'thermal-margin',
                'reactor',
                ['postprocessor-history', 'final-review-summary', 'axial-temperature-profile', 'vector-profile-summary'],
                'Inspect BISON-like fuel temperature, coating, hydrogen attack, burnup, damage, and restart-memory records for fuel-performance discussion.',
            ),
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
                'Inspect MOOSE-like temperature history, postprocessor values, coupling proxies, and warnings as thermal context for fuel-performance review.',
            ),
            step(
                'rocets-stability',
                'ROCETS stability support',
                'rocets-output',
                'propulsion-stability',
                'rocets-stability-history',
                'propulsion-stability',
                'evidence',
                'propulsion-stability',
                'flow-path',
                ['transient-log', 'overview-snapshots', 'advisory-diagnostics', 'warnings'],
                'Use ROCETS-like stability and boundary-condition history as supporting context, not as the leading fuel-performance claim.',
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
