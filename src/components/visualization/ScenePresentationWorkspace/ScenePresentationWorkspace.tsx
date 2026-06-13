import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';

import {buildSceneViewPresetModel, type SceneViewPresetId} from '../SceneViewPresets/SceneViewPresets.model';
import type {
    SceneCameraPose,
    ScenePresentationSnapshot,
    ScenePresentationWorkspaceModel,
    ScenePresentationWorkspaceState,
} from './ScenePresentationWorkspace.model';

export interface ScenePresentationContextValue {
    readonly model: ScenePresentationWorkspaceModel;
    readonly state: ScenePresentationWorkspaceState;
    readonly selectPreset: (presetId: SceneViewPresetId) => void;
    readonly setExploded: (exploded: boolean) => void;
    readonly setDetailsVisible: (visible: boolean) => void;
    readonly captureManualPose: (pose: SceneCameraPose) => void;
    readonly completeTransition: (pose: SceneCameraPose) => void;
    readonly requestTheatrePose: (pose: SceneCameraPose, explodedViewProgress: number) => void;
    readonly saveTourSnapshot: () => void;
    readonly restoreTourSnapshot: () => void;
    readonly resetPresentation: () => void;
}

const ScenePresentationContext = createContext<ScenePresentationContextValue | undefined>(undefined);
const presetModel = buildSceneViewPresetModel();

export function ScenePresentationProvider({
    model,
    children,
}: Readonly<{model: ScenePresentationWorkspaceModel; children: ReactNode}>) {
    const [state, setState] = useState(model.initialState);
    const savedSnapshot = useRef<ScenePresentationSnapshot | null>(null);

    const requestPose = useCallback((
        pose: SceneCameraPose,
        owner: ScenePresentationWorkspaceState['cameraOwner'],
        updates: Partial<ScenePresentationWorkspaceState> = {},
    ) => {
        setState((current) => ({
            ...current,
            ...updates,
            cameraOwner: owner,
            transition: {
                id: current.transition.id + 1,
                pose,
                owner,
            },
        }));
    }, []);
    const selectPreset = useCallback((presetId: SceneViewPresetId) => {
        const preset = presetModel.presets.find((candidate) => candidate.id === presetId);
        if (!preset) return;
        requestPose(
            {position: preset.cameraPosition, target: preset.cameraTarget},
            'user',
            {activePresetId: presetId},
        );
    }, [requestPose]);
    const setExploded = useCallback((exploded: boolean) => {
        setState((current) => ({...current, explodedViewProgress: exploded ? 1 : 0}));
    }, []);
    const setDetailsVisible = useCallback((detailsVisible: boolean) => {
        setState((current) => ({...current, detailsVisible}));
    }, []);
    const captureManualPose = useCallback((cameraPose: SceneCameraPose) => {
        setState((current) => current.cameraOwner === 'theatre'
            ? current
            : {...current, cameraPose, cameraOwner: 'user'});
    }, []);
    const completeTransition = useCallback((cameraPose: SceneCameraPose) => {
        setState((current) => ({...current, cameraPose}));
    }, []);
    const requestTheatrePose = useCallback((pose: SceneCameraPose, explodedViewProgress: number) => {
        requestPose(pose, 'theatre', {explodedViewProgress});
    }, [requestPose]);
    const saveTourSnapshot = useCallback(() => {
        setState((current) => {
            if (!savedSnapshot.current) {
                savedSnapshot.current = {
                    activePresetId: current.activePresetId,
                    explodedViewProgress: current.explodedViewProgress,
                    detailsVisible: current.detailsVisible,
                    cameraPose: current.cameraPose,
                };
            }
            return current;
        });
    }, []);
    const restoreTourSnapshot = useCallback(() => {
        const snapshot = savedSnapshot.current;
        if (!snapshot) return;
        savedSnapshot.current = null;
        requestPose(snapshot.cameraPose, 'user', {
            activePresetId: snapshot.activePresetId,
            explodedViewProgress: snapshot.explodedViewProgress,
            detailsVisible: snapshot.detailsVisible,
        });
    }, [requestPose]);
    const resetPresentation = useCallback(() => {
        savedSnapshot.current = null;
        setState((current) => ({
            ...model.initialState,
            transition: {
                ...model.initialState.transition,
                id: current.transition.id + 1,
            },
        }));
    }, [model.initialState]);
    const value = useMemo<ScenePresentationContextValue>(() => ({
        model,
        state,
        selectPreset,
        setExploded,
        setDetailsVisible,
        captureManualPose,
        completeTransition,
        requestTheatrePose,
        saveTourSnapshot,
        restoreTourSnapshot,
        resetPresentation,
    }), [
        captureManualPose,
        completeTransition,
        model,
        requestTheatrePose,
        resetPresentation,
        restoreTourSnapshot,
        saveTourSnapshot,
        selectPreset,
        setDetailsVisible,
        setExploded,
        state,
    ]);

    return <ScenePresentationContext.Provider value={value}>{children}</ScenePresentationContext.Provider>;
}

export function useScenePresentation(): ScenePresentationContextValue {
    const context = useContext(ScenePresentationContext);
    if (!context) throw new Error('useScenePresentation must be used inside ScenePresentationProvider.');
    return context;
}
