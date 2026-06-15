import {describe, expect, it} from 'vitest';

import {DEFAULT_ANALYSIS_EVIDENCE, EVIDENCE_PAIRING_INVENTORY} from './demoModel';
import {buildEvidenceWorkspace} from './evidenceModel';

describe('curated evidence workspace', () => {
    it('includes the full input and output fixture corpus with pairing metadata', () => {
        expect(DEFAULT_ANALYSIS_EVIDENCE).toHaveLength(8);
        expect(DEFAULT_ANALYSIS_EVIDENCE.filter((evidence) => evidence.direction === 'input')).toHaveLength(4);
        expect(DEFAULT_ANALYSIS_EVIDENCE.filter((evidence) => evidence.direction === 'output')).toHaveLength(4);
        expect(DEFAULT_ANALYSIS_EVIDENCE.map((evidence) => evidence.sourceFile)).toEqual([
            'ntp_mcnp.inp',
            'ntp_crit.inp',
            'ntp_mcnp.out',
            'ntp_crit.out',
            'ntp_rocet.inp',
            'ntp_moose.inp',
            'ntp_moose.out',
            'ntp_rocet.out',
        ]);
        expect(EVIDENCE_PAIRING_INVENTORY).toHaveLength(4);
        expect(EVIDENCE_PAIRING_INVENTORY.map((pairing) => pairing.id)).toEqual([
            'mcnp-fixed-source',
            'mcnp-criticality',
            'rocets-system',
            'moose-thermal',
        ]);
    });

    it('keeps parsed inventory counts available for fixture cards', () => {
        const fixedSourceInput = DEFAULT_ANALYSIS_EVIDENCE.find((evidence) => evidence.id === 'mcnp-fixed-source-input');
        const rocetsOutput = DEFAULT_ANALYSIS_EVIDENCE.find((evidence) => evidence.id === 'rocets-output');

        expect(fixedSourceInput?.artifact.parsed?.tables).toHaveLength(6);
        expect(fixedSourceInput?.artifact.parsed?.tables.map((table) => table.id)).toContain('cells');
        expect(rocetsOutput?.artifact.parsed?.timeSeries.map((series) => series.id)).toEqual([
            'transient-log',
            'feed-turbomachinery-history',
            'nozzle-performance-history',
            'neutronics-history',
        ]);
        expect(rocetsOutput?.plotCandidates).toContain('transient log');
    });

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
