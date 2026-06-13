import type {Vector3Tuple, VisualizationBoundary} from '../visualizationTypes';

export type SceneViewPresetId = 'fit-engine' | 'reactor' | 'flow-path' | 'nozzle';

export interface SceneViewPreset {
    readonly id: SceneViewPresetId;
    readonly label: string;
    readonly cameraPosition: Vector3Tuple;
    readonly cameraTarget: Vector3Tuple;
    readonly minimumDistance: number;
    readonly emphasisTargetIds: readonly string[];
}

export interface SceneViewPresetModel {
    readonly presets: readonly SceneViewPreset[];
    readonly defaultPresetId: SceneViewPresetId;
    readonly boundary: VisualizationBoundary;
}

export function buildSceneViewPresetModel(): SceneViewPresetModel {
    return {
        presets: [
            preset('fit-engine', 'Fit Engine', [8.8, 4.4, 12.2], [-0.45, -0.55, 0], 8, ['engine-assembly']),
            preset('reactor', 'Reactor', [6.8, 3.2, 8.8], [0, 0.2, 0], 6, ['reactor-assembly']),
            preset('flow-path', 'Flow Path', [7.7, 3.5, 10.6], [-0.55, -0.45, 0], 7, ['flow-path-overlay']),
            preset('nozzle', 'Nozzle', [6.8, 2.1, 8.6], [0, -2.45, 0], 6, ['nozzle-assembly']),
        ],
        defaultPresetId: 'fit-engine',
        boundary: {
            scope: 'Defines presenter camera compositions without owning engineering or selection state.',
            owns: ['camera positions', 'camera targets', 'minimum framing distance'],
            excludes: ['engineering calculations', 'fixture evidence', 'component selection'],
        },
    };
}

function preset(
    id: SceneViewPresetId,
    label: string,
    cameraPosition: Vector3Tuple,
    cameraTarget: Vector3Tuple,
    minimumDistance: number,
    emphasisTargetIds: readonly string[],
): SceneViewPreset {
    return {id, label, cameraPosition, cameraTarget, minimumDistance, emphasisTargetIds};
}
