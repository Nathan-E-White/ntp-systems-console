import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ActiveCaseProviders} from '../analysis/ActiveCaseProviders';
import {ModelEvidenceSection} from './ModelEvidenceSection';
import {buildActiveCaseWorkspace} from '../../demo/activeCaseWorkspace';
import {computeEngineOutputs} from '../../physics/propulsionModel';
import {generateTransient} from '../../physics/transientModel';
import {DEFAULT_ENGINE_INPUTS, DEFAULT_ENGINE_PRESET_ID} from '../../state/EngineStore';

function renderEvidenceSection() {
    const outputs = computeEngineOutputs(DEFAULT_ENGINE_INPUTS);
    const transient = generateTransient(DEFAULT_ENGINE_INPUTS);
    const model = buildActiveCaseWorkspace({
        selection: DEFAULT_ENGINE_PRESET_ID,
        inputs: DEFAULT_ENGINE_INPUTS,
        outputs,
        transient,
    });

    render(
        <ActiveCaseProviders model={model}>
            <ModelEvidenceSection onReturnToOperatingCase={() => undefined}/>
        </ActiveCaseProviders>,
    );
}

describe('ModelEvidenceSection', () => {
    it('focuses MCNP burnup evidence when the walkthrough starts', async () => {
        renderEvidenceSection();

        fireEvent.click(screen.getByRole('button', {name: 'Start tour'}));

        expect(await screen.findByText('MCNP Burnup Evidence')).toBeInTheDocument();
        expect(screen.getByText('Criticality / burnup evidence in inspection view')).toBeInTheDocument();
        expect(screen.getAllByText('MCNP-like burnup and restart memory').length).toBeGreaterThan(0);
        expect(screen.getByText('Peak xenon worth')).toBeInTheDocument();
    });

    it('moves the walkthrough into BISON fuel-performance evidence', async () => {
        renderEvidenceSection();

        fireEvent.click(screen.getByRole('button', {name: 'Start tour'}));
        fireEvent.click(screen.getByRole('button', {name: 'Next'}));

        expect(await screen.findByText('BISON Fuel Performance Evidence')).toBeInTheDocument();
        expect(screen.getByText('BISON fuel-performance evidence in inspection view')).toBeInTheDocument();
        expect(screen.getAllByText('BISON postprocessor history').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Final fuel-performance review summary').length).toBeGreaterThan(0);
    });
});
