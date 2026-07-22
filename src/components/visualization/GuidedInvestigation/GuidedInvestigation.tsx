import {createContext, type ReactNode, useCallback, useContext, useMemo, useState} from 'react';

import {
    buildGuidedInvestigationModel,
    type GuidedInvestigationModel,
    type SceneComponentId,
    type SceneSelectionState,
} from './GuidedInvestigation.model';
import {useOptionalActiveCase} from '../../activeCase';

export interface GuidedInvestigationContextValue {
    readonly model: GuidedInvestigationModel;
    readonly state: SceneSelectionState;
    readonly selectComponent: (componentId: SceneComponentId, owner?: SceneSelectionState['owner']) => void;
    readonly restoreSelection: (selection: SceneSelectionState) => void;
    readonly resetSelection: () => void;
}

const GuidedInvestigationContext = createContext<GuidedInvestigationContextValue | undefined>(undefined);

export function GuidedInvestigationProvider({children}: Readonly<{children: ReactNode}>) {
    const activeCase = useOptionalActiveCase();
    const model = useMemo(buildGuidedInvestigationModel, []);
    const [localState, setState] = useState<SceneSelectionState>({
        selectedComponentId: 'engine-overview',
        owner: 'user',
    });
    const state = activeCase
        ? {selectedComponentId: activeCase.state.evidenceFocus, owner: activeCase.state.sceneOwner === 'guided' ? 'theatre' : 'user'} as const
        : localState;
    const selectComponent = useCallback((selectedComponentId: SceneComponentId, owner: SceneSelectionState['owner'] = 'user') => {
        if (activeCase) activeCase.openEvidence(selectedComponentId, owner === 'theatre' ? 'guided' : 'manual');
        else setState({selectedComponentId, owner});
    }, [activeCase]);
    const restoreSelection = useCallback((selection: SceneSelectionState) => {
        if (activeCase) activeCase.openEvidence(selection.selectedComponentId, selection.owner === 'theatre' ? 'guided' : 'manual');
        else setState(selection);
    }, [activeCase]);
    const resetSelection = useCallback(
        () => activeCase ? activeCase.reset() : setState({selectedComponentId: 'engine-overview', owner: 'user'}),
        [activeCase],
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
