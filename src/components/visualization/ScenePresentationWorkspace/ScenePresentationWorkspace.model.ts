import {buildSceneViewPresetModel, type SceneViewPresetId} from '../SceneViewPresets/SceneViewPresets.model';
import type {SceneCutawayMode, Vector3Tuple, VisualizationBoundary} from '../visualizationTypes';

export interface SceneCameraPose {
    readonly position: Vector3Tuple;
    readonly target: Vector3Tuple;
}

export interface SceneCameraTransition {
    readonly id: number;
    readonly pose: SceneCameraPose;
    readonly owner: 'user' | 'theatre';
}

export interface ScenePresentationWorkspaceState {
    readonly activePresetId: SceneViewPresetId;
    readonly cutawayMode: SceneCutawayMode;
    readonly explodedViewProgress: number;
    readonly detailsVisible: boolean;
    readonly cameraPose: SceneCameraPose;
    readonly cameraOwner: 'user' | 'theatre';
    readonly transition: SceneCameraTransition;
}

export interface ScenePresentationSnapshot {
    readonly activePresetId: SceneViewPresetId;
    readonly cutawayMode: SceneCutawayMode;
    readonly explodedViewProgress: number;
    readonly detailsVisible: boolean;
    readonly cameraPose: SceneCameraPose;
}

export interface ScenePresentationWorkspaceModel {
    readonly initialState: ScenePresentationWorkspaceState;
    readonly boundary: VisualizationBoundary;
}

export function buildScenePresentationWorkspaceModel(): ScenePresentationWorkspaceModel {
    const presets = buildSceneViewPresetModel();
    const defaultPreset = presets.presets.find((preset) => preset.id === presets.defaultPresetId)
        ?? presets.presets[0];
    const cameraPose = {
        position: defaultPreset.cameraPosition,
        target: defaultPreset.cameraTarget,
    };
    return {
        initialState: {
            activePresetId: defaultPreset.id,
            cutawayMode: 'assembled',
            explodedViewProgress: 0,
            detailsVisible: false,
            cameraPose,
            cameraOwner: 'user',
            transition: {id: 0, pose: cameraPose, owner: 'user'},
        },
        boundary: {
            scope: 'Owns persistent cutaway presentation and captured camera state across app sections.',
            owns: ['view preset', 'camera pose', 'cutaway mode', 'exploded progress', 'detail visibility'],
            excludes: ['engineering inputs', 'calculated outputs', 'fixture evidence', 'investigation selection'],
        },
    };
}
