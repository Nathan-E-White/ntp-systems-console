import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {GuidedInvestigationProvider, useGuidedInvestigation} from './GuidedInvestigation';
import {ActiveCaseProvider} from '../../activeCase';

function SelectionProbe() {
    const investigation = useGuidedInvestigation();
    return (
        <>
            <output aria-label="selection">
                {investigation.state.selectedComponentId}:{investigation.state.owner}
            </output>
            <button
                onClick={() => investigation.selectComponent('reactor-criticality')}
                type="button"
            >
                Select criticality
            </button>
            <button
                onClick={() => investigation.selectComponent('thermal-margin', 'theatre')}
                type="button"
            >
                Theatre focus
            </button>
        </>
    );
}

describe('GuidedInvestigationProvider', () => {
    it('adapts Active Case evidence selection for manual and Theatre-owned selection', () => {
        render(
            <ActiveCaseProvider caseId="baseline">
                <GuidedInvestigationProvider>
                    <SelectionProbe/>
                </GuidedInvestigationProvider>
            </ActiveCaseProvider>,
        );

        expect(screen.getByLabelText('selection')).toHaveTextContent('engine-overview:user');
        fireEvent.click(screen.getByRole('button', {name: 'Select criticality'}));
        expect(screen.getByLabelText('selection')).toHaveTextContent('reactor-criticality:user');
        fireEvent.click(screen.getByRole('button', {name: 'Theatre focus'}));
        expect(screen.getByLabelText('selection')).toHaveTextContent('thermal-margin:theatre');
    });
});
