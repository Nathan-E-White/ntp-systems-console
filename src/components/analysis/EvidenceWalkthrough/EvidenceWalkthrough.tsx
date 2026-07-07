import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import {
    buildEvidenceWalkthroughModel,
    type EvidenceWalkthroughModel,
    type EvidenceWalkthroughStep,
    type EvidenceWalkthroughStepId,
} from './EvidenceWalkthrough.model';

export type EvidenceWalkthroughStatus = 'idle' | 'active' | 'complete';

export interface EvidenceWalkthroughState {
    readonly status: EvidenceWalkthroughStatus;
    readonly activeStepId: EvidenceWalkthroughStepId | null;
    readonly activeStepIndex: number | null;
    readonly reducedMotion: boolean;
}

export interface EvidenceWalkthroughStartOptions {
    readonly reducedMotion?: boolean;
}

export interface EvidenceWalkthroughContextValue {
    readonly model: EvidenceWalkthroughModel;
    readonly state: EvidenceWalkthroughState;
    readonly activeStep: EvidenceWalkthroughStep | null;
    readonly start: (options?: EvidenceWalkthroughStartOptions) => void;
    readonly next: () => void;
    readonly previous: () => void;
    readonly stop: () => void;
    readonly selectStep: (stepId: EvidenceWalkthroughStepId, options?: EvidenceWalkthroughStartOptions) => void;
}

const EvidenceWalkthroughContext = createContext<EvidenceWalkthroughContextValue | undefined>(undefined);

export function EvidenceWalkthroughProvider({
    children,
    model = buildEvidenceWalkthroughModel(),
}: Readonly<{children: ReactNode; model?: EvidenceWalkthroughModel}>) {
    const [state, setState] = useState<EvidenceWalkthroughState>({
        status: 'idle',
        activeStepId: null,
        activeStepIndex: null,
        reducedMotion: false,
    });

    const activeStep = state.activeStepId
        ? model.steps.find((step) => step.id === state.activeStepId) ?? null
        : null;

    const selectStep = useCallback((stepId: EvidenceWalkthroughStepId, options: EvidenceWalkthroughStartOptions = {}) => {
        const index = model.steps.findIndex((step) => step.id === stepId);
        if (index < 0) return;
        setState({
            status: 'active',
            activeStepId: stepId,
            activeStepIndex: index,
            reducedMotion: Boolean(options.reducedMotion),
        });
    }, [model.steps]);

    const start = useCallback((options: EvidenceWalkthroughStartOptions = {}) => {
        const firstStep = model.steps[0];
        if (!firstStep) return;
        selectStep(firstStep.id, options);
    }, [model.steps, selectStep]);

    const next = useCallback(() => {
        setState((current) => {
            const currentIndex = current.activeStepIndex ?? -1;
            const nextIndex = currentIndex + 1;
            if (nextIndex >= model.steps.length) {
                return {
                    ...current,
                    status: 'complete',
                    activeStepId: null,
                    activeStepIndex: null,
                };
            }
            return {
                ...current,
                status: 'active',
                activeStepId: model.steps[nextIndex].id,
                activeStepIndex: nextIndex,
            };
        });
    }, [model.steps]);

    const previous = useCallback(() => {
        setState((current) => {
            const currentIndex = current.activeStepIndex ?? 0;
            const previousIndex = Math.max(0, currentIndex - 1);
            return {
                ...current,
                status: 'active',
                activeStepId: model.steps[previousIndex]?.id ?? null,
                activeStepIndex: model.steps[previousIndex] ? previousIndex : null,
            };
        });
    }, [model.steps]);

    const stop = useCallback(() => {
        setState((current) => ({
            ...current,
            status: 'idle',
            activeStepId: null,
            activeStepIndex: null,
        }));
    }, []);

    const value = useMemo<EvidenceWalkthroughContextValue>(() => ({
        model,
        state,
        activeStep,
        start,
        next,
        previous,
        stop,
        selectStep,
    }), [activeStep, model, next, previous, selectStep, start, state, stop]);

    return (
        <EvidenceWalkthroughContext.Provider value={value}>
            {children}
        </EvidenceWalkthroughContext.Provider>
    );
}

export function useEvidenceWalkthrough(): EvidenceWalkthroughContextValue {
    const context = useContext(EvidenceWalkthroughContext);
    if (!context) throw new Error('useEvidenceWalkthrough must be used inside EvidenceWalkthroughProvider.');
    return context;
}
