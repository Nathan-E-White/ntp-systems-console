import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {computeEngineOutputs} from '../../../physics/propulsionModel';
import {ENGINE_INPUT_PRESETS} from '../../../state/EngineStore';
import {OutputWorkspace} from './OutputWorkspace';
import {buildOutputWorkspaceModel} from './OutputWorkspace.model';

describe('OutputWorkspace', () => {
    it('labels the reduced-order output projection', () => {
        const outputs = computeEngineOutputs(ENGINE_INPUT_PRESETS.baselineStartup);
        render(<OutputWorkspace model={buildOutputWorkspaceModel(outputs)}/>);
        expect(screen.getByRole('region', {name: 'Calculated outputs'}))
            .toHaveAttribute('data-output-count', '8');
    });
});
