import {createContext, type ReactNode, useContext, useMemo, useState} from 'react';

import type {SceneCalloutOverlayModel} from './SceneCalloutOverlay.model';

export interface SceneCalloutOverlayProps {
    readonly model: SceneCalloutOverlayModel;
    readonly initialVisibleCalloutIds?: readonly string[];
    readonly visibleCalloutIds?: readonly string[];
    readonly metricOverrides?: Readonly<Record<string, string>>;
}

export interface SceneCalloutOverlayState {
    readonly visibleCalloutIds: readonly string[];
}

export interface SceneCalloutOverlayContextValue {
    readonly model: SceneCalloutOverlayModel;
    readonly state: SceneCalloutOverlayState;
    readonly setVisibleCallouts: (calloutIds: readonly string[]) => void;
}

export interface SceneCalloutOverlayProviderProps extends SceneCalloutOverlayProps {
    readonly children: ReactNode;
}

const SceneCalloutOverlayContext = createContext<SceneCalloutOverlayContextValue | undefined>(undefined);

/** Boundary: WebGL-to-DOM annotation projection. Scope: traceability labels and selection only. */
export function SceneCalloutOverlayProvider({
    model,
    initialVisibleCalloutIds = [],
    children,
}: Readonly<SceneCalloutOverlayProviderProps>) {
    const [visibleCalloutIds, setVisibleCallouts] = useState<readonly string[]>(initialVisibleCalloutIds);
    const value = useMemo(() => ({
        model,
        state: {visibleCalloutIds},
        setVisibleCallouts,
    }), [model, visibleCalloutIds]);
    return <SceneCalloutOverlayContext.Provider value={value}>{children}</SceneCalloutOverlayContext.Provider>;
}

export function useSceneCalloutOverlay(): SceneCalloutOverlayContextValue {
    const context = useContext(SceneCalloutOverlayContext);
    if (!context) throw new Error('useSceneCalloutOverlay must be used inside SceneCalloutOverlayProvider.');
    return context;
}

export function SceneCalloutOverlayView({
    visibleCalloutIds,
    metricOverrides = {},
}: Readonly<Pick<SceneCalloutOverlayProps, 'visibleCalloutIds' | 'metricOverrides'>>) {
    const {model, state} = useSceneCalloutOverlay();
    const visibleIds = visibleCalloutIds ?? state.visibleCalloutIds;
    const visibleCallouts = model.callouts.filter((callout) => visibleIds.includes(callout.id));
    return (
        <aside
            aria-label="Scene traceability callouts"
            data-callout-count={model.callouts.length}
            data-scope="scene-callout-overlay"
            data-visible-count={visibleCallouts.length}
            className="scene-callout-overlay"
        >
            <p className="scene-claim-boundary">Representative engineering visualization, not a design schematic</p>
            {visibleCallouts.map((callout) => (
                <article className={`scene-callout ${callout.provenance}`} key={callout.id}>
                    <span>{callout.discipline}</span>
                    <strong>{callout.label}</strong>
                    <p>{metricOverrides[callout.id] ?? callout.metric}</p>
                    <small>{formatProvenance(callout.provenance)}</small>
                </article>
            ))}
        </aside>
    );
}

export function SceneCalloutOverlay({
    visibleCalloutIds,
    metricOverrides,
    ...props
}: Readonly<SceneCalloutOverlayProps>) {
    return (
        <SceneCalloutOverlayProvider {...props}>
            <SceneCalloutOverlayView
                metricOverrides={metricOverrides}
                visibleCalloutIds={visibleCalloutIds}
            />
        </SceneCalloutOverlayProvider>
    );
}

function formatProvenance(provenance: SceneCalloutOverlayModel['callouts'][number]['provenance']): string {
    switch (provenance) {
        case 'mcnp-fixture':
            return 'Synthetic MCNP-like fixture';
        case 'moose-fixture':
            return 'Synthetic MOOSE-like fixture';
        case 'rocets-fixture':
            return 'Synthetic ROCETS-like fixture';
        case 'reduced-order':
            return 'Calculated reduced-order result';
    }
}
