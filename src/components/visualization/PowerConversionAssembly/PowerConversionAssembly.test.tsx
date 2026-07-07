import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {PowerConversionAssembly} from './PowerConversionAssembly';
import {buildPowerConversionAssemblyModel} from './PowerConversionAssembly.model';

describe('PowerConversionAssembly', () => {
    it('declares the primary and turbine branches', () => {
        render(<PowerConversionAssembly model={buildPowerConversionAssemblyModel()}/>);
        expect(screen.getByRole('group', {name: 'Representative power-conversion assembly'}))
            .toHaveAttribute('data-branch-count', '2');
    });
});
