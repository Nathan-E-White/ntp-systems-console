import {describe, expect, it} from 'vitest';

import {buildAnalysisLinkRegistryModel} from './AnalysisLinkRegistry.model';

describe('buildAnalysisLinkRegistryModel', () => {
    it('builds the default analysis link registry model', () => {
        const model = buildAnalysisLinkRegistryModel();

        expect(model.links).toHaveLength(2);
        expect(model.boundary).toEqual({
            scope: 'Declares traceable links among fixtures, inputs, outputs, charts, and visualization targets.',
            owns: ['cross-domain identifiers', 'link descriptions', 'selection propagation contract'],
            excludes: ['numerical coupling', 'solver orchestration', 'component rendering'],
        });
    });

    it('declares the thermal margin traceability link', () => {
        const model = buildAnalysisLinkRegistryModel();

        expect(model.links).toContainEqual({
            id: 'thermal-margin',
            fixtureFamilies: ['mcnp', 'moose'],
            inputKeys: ['thermalPowerMw', 'massFlowKgPerSec', 'fuelTemperatureLimitK'],
            outputKeys: ['peakChannelWallTemperatureK', 'channelWallCriterionMarginK'],
            chartSeriesIds: ['reduced-order-transient'],
            visualizationTargetIds: ['reactor-assembly', 'nozzle-assembly'],
            interpretation: 'Connect power-shape context and thermomechanical limits to the reduced-order margin.',
        });
    });

    it('declares the propulsion stability traceability link', () => {
        const model = buildAnalysisLinkRegistryModel();

        expect(model.links).toContainEqual({
            id: 'propulsion-stability',
            fixtureFamilies: ['rocets'],
            inputKeys: ['massFlowKgPerSec', 'chamberPressureMpa'],
            outputKeys: ['thrustKn', 'pressureDropMpa', 'basisCompletenessPercent'],
            chartSeriesIds: ['reduced-order-transient'],
            visualizationTargetIds: ['feed-system-assembly', 'power-conversion-assembly', 'flow-path-overlay'],
            interpretation: 'Connect system transient evidence to flow, pressure-drop, thrust, and stability posture.',
        });
    });

    it('allows callers to override the model for fixtures and focused test cases', () => {
        const model = buildAnalysisLinkRegistryModel({
            links: [
                {
                    id: 'custom-link',
                    fixtureFamilies: ['mcnp'],
                    inputKeys: ['thermalPowerMw'],
                    outputKeys: ['channelWallCriterionMarginK'],
                    chartSeriesIds: ['custom-series'],
                    visualizationTargetIds: ['custom-target'],
                    interpretation: 'Custom test-only traceability link.',
                },
            ],
        });

        expect(model.links).toEqual([
            {
                id: 'custom-link',
                fixtureFamilies: ['mcnp'],
                inputKeys: ['thermalPowerMw'],
                outputKeys: ['channelWallCriterionMarginK'],
                chartSeriesIds: ['custom-series'],
                visualizationTargetIds: ['custom-target'],
                interpretation: 'Custom test-only traceability link.',
            },
        ]);
        expect(model.boundary.scope).toBe(
            'Declares traceable links among fixtures, inputs, outputs, charts, and visualization targets.',
        );
    });

    it('allows the boundary contract to be overridden independently from the default links', () => {
        const model = buildAnalysisLinkRegistryModel({
            boundary: {
                scope: 'Test-only scope.',
                owns: ['test-owned responsibility'],
                excludes: ['test-excluded responsibility'],
            },
        });

        expect(model.links.map((link) => link.id)).toEqual(['thermal-margin', 'propulsion-stability']);
        expect(model.boundary).toEqual({
            scope: 'Test-only scope.',
            owns: ['test-owned responsibility'],
            excludes: ['test-excluded responsibility'],
        });
    });
});
