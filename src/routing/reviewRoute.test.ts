import {describe, expect, it} from 'vitest';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';
import {changedEngineInputs, parseReviewRoute, reviewRouteSearch} from './reviewRoute';

describe('review routes', () => {
    it('round-trips a citeable section and evidence focus', () => {
        const route = {section: 'model-evidence' as const, focus: 'thermal-margin' as const, caseSelection: 'thermalMarginInvestigation' as const, basePresetId: 'thermalMarginInvestigation' as const, inputChanges: {}};
        expect(parseReviewRoute(reviewRouteSearch(route))).toEqual(route);
    });

    it('round-trips a Custom What-If against its declared baseline', () => {
        const inputs = {...ENGINE_INPUT_PRESETS.thermalMarginInvestigation, thermalPowerMw: 525, overrideRationale: 'Hold margin for review'};
        const route = {section: 'review' as const, focus: null, caseSelection: 'customWhatIf' as const, basePresetId: 'thermalMarginInvestigation' as const, inputChanges: changedEngineInputs(inputs, 'thermalMarginInvestigation')};
        expect(parseReviewRoute(reviewRouteSearch(route))).toEqual(route);
    });

    it('ignores malformed Custom What-If values', () => {
        const route = parseReviewRoute('?section=review&case=customWhatIf&base=baselineStartup&inputs=%7B%22thermalPowerMw%22%3A%22nope%22%2C%22unknown%22%3A1%7D');
        expect(route.inputChanges).toEqual({});
    });
});
