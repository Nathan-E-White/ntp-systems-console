import {lazy, Suspense, type ReactNode, useEffect, useMemo, useRef, useState} from 'react';

import {AppLayout} from './AppLayout';
import {type AppSectionId} from './AppSections';
import {ActiveCaseProviders} from './components/analysis/ActiveCaseProviders';
import {OperatingCaseSection} from './components/sections/OperatingCaseSection';
import {buildActiveCaseWorkspace} from './demo/activeCaseWorkspace';
import {useEngineInputs, useEngineOutputs, useEngineTransient} from './state/EngineSelectors';
import {type EngineCaseSelection, type EnginePresetId, useEngineStore} from './state/EngineStore';
import {
    cancelGuidedDemoSequence,
} from './theatre/guidedDemoSequence';
import {
    type SceneComponentId,
    useScenePresentation,
    useTheatreDemoDirector,
} from './components/visualization';
import {useAnalysisLinkRegistry} from './components/analysis';
import {useActiveCase} from './components/activeCase';
import {changedEngineInputs, parseReviewRoute, reviewRouteSearch} from './routing/reviewRoute';

const ModelEvidenceSection = lazy(() => import('./components/sections/ModelEvidenceSection').then((module) => ({default: module.ModelEvidenceSection})));
const NuclearFuelPerformanceSection = lazy(() => import('./components/sections/NuclearFuelPerformanceSection').then((module) => ({default: module.NuclearFuelPerformanceSection})));
const ReviewSection = lazy(() => import('./components/sections/ReviewSection').then((module) => ({default: module.ReviewSection})));

export function App() {
    const inputs = useEngineInputs();
    const outputs = useEngineOutputs();
    const transient = useEngineTransient();
    const selection = useEngineStore((state) => state.selectedPresetId);
    const workspaceModel = useMemo(() => buildActiveCaseWorkspace({
        selection,
        inputs,
        outputs,
        transient,
    }), [inputs, outputs, selection, transient]);

    return (
        <ActiveCaseProviders model={workspaceModel}>
            <Workbench
                inputs={inputs}
                outputs={outputs}
            />
        </ActiveCaseProviders>
    );
}

