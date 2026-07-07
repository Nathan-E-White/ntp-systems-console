import type {VisualizationBoundary} from '../visualizationTypes';

export interface PowerConversionAssemblyModel {
    readonly id: string;
    readonly branchIds: readonly string[];
    readonly turbineId: string;
    readonly mixerId: string;
    readonly boundary: VisualizationBoundary;
}

export function buildPowerConversionAssemblyModel(
    overrides: Partial<PowerConversionAssemblyModel> = {},
): PowerConversionAssemblyModel {
    return {
        id: 'power-conversion-assembly',
        branchIds: ['primary-chamber-branch', 'secondary-turbine-branch'],
        turbineId: 'drive-turbine',
        mixerId: 'turbine-exhaust-mixer',
        boundary: {
            scope: 'Represents the hot-gas turbine tap, drive turbine, bypass, and exhaust mixer.',
            owns: ['branch geometry', 'turbine representation', 'mixer representation'],
            excludes: ['shaft-power balance', 'turbine efficiency calculation', 'control logic'],
        },
        ...overrides,
    };
}
