import type {Vector3Tuple, VisualizationBoundary} from '../visualizationTypes';

export type CalloutProvenance = 'mcnp-fixture' | 'moose-fixture' | 'rocets-fixture' | 'reduced-order';

export interface SceneCalloutModel {
    readonly id: string;
    readonly label: string;
    readonly anchor: Vector3Tuple;
    readonly provenance: CalloutProvenance;
    readonly discipline: string;
    readonly metric: string;
    readonly targetIds: readonly string[];
}

export interface SceneCalloutOverlayModel {
    readonly callouts: readonly SceneCalloutModel[];
    readonly boundary: VisualizationBoundary;
}

export function buildSceneCalloutOverlayModel(
    overrides: Partial<SceneCalloutOverlayModel> = {},
): SceneCalloutOverlayModel {
    return {
        callouts: [
            {
                id: 'core',
                label: 'Active core: 3 axial x 6 sector fixture regions',
                anchor: [0, 0, 0],
                provenance: 'mcnp-fixture',
                discipline: 'Neutronics',
                metric: 'Power-shape context',
                targetIds: ['reactor-assembly'],
            },
            {
                id: 'regen',
                label: 'Regenerative heat-pickup path',
                anchor: [1, -1.2, 0],
                provenance: 'rocets-fixture',
                discipline: 'Propulsion',
                metric: 'Hydrogen flow and pressure-drop path',
                targetIds: ['nozzle-assembly', 'flow-path-overlay'],
            },
            {
                id: 'fuel-margin',
                label: 'Channel wall criterion margin',
                anchor: [0.4, 0.2, 0],
                provenance: 'moose-fixture',
                discipline: 'Thermomechanics',
                metric: 'Wall criterion margin',
                targetIds: ['reactor-assembly', 'nozzle-assembly'],
            },
        ],
        boundary: {
            scope: 'Projects traceability labels and provenance from scene anchors into the DOM overlay.',
            owns: ['callout placement', 'selection text', 'provenance labels'],
            excludes: ['metric calculation', 'source parsing', 'review conclusions'],
        },
        ...overrides,
    };
}
