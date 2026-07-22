import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

import {getCaseLabel} from '../../demo/demoModel';
import {
    type SceneComponentId,
    type SceneSelectionState,
    getSceneComponentViewPreset,
    useGuidedInvestigation,
    useScenePresentation,
    useTheatreDemoDirector,
} from '../visualization';
import {useAnalysisLinkRegistry} from '../analysis';
import {useEngineStore} from '../../state/EngineStore';

export type ActiveCaseActivityKind = 'case-change' | 'evidence-opened' | 'scene-cue' | 'reset';

export interface ActiveCaseActivity {
    readonly id: number;
    readonly kind: ActiveCaseActivityKind;
    readonly label: string;
    readonly reversible: true;
}

export interface ActiveCaseContextValue {
    readonly operatingCase: {readonly id: string; readonly label: string};
    readonly evidenceFocus: SceneSelectionState;
    readonly sceneCueId: string | null;
    readonly timeline: readonly ActiveCaseActivity[];
    readonly openEvidence: (componentId: SceneComponentId, owner?: SceneSelectionState['owner']) => void;
    readonly applySceneCue: (cueId: string, componentId: SceneComponentId) => void;
    readonly startGuidedPresentation: () => void;
    readonly restoreGuidedPresentation: (selection: SceneSelectionState) => void;
    readonly reset: () => void;
}

const ActiveCaseContext = createContext<ActiveCaseContextValue | undefined>(undefined);

/**
 * The single public seam for the active operating case. It composes the existing
 * engine, evidence, and scene workspaces but does not own calculations or fixtures.
 */
export function ActiveCaseProvider({children}: Readonly<{children: ReactNode}>) {
    const selectedPresetId = useEngineStore((state) => state.selectedPresetId);
    const setVisualizationMode = useEngineStore((state) => state.setVisualizationMode);
    const resetEngine = useEngineStore((state) => state.resetDemo);
    const investigation = useGuidedInvestigation();
    const presentation = useScenePresentation();
    const director = useTheatreDemoDirector();
    const links = useAnalysisLinkRegistry();
    const previousCaseId = useRef(selectedPresetId);
    const nextActivityId = useRef(1);
    const [timeline, setTimeline] = useState<readonly ActiveCaseActivity[]>([]);

    const record = useCallback((kind: ActiveCaseActivityKind, label: string) => {
        const activity: ActiveCaseActivity = {id: nextActivityId.current++, kind, label, reversible: true};
        setTimeline((entries) => [...entries, activity]);
    }, []);

    useEffect(() => {
        if (previousCaseId.current === selectedPresetId) return;
        previousCaseId.current = selectedPresetId;
        record('case-change', `Operating Case changed to ${getCaseLabel(selectedPresetId)}.`);
    }, [record, selectedPresetId]);

    const openEvidence = useCallback((componentId: SceneComponentId, owner: SceneSelectionState['owner'] = 'user') => {
        const descriptor = investigation.model.components.find((component) => component.id === componentId);
        investigation.selectComponent(componentId, owner);
        links.activateLink(descriptor?.analysisLinkId ?? null);
        if (descriptor?.analysisLinkId === 'thermal-margin') setVisualizationMode('thermal');
        if (descriptor?.analysisLinkId === 'propulsion-stability') setVisualizationMode('flow');
        if (owner === 'user') presentation.selectPreset(getSceneComponentViewPreset(componentId));
        record('evidence-opened', `Evidence focus opened: ${descriptor?.label ?? componentId}.`);
    }, [investigation, links, presentation, record, setVisualizationMode]);

    const applySceneCue = useCallback((cueId: string, componentId: SceneComponentId) => {
        const cue = director.model.cues.find((candidate) => candidate.id === cueId);
        if (!cue) return;
        if (director.state.activeCueId !== cue.id) director.activateCue(cue.id);
        setVisualizationMode(cue.mode);
        openEvidence(componentId, 'theatre');
        presentation.requestTheatrePose(
            {position: cue.cameraPosition, target: cue.cameraTarget},
            cue.explodedViewProgress,
            cue.explodedViewProgress > 0 ? 'layers' : 'assembled',
        );
        record('scene-cue', `Scene cue applied: ${cue.label}.`);
    }, [director, openEvidence, presentation, record, setVisualizationMode]);

    const startGuidedPresentation = useCallback(() => {
        presentation.saveTourSnapshot();
        director.replay();
    }, [director, presentation]);
    const restoreGuidedPresentation = useCallback((selection: SceneSelectionState) => {
        investigation.restoreSelection(selection);
        const descriptor = investigation.model.components.find((component) => component.id === selection.selectedComponentId);
        links.activateLink(descriptor?.analysisLinkId ?? null);
        presentation.restoreTourSnapshot();
    }, [investigation, links, presentation]);

    const reset = useCallback(() => {
        director.stop();
        investigation.resetSelection();
        links.activateLink(null);
        presentation.resetPresentation();
        resetEngine();
        record('reset', 'Active Case reset to the benchmark state.');
    }, [director, investigation, links, presentation, record, resetEngine]);

    const value = useMemo<ActiveCaseContextValue>(() => ({
        operatingCase: {id: selectedPresetId, label: getCaseLabel(selectedPresetId)},
        evidenceFocus: investigation.state,
        sceneCueId: director.state.activeCueId,
        timeline,
        openEvidence,
        applySceneCue,
        startGuidedPresentation,
        restoreGuidedPresentation,
        reset,
    }), [applySceneCue, director.state.activeCueId, investigation.state, openEvidence, reset, restoreGuidedPresentation, selectedPresetId, startGuidedPresentation, timeline]);

    return <ActiveCaseContext.Provider value={value}>{children}</ActiveCaseContext.Provider>;
}

export function useActiveCase(): ActiveCaseContextValue {
    const context = useContext(ActiveCaseContext);
    if (!context) throw new Error('useActiveCase must be used inside ActiveCaseProvider.');
    return context;
}

export function ActiveCaseTimeline() {
    const activeCase = useActiveCase();
    return (
        <section aria-label="Active Case activity timeline" className="active-case-timeline">
            <div>
                <p className="eyebrow">reversible activity</p>
                <h2>Active Case timeline</h2>
            </div>
            <p>
                Evidence focus is <strong>{activeCase.evidenceFocus.owner}</strong>-owned;
                {activeCase.sceneCueId ? ` scene cue: ${activeCase.sceneCueId}.` : ' no scene cue is active.'}
            </p>
            <ol>
                {activeCase.timeline.length ? activeCase.timeline.map((entry) => (
                    <li key={entry.id}>{entry.label}</li>
                )) : <li>No activity recorded for this case.</li>}
            </ol>
        </section>
    );
}
