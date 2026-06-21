import {useMemo, useState} from 'react';

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
    const [activeSectionId, setActiveSectionId] = useState<AppSectionId>('operating-case');
    const investigation = useGuidedInvestigation();
    const links = useAnalysisLinkRegistry();
    const director = useTheatreDemoDirector();
    const presentation = useScenePresentation();
    const resetEngine = useEngineStore((state) => state.resetDemo);

    const openEvidence = (componentId: SceneComponentId) => {
        investigation.selectComponent(componentId);
        setActiveSectionId('model-evidence');
    };
    const resetDemo = () => {
        cancelGuidedDemoSequence();
        director.stop();
        investigation.resetSelection();
        links.activateLink(null);
        presentation.resetPresentation();
        resetEngine();
        setActiveSectionId('operating-case');
    };

    return (
        <AppLayout
            activeSectionId={activeSectionId}
            onResetDemo={resetDemo}
            onSectionChange={setActiveSectionId}
        >
            {activeSectionId === 'operating-case' && (
                <OperatingCaseSection inputs={inputs} onOpenModelEvidence={openEvidence} outputs={outputs}/>
            )}
            {activeSectionId === 'nuclear-fuel-performance' && <NuclearFuelPerformanceSection/>}
            {activeSectionId === 'model-evidence' && (
                <ModelEvidenceSection onReturnToOperatingCase={() => setActiveSectionId('operating-case')}/>
            )}
            {activeSectionId === 'review' && <ReviewSection inputs={inputs} outputs={outputs}/>}
        </AppLayout>
    );
}
