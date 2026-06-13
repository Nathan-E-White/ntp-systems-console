import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ReactorAssembly} from './ReactorAssembly';
import {buildReactorAssemblyModel} from './ReactorAssembly.model';
import type {ScenePresentationState} from '../visualizationTypes';

const presentation: ScenePresentationState = {
    mode: 'thermal',
    activeCueId: 'inspect-core',
    highlightedTargetIds: ['reactor-assembly'],
    thermalPower: 0.82,
    flowRate: 0.4,
    thermalMargin: 0.2,
    controlDrumAngleDegrees: 78,
    shieldingMassFraction: 0.09,
    yawRadians: -1.15,
    reducedMotion: false,
    selectedComponentId: 'thermal-margin',
    cueProgress: 0.65,
    playbackOwner: 'theatre',
    focusIntensity: 1,
    cameraPosition: [4.2, 2.2, 5.8],
    activeViewPresetId: 'reactor',
    explodedViewProgress: 0,
    cameraTransitionOwner: 'user',
    overlaysVisible: false,
    selectedAxialRegionIndex: 1,
};

describe('ReactorAssembly', () => {
    it('exposes the fixture-derived axial and azimuthal region layout', () => {
        render(<ReactorAssembly model={buildReactorAssemblyModel()} presentation={presentation}/>);
        const assembly = screen.getByRole('group', {name: 'Representative reactor assembly'});
        expect(assembly).toHaveAttribute('data-region-layout', '3x6');
        expect(assembly).toHaveAttribute('data-highlighted', 'true');
        expect(assembly).toHaveAttribute('data-control-angle', '78');
        expect(assembly).toHaveAttribute('data-section-layer-count', '4');
        expect(assembly).toHaveAttribute('data-fuel-channel-count', '13');
        expect(assembly).toHaveAttribute('data-selected-axial-region', '1');
    });
});
