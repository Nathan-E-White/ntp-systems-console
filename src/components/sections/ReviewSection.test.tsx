import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ActiveCaseProviders} from '../analysis/ActiveCaseProviders';
import {buildActiveCaseWorkspace} from '../../demo/activeCaseWorkspace';
import {computeEngineOutputs} from '../../physics/propulsionModel';
import {generateTransient} from '../../physics/transientModel';
import {DEFAULT_ENGINE_INPUTS, DEFAULT_ENGINE_PRESET_ID} from '../../state/EngineStore';
import {ReviewSection} from './ReviewSection';

function renderReviewSection() {
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
            <ReviewSection inputs={DEFAULT_ENGINE_INPUTS} outputs={outputs}/>
        </ActiveCaseProviders>,
    );
}

describe('ReviewSection', () => {
    it('keeps ROCETS stability as compact review support', () => {
        renderReviewSection();

        expect(screen.getByRole('heading', {name: 'Compact Stability Disposition'})).toBeInTheDocument();
        expect(screen.getByText('Controlling interval')).toBeInTheDocument();
        expect(screen.getByText('Advisory path')).toBeInTheDocument();
        expect(screen.getByText('not a qualified margin')).toBeInTheDocument();
    });
});
