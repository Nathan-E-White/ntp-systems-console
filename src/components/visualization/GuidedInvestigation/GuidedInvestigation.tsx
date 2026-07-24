import {createContext, type ReactNode, useCallback, useContext, useMemo} from 'react';

import {
    buildGuidedInvestigationModel,
    type GuidedInvestigationModel,
    type SceneComponentId,
    type SceneSelectionState,
} from './GuidedInvestigation.model';
import {useActiveCase} from '../../activeCase';

export interface GuidedInvestigationContextValue {
    readonly model: GuidedInvestigationModel;
    readonly state: SceneSelectionState;
    readonly selectComponent: (componentId: SceneComponentId, owner?: SceneSelectionState['owner']) => void;
    readonly restoreSelection: (selection: SceneSelectionState) => void;
}

const GuidedInvestigationContext = createContext<GuidedInvestigationContextValue | undefined>(undefined);

export function GuidedInvestigationProvider({children}: Readonly<{children: ReactNode}>) {
    const {openEvidence, state: activeCaseState} = useActiveCase();
    const model = useMemo(buildGuidedInvestigationModel, []);
    const state = {
        selectedComponentId: activeCaseState.evidenceFocus,
        owner: activeCaseState.evidenceOwner === 'guided' ? 'theatre' : 'user',
    } as const;
    const selectComponent = useCallback((selectedComponentId: SceneComponentId, owner: SceneSelectionState['owner'] = 'user') => {
        openEvidence(selectedComponentId, owner === 'theatre' ? 'guided' : 'manual');
    }, [openEvidence]);
    const restoreSelection = useCallback((selection: SceneSelectionState) => {
        openEvidence(selection.selectedComponentId, selection.owner === 'theatre' ? 'guided' : 'manual');
    }, [openEvidence]);
    const value = useMemo<GuidedInvestigationContextValue>(() => ({
        model,
        state,
        selectComponent,
        restoreSelection,
    }), [model, restoreSelection, selectComponent, state]);

    return <GuidedInvestigationContext.Provider value={value}>{children}</GuidedInvestigationContext.Provider>;
}

export function useGuidedInvestigation(): GuidedInvestigationContextValue {
    const context = useContext(GuidedInvestigationContext);
    if (!context) throw new Error('useGuidedInvestigation must be used inside GuidedInvestigationProvider.');
    return context;
}
