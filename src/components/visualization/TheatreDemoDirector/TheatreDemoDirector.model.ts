import type {VisualizationBoundary, VisualizationMode} from '../visualizationTypes';
import type {SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';
import type {Vector3Tuple} from '../visualizationTypes';

export interface TheatreCueModel {
    readonly id: string;
    readonly label: string;
    readonly animationDurationSeconds: number;
    readonly mode: VisualizationMode;
    readonly focusComponentId: SceneComponentId;
    readonly cameraPosition: Vector3Tuple;
    readonly cameraTarget: Vector3Tuple;
    readonly explodedViewProgress: number;
    readonly interpretation: {
        readonly baseline: string;
        readonly investigation: string;
        readonly custom: string;
    };
}

export interface TheatreDemoDirectorModel {
    readonly projectId: string;
    readonly sheetId: string;
    readonly cues: readonly TheatreCueModel[];
    readonly boundary: VisualizationBoundary;
}

export function buildTheatreDemoDirectorModel(
    overrides: Partial<TheatreDemoDirectorModel> = {},
): TheatreDemoDirectorModel {
    return {
        projectId: 'ntp-demo-presentation',
        sheetId: 'engine-walkthrough',
        cues: [
            cue('establish-basis', 'Establish benchmark and source basis', 1.8, 'systems', 'engine-overview', [8.8, 4.4, 12.2], [-0.45, -0.55, 0], 0.12,
                'Start from published Pewee-scale benchmarks, cited thermochemistry, and user-visible representative channel geometry.',
                'Start from the same controlled benchmark, then identify the visible power, flow, geometry, and criterion changes.',
                'Establish the analyst-defined point and its active overrides; bundled solver fixtures have not been rerun.'),
            cue('follow-flow', 'Follow power deposition and enthalpy rise', 2.2, 'flow', 'feed-system', [7.7, 3.5, 10.6], [-0.55, -0.45, 0], 0,
                'Follow hydrogen through the representative flow path while the enthalpy balance closes the 2550 K benchmark target.',
                'Follow the reduced flow that raises bulk and channel-wall temperatures for the selected deposited power.',
                'Follow the current calculated flow path while retaining the original benchmark and fixture provenance.'),
            cue('inspect-channel', 'Inspect peak wall temperature and pressure loss', 2.2, 'thermal', 'thermal-margin', [6.8, 3.2, 8.8], [0, 0.2, 0], 0.22,
                'Select the limiting axial station and review its positive wall-criterion margin and channel-only pressure drop.',
                'Select the limiting axial station where the wall criterion is exceeded and the thermal concern controls review.',
                'Inspect the current limiting station without implying a new coupled thermal, neutronics, or engine-system solve.'),
            cue('correlate-evidence', 'Correlate immutable fixture evidence', 2.0, 'thermal', 'fuel-performance', [7.2, 3.4, 9.5], [-0.1, 0.05, 0], 0.12,
                'Compare axial partition, BISON fuel-performance records, synthetic thermal constraints, and engine-system channels as separate evidence questions.',
                'Use the unchanged fixtures to identify the MCNP-, BISON-, MOOSE-, and ROCETS-like records needed to investigate the limit.',
                'Keep calculated what-if results and immutable fixture records in separate columns and claim boundaries.'),
            cue('review', 'Return to review flags and follow-up', 1.8, 'review', 'engine-overview', [8.8, 4.4, 12.2], [-0.45, -0.55, 0], 0,
                'Conclude with the remaining property, pressure-basis, and transient-model flags rather than an unsupported nominal claim.',
                'Conclude with the exceeded wall criterion, incomplete whole-engine pressure basis, and discipline-specific follow-up.',
                'Return to review with calculated what-if flags, active overrides, and unchanged fixture provenance shown separately.'),
        ],
        boundary: {
            scope: 'Coordinates presentation timing and normalized visual cues through Theatre Core.',
            owns: ['cue playback', 'camera targets', 'visual emphasis timing'],
            excludes: ['engineering state mutation', 'parameter editing', 'solver execution'],
        },
        ...overrides,
    };
}

function cue(
    id: string,
    label: string,
    animationDurationSeconds: number,
    mode: VisualizationMode,
    focusComponentId: SceneComponentId,
    cameraPosition: Vector3Tuple,
    cameraTarget: Vector3Tuple,
    explodedViewProgress: number,
    baseline: string,
    investigation: string,
    custom: string,
): TheatreCueModel {
    return {
        id,
        label,
        animationDurationSeconds,
        mode,
        focusComponentId,
        cameraPosition,
        cameraTarget,
        explodedViewProgress,
        interpretation: {baseline, investigation, custom},
    };
}
