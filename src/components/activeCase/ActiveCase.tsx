import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

import type {SceneComponentId} from '../visualization/GuidedInvestigation/GuidedInvestigation.model';

export type ActiveCaseEventKind = 'case-change' | 'evidence-opened' | 'scene-cue' | 'reset';

export interface ActiveCaseEvent {
    readonly id: number;
    readonly kind: ActiveCaseEventKind;
    readonly label: string;
    readonly before: ActiveCaseSnapshot;
}

export interface ActiveCaseSnapshot {
    readonly caseId: string;
    readonly evidenceFocus: SceneComponentId;
    readonly evidenceOwner: 'manual' | 'guided';
    readonly sceneCue: SceneComponentId;
    readonly sceneOwner: 'manual' | 'guided';
}

export interface ActiveCaseState {
    readonly caseId: string;
    readonly evidenceFocus: SceneComponentId;
    readonly evidenceOwner: 'manual' | 'guided';
    readonly sceneCue: SceneComponentId;
    readonly sceneOwner: 'manual' | 'guided';
    readonly resetVersion: number;
    readonly timeline: readonly ActiveCaseEvent[];
}

export interface ActiveCaseContextValue {
    readonly state: ActiveCaseState;
    readonly changeCase: (caseId: string, label: string) => void;
    readonly openEvidence: (componentId: SceneComponentId, owner?: 'manual' | 'guided') => void;
    readonly cueScene: (componentId: SceneComponentId, owner?: 'manual' | 'guided') => void;
    readonly reset: () => void;
    readonly undoLastEvent: () => void;
}

const ActiveCaseContext = createContext<ActiveCaseContextValue | undefined>(undefined);

export function ActiveCaseProvider({caseId, children}: Readonly<{caseId: string; children: ReactNode}>) {
    const [state, setState] = useState<ActiveCaseState>(() => initialState(caseId));
    const previousCaseId = useRef(caseId);
    const changeCase = useCallback((nextCaseId: string, label: string) => {
        setState((current) => ({
            ...current,
            caseId: nextCaseId,
            timeline: [...current.timeline, eventFor(current, 'case-change', label)],
        }));
    }, []);
    const openEvidence = useCallback((componentId: SceneComponentId, owner: 'manual' | 'guided' = 'manual') => {
        setState((current) => ({
            ...current,
            evidenceFocus: componentId,
            evidenceOwner: owner,
            sceneCue: componentId,
            sceneOwner: owner,
            timeline: [...current.timeline, eventFor(current, 'evidence-opened', componentId)],
        }));
    }, []);
    const cueScene = useCallback((componentId: SceneComponentId, owner: 'manual' | 'guided' = 'manual') => {
        setState((current) => ({
            ...current,
            sceneCue: componentId,
            sceneOwner: owner,
            timeline: [...current.timeline, eventFor(current, 'scene-cue', componentId)],
        }));
    }, []);
    const reset = useCallback(() => {
        setState((current) => ({
            ...initialState(current.caseId),
            resetVersion: current.resetVersion + 1,
            timeline: [...current.timeline, eventFor(current, 'reset', 'Reset investigation')],
        }));
    }, []);
    const undoLastEvent = useCallback(() => {
        setState((current) => {
            const event = current.timeline.at(-1);
            if (!event) return current;
            return {...current, ...event.before, timeline: current.timeline.slice(0, -1)};
        });
    }, []);
    useEffect(() => {
        if (previousCaseId.current === caseId) return;
        previousCaseId.current = caseId;
        changeCase(caseId, `Changed case to ${caseId}`);
    }, [caseId, changeCase]);
    const value = useMemo(() => ({state, changeCase, openEvidence, cueScene, reset, undoLastEvent}), [changeCase, cueScene, openEvidence, reset, state, undoLastEvent]);
    return <ActiveCaseContext.Provider value={value}>{children}</ActiveCaseContext.Provider>;
}

export function ActiveCaseTimeline() {
    const {state, undoLastEvent} = useActiveCase();
    return (
        <aside aria-label="Investigation timeline" className="activity-timeline">
            <strong>Investigation timeline</strong>
            <ol>{state.timeline.map((event) => <li key={event.id}>{event.kind.replace('-', ' ')}: {event.label}</li>)}</ol>
            <button disabled={state.timeline.length === 0} onClick={undoLastEvent} type="button">Undo last activity</button>
        </aside>
    );
}

export function useOptionalActiveCase(): ActiveCaseContextValue | undefined {
    return useContext(ActiveCaseContext);
}

export function useActiveCase(): ActiveCaseContextValue {
    const context = useContext(ActiveCaseContext);
    if (!context) throw new Error('useActiveCase must be used inside ActiveCaseProvider.');
    return context;
}

function initialState(caseId: string): ActiveCaseState {
    return {
        caseId,
        evidenceFocus: 'engine-overview',
        evidenceOwner: 'manual',
        sceneCue: 'engine-overview',
        sceneOwner: 'manual',
        resetVersion: 0,
        timeline: [],
    };
}

function eventFor(state: ActiveCaseState, kind: ActiveCaseEventKind, label: string): ActiveCaseEvent {
    return {id: state.timeline.length + 1, kind, label, before: snapshotOf(state)};
}

function snapshotOf(state: ActiveCaseState): ActiveCaseSnapshot {
    return {
        caseId: state.caseId,
        evidenceFocus: state.evidenceFocus,
        evidenceOwner: state.evidenceOwner,
        sceneCue: state.sceneCue,
        sceneOwner: state.sceneOwner,
    };
}
