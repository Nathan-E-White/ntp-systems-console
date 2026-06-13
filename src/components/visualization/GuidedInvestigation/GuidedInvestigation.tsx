import {createContext, type ReactNode, useCallback, useContext, useMemo, useState} from 'react';

import {
    buildGuidedInvestigationModel,
    type GuidedInvestigationModel,
    type SceneComponentId,
    type SceneSelectionState,
} from './GuidedInvestigation.model';

export interface GuidedInvestigationContextValue {
    readonly model: GuidedInvestigationModel;
    readonly state: SceneSelectionState;
    readonly selectComponent: (componentId: SceneComponentId, owner?: SceneSelectionState['owner']) => void;
    readonly restoreSelection: (selection: SceneSelectionState) => void;
    readonly resetSelection: () => void;
}

const GuidedInvestigationContext = createContext<GuidedInvestigationContextValue | undefined>(undefined);

export function GuidedInvestigationProvider({children}: Readonly<{children: ReactNode}>) {
    const model = useMemo(buildGuidedInvestigationModel, []);
    const [state, setState] = useState<SceneSelectionState>({
        selectedComponentId: 'engine-overview',
        owner: 'user',
    });
    const selectComponent = useCallback(
        (selectedComponentId: SceneComponentId, owner: SceneSelectionState['owner'] = 'user') =>
            setState({selectedComponentId, owner}),
        [],
    );
    const restoreSelection = useCallback((selection: SceneSelectionState) => setState(selection), []);
    const resetSelection = useCallback(
        () => setState({selectedComponentId: 'engine-overview', owner: 'user'}),
        [],
    );
    const value = useMemo<GuidedInvestigationContextValue>(() => ({
        model,
        state,
        selectComponent,
        restoreSelection,
        resetSelection,
    }), [model, resetSelection, restoreSelection, selectComponent, state]);

    return <GuidedInvestigationContext.Provider value={value}>{children}</GuidedInvestigationContext.Provider>;
}

export function useGuidedInvestigation(): GuidedInvestigationContextValue {
    const context = useContext(GuidedInvestigationContext);
    if (!context) throw new Error('useGuidedInvestigation must be used inside GuidedInvestigationProvider.');
    return context;
}
