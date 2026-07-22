import type {ReactNode} from 'react';

import {
    AnalysisLinkRegistryProvider,
    ChartWorkspaceProvider,
    EngineeringDataWorkspaceProvider,
    EvidenceWalkthroughProvider,
    FixtureEvidenceWorkspaceProvider,
    OutputWorkspaceProvider,
    ParameterWorkspaceProvider,
} from './index';
import {EvidenceWalkthroughBridge} from './EvidenceWalkthrough/EvidenceWalkthroughBridge';
import {ActiveCaseProvider, ActiveCaseTimeline} from '../activeCase';
import type {EngineeringDataWorkspaceModel} from './EngineeringDataWorkspace/EngineeringDataWorkspace.model';
import {
    buildTheatreDemoDirectorModel,
    buildScenePresentationWorkspaceModel,
    GuidedInvestigationProvider,
    ScenePresentationProvider,
    TheatreDemoDirectorProvider,
    TheatreDemoDirectorView,
} from '../visualization';

export interface ActiveCaseProvidersProps {
    readonly model: EngineeringDataWorkspaceModel;
    readonly children: ReactNode;
}

export function ActiveCaseProviders({model, children}: Readonly<ActiveCaseProvidersProps>) {
    return (
        <ActiveCaseProvider caseId={model.caseId}>
        <ActiveCaseTimeline/>
        <EngineeringDataWorkspaceProvider model={model} initialStatus="ready">
            <FixtureEvidenceWorkspaceProvider model={model.fixtures}>
                <ParameterWorkspaceProvider model={model.parameters}>
                    <OutputWorkspaceProvider model={model.outputs} initialSelectedOutputKey="channelWallCriterionMarginK">
                        <ChartWorkspaceProvider
                            model={model.charts}
                            initialSelectedSeriesId="reduced-order-transient"
                        >
                            <AnalysisLinkRegistryProvider model={model.links}>
                                <GuidedInvestigationProvider>
                                    <ScenePresentationProvider model={buildScenePresentationWorkspaceModel()}>
                                        <EvidenceWalkthroughProvider>
                                            <TheatreDemoDirectorProvider model={buildTheatreDemoDirectorModel()}>
                                                <TheatreDemoDirectorView/>
                                                <EvidenceWalkthroughBridge/>
                                                {children}
                                            </TheatreDemoDirectorProvider>
                                        </EvidenceWalkthroughProvider>
                                    </ScenePresentationProvider>
                                </GuidedInvestigationProvider>
                            </AnalysisLinkRegistryProvider>
                        </ChartWorkspaceProvider>
                    </OutputWorkspaceProvider>
                </ParameterWorkspaceProvider>
            </FixtureEvidenceWorkspaceProvider>
        </EngineeringDataWorkspaceProvider>
        </ActiveCaseProvider>
    );
}
