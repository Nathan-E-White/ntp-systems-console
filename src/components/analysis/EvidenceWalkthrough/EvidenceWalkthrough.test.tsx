import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {
    AnalysisLinkRegistryProvider,
    useAnalysisLinkRegistry,
} from '../AnalysisLinkRegistry/AnalysisLinkRegistry';
import {buildAnalysisLinkRegistryModel} from '../AnalysisLinkRegistry/AnalysisLinkRegistry.model';
import {GuidedInvestigationProvider, useGuidedInvestigation} from '../../visualization/GuidedInvestigation/GuidedInvestigation';
import {
    ScenePresentationProvider,
    useScenePresentation,
} from '../../visualization/ScenePresentationWorkspace/ScenePresentationWorkspace';
import {buildScenePresentationWorkspaceModel} from '../../visualization/ScenePresentationWorkspace/ScenePresentationWorkspace.model';
import {EvidenceWalkthroughProvider, useEvidenceWalkthrough} from './EvidenceWalkthrough';
import {EvidenceWalkthroughBridge} from './EvidenceWalkthroughBridge';

describe('EvidenceWalkthrough', () => {
    it('steps through MOOSE and ROCETS evidence in the declared order', () => {
        render(
            <EvidenceWalkthroughProvider>
                <WalkthroughProbe/>
            </EvidenceWalkthroughProvider>,
        );

        expect(screen.getByLabelText('walkthrough state')).toHaveTextContent('idle:none:none:false');
        fireEvent.click(screen.getByRole('button', {name: 'Start reduced'}));
        expect(screen.getByLabelText('walkthrough state')).toHaveTextContent('active:0:moose-thermal-response:true');
        fireEvent.click(screen.getByRole('button', {name: 'Next'}));
        expect(screen.getByLabelText('walkthrough state')).toHaveTextContent('active:1:rocets-feed-turbomachinery:true');
        fireEvent.click(screen.getByRole('button', {name: 'Select nozzle'}));
        expect(screen.getByLabelText('walkthrough state')).toHaveTextContent('active:2:rocets-nozzle-performance:false');
        fireEvent.click(screen.getByRole('button', {name: 'Previous'}));
        expect(screen.getByLabelText('walkthrough state')).toHaveTextContent('active:1:rocets-feed-turbomachinery:false');
    });

    it('bridges an active step into scene selection, cutaway mode, and analysis link', () => {
        render(
            <AnalysisLinkRegistryProvider model={buildAnalysisLinkRegistryModel()}>
                <GuidedInvestigationProvider>
                    <ScenePresentationProvider model={buildScenePresentationWorkspaceModel()}>
                        <EvidenceWalkthroughProvider>
                            <EvidenceWalkthroughBridge/>
                            <BridgeProbe/>
                        </EvidenceWalkthroughProvider>
                    </ScenePresentationProvider>
                </GuidedInvestigationProvider>
            </AnalysisLinkRegistryProvider>,
        );

        fireEvent.click(screen.getByRole('button', {name: 'Select stability'}));
        expect(screen.getByLabelText('bridge state'))
            .toHaveTextContent('propulsion-stability:evidence:propulsion-stability');
    });
});

function WalkthroughProbe() {
    const walkthrough = useEvidenceWalkthrough();
    return (
        <>
            <output aria-label="walkthrough state">
                {walkthrough.state.status}:{walkthrough.state.activeStepIndex ?? 'none'}:
                {walkthrough.state.activeStepId ?? 'none'}:{String(walkthrough.state.reducedMotion)}
            </output>
            <button onClick={() => walkthrough.start({reducedMotion: true})} type="button">Start reduced</button>
            <button onClick={walkthrough.next} type="button">Next</button>
            <button onClick={walkthrough.previous} type="button">Previous</button>
            <button onClick={() => walkthrough.selectStep('rocets-nozzle-performance')} type="button">Select nozzle</button>
        </>
    );
}

function BridgeProbe() {
    const walkthrough = useEvidenceWalkthrough();
    const investigation = useGuidedInvestigation();
    const presentation = useScenePresentation();
    const links = useAnalysisLinkRegistry();

    return (
        <>
            <output aria-label="bridge state">
                {investigation.state.selectedComponentId}:{presentation.state.cutawayMode}:{links.state.activeLinkId ?? 'none'}
            </output>
            <button onClick={() => walkthrough.selectStep('rocets-stability')} type="button">Select stability</button>
        </>
    );
}
