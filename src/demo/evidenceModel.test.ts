import {describe, expect, it} from 'vitest';

import {DEFAULT_ANALYSIS_EVIDENCE} from './demoModel';
import {buildEvidenceWorkspace} from './evidenceModel';

describe('curated evidence workspace', () => {
    it('normalizes every bundled output into a populated review dataset', () => {
        const workspace = buildEvidenceWorkspace(DEFAULT_ANALYSIS_EVIDENCE);

        expect(workspace.datasets.map((dataset) => dataset.id)).toEqual([
            'mcnp-transport-axial',
            'mcnp-criticality-burnup',
            'moose-thermal-history',
            'rocets-feed-history',
            'rocets-nozzle-history',
            'rocets-stability-history',
        ]);
        expect(workspace.datasets.every((dataset) => dataset.points.length > 0)).toBe(true);
        expect(workspace.datasets.every((dataset) => dataset.table.rows.length > 0)).toBe(true);
    });

    it('keeps fixed-source transport and criticality evidence separate', () => {
        const workspace = buildEvidenceWorkspace(DEFAULT_ANALYSIS_EVIDENCE);
        const transport = workspace.datasets.find((dataset) => dataset.id === 'mcnp-transport-axial');
        const criticality = workspace.datasets.find((dataset) => dataset.id === 'mcnp-criticality-burnup');

        expect(transport?.sourceFile).toBe('ntp_mcnp.out');
        expect(criticality?.sourceFile).toBe('ntp_crit.out');
        expect(transport?.traces.map((trace) => trace.id)).toEqual(['flux']);
        expect(criticality?.traces.map((trace) => trace.id)).toEqual(['keff']);
        expect(criticality?.points.at(-1)?.values.keff).toBe(0.99284);
    });
});
