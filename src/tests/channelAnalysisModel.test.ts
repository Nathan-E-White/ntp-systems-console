import {describe, expect, it} from 'vitest';

import {buildChannelAnalysisResult, getAxialRegionForStation} from '../physics/channelAnalysisModel';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';

describe('channel analysis model', () => {
    it('exposes all calculated stations and maps them to the three fixture axial regions', () => {
        const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const evaluation = evaluateEngineCase(inputs);
        const analysis = buildChannelAnalysisResult(inputs, evaluation.outputs, evaluation.channel, null);

        expect(analysis.stations).toHaveLength(36);
        expect(analysis.axialRegions).toHaveLength(3);
        expect(analysis.axialRegions.flatMap((region) => region.stationIndices)).toHaveLength(36);
        expect(getAxialRegionForStation(analysis.peakWallStation)).not.toBeNull();
        expect(analysis.selectedStation).toEqual(analysis.peakWallStation);
    });

    it('selects a station without changing the immutable channel result', () => {
        const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const evaluation = evaluateEngineCase(inputs);
        const originalStations = evaluation.channel!.stations;
        const analysis = buildChannelAnalysisResult(inputs, evaluation.outputs, evaluation.channel, 4);

        expect(analysis.selectedStation?.index).toBe(4);
        expect(evaluation.channel!.stations).toBe(originalStations);
    });

    it('reports the exceeded wall criterion for the investigation case', () => {
        const inputs = ENGINE_INPUT_PRESETS.thermalMarginInvestigation;
        const evaluation = evaluateEngineCase(inputs);
        const analysis = buildChannelAnalysisResult(inputs, evaluation.outputs, evaluation.channel, null);

        expect(evaluation.outputs.channelWallCriterionMarginK).toBeLessThan(0);
        expect(analysis.reviewFlags).toEqual(expect.arrayContaining([
            expect.objectContaining({id: 'wall-criterion-exceeded', severity: 'limit'}),
            expect.objectContaining({id: 'pressure-basis-incomplete', severity: 'incomplete'}),
            expect.objectContaining({id: 'transient-model-unavailable'}),
        ]));
    });

    it('keeps fixture correlations qualitative and source-specific', () => {
        const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const evaluation = evaluateEngineCase(inputs);
        const analysis = buildChannelAnalysisResult(inputs, evaluation.outputs, evaluation.channel, null);

        expect(analysis.evidenceCorrelations.map((record) => record.fixtureArtifactId))
            .toEqual(['mcnp-output', 'moose-output', 'rocets-output']);
        expect(analysis.evidenceCorrelations.every((record) => record.claimBoundary.length > 20)).toBe(true);
    });
});
