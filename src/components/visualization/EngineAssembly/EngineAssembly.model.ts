import type {Vector3Tuple, VisualizationBoundary} from '../visualizationTypes';

export interface EngineAssemblyModel {
    readonly id: string;
    readonly origin: Vector3Tuple;
    readonly scale: number;
    readonly childAssemblyIds: readonly string[];
    readonly boundary: VisualizationBoundary;
}

export function buildEngineAssemblyModel(overrides: Partial<EngineAssemblyModel> = {}): EngineAssemblyModel {
    return {
        id: 'engine-assembly',
        origin: [0, 0, 0],
        scale: 1,
        childAssemblyIds: ['feed-system', 'reactor', 'power-conversion', 'nozzle'],
        boundary: {
            scope: 'Positions major representative assemblies using a shared engine coordinate system.',
            owns: ['assembly transforms', 'major-component composition', 'exploded-view offsets'],
            excludes: ['primitive geometry details', 'flow animation', 'case calculations'],
        },
        ...overrides,
    };
}
