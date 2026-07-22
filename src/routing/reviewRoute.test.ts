import {describe, expect, it} from 'vitest';
import {parseReviewRoute, reviewRouteSearch} from './reviewRoute';

describe('review routes', () => {
    it('round-trips a citeable section and evidence focus', () => {
        const route = {section: 'model-evidence' as const, focus: 'thermal-margin' as const};
        expect(parseReviewRoute(reviewRouteSearch(route))).toEqual(route);
    });
});
