import type {Vector3Tuple, VisualizationBoundary} from '../visualizationTypes';

export interface SceneCanvasModel {
    readonly cameraPosition: Vector3Tuple;
    readonly fieldOfViewDegrees: number;
    readonly background: string;
    readonly boundary: VisualizationBoundary;
}

export function buildSceneCanvasModel(overrides: Partial<SceneCanvasModel> = {}): SceneCanvasModel {
    return {
        cameraPosition: [8.8, 4.4, 12.2],
        fieldOfViewDegrees: 38,
        background: '#111820',
        boundary: {
            scope: 'Owns Canvas creation, camera defaults, lighting defaults, and WebGL failure fallback.',
            owns: ['WebGL lifecycle', 'camera', 'lighting', 'render fallback'],
            excludes: ['engine geometry', 'engineering state', 'panel controls'],
        },
        ...overrides,
    };
}
