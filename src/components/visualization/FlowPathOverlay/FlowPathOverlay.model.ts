import type {VisualizationBoundary, Vector3Tuple} from '../visualizationTypes';

export type FlowPathTemperatureClass = 'cryogenic' | 'warming' | 'hot';

export interface FlowPathNodeModel {
    readonly id: string;
    readonly position: Vector3Tuple;
}

export interface FlowPathSegmentModel {
    readonly id: string;
    readonly fromNodeId: string;
    readonly toNodeId: string;
    readonly temperatureClass: FlowPathTemperatureClass;
}

export interface FlowPathOverlayModel {
    readonly nodes: readonly FlowPathNodeModel[];
    readonly segments: readonly FlowPathSegmentModel[];
    readonly boundary: VisualizationBoundary;
}

export function buildFlowPathOverlayModel(overrides: Partial<FlowPathOverlayModel> = {}): FlowPathOverlayModel {
    return {
        nodes: [
            {id: 'tank', position: [-3, 1.4, 0]},
            {id: 'pump', position: [-2, 0.8, 0]},
            {id: 'regen', position: [1, -1.3, 0]},
            {id: 'core-inlet', position: [0, 1.1, 0]},
            {id: 'core-exit', position: [0, -0.8, 0]},
            {id: 'chamber', position: [0, -2.1, 0]},
        ],
        segments: [
            {id: 'tank-to-pump', fromNodeId: 'tank', toNodeId: 'pump', temperatureClass: 'cryogenic'},
            {id: 'pump-to-regen', fromNodeId: 'pump', toNodeId: 'regen', temperatureClass: 'cryogenic'},
            {id: 'regen-to-core', fromNodeId: 'regen', toNodeId: 'core-inlet', temperatureClass: 'warming'},
            {id: 'core-heating', fromNodeId: 'core-inlet', toNodeId: 'core-exit', temperatureClass: 'hot'},
            {id: 'core-to-chamber', fromNodeId: 'core-exit', toNodeId: 'chamber', temperatureClass: 'hot'},
        ],
        boundary: {
            scope: 'Animates the declared propellant topology and temperature class along fixture-mapped paths.',
            owns: ['path curves', 'particle motion', 'flow color classification'],
            excludes: ['mass conservation', 'pressure solution', 'fluid-property calculation'],
        },
        ...overrides,
    };
}
