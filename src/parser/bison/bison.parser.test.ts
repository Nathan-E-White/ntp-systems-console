import {describe, expect, it} from 'vitest';

import {canonicalFixture} from '../../fixtures/canonicalFixtures';
import {createFileArtifactFromText} from '../createFileArtifactFromText';
import {parseBisonInput} from './bison.input.parser';
import {parseBisonOutput} from './bison.output.parser';

describe('BISON fixture parsing', () => {
    it('extracts input variables, schedules, and companion source context', () => {
        const parsed = parseBisonInput(canonicalFixture('bison-input').text);

        expect(parsed.metadata.inputFile).toBe('ntp.bison.i');
        expect(parsed.metadata.validationStatus).toBe('not_validated');
        expect(parsed.variables.filter((variable) => variable.kind === 'primary')).toHaveLength(6);
        expect(parsed.variables.find((variable) => variable.name === 'hydrogen_inventory'))
            .toMatchObject({kind: 'primary', initialCondition: 0});
        expect(parsed.functions.find((fn) => fn.name === 'core_power_profile')?.y.at(-1)).toBe(0.05);
        expect(parsed.metadata.sourceContext).toEqual(expect.arrayContaining([
            'ntp_mcnp.inp',
            'ntp_crit.inp',
            'ntp_moose.inp',
            'ntp_rocet.inp',
            'ntp_rocket.e',
        ]));
    });

    it('extracts output postprocessors, profiles, and final review values', () => {
        const parsed = parseBisonOutput(canonicalFixture('bison-output').text);

        expect(parsed.metadata.application).toBe('BISON-like fuel performance scaffold');
        expect(parsed.postprocessorHistory).toHaveLength(14);
        expect(parsed.postprocessorHistory.find((row) => row.time === 210)?.peakFuelTemperature).toBe(2966.539);
        expect(parsed.finalReview).toMatchObject({
            caseId: 'ntp-bison-fuel-performance-001',
            peakFuelTemperatureK: 2966.5,
            peakRestartTemperatureK: 2608.1,
            minimumCoatingMargin: 0.68,
            minimumHydrogenAttackMargin: 0.72,
            finalBurnupProxy: 0.06728,
            finalDamageIndexProxy: 0.00000658,
        });
        expect(parsed.vectorProfiles.find((profile) => profile.name === 'hot_wall_hydrogen_profile'))
            .toMatchObject({finalMean: 9.649105e-8, finalMax: 3.841006e-7});
        expect(parsed.axialTemperatureProfile).toHaveLength(17);
    });

    it('detects BISON fixtures through the registry and rejects unsupported files', () => {
        const outputArtifact = createFileArtifactFromText({
            filename: 'ntp.bison.o',
            text: canonicalFixture('bison-output').text,
            id: 'bison-output-test',
        });
        const unsupported = createFileArtifactFromText({
            filename: 'notes.txt',
            text: 'plain notes without engineering fixture structure',
        });

        expect(outputArtifact.parserStatus).toBe('parsed');
        expect(outputArtifact.parsed?.family).toBe('bison');
        expect(outputArtifact.parsed?.tables.map((table) => table.id)).toContain('postprocessor-history');
        expect(unsupported.parserStatus).toBe('unsupported');
        expect(unsupported.diagnostics.at(0)?.hint).toContain('BISON');
    });
});
