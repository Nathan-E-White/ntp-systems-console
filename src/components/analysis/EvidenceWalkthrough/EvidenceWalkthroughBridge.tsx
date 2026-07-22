import {useEffect} from 'react';

import {useActiveCase} from '../../activeCase/ActiveCase';
import {useEvidenceWalkthrough} from './EvidenceWalkthrough';

export function EvidenceWalkthroughBridge() {
    const walkthrough = useEvidenceWalkthrough();
    const activeCase = useActiveCase();
    const activeStep = walkthrough.activeStep;

    useEffect(() => {
        if (!activeStep || walkthrough.state.status !== 'active') return;
        activeCase.openEvidence(activeStep.componentId);
    }, [
        activeStep,
        activeCase,
        walkthrough.state.status,
    ]);

    return null;
}
