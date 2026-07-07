import {
    createContext,
    type ReactNode,
    useContext,
    useMemo,
    useState,
} from 'react';

import type {VisualizationStatus} from '../visualizationTypes';
import type {EngineVisualizationModel} from './EngineVisualization.model';

export interface EngineVisualizationProps {
    readonly model: EngineVisualizationModel;
    readonly initialStatus?: VisualizationStatus;
}

export interface EngineVisualizationState {
    readonly status: VisualizationStatus;
    readonly selectedComponentId: string | null;
}

export interface EngineVisualizationContextValue {
    readonly model: EngineVisualizationModel;
    readonly state: EngineVisualizationState;
    readonly selectComponent: (componentId: string | null) => void;
}

export interface EngineVisualizationProviderProps extends EngineVisualizationProps {
    readonly children: ReactNode;
}

const EngineVisualizationContext = createContext<EngineVisualizationContextValue | undefined>(undefined);

/**
 * Boundary: app case data enters here; WebGL, Theatre, and component geometry remain below it.
 * Scope: visualization composition only. This provider must not mutate engine-analysis state.
 */
export function EngineVisualizationProvider({
    model,
    initialStatus = 'stub',
    children,
}: Readonly<EngineVisualizationProviderProps>) {
    const [selectedComponentId, selectComponent] = useState<string | null>(null);
    const value = useMemo<EngineVisualizationContextValue>(() => ({
        model,
        state: {status: initialStatus, selectedComponentId},
        selectComponent,
    }), [initialStatus, model, selectedComponentId]);

    return <EngineVisualizationContext.Provider value={value}>{children}</EngineVisualizationContext.Provider>;
}

export function useEngineVisualization(): EngineVisualizationContextValue {
    const context = useContext(EngineVisualizationContext);
    if (!context) {
        throw new Error('useEngineVisualization must be used inside EngineVisualizationProvider.');
    }
    return context;
}

export function EngineVisualizationView() {
    const {model, state} = useEngineVisualization();
    return (
        <section aria-label={model.title} data-scope="engine-visualization" data-status={state.status}>
            <h2>{model.title}</h2>
            <p>{model.caseLabel}</p>
        </section>
    );
}

export function EngineVisualization(props: Readonly<EngineVisualizationProps>) {
    return (
        <EngineVisualizationProvider {...props}>
            <EngineVisualizationView/>
        </EngineVisualizationProvider>
    );
}
