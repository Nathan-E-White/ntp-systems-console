export type VisualizationStatus = 'stub' | 'loading' | 'ready' | 'error';
export type VisualizationMode = 'systems' | 'thermal' | 'flow' | 'review';
export type Vector3Tuple = readonly [x: number, y: number, z: number];

export interface ScenePresentationState {
    readonly mode: VisualizationMode;
    readonly activeCueId: string | null;
    readonly highlightedTargetIds: readonly string[];
    readonly thermalPower: number;
    readonly flowRate: number;
    readonly thermalMargin: number;
    readonly controlDrumAngleDegrees: number;
    readonly shieldingMassFraction: number;
    readonly yawRadians: number;
    readonly reducedMotion: boolean;
    readonly selectedComponentId: string;
    readonly cueProgress: number;
    readonly playbackOwner: 'user' | 'theatre';
    readonly focusIntensity: number;
    readonly cameraPosition: Vector3Tuple;
    readonly activeViewPresetId: string;
    readonly explodedViewProgress: number;
    readonly cameraTransitionOwner: 'user' | 'theatre';
    readonly overlaysVisible: boolean;
    readonly selectedAxialRegionIndex: number | null;
}

export interface VisualizationBoundary {
    readonly scope: string;
    readonly owns: readonly string[];
    readonly excludes: readonly string[];
}
