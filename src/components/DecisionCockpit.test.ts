import {describe, expect, it} from 'vitest';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';
import {buildOperatingCaseDecisionRecord} from './DecisionCockpit';

describe('buildOperatingCaseDecisionRecord', () => {
    it('keeps a custom what-if comparison and rollback decision on the public seam', () => {
        const inputs = {...ENGINE_INPUT_PRESETS.baselineStartup, thermalPowerMw: 540};
        const record = buildOperatingCaseDecisionRecord({inputs, outputs: evaluateEngineCase(inputs).outputs, selection: 'customWhatIf', baselinePreset: 'baselineStartup'});
        expect(record.rollbackPreset).toBe('baselineStartup');
        expect(record.provenanceDelta).toContain('not rerun');
        expect(record.trace).toContain('RC-TH-103');
        expect(record.changedInputs).toContain('thermal Power Mw');
        expect(record.affectedClaims).toContain('Channel-wall criterion margin');
    });
});
