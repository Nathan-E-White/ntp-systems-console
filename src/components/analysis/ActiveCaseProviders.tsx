import type {ReactNode} from 'react';

import {
    AnalysisLinkRegistryProvider,
    ChartWorkspaceProvider,
    EngineeringDataWorkspaceProvider,
    FixtureEvidenceWorkspaceProvider,
    OutputWorkspaceProvider,
    ParameterWorkspaceProvider,
} from './index';
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
                                        <TheatreDemoDirectorProvider model={buildTheatreDemoDirectorModel()}>
                                            <TheatreDemoDirectorView/>
                                            {children}
                                        </TheatreDemoDirectorProvider>
                                    </ScenePresentationProvider>
                                </GuidedInvestigationProvider>
                            </AnalysisLinkRegistryProvider>
                        </ChartWorkspaceProvider>
                    </OutputWorkspaceProvider>
                </ParameterWorkspaceProvider>
            </FixtureEvidenceWorkspaceProvider>
        </EngineeringDataWorkspaceProvider>
    );
}
