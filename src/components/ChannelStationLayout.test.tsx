import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {buildChannelAnalysisResult} from '../physics/channelAnalysisModel';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';
import {ChannelStationLayout} from './ChannelStationLayout';

describe('ChannelStationLayout', () => {
    it('renders every station and reports selection from the cutaway', () => {
        const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const evaluation = evaluateEngineCase(inputs);
        const analysis = buildChannelAnalysisResult(inputs, evaluation.outputs, evaluation.channel, 4);
        const onSelectStation = vi.fn();

        render(
            <ChannelStationLayout
                onSelectStation={onSelectStation}
                regions={analysis.axialRegions}
                selectedStation={analysis.selectedStation}
                stations={analysis.stations}
            />,
        );

        expect(screen.getByRole('img', {name: /36 channel stations/i})).toBeTruthy();
        expect(screen.getByText('Core A')).toBeTruthy();
        expect(screen.getByText('Core B')).toBeTruthy();
        expect(screen.getByText('Core C')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: /station 12, wall temperature/i}));
        expect(onSelectStation).toHaveBeenCalledWith(11);
    });

    it('switches the station color metric', () => {
        const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const evaluation = evaluateEngineCase(inputs);
        const analysis = buildChannelAnalysisResult(inputs, evaluation.outputs, evaluation.channel, null);

        render(
            <ChannelStationLayout
                onSelectStation={vi.fn()}
                regions={analysis.axialRegions}
                selectedStation={analysis.selectedStation}
                stations={analysis.stations}
            />,
        );

        fireEvent.click(screen.getByRole('button', {name: 'Pressure'}));
        expect(screen.getByRole('button', {name: 'Pressure'}).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('img', {name: /colored by static pressure/i})).toBeTruthy();
    });
});
