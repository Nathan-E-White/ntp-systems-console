import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {EngineAssembly} from './EngineAssembly';
import {buildEngineAssemblyModel} from './EngineAssembly.model';
import type {ScenePresentationState} from '../visualizationTypes';

describe('EngineAssembly', () => {
    it('composes the representative engine assemblies in a shared coordinate system', () => {
        render(<EngineAssembly model={buildEngineAssemblyModel()}/>);
        expect(screen.getByRole('group', {name: 'Representative engine assembly'}))
            .toHaveAttribute('data-part-count', '4');
        expect(screen.getByRole('group', {name: 'Representative reactor assembly'}))
            .toHaveAttribute('data-region-layout', '3x6');
        expect(screen.getByRole('group', {name: 'Representative nozzle assembly'}))
            .toHaveAttribute('data-expansion-radius', '0.72');
    });

    it('accepts bounded exploded-view progress as presentation-only state', () => {
        render(
            <EngineAssembly
                model={buildEngineAssemblyModel()}
                presentation={{...presentation, cutawayMode: 'layers', explodedViewProgress: 1}}
            />,
        );
        expect(screen.getByRole('group', {name: 'Representative engine assembly'}))
            .toHaveAttribute('data-exploded-progress', '1');
        expect(screen.getByRole('group', {name: 'Representative engine assembly'}))
            .toHaveAttribute('data-cutaway-mode', 'layers');
    });
});

const presentation: ScenePresentationState = {
    mode: 'systems',
    activeCueId: null,
    highlightedTargetIds: [],
    thermalPower: 0.5,
    flowRate: 0.5,
    thermalMargin: 0.5,
    controlDrumAngleDegrees: 45,
    shieldingMassFraction: 0.08,
    yawRadians: 0,
    reducedMotion: false,
    selectedComponentId: 'engine-overview',
    cueProgress: 0,
    playbackOwner: 'user',
    focusIntensity: 0,
    cameraPosition: [8.4, 4.4, 11.8],
    activeViewPresetId: 'fit-engine',
    cutawayMode: 'assembled',
    explodedViewProgress: 0,
    cameraTransitionOwner: 'user',
    overlaysVisible: false,
    selectedAxialRegionIndex: null,
};
