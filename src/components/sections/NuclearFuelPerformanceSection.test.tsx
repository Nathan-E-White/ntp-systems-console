import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ActiveCaseProviders} from '../analysis/ActiveCaseProviders';
import {buildActiveCaseWorkspace} from '../../demo/activeCaseWorkspace';
import {computeEngineOutputs} from '../../physics/propulsionModel';
import {generateTransient} from '../../physics/transientModel';
import {DEFAULT_ENGINE_INPUTS, DEFAULT_ENGINE_PRESET_ID} from '../../state/EngineStore';
import {NuclearFuelPerformanceSection} from './NuclearFuelPerformanceSection';

function renderNuclearSection() {
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
            <NuclearFuelPerformanceSection/>
        </ActiveCaseProviders>,
    );
}

describe('NuclearFuelPerformanceSection', () => {
    it('surfaces BISON and MCNP burnup fixture values without validation claims', () => {
        renderNuclearSection();

        expect(screen.getByRole('heading', {name: 'Nuclear Fuel Performance'})).toBeInTheDocument();
        expect(screen.getAllByText('2,966.5').length).toBeGreaterThan(0);
        expect(screen.getAllByText('2,608.1').length).toBeGreaterThan(0);
        expect(screen.getByText('0.06728')).toBeInTheDocument();
        expect(screen.getByText(/k-effective trend: 1.01039 -> 0.99284/i)).toBeInTheDocument();
        expect(screen.getAllByText(/not validated/i).length).toBeGreaterThan(0);
    });

    it('renders BISON transient, MCNP burnup, axial temperature, and hydrogen evidence panels', () => {
        renderNuclearSection();

        expect(screen.getByText('BISON-like fuel performance history')).toBeInTheDocument();
        expect(screen.getByText('MCNP-like burnup and restart memory')).toBeInTheDocument();
        expect(screen.getByText('BISON-like final axial temperature profile')).toBeInTheDocument();
        expect(screen.getByText('BISON-like hot-wall hydrogen profile summary')).toBeInTheDocument();
    });
});
