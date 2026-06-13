import type {VisualizationBoundary} from '../visualizationTypes';

export interface ReactorAssemblyModel {
    readonly id: string;
    readonly activeCoreRadiusM: number;
    readonly activeCoreLengthM: number;
    readonly axialRegionCount: number;
    readonly azimuthalSectorCount: number;
    readonly controlDrumCount: number;
    readonly boundary: VisualizationBoundary;
}

export function buildReactorAssemblyModel(overrides: Partial<ReactorAssemblyModel> = {}): ReactorAssemblyModel {
    return {
        id: 'reactor-assembly',
        activeCoreRadiusM: 0.46,
        activeCoreLengthM: 1.2,
        axialRegionCount: 3,
        azimuthalSectorCount: 6,
        controlDrumCount: 12,
        boundary: {
            scope: 'Approximates the fixture core, reflector, drum band, poison bank, vessel, and shield regions.',
            owns: ['reactor geometry', 'control-drum transforms', 'core-region highlighting'],
            excludes: ['criticality solution', 'material validation', 'thermal-mechanical calculation'],
        },
        ...overrides,
    };
}
