import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {SceneCalloutOverlay} from './SceneCalloutOverlay';
import {buildSceneCalloutOverlayModel} from './SceneCalloutOverlay.model';

describe('SceneCalloutOverlay', () => {
    it('keeps provenance-bearing callouts in a DOM overlay boundary', () => {
        render(
            <SceneCalloutOverlay
                model={buildSceneCalloutOverlayModel()}
                visibleCalloutIds={['core']}
            />,
        );
        expect(screen.getByRole('complementary', {name: 'Scene traceability callouts'}))
            .toHaveAttribute('data-callout-count', '3');
        expect(screen.getByText('Synthetic MCNP-like fixture')).toBeVisible();
        expect(screen.getByText(/not a design schematic/i)).toBeVisible();
    });
});