function Workbench({
    inputs,
    outputs,
}: Readonly<{
    inputs: ReturnType<typeof useEngineInputs>;
    outputs: ReturnType<typeof useEngineOutputs>;
}>) {
    const [activeSectionId, setActiveSectionId] = useState<AppSectionId>(() => parseReviewRoute(window.location.search).section);
    const [showKeyboardMap, setShowKeyboardMap] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const links = useAnalysisLinkRegistry();
    const director = useTheatreDemoDirector();
    const presentation = useScenePresentation();
    const resetEngine = useEngineStore((state) => state.resetDemo);
    const loadPreset = useEngineStore((state) => state.loadPreset);
    const loadCustomWhatIf = useEngineStore((state) => state.loadCustomWhatIf);
    const selection = useEngineStore((state) => state.selectedPresetId);
    const basePresetId = useEngineStore((state) => state.basePresetId);
    const currentInputs = useEngineStore((state) => state.inputs);
    const activeCase = useActiveCase();
    const appliedInitialRoute = useRef(false);
    const appliedResetVersion = useRef(0);

    const updateRoute = (section: AppSectionId, focus: SceneComponentId | null = null, replace = false, routeCase: EngineCaseSelection = selection, routeBasePreset: EnginePresetId = basePresetId) => {
        const url = `${window.location.pathname}${reviewRouteSearch({
            section,
            focus,
            caseSelection: routeCase,
            basePresetId: routeBasePreset,
            inputChanges: routeCase === 'customWhatIf' ? changedEngineInputs(currentInputs, routeBasePreset) : {},
        })}`;
        window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
        setActiveSectionId(section);
    };

    const openEvidence = (componentId: SceneComponentId) => {
        activeCase.openEvidence(componentId);
        updateRoute('model-evidence', componentId);
    };
    useEffect(() => {
        const route = parseReviewRoute(window.location.search);
        if (!appliedInitialRoute.current) {
            appliedInitialRoute.current = true;
            restoreRouteCase(route.caseSelection, route.basePresetId, route.inputChanges, loadPreset, loadCustomWhatIf);
            if (route.focus) activeCase.openEvidence(route.focus);
        }
        const onPopState = () => {
            const next = parseReviewRoute(window.location.search);
            setActiveSectionId(next.section);
            restoreRouteCase(next.caseSelection, next.basePresetId, next.inputChanges, loadPreset, loadCustomWhatIf);
            if (next.focus) activeCase.openEvidence(next.focus);
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [activeCase, loadCustomWhatIf, loadPreset]);
    useEffect(() => {
        if (!appliedInitialRoute.current) return;
        const current = parseReviewRoute(window.location.search);
        const nextSearch = reviewRouteSearch({
            section: activeSectionId,
            focus: current.focus,
            caseSelection: selection,
            basePresetId,
            inputChanges: selection === 'customWhatIf' ? changedEngineInputs(currentInputs, basePresetId) : {},
        });
        if (window.location.search !== nextSearch) window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
    }, [activeSectionId, basePresetId, currentInputs, selection]);
    useEffect(() => {
        const {resetVersion} = activeCase.state;
        if (resetVersion === 0 || appliedResetVersion.current === resetVersion) return;
        appliedResetVersion.current = resetVersion;
        cancelGuidedDemoSequence();
        director.stop();
        links.activateLink(null);
        presentation.resetPresentation();
        resetEngine();
        updateRoute('operating-case', null, true);
    }, [activeCase.state.resetVersion, director, links, presentation, resetEngine]);
    const resetDemo = () => activeCase.reset();
    const returnToEvidence = () => updateRoute('model-evidence', activeCase.state.evidenceFocus);
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setShowCommandPalette(true);
            }
            if (!isTyping && event.key.toLowerCase() === 'e' && !event.metaKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault();
                returnToEvidence();
            }
            if (!isTyping && event.key === '?' && !event.metaKey && !event.ctrlKey) setShowKeyboardMap(true);
            if (event.key === 'Escape') {
                setShowKeyboardMap(false);
                setShowCommandPalette(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [activeCase.state.evidenceFocus, basePresetId, currentInputs, selection]);

    return (
        <AppLayout
            activeSectionId={activeSectionId}
            onResetDemo={resetDemo}
            onSectionChange={(section) => updateRoute(section)}
            onReturnToEvidence={returnToEvidence}
            onShowCommandPalette={() => setShowCommandPalette(true)}
            onShowKeyboardMap={() => setShowKeyboardMap(true)}
        >
            {activeSectionId === 'operating-case' && (
                <OperatingCaseSection inputs={inputs} onOpenModelEvidence={openEvidence} outputs={outputs}/>
            )}
            {activeSectionId === 'nuclear-fuel-performance' && <DeferredSection><NuclearFuelPerformanceSection/></DeferredSection>}
            {activeSectionId === 'model-evidence' && (
                <DeferredSection><ModelEvidenceSection onReturnToOperatingCase={() => updateRoute('operating-case')} routeFocus={parseReviewRoute(window.location.search).focus}/></DeferredSection>
            )}
            {activeSectionId === 'review' && <DeferredSection><ReviewSection inputs={inputs} outputs={outputs}/></DeferredSection>}
            {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} onNavigate={(section) => { updateRoute(section, section === 'model-evidence' ? activeCase.state.evidenceFocus : null); setShowCommandPalette(false); }} onReset={() => { resetDemo(); setShowCommandPalette(false); }} onReturnToEvidence={() => { returnToEvidence(); setShowCommandPalette(false); }} onShowKeyboardMap={() => { setShowKeyboardMap(true); setShowCommandPalette(false); }}/>}
            {showKeyboardMap && <aside className="keyboard-map" role="dialog" aria-label="Keyboard map"><button onClick={() => setShowKeyboardMap(false)} type="button">Close</button><h2>Keyboard map</h2><p><kbd>⌘/Ctrl</kbd> + <kbd>K</kbd> command palette · <kbd>E</kbd> return to last evidence · <kbd>?</kbd> open this map · <kbd>Esc</kbd> close dialogs</p><p>Use visible section tabs and scene controls with standard keyboard focus.</p></aside>}
        </AppLayout>
    );
}

function CommandPalette({onClose, onNavigate, onReset, onReturnToEvidence, onShowKeyboardMap}: Readonly<{
    onClose: () => void;
    onNavigate: (section: AppSectionId) => void;
    onReset: () => void;
    onReturnToEvidence: () => void;
    onShowKeyboardMap: () => void;
}>) {
    return <aside className="command-palette" role="dialog" aria-label="Command palette" aria-modal="true">
        <header><h2>Command palette</h2><button autoFocus onClick={onClose} type="button">Close</button></header>
        <p>Navigate the review path without leaving the keyboard.</p>
        <div role="group" aria-label="Navigation commands">
            <button onClick={() => onNavigate('operating-case')} type="button">Go to Operating Case</button>
            <button onClick={() => onNavigate('model-evidence')} type="button">Go to Model Evidence</button>
            <button onClick={onReturnToEvidence} type="button">Return to last evidence</button>
            <button onClick={() => onNavigate('review')} type="button">Go to Review</button>
            <button onClick={onReset} type="button">Reset Demo</button>
            <button onClick={onShowKeyboardMap} type="button">Show keyboard map</button>
        </div>
    </aside>;
}

function restoreRouteCase(
    selection: EngineCaseSelection,
    basePresetId: EnginePresetId,
    inputChanges: Partial<ReturnType<typeof useEngineStore.getState>['inputs']>,
    loadPreset: (presetId: EnginePresetId) => void,
    loadCustomWhatIf: (presetId: EnginePresetId, changes: Partial<ReturnType<typeof useEngineStore.getState>['inputs']>) => void,
) {
    if (selection === 'customWhatIf') loadCustomWhatIf(basePresetId, inputChanges);
    else loadPreset(selection);
}

function DeferredSection({children}: Readonly<{children: ReactNode}>) {
    return <Suspense fallback={<p role="status">Loading review workspace…</p>}>{children}</Suspense>;
}
