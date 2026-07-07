import type {VisualizationBoundary, VisualizationMode} from '../visualizationTypes';

export interface EngineVisualizationModel {
    readonly geometryId: string;
    readonly title: string;
    readonly caseLabel: string;
    readonly mode: VisualizationMode;
    readonly boundary: VisualizationBoundary;
}

export function buildEngineVisualizationModel(
    overrides: Partial<EngineVisualizationModel> = {},
): EngineVisualizationModel {
    return {
        geometryId: 'representative-ntp-engine-v1',
        title: 'Representative Nuclear Thermal Propulsion Engine',
        caseLabel: 'Pewee-Inspired Benchmark',
        mode: 'systems',
        boundary: {
            scope: 'Coordinates the visualization subtree and translates app-level case data into scene models.',
            owns: ['visualization composition', 'scene-level status', 'visualization mode'],
            excludes: ['engineering calculations', 'parameter editing', 'review generation'],
        },
        ...overrides,
    };
}
