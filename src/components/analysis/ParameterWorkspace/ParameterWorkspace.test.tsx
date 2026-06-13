import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ENGINE_INPUT_PRESETS} from '../../../state/EngineStore';
import {ParameterWorkspace} from './ParameterWorkspace';
import {buildParameterWorkspaceModel} from './ParameterWorkspace.model';

describe('ParameterWorkspace', () => {
    it('publishes editable parameter definitions separately from fixture evidence', () => {
        render(<ParameterWorkspace model={buildParameterWorkspaceModel(ENGINE_INPUT_PRESETS.baselineStartup)}/>);
        expect(screen.getByRole('region', {name: 'Operating parameters'}))
            .toHaveAttribute('data-parameter-count', '15');
    });
});
