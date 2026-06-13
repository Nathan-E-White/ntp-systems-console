import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {FlowPathOverlay} from './FlowPathOverlay';
import {buildFlowPathOverlayModel} from './FlowPathOverlay.model';
import type {ScenePresentationState} from '../visualizationTypes';

describe('FlowPathOverlay', () => {
    it('declares the fixture-mapped flow segments', () => {
        render(<FlowPathOverlay model={buildFlowPathOverlayModel()}/>);
        expect(screen.getByRole('img', {name: 'Propellant flow-path overlay'}))
            .toHaveAttribute('data-segment-count', '5');
    });

    it('suppresses particle animation when reduced motion is requested', () => {
        const presentation: ScenePresentationState = {
            mode: 'flow',
            activeCueId: 'follow-flow',
            highlightedTargetIds: ['flow-path-overlay'],
            thermalPower: 0.5,
            flowRate: 0.8,
            thermalMargin: 0.5,
            controlDrumAngleDegrees: 45,
            shieldingMassFraction: 0.08,
            yawRadians: 0.35,
            reducedMotion: true,
            selectedComponentId: 'propulsion-stability',
            cueProgress: 0.4,
            playbackOwner: 'theatre',
            focusIntensity: 1,
            cameraPosition: [5.2, 2.4, 7],
            activeViewPresetId: 'flow-path',
            explodedViewProgress: 0,
            cameraTransitionOwner: 'user',
            overlaysVisible: false,
            selectedAxialRegionIndex: null,
        };
        render(
            <FlowPathOverlay
                initiallyAnimated
                model={buildFlowPathOverlayModel()}
                presentation={presentation}
            />,
        );
        const overlay = screen.getByRole('img', {name: 'Propellant flow-path overlay'});
        expect(overlay).toHaveAttribute('data-highlighted', 'true');
        expect(overlay).toHaveAttribute('data-animated', 'false');
    });
});
