import {describe, expect, it} from 'vitest';

import {DEFAULT_ANALYSIS_EVIDENCE, EVIDENCE_PAIRING_INVENTORY} from './demoModel';
import {buildEvidenceWorkspace} from './evidenceModel';

describe('curated evidence workspace', () => {
    it('includes the full input and output fixture corpus with pairing metadata', () => {
        expect(DEFAULT_ANALYSIS_EVIDENCE).toHaveLength(10);
        expect(DEFAULT_ANALYSIS_EVIDENCE.filter((evidence) => evidence.direction === 'input')).toHaveLength(5);
        expect(DEFAULT_ANALYSIS_EVIDENCE.filter((evidence) => evidence.direction === 'output')).toHaveLength(5);
        expect(DEFAULT_ANALYSIS_EVIDENCE.map((evidence) => evidence.sourceFile)).toEqual([
            'ntp_mcnp.inp',
            'ntp_crit.inp',
            'ntp_mcnp.out',
            'ntp_crit.out',
            'ntp.bison.i',
            'ntp.bison.o',
            'ntp_rocet.inp',
            'ntp_moose.inp',
            'ntp_moose.out',
            'ntp_rocet.out',
        ]);
        expect(EVIDENCE_PAIRING_INVENTORY).toHaveLength(5);
        expect(EVIDENCE_PAIRING_INVENTORY.map((pairing) => pairing.id)).toEqual([
            'mcnp-fixed-source',
            'mcnp-criticality',
            'bison-fuel-performance',
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
            'bison-fuel-performance-history',
            'bison-axial-temperature-profile',
            'bison-hydrogen-profile',
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

    it('promotes BISON fuel-performance values as fixture-backed datasets', () => {
        const workspace = buildEvidenceWorkspace(DEFAULT_ANALYSIS_EVIDENCE);
        const fuel = workspace.datasets.find((dataset) => dataset.id === 'bison-fuel-performance-history');
        const axial = workspace.datasets.find((dataset) => dataset.id === 'bison-axial-temperature-profile');
        const hydrogen = workspace.datasets.find((dataset) => dataset.id === 'bison-hydrogen-profile');

        expect(fuel?.sourceFile).toBe('ntp.bison.o');
        expect(fuel?.traces.map((trace) => trace.id)).toEqual([
            'peakFuel',
            'averageFuel',
            'coatingMargin',
            'hydrogenAttack',
        ]);
        expect(fuel?.table.rows).toContainEqual({metric: 'Peak fuel temperature', value: 2966.5, unit: 'K'});
        expect(fuel?.table.rows).toContainEqual({metric: 'Final damage index', value: 0.00000658, unit: 'proxy'});
        expect(axial?.points.at(-1)?.values.temperature).toBe(398.9227);
        expect(hydrogen?.points.map((point) => point.values.hydrogenInventory)).toEqual([
            1.302118e-11,
            9.649105e-8,
            3.841006e-7,
        ]);
    });
});
