import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {AnalysisLinkRegistryModel} from './AnalysisLinkRegistry.model';

export interface AnalysisLinkRegistryProps {
    readonly model: AnalysisLinkRegistryModel;
    readonly initialActiveLinkId?: string | null;
}

export interface AnalysisLinkRegistryState {
    readonly activeLinkId: string | null;
}

export interface AnalysisLinkRegistryContextValue {
    readonly model: AnalysisLinkRegistryModel;
    readonly state: AnalysisLinkRegistryState;
    readonly activateLink: (linkId: string | null) => void;
}

export interface AnalysisLinkRegistryProviderProps extends AnalysisLinkRegistryProps {
    readonly children: ReactNode;
}

const AnalysisLinkRegistryContext = createContext<AnalysisLinkRegistryContextValue | undefined>(undefined);

/** Boundary: translates a user selection into IDs understood by panels, charts, and the scene. */
export function AnalysisLinkRegistryProvider({
    model,
    initialActiveLinkId = null,
    children,
}: Readonly<AnalysisLinkRegistryProviderProps>) {
    const [activeLinkId, activateLink] = useState<string | null>(initialActiveLinkId);
    const value = useMemo(() => ({
        model,
        state: {activeLinkId},
        activateLink,
    }), [activeLinkId, model]);
    return <AnalysisLinkRegistryContext.Provider value={value}>{children}</AnalysisLinkRegistryContext.Provider>;
}

export function useAnalysisLinkRegistry(): AnalysisLinkRegistryContextValue {
    const context = useContext(AnalysisLinkRegistryContext);
    if (!context) throw new Error('useAnalysisLinkRegistry must be used inside AnalysisLinkRegistryProvider.');
    return context;
}

export function AnalysisLinkRegistryView() {
    const {model, state} = useAnalysisLinkRegistry();
    return (
        <section
            aria-label="Analysis link registry"
            data-active-link={state.activeLinkId ?? 'none'}
            data-link-count={model.links.length}
        />
    );
}

export function AnalysisLinkRegistry(props: Readonly<AnalysisLinkRegistryProps>) {
    return <AnalysisLinkRegistryProvider {...props}><AnalysisLinkRegistryView/></AnalysisLinkRegistryProvider>;
}
