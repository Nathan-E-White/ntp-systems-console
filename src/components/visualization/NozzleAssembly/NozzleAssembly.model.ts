import type {VisualizationBoundary} from '../visualizationTypes';

export interface NozzleAssemblyModel {
    readonly id: string;
    readonly throatRadiusM: number;
    readonly exitRadiusM: number;
    readonly chamberRadiusM: number;
    readonly includesRegenJacket: boolean;
    readonly boundary: VisualizationBoundary;
}

export function buildNozzleAssemblyModel(overrides: Partial<NozzleAssemblyModel> = {}): NozzleAssemblyModel {
    return {
        id: 'nozzle-assembly',
        throatRadiusM: 0.2,
        exitRadiusM: 0.72,
        chamberRadiusM: 0.4,
        includesRegenJacket: true,
        boundary: {
            scope: 'Approximates chamber, throat, divergent bell, wall, and regenerative-jacket envelopes.',
            owns: ['nozzle geometry', 'thermal glow', 'plume attachment point'],
            excludes: ['contour optimization', 'CFD', 'validated wall-temperature prediction'],
        },
        ...overrides,
    };
}
