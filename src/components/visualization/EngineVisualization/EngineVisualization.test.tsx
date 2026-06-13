import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {EngineVisualization} from './EngineVisualization';
import {buildEngineVisualizationModel} from './EngineVisualization.model';

describe('EngineVisualization', () => {
    it('renders the root visualization boundary from its provider model', () => {
        render(<EngineVisualization model={buildEngineVisualizationModel()}/>);

        expect(screen.getByRole('region', {name: 'Representative Nuclear Thermal Propulsion Engine'}))
            .toHaveAttribute('data-status', 'stub');
    });
});
