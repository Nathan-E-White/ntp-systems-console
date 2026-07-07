import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {NozzleAssembly} from './NozzleAssembly';
import {buildNozzleAssemblyModel} from './NozzleAssembly.model';

describe('NozzleAssembly', () => {
    it('keeps fixture-derived throat and exit dimensions in its model boundary', () => {
        render(<NozzleAssembly model={buildNozzleAssemblyModel()}/>);
        const assembly = screen.getByRole('group', {name: 'Representative nozzle assembly'});
        expect(assembly).toHaveAttribute('data-expansion-radius', '0.72');
        expect(assembly).toHaveAttribute('data-wall-layer-count', '3');
        expect(assembly).toHaveAttribute('data-regen-channel-count', '7');
    });
});
