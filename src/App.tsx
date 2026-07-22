import {lazy, Suspense, type ReactNode, useEffect, useMemo, useRef, useState} from 'react';

import {AppLayout} from './AppLayout';
import {type AppSectionId} from './AppSections';
import {ActiveCaseProviders} from './components/analysis/ActiveCaseProviders';
import {OperatingCaseSection} from './components/sections/OperatingCaseSection';
import {buildActiveCaseWorkspace} from './demo/activeCaseWorkspace';
import {useEngineInputs, useEngineOutputs, useEngineTransient} from './state/EngineSelectors';
import {useEngineStore} from './state/EngineStore';
import {
    cancelGuidedDemoSequence,
} from './theatre/guidedDemoSequence';
import {
    type SceneComponentId,
    useGuidedInvestigation,
    useScenePresentation,
    useTheatreDemoDirector,
} from './components/visualization';
import {useAnalysisLinkRegistry} from './components/analysis';
import {useActiveCase} from './components/activeCase';
import {parseReviewRoute, reviewRouteSearch} from './routing/reviewRoute';

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
    const investigation = useGuidedInvestigation();
    const links = useAnalysisLinkRegistry();
    const director = useTheatreDemoDirector();
    const presentation = useScenePresentation();
    const resetEngine = useEngineStore((state) => state.resetDemo);
    const activeCase = useActiveCase();
    const appliedInitialRoute = useRef(false);

    const updateRoute = (section: AppSectionId, focus: SceneComponentId | null = null, replace = false) => {
        const url = `${window.location.pathname}${reviewRouteSearch({section, focus})}`;
        window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
        setActiveSectionId(section);
    };

    const openEvidence = (componentId: SceneComponentId) => {
        activeCase.openEvidence(componentId);
        investigation.selectComponent(componentId);
        updateRoute('model-evidence', componentId);
    };
    useEffect(() => {
        const route = parseReviewRoute(window.location.search);
        if (!appliedInitialRoute.current && route.focus) {
            appliedInitialRoute.current = true;
            activeCase.openEvidence(route.focus);
            investigation.selectComponent(route.focus);
        }
        const onPopState = () => {
            const next = parseReviewRoute(window.location.search);
            setActiveSectionId(next.section);
            if (next.focus) investigation.selectComponent(next.focus);
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [activeCase, investigation]);
    useEffect(() => {
        if (activeCase.state.resetVersion === 0) return;
        cancelGuidedDemoSequence();
        director.stop();
        investigation.resetSelection();
        links.activateLink(null);
        presentation.resetPresentation();
        resetEngine();
        updateRoute('operating-case', null, true);
    }, [activeCase.state.resetVersion, director, investigation, links, presentation, resetEngine]);
    const resetDemo = () => activeCase.reset();
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === '?' && !event.metaKey && !event.ctrlKey) setShowKeyboardMap(true);
            if (event.key === 'Escape') setShowKeyboardMap(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <AppLayout
            activeSectionId={activeSectionId}
            onResetDemo={resetDemo}
            onSectionChange={(section) => updateRoute(section)}
            onReturnToEvidence={() => updateRoute('model-evidence', activeCase.state.evidenceFocus)}
            onShowKeyboardMap={() => setShowKeyboardMap(true)}
        >
            {activeSectionId === 'operating-case' && (
                <OperatingCaseSection inputs={inputs} onOpenModelEvidence={openEvidence} outputs={outputs}/>
            )}
            {activeSectionId === 'nuclear-fuel-performance' && <DeferredSection><NuclearFuelPerformanceSection/></DeferredSection>}
            {activeSectionId === 'model-evidence' && (
                <DeferredSection><ModelEvidenceSection onReturnToOperatingCase={() => updateRoute('operating-case')}/></DeferredSection>
            )}
            {activeSectionId === 'review' && <DeferredSection><ReviewSection inputs={inputs} outputs={outputs}/></DeferredSection>}
            {showKeyboardMap && <aside className="keyboard-map" role="dialog" aria-label="Keyboard map"><button onClick={() => setShowKeyboardMap(false)} type="button">Close</button><h2>Keyboard map</h2><p><kbd>?</kbd> open this map · <kbd>Esc</kbd> close it</p><p>Use visible section tabs and scene controls with standard keyboard focus.</p></aside>}
        </AppLayout>
    );
}

function DeferredSection({children}: Readonly<{children: ReactNode}>) {
    return <Suspense fallback={<p role="status">Loading review workspace…</p>}>{children}</Suspense>;
}
