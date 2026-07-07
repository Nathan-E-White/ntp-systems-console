import {describe, expect, it} from 'vitest';

import {DEMO_CASES, buildIntegratedReview, DEFAULT_ANALYSIS_EVIDENCE} from '../demo/demoModel';
import {computeEngineOutputs} from '../physics/propulsionModel';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';
import {buildActiveCaseWorkspace} from '../demo/activeCaseWorkspace';
import {generateTransient} from '../physics/transientModel';
import {buildGuidedInvestigationModel} from '../components/visualization';

function buildReview(
    selection: 'thermalMarginInvestigation' | 'customWhatIf',
    inputs: typeof ENGINE_INPUT_PRESETS.baselineStartup,
) {
    const outputs = computeEngineOutputs(inputs);
    const workspace = buildActiveCaseWorkspace({
        selection,
        inputs,
        outputs,
        transient: generateTransient(inputs),
    });
    const focus = buildGuidedInvestigationModel().components.find(
        (component) => component.id === 'thermal-margin',
    )!;
    return {outputs, review: buildIntegratedReview(selection, inputs, outputs, workspace, focus)};
}

describe('prepared demo cases', () => {
    it('keeps the benchmark above its wall criterion while retaining a screening posture', () => {
        const outputs = computeEngineOutputs(ENGINE_INPUT_PRESETS.baselineStartup);

        expect(outputs.channelWallCriterionMarginK).toBeGreaterThan(0);
        expect(outputs.reviewPosture).toBe(DEMO_CASES.baselineStartup.expectedPosture);
    });

    it('makes thermal margin the controlling concern in the investigation case', () => {
        const inputs = ENGINE_INPUT_PRESETS.thermalMarginInvestigation;
        const {outputs, review} = buildReview('thermalMarginInvestigation', inputs);

        expect(outputs.channelWallCriterionMarginK).toBeLessThan(80);
        expect(outputs.reviewPosture).toBe(DEMO_CASES.thermalMarginInvestigation.expectedPosture);
        expect(review.controllingConcern).toContain('exceeds');
    });

    it('parses all bundled model-evidence fixtures at startup', () => {
        expect(DEFAULT_ANALYSIS_EVIDENCE).toHaveLength(10);
        expect(DEFAULT_ANALYSIS_EVIDENCE.every((item) => item.parserStatus === 'parsed')).toBe(true);
        expect(DEFAULT_ANALYSIS_EVIDENCE.map((item) => item.family)).toEqual([
            'mcnp',
            'mcnp',
            'mcnp',
            'mcnp',
            'bison',
            'bison',
            'rocets',
            'moose',
            'moose',
            'rocets',
        ]);
    });

    it('labels manual edits as a what-if without claiming fixture reruns', () => {
        const inputs = {...ENGINE_INPUT_PRESETS.baselineStartup, thermalPowerMw: 475};
        const {review} = buildReview('customWhatIf', inputs);

        expect(review.customerObjective).toContain('do not imply');
        expect(review.assumptions.join(' ')).toContain('static synthetic fixture data');
    });
});
