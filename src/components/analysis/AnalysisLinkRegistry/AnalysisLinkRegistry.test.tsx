import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {AnalysisLinkRegistry} from './AnalysisLinkRegistry';
import {buildAnalysisLinkRegistryModel} from './AnalysisLinkRegistry.model';

describe('AnalysisLinkRegistry', () => {
    it('declares cross-domain links without performing numerical coupling', () => {
        render(<AnalysisLinkRegistry model={buildAnalysisLinkRegistryModel()}/>);
        expect(screen.getByRole('region', {name: 'Analysis link registry'}))
            .toHaveAttribute('data-link-count', '2');
    });
});
