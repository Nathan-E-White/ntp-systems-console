import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {EngineInputs} from '../../../types/EngineState';
import type {NumericInputKey} from '../analysisTypes';
import type {ParameterWorkspaceModel} from './ParameterWorkspace.model';

export interface ParameterWorkspaceProps {
    readonly model: ParameterWorkspaceModel;
}

export interface ParameterWorkspaceState {
    readonly draftValues: EngineInputs;
    readonly dirtyKeys: readonly NumericInputKey[];
    readonly lastEditedKey: NumericInputKey | null;
}

export interface ParameterWorkspaceContextValue {
    readonly model: ParameterWorkspaceModel;
    readonly state: ParameterWorkspaceState;
    readonly setDraftValue: (key: NumericInputKey, value: number) => void;
    readonly resetDraft: (values?: EngineInputs) => void;
}

export interface ParameterWorkspaceProviderProps extends ParameterWorkspaceProps {
    readonly children: ReactNode;
}

const ParameterWorkspaceContext = createContext<ParameterWorkspaceContextValue | undefined>(undefined);

/** Boundary: operator edits remain draft intent until an app-level adapter commits them. */
export function ParameterWorkspaceProvider({model, children}: Readonly<ParameterWorkspaceProviderProps>) {
    const [draftValues, setDraftValues] = useState(model.values);
    const [dirtyKeys, setDirtyKeys] = useState<readonly NumericInputKey[]>([]);
    const [lastEditedKey, setLastEditedKey] = useState<NumericInputKey | null>(null);

    const value = useMemo<ParameterWorkspaceContextValue>(() => ({
        model,
        state: {draftValues, dirtyKeys, lastEditedKey},
        setDraftValue: (key, nextValue) => {
            setDraftValues((current) => ({...current, [key]: nextValue}));
            setDirtyKeys((current) => current.includes(key) ? current : [...current, key]);
            setLastEditedKey(key);
        },
        resetDraft: (values = model.values) => {
            setDraftValues(values);
            setDirtyKeys([]);
            setLastEditedKey(null);
        },
    }), [dirtyKeys, draftValues, lastEditedKey, model]);

    return <ParameterWorkspaceContext.Provider value={value}>{children}</ParameterWorkspaceContext.Provider>;
}

export function useParameterWorkspace(): ParameterWorkspaceContextValue {
    const context = useContext(ParameterWorkspaceContext);
    if (!context) throw new Error('useParameterWorkspace must be used inside ParameterWorkspaceProvider.');
    return context;
}

export function ParameterWorkspaceView() {
    const {model, state} = useParameterWorkspace();
    return (
        <section
            aria-label="Operating parameters"
            data-dirty-count={state.dirtyKeys.length}
            data-parameter-count={model.definitions.length}
        />
    );
}

export function ParameterWorkspace(props: Readonly<ParameterWorkspaceProps>) {
    return <ParameterWorkspaceProvider {...props}><ParameterWorkspaceView/></ParameterWorkspaceProvider>;
}
