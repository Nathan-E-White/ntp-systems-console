import {describe, expect, it} from 'vitest';

import {collectInputDependencies, findCalculationNode} from '../physics/calculationTrace';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {generateTransient, generateTransientEvaluation} from '../physics/transientModel';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';
import type {ReferenceControlledEngineOutputs} from '../types/EngineState';

describe('reference-controlled model evaluation', () => {
    it('locks the prepared profile postures and benchmark closure', () => {
        const baseline = evaluateEngineCase(ENGINE_INPUT_PRESETS.baselineStartup);
        const investigation = evaluateEngineCase(ENGINE_INPUT_PRESETS.thermalMarginInvestigation);
        expect(baseline.outputs.outletTemperatureK).toBeCloseTo(2550, 8);
        expect(baseline.outputs.thrustKn).toBeCloseTo(113.5746, 3);
        expect(baseline.outputs.stabilityStatus).toBe('watch');
        expect(baseline.basis.completeness).toBe('screening');
        expect(investigation.outputs.thermalMarginK).toBeLessThan(0);
        expect(investigation.outputs.stabilityStatus).toBe('limit');
});
    it('makes every displayed output equal its root trace result', () => {
        const evaluation = evaluateEngineCase(ENGINE_INPUT_PRESETS.baselineStartup);
        const displayedKeys: readonly (keyof ReferenceControlledEngineOutputs)[] = [
            'outletTemperatureK',
            'exhaustVelocityMPerSec',
            'specificImpulseSec',
            'thrustKn',
            'peakChannelWallTemperatureK',
            'channelWallCriterionMarginK',
            'pressureDropMpa',
            'basisCompletenessPercent',
            'reviewPosture',
        ];
        displayedKeys.forEach((key) => {
            const value = evaluation.outputs[key];
            expect(findCalculationNode(evaluation.trace, key as keyof typeof evaluation.outputs)?.finalValue)
                .toBe(value);
        });
    });

    it('reports source-controlled dependencies for wall criterion margin', () => {
        const evaluation = evaluateEngineCase(ENGINE_INPUT_PRESETS.baselineStartup);
        expect(collectInputDependencies(evaluation.trace, 'thermal-margin')).toEqual(
            expect.arrayContaining([
                'channelWallCriterionK',
                'channelHydraulicDiameterM',
                'channelCount',
                'channelLengthM',
                'thermalPowerMw',
                'massFlowKgPerSec',
                'inletTemperatureK',
            ]),
        );
    });

    it('marks a cryogenic ideal-gas inlet incomplete instead of clamping a plausible result', () => {
        const evaluation = evaluateEngineCase({
            ...ENGINE_INPUT_PRESETS.baselineStartup,
            inletTemperatureK: 20,
            thermalCouplingMode: 'fixedEfficiency',
        });
        expect(evaluation.basis.completeness).toBe('incomplete');
        expect(evaluation.basis.diagnostics.some((item) => item.id === 'inlet-real-fluid-required')).toBe(true);
    });

    it('keeps the unsupported model isolated behind the explicit legacy profile', () => {
        const legacy = evaluateEngineCase(ENGINE_INPUT_PRESETS.legacyDemo);
        expect(legacy.basis.completeness).toBe('legacy');
        expect(legacy.trace.nodes.every((node) => node.equationId.startsWith('LEGACY-'))).toBe(true);
        expect(evaluateEngineCase(ENGINE_INPUT_PRESETS.baselineStartup).trace.nodes
            .some((node) => node.equationId.startsWith('LEGACY-'))).toBe(false);
    });

    it('reproduces every plotted transient value from its point evaluation', () => {
        const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const points = generateTransient(inputs);
        const evaluations = generateTransientEvaluation(inputs);
        expect(points).toHaveLength(41);
        expect(points[0].outletTemperatureK).toBeLessThan(points.at(-1)!.outletTemperatureK);
        points.forEach((point, index) => {
            const evaluation = evaluations[index].evaluation.outputs;
            expect(point.outletTemperatureK).toBe(evaluation.outletTemperatureK);
            expect(point.thrustKn).toBe(evaluation.thrustKn);
            expect(point.channelWallCriterionMarginK).toBe(evaluation.channelWallCriterionMarginK);
            expect(point.basisCompletenessPercent).toBe(evaluation.basisCompletenessPercent);
        });
    });
});
