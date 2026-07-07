import type {ParserFamily} from '../../../parser/parserTypes';
import type {
    AnalysisBoundary,
    EngineeringFixtureReference,
} from '../analysisTypes';

export interface FixtureEvidenceWorkspaceModel {
    readonly fixtures: readonly EngineeringFixtureReference[];
    readonly selectedFamilies: readonly ParserFamily[];
    readonly boundary: AnalysisBoundary;
}

/** Boundary: parsed fixture evidence enters here and remains immutable downstream.
 *  Current milestone is read-only fixture inspection only (input/output views).
 *  The future milestone may add graphical fixture editing actions within the same artifact shell.
 */
export function buildFixtureEvidenceWorkspaceModel(
    overrides: Partial<FixtureEvidenceWorkspaceModel> = {},
): FixtureEvidenceWorkspaceModel {
    return {
        fixtures: [
            {
                id: 'mcnp-criticality-input',
                family: 'mcnp',
                direction: 'input',
                filename: 'ntp_crit.inp',
                parserStatus: 'parsed',
                provenance: 'Repository-bundled synthetic fixture',
                validationLabel: 'Syntactic workflow fixture only',
            },
            {
                id: 'mcnp-criticality-output',
                family: 'mcnp',
                direction: 'output',
                filename: 'ntp_crit.out',
                parserStatus: 'parsed',
                provenance: 'Repository-bundled synthetic fixture',
                validationLabel: 'Not validated solver output',
            },
            {
                id: 'bison-input',
                family: 'bison',
                direction: 'input',
                filename: 'ntp.bison.i',
                parserStatus: 'parsed',
                provenance: 'Repository-bundled synthetic fixture',
                validationLabel: 'Executable-lite scaffold only',
            },
            {
                id: 'bison-output',
                family: 'bison',
                direction: 'output',
                filename: 'ntp.bison.o',
                parserStatus: 'parsed',
                provenance: 'Repository-bundled synthetic fixture',
                validationLabel: 'Not validated solver output',
            },
            {
                id: 'moose-output',
                family: 'moose',
                direction: 'output',
                filename: 'ntp_moose.out',
                parserStatus: 'parsed',
                provenance: 'Repository-bundled synthetic fixture',
                validationLabel: 'Not validated solver output',
            },
            {
                id: 'rocets-output',
                family: 'rocets',
                direction: 'output',
                filename: 'ntp_rocet.out',
                parserStatus: 'parsed',
                provenance: 'Repository-bundled synthetic fixture',
                validationLabel: 'Not validated solver output',
            },
        ],
        selectedFamilies: ['mcnp', 'bison', 'moose', 'rocets'],
        boundary: {
            scope: 'Catalogs parsed engineering fixtures and exposes immutable evidence selections.',
            owns: ['fixture identity', 'parser status', 'provenance', 'validation labels'],
            excludes: ['solver execution', 'manual parameter edits', 'reduced-order outputs', 'graphical fixture mutation'],
        },
        ...overrides,
    };
}
