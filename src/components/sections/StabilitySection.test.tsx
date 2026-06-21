import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ActiveCaseProviders} from '../analysis/ActiveCaseProviders';
import {buildActiveCaseWorkspace} from '../../demo/activeCaseWorkspace';
import {computeEngineOutputs} from '../../physics/propulsionModel';
import {generateTransient} from '../../physics/transientModel';
import {DEFAULT_ENGINE_INPUTS, DEFAULT_ENGINE_PRESET_ID} from '../../state/EngineStore';
import {StabilitySection} from './StabilitySection';

function renderStabilitySection() {
    const inputs = DEFAULT_ENGINE_INPUTS;
    const outputs = computeEngineOutputs(inputs);
    const model = buildActiveCaseWorkspace({
        selection: DEFAULT_ENGINE_PRESET_ID,
        inputs,
        outputs,
        transient: generateTransient(inputs),
    });

    render(
        <ActiveCaseProviders model={model}>
            <StabilitySection inputs={inputs} outputs={outputs}/>
        </ActiveCaseProviders>,
    );
}

describe('StabilitySection', () => {
    it('renders linked summary tiles for the stability investigation panel', () => {
        renderStabilitySection();

        expect(screen.getByRole('heading', {name: 'Stability investigation'})).toBeInTheDocument();

        [
            ['Controlling Interval', '#stability-controlling-interval'],
            ['Advisory state', '#stability-advisory-state'],
            ['Coupled proxy alignment', '#stability-coupled-proxy-alignment'],
            ['Solver health', '#stability-solver-health'],
            ['Boundary', '#stability-boundary'],
        ].forEach(([label, href]) => {
            expect(screen.getByRole('link', {name: new RegExp(label, 'i')})).toHaveAttribute('href', href);
            expect(document.querySelector(href)).toBeInTheDocument();
        });
    });

    it('shows the computed fixture evidence and boundary language', () => {
        renderStabilitySection();

        expect(screen.getByText(/650 s restart\/cooldown transition/u)).toBeInTheDocument();
        expect(screen.getAllByText('nominal -> recovering -> reset -> watch -> nominal').length).toBeGreaterThan(0);
        expect(screen.getByText('0.001 at 520 s')).toBeInTheDocument();
        expect(screen.getByText(/chamber pressure target at 94.4%/u)).toBeInTheDocument();
        expect(screen.getByText('Advisory fixture diagnosis, not qualified engine stability margin.')).toBeInTheDocument();
        expect(screen.getByText('Hydraulic resistance is an operating-point comparison, not a Ledinegg slope proof.')).toBeInTheDocument();
    });
});
