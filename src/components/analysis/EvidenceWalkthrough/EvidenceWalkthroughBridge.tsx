import {useEffect} from 'react';

import {useAnalysisLinkRegistry} from '../AnalysisLinkRegistry/AnalysisLinkRegistry';
import {
    useGuidedInvestigation,
    useScenePresentation,
} from '../../visualization';
import {useEvidenceWalkthrough} from './EvidenceWalkthrough';

export function EvidenceWalkthroughBridge() {
    const walkthrough = useEvidenceWalkthrough();
    const investigation = useGuidedInvestigation();
    const presentation = useScenePresentation();
    const links = useAnalysisLinkRegistry();
    const activeStep = walkthrough.activeStep;
    const {activateLink} = links;
    const {selectComponent} = investigation;
    const {selectCutawayMode, selectPreset} = presentation;

    useEffect(() => {
        if (!activeStep || walkthrough.state.status !== 'active') return;
        selectComponent(activeStep.componentId);
        selectCutawayMode(activeStep.cutawayMode);
        selectPreset(activeStep.scenePresetId);
        activateLink(activeStep.analysisLinkId);
    }, [
        activeStep,
        activateLink,
        selectComponent,
        selectCutawayMode,
        selectPreset,
        walkthrough.state.status,
    ]);

    return null;
}
