import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {GuidedInvestigationProvider, useGuidedInvestigation} from './GuidedInvestigation';

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
            <button onClick={investigation.resetSelection} type="button">Reset selection</button>
        </>
    );
}

describe('GuidedInvestigationProvider', () => {
    it('tracks manual and Theatre-owned presentation selection without domain state', () => {
        render(
            <GuidedInvestigationProvider>
                <SelectionProbe/>
            </GuidedInvestigationProvider>,
        );

        expect(screen.getByLabelText('selection')).toHaveTextContent('engine-overview:user');
        fireEvent.click(screen.getByRole('button', {name: 'Select criticality'}));
        expect(screen.getByLabelText('selection')).toHaveTextContent('reactor-criticality:user');
        fireEvent.click(screen.getByRole('button', {name: 'Theatre focus'}));
        expect(screen.getByLabelText('selection')).toHaveTextContent('thermal-margin:theatre');
        fireEvent.click(screen.getByRole('button', {name: 'Reset selection'}));
        expect(screen.getByLabelText('selection')).toHaveTextContent('engine-overview:user');
    });
});
