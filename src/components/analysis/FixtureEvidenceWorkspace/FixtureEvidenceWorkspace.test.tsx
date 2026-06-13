import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {FixtureEvidenceWorkspace} from './FixtureEvidenceWorkspace';
import {buildFixtureEvidenceWorkspaceModel} from './FixtureEvidenceWorkspace.model';

describe('FixtureEvidenceWorkspace', () => {
    it('catalogs input and output fixtures without implying execution', () => {
        render(<FixtureEvidenceWorkspace model={buildFixtureEvidenceWorkspaceModel()}/>);
        expect(screen.getByRole('region', {name: 'Engineering fixture evidence'}))
            .toHaveAttribute('data-fixture-count', '4');
    });
});
