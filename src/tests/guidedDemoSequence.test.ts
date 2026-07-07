import {describe, expect, it} from 'vitest';

import {buildTheatreDemoDirectorModel} from '../components/visualization';
import {runGuidedDemoCue} from '../theatre/guidedDemoSequence';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';

describe('guided demo sequence', () => {
    it('animates one requested cue without advancing or mutating engineering inputs', async () => {
        const inputsBefore = structuredClone(ENGINE_INPUT_PRESETS.baselineStartup);
        const model = buildTheatreDemoDirectorModel();
        const progress: number[] = [];
        await runGuidedDemoCue(model.cues[1], {
            onProgress: (value) => progress.push(value),
        });

        expect(progress.at(-1)).toBe(1);
        expect(ENGINE_INPUT_PRESETS.baselineStartup).toEqual(inputsBefore);
    });
});
