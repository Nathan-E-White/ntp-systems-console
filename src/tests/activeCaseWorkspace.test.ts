import {describe, expect, it} from 'vitest';

import {buildActiveCaseWorkspace} from '../demo/activeCaseWorkspace';
import {computeEngineOutputs} from '../physics/propulsionModel';
import {generateTransient} from '../physics/transientModel';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';

describe('active case workspace adapter', () => {
    it('keeps fixture evidence immutable when a manual what-if changes calculated data', () => {
        const baselineInputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const baseline = buildActiveCaseWorkspace({
            selection: 'baselineStartup',
            inputs: baselineInputs,
            outputs: computeEngineOutputs(baselineInputs),
            transient: generateTransient(baselineInputs),
        });
        const fixtureSnapshot = JSON.stringify(baseline.fixtures.fixtures);
        const whatIfInputs = {
            ...baselineInputs,
            thermalCouplingMode: 'fixedEfficiency' as const,
            thermalCouplingEfficiency: 0.9295175369895565,
            thermalPowerMw: baselineInputs.thermalPowerMw + 25,
        };
        const whatIf = buildActiveCaseWorkspace({
            selection: 'customWhatIf',
            inputs: whatIfInputs,
            outputs: computeEngineOutputs(whatIfInputs),
            transient: generateTransient(whatIfInputs),
        });

        expect(whatIf.caseLabel).toBe('Custom What-If');
        expect(JSON.stringify(whatIf.fixtures.fixtures)).toBe(fixtureSnapshot);
        expect(JSON.stringify(whatIf.investigationEvidence)).toBe(
            JSON.stringify(baseline.investigationEvidence),
        );
        expect(whatIf.outputs.values).not.toEqual(baseline.outputs.values);
    });

    it('normalizes the reduced-order transient and any parsed fixture series', () => {
        const inputs = ENGINE_INPUT_PRESETS.baselineStartup;
        const workspace = buildActiveCaseWorkspace({
            selection: 'baselineStartup',
            inputs,
            outputs: computeEngineOutputs(inputs),
            transient: generateTransient(inputs),
        });

        expect(workspace.charts.series[0].id).toBe('reduced-order-transient');
        expect(workspace.charts.series[0].source).toBe('reduced-order');
        expect(workspace.charts.series[0].points).toHaveLength(41);
    });
});
