import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import type {ReactElement} from 'react';
import {describe, expect, it} from 'vitest';

import {
    FixtureEvidenceWorkspace,
    useFixtureEvidenceWorkspace,
} from './FixtureEvidenceWorkspace';
import {buildFixtureEvidenceWorkspaceModel} from './FixtureEvidenceWorkspace.model';

function FixtureSelectionProbe(): ReactElement {
    const {model, state, selectFixture} = useFixtureEvidenceWorkspace();

    return (
        <div>
            <span data-testid="selected-fixture">{state.selectedFixtureId ?? 'none'}</span>
            {model.fixtures.slice(0, 2).map((fixture) => (
                <button
                    key={fixture.id}
                    onClick={() => selectFixture(fixture.id)}
                    type="button"
                >
                    {fixture.id}
                </button>
            ))}
        </div>
    );
}

describe('FixtureEvidenceWorkspace', () => {
    it('catalogs input and output fixtures without implying execution', () => {
        render(<FixtureEvidenceWorkspace model={buildFixtureEvidenceWorkspaceModel()}/>);
        expect(screen.getByRole('region', {name: 'Engineering fixture evidence'}))
            .toHaveAttribute('data-fixture-count', '6');

        const fixtureIds = buildFixtureEvidenceWorkspaceModel().fixtures.map((fixture) => fixture.id);
        expect(fixtureIds).toContain('mcnp-criticality-input');
        expect(fixtureIds).toContain('mcnp-criticality-output');
        expect(fixtureIds).toContain('bison-output');
    });

    it('allows fixture selection independent of external case workflow', () => {
        render(
            <FixtureEvidenceWorkspace model={buildFixtureEvidenceWorkspaceModel()}>
                <FixtureSelectionProbe/>
            </FixtureEvidenceWorkspace>,
        );

        const firstButton = screen.getByRole('button', {name: 'mcnp-criticality-input'});
        const secondButton = screen.getByRole('button', {name: 'mcnp-criticality-output'});
        const selected = screen.getByTestId('selected-fixture');

        expect(selected).toHaveTextContent('none');
        fireEvent.click(firstButton);
        expect(selected).toHaveTextContent('mcnp-criticality-input');
        fireEvent.click(secondButton);
        expect(selected).toHaveTextContent('mcnp-criticality-output');
    });

    it('keeps fixture catalog data immutable when selection state changes', () => {
        const model = buildFixtureEvidenceWorkspaceModel();
        const catalogBaseline = JSON.parse(JSON.stringify(model));

        render(
            <FixtureEvidenceWorkspace model={model}>
                <FixtureSelectionProbe/>
            </FixtureEvidenceWorkspace>,
        );

        fireEvent.click(screen.getByRole('button', {name: 'mcnp-criticality-input'}));
        fireEvent.click(screen.getByRole('button', {name: 'mcnp-criticality-output'}));
        expect(JSON.parse(JSON.stringify(model))).toEqual(catalogBaseline);
        expect(model.fixtures).toHaveLength(6);
    });
});
