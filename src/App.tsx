import {useEffect, useMemo, useRef, useState} from 'react';

import {AppLayout} from './AppLayout';
import {type AppSectionId} from './AppSections';
import {ActiveCaseProviders} from './components/analysis/ActiveCaseProviders';
import {ModelEvidenceSection} from './components/sections/ModelEvidenceSection';
import {NuclearFuelPerformanceSection} from './components/sections/NuclearFuelPerformanceSection';
import {OperatingCaseSection} from './components/sections/OperatingCaseSection';
import {ReviewSection} from './components/sections/ReviewSection';
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

    return (
        <AppLayout
            activeSectionId={activeSectionId}
            onResetDemo={resetDemo}
            onSectionChange={(section) => updateRoute(section)}
        >
            {activeSectionId === 'operating-case' && (
                <OperatingCaseSection inputs={inputs} onOpenModelEvidence={openEvidence} outputs={outputs}/>
            )}
            {activeSectionId === 'nuclear-fuel-performance' && <NuclearFuelPerformanceSection/>}
            {activeSectionId === 'model-evidence' && (
                <ModelEvidenceSection onReturnToOperatingCase={() => updateRoute('operating-case')}/>
            )}
            {activeSectionId === 'review' && <ReviewSection inputs={inputs} outputs={outputs}/>}
        </AppLayout>
    );
}
