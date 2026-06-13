import {beforeEach, describe, expect, it} from 'vitest';

import {derivePeweeClosureEfficiency} from '../physics/representativeChannelModel';
import {
    DEFAULT_ENGINE_PRESET_ID,
    ENGINE_INPUT_PRESETS,
    useEngineStore,
} from '../state/EngineStore';

describe('reference-profile edit behavior', () => {
    beforeEach(() => {
        useEngineStore.getState().loadPreset(DEFAULT_ENGINE_PRESET_ID);
    });

    it('freezes benchmark closure before applying a manual what-if edit', () => {
        const original = useEngineStore.getState().inputs;
        const expectedEfficiency = derivePeweeClosureEfficiency(original);
        useEngineStore.getState().setInput('thermalPowerMw', 525);
        const edited = useEngineStore.getState();

        expect(edited.selectedPresetId).toBe('customWhatIf');
        expect(edited.inputs.thermalCouplingMode).toBe('fixedEfficiency');
        expect(edited.inputs.thermalCouplingEfficiency).toBeCloseTo(expectedEfficiency!, 12);
        expect(ENGINE_INPUT_PRESETS.baselineStartup.thermalPowerMw).toBe(500);
    });

    it('reset restores the cited benchmark and clears the what-if state', () => {
        useEngineStore.getState().setInput('channelWallCriterionK', 2_600);
        useEngineStore.getState().resetDemo();
        const reset = useEngineStore.getState();

        expect(reset.selectedPresetId).toBe(DEFAULT_ENGINE_PRESET_ID);
        expect(reset.inputs).toEqual(ENGINE_INPUT_PRESETS.baselineStartup);
        expect(reset.inputs.thermalCouplingMode).toBe('benchmarkClosure');
    });
});
