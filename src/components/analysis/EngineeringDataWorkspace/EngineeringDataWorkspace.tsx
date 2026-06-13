import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {EngineeringDataWorkspaceModel} from './EngineeringDataWorkspace.model';

export type EngineeringDataWorkspaceStatus = 'stub' | 'ready' | 'error';

export interface EngineeringDataWorkspaceProps {
    readonly model: EngineeringDataWorkspaceModel;
    readonly initialStatus?: EngineeringDataWorkspaceStatus;
}

export interface EngineeringDataWorkspaceState {
    readonly status: EngineeringDataWorkspaceStatus;
}

export interface EngineeringDataWorkspaceContextValue {
    readonly model: EngineeringDataWorkspaceModel;
    readonly state: EngineeringDataWorkspaceState;
    readonly setStatus: (status: EngineeringDataWorkspaceStatus) => void;
}

export interface EngineeringDataWorkspaceProviderProps extends EngineeringDataWorkspaceProps {
    readonly children: ReactNode;
}

const EngineeringDataWorkspaceContext =
    createContext<EngineeringDataWorkspaceContextValue | undefined>(undefined);

/** Boundary: the app supplies one assembled case model; child modules remain renderer-independent. */
export function EngineeringDataWorkspaceProvider({
    model,
    initialStatus = 'stub',
    children,
}: Readonly<EngineeringDataWorkspaceProviderProps>) {
    const [status, setStatus] = useState<EngineeringDataWorkspaceStatus>(initialStatus);
    const value = useMemo(() => ({model, state: {status}, setStatus}), [model, status]);
    return (
        <EngineeringDataWorkspaceContext.Provider value={value}>
            {children}
        </EngineeringDataWorkspaceContext.Provider>
    );
}

export function useEngineeringDataWorkspace(): EngineeringDataWorkspaceContextValue {
    const context = useContext(EngineeringDataWorkspaceContext);
    if (!context) {
        throw new Error('useEngineeringDataWorkspace must be used inside EngineeringDataWorkspaceProvider.');
    }
    return context;
}

export function EngineeringDataWorkspaceView() {
    const {model, state} = useEngineeringDataWorkspace();
    return (
        <section
            aria-label="Engineering data workspace"
            data-case-id={model.caseId}
            data-status={state.status}
        >
            <h2>{model.caseLabel}</h2>
        </section>
    );
}

export function EngineeringDataWorkspace(props: Readonly<EngineeringDataWorkspaceProps>) {
    return (
        <EngineeringDataWorkspaceProvider {...props}>
            <EngineeringDataWorkspaceView/>
        </EngineeringDataWorkspaceProvider>
    );
}
