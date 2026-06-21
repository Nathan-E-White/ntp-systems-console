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
    it('focuses the MOOSE card with rich evidence when the walkthrough starts', async () => {
        renderEvidenceSection();

        fireEvent.click(screen.getByRole('button', {name: 'Start tour'}));

        expect(await screen.findByText('MOOSE Thermal Evidence')).toBeInTheDocument();
        expect(screen.getByText('Thermomechanics evidence in inspection view')).toBeInTheDocument();
        expect(screen.getAllByText('Postprocessor time history').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Final postprocessor values').length).toBeGreaterThan(0);
    });

    it('moves the walkthrough into RoCETS tabbed evidence', async () => {
        renderEvidenceSection();

        fireEvent.click(screen.getByRole('button', {name: 'Start tour'}));
        fireEvent.click(screen.getByRole('button', {name: 'Next'}));

        expect(await screen.findByText('RoCETS System Evidence')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Feed / turbomachinery'})).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getAllByText('Feed and turbomachinery history').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Mission phases').length).toBeGreaterThan(0);
    });
});
