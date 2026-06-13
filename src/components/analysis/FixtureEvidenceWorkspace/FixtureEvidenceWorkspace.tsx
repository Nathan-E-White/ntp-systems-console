import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {FixtureEvidenceWorkspaceModel} from './FixtureEvidenceWorkspace.model';

export interface FixtureEvidenceWorkspaceProps {
    readonly model: FixtureEvidenceWorkspaceModel;
    readonly initialSelectedFixtureId?: string | null;
}

export interface FixtureEvidenceWorkspaceState {
    readonly selectedFixtureId: string | null;
}

export interface FixtureEvidenceWorkspaceContextValue {
    readonly model: FixtureEvidenceWorkspaceModel;
    readonly state: FixtureEvidenceWorkspaceState;
    readonly selectFixture: (fixtureId: string | null) => void;
}

export interface FixtureEvidenceWorkspaceProviderProps extends FixtureEvidenceWorkspaceProps {
    readonly children: ReactNode;
}

const FixtureEvidenceWorkspaceContext =
    createContext<FixtureEvidenceWorkspaceContextValue | undefined>(undefined);

/** Boundary: parsed fixture evidence enters here and remains immutable downstream. */
export function FixtureEvidenceWorkspaceProvider({
    model,
    initialSelectedFixtureId = null,
    children,
}: Readonly<FixtureEvidenceWorkspaceProviderProps>) {
    const [selectedFixtureId, selectFixture] = useState<string | null>(initialSelectedFixtureId);
    const value = useMemo(() => ({
        model,
        state: {selectedFixtureId},
        selectFixture,
    }), [model, selectedFixtureId]);
    return (
        <FixtureEvidenceWorkspaceContext.Provider value={value}>
            {children}
        </FixtureEvidenceWorkspaceContext.Provider>
    );
}

export function useFixtureEvidenceWorkspace(): FixtureEvidenceWorkspaceContextValue {
    const context = useContext(FixtureEvidenceWorkspaceContext);
    if (!context) {
        throw new Error('useFixtureEvidenceWorkspace must be used inside FixtureEvidenceWorkspaceProvider.');
    }
    return context;
}

export function FixtureEvidenceWorkspaceView() {
    const {model, state} = useFixtureEvidenceWorkspace();
    return (
        <section
            aria-label="Engineering fixture evidence"
            data-fixture-count={model.fixtures.length}
            data-selected-fixture={state.selectedFixtureId ?? 'none'}
        />
    );
}

export function FixtureEvidenceWorkspace(props: Readonly<FixtureEvidenceWorkspaceProps>) {
    return (
        <FixtureEvidenceWorkspaceProvider {...props}>
            <FixtureEvidenceWorkspaceView/>
        </FixtureEvidenceWorkspaceProvider>
    );
}
