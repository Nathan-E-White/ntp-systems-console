import {describe, expect, it} from 'vitest';

import {DEFAULT_ANALYSIS_EVIDENCE} from './demoModel';
import {buildStabilityInvestigationSummary} from './stabilityInvestigationSummary';

describe('buildStabilityInvestigationSummary', () => {
    const summary = buildStabilityInvestigationSummary(DEFAULT_ANALYSIS_EVIDENCE);

    it('selects the coupled restart/cooldown interval as controlling', () => {
        expect(summary.controllingInterval.timeSeconds).toBe(650);
        expect(summary.controllingInterval.alignedExtremaCount).toBeGreaterThanOrEqual(6);
        expect(summary.controllingInterval.windowLabel).toContain('restart/cooldown');
    });

    it('captures the Ledinegg advisory state path and watch window', () => {
        expect(summary.advisoryState.statePath).toEqual([
            'nominal',
            'recovering',
            'reset',
            'watch',
            'nominal',
        ]);
        expect(summary.advisoryState.minimumMargin.margin).toBeCloseTo(0.001, 6);
        expect(summary.advisoryState.minimumMargin.timeSeconds).toBe(520);
        expect(summary.advisoryState.watchStart?.timeSeconds).toBe(560);
        expect(summary.advisoryState.watchEnd?.timeSeconds).toBe(760);
        expect(summary.advisoryState.finalState.ledinegg).toBe('nominal');
    });

    it('aligns displayed MOOSE coupled proxy extrema at 650 seconds', () => {
        expect(summary.coupledProxyExtrema).toHaveLength(6);
        expect(summary.coupledProxyExtrema.every((extremum) => extremum.timeSeconds === 650)).toBe(true);
        expect(summary.coupledProxyExtrema.map((extremum) => extremum.id)).toEqual([
            'moose-ledinegg-margin',
            'moose-point-kinetics',
            'moose-net-coupled-gain',
            'moose-thrust-frame-gain',
            'moose-feedline-wave',
            'moose-fluid-phase-angle',
        ]);
    });

    it('separates numerical run stability from physical stability claims', () => {
        expect(summary.solverHealth.totalStepCuts).toBe(1);
        expect(summary.solverHealth.stepCutEvents[0]?.timeSeconds).toBe(530);
        expect(summary.solverHealth.residualPassCount).toBe(summary.solverHealth.residualCount);
        expect(summary.solverHealth.worstResidual.name).toBe('chamber_pressure_target');
        expect(summary.solverHealth.worstResidual.utilization).toBeCloseTo(0.944, 3);
    });

    it('computes hydraulic operating-point resistance without treating it as a Ledinegg slope', () => {
        expect(summary.hydraulicComparison.ratedBurn.average).toBeGreaterThan(93000);
        expect(summary.hydraulicComparison.ratedBurn.average).toBeLessThan(94000);
        expect(summary.hydraulicComparison.restartCooldown.minimum).toBeGreaterThan(104000);
        expect(summary.hydraulicComparison.restartCooldown.maximum).toBeLessThan(120000);
        expect(summary.hydraulicComparison.boundary).toContain('not a Ledinegg slope proof');
    });
});
