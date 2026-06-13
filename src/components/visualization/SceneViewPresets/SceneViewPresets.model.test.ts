import {describe, expect, it} from 'vitest';

import {buildSceneViewPresetModel} from './SceneViewPresets.model';

describe('SceneViewPresets', () => {
    it('provides presenter-safe compositions for the complete cutaway', () => {
        const model = buildSceneViewPresetModel();
        expect(model.defaultPresetId).toBe('fit-engine');
        expect(model.presets.map((preset) => preset.id)).toEqual([
            'fit-engine',
            'reactor',
            'flow-path',
            'nozzle',
        ]);
        expect(model.presets.every((preset) => preset.minimumDistance >= 6)).toBe(true);
    });
});
