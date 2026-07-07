import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {NumericOutputKey} from '../analysisTypes';
import type {OutputWorkspaceModel} from './OutputWorkspace.model';

export interface OutputWorkspaceProps {
    readonly model: OutputWorkspaceModel;
    readonly initialSelectedOutputKey?: NumericOutputKey | null;
}

export interface OutputWorkspaceState {
    readonly selectedOutputKey: NumericOutputKey | null;
}

export interface OutputWorkspaceContextValue {
    readonly model: OutputWorkspaceModel;
    readonly state: OutputWorkspaceState;
    readonly selectOutput: (key: NumericOutputKey | null) => void;
}

export interface OutputWorkspaceProviderProps extends OutputWorkspaceProps {
    readonly children: ReactNode;
}

const OutputWorkspaceContext = createContext<OutputWorkspaceContextValue | undefined>(undefined);

/** Boundary: calculated values enter read-only; display selection never reruns or mutates a model. */
export function OutputWorkspaceProvider({
    model,
    initialSelectedOutputKey = null,
    children,
}: Readonly<OutputWorkspaceProviderProps>) {
    const [selectedOutputKey, selectOutput] = useState<NumericOutputKey | null>(initialSelectedOutputKey);
    const value = useMemo(() => ({
        model,
        state: {selectedOutputKey},
        selectOutput,
    }), [model, selectedOutputKey]);
    return <OutputWorkspaceContext.Provider value={value}>{children}</OutputWorkspaceContext.Provider>;
}

export function useOutputWorkspace(): OutputWorkspaceContextValue {
    const context = useContext(OutputWorkspaceContext);
    if (!context) throw new Error('useOutputWorkspace must be used inside OutputWorkspaceProvider.');
    return context;
}

export function OutputWorkspaceView() {
    const {model, state} = useOutputWorkspace();
    return (
        <section
            aria-label="Calculated outputs"
            data-output-count={model.definitions.length}
            data-selected-output={state.selectedOutputKey ?? 'none'}
        />
    );
}

export function OutputWorkspace(props: Readonly<OutputWorkspaceProps>) {
    return <OutputWorkspaceProvider {...props}><OutputWorkspaceView/></OutputWorkspaceProvider>;
}
