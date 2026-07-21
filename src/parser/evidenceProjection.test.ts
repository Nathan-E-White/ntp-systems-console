import {describe, expect, it} from 'vitest';

import {
    type EvidenceClaimSourceDefinition,
    projectEvidenceClaims,
} from './evidenceProjection';
import type {ParsedFileViewModel} from './parserTypes';

const transportArtifact: ParsedFileViewModel = {
    id: 'mcnp-transport-output',
    filename: 'ntp_mcnp.out',
    family: 'mcnp',
    direction: 'output',
    displayName: 'MCNP output',
    summaryCards: [],
    diagnostics: [],
    sections: [{
        id: 'tally-results',
        title: 'Tally results',
        records: [],
    }],
    tables: [{
        id: 'feed-turbomachinery-history',
        title: 'Feed turbomachinery history',
        columns: [],
        rows: [],
    }],
    timeSeries: [],
    crossLinks: [],
    domainSlices: {},
    rawParsed: {},
};

describe('projectEvidenceClaims', () => {
    it('projects a review claim with its resolved Source Locator', () => {
        const projection = projectEvidenceClaims({
            artifacts: [transportArtifact],
            definitions: [{
                id: 'transport-power-shape',
                statement: 'The transport fixture supports an axial power-shape comparison.',
                limitation: 'The fixture is static synthetic evidence, not an executed transport calculation.',
                nextAction: 'Compare the axial hot location before requesting a coupled calculation.',
                sources: [{
                    artifactId: 'mcnp-transport-output',
                    sectionId: 'tally-results',
                    location: {line: 282},
                }],
            }],
        });

        expect(projection.diagnostics).toEqual([]);
        expect(projection.claims).toEqual([{
            id: 'transport-power-shape',
            statement: 'The transport fixture supports an axial power-shape comparison.',
            limitation: 'The fixture is static synthetic evidence, not an executed transport calculation.',
            nextAction: 'Compare the axial hot location before requesting a coupled calculation.',
            sourceLocators: [{
                artifactId: 'mcnp-transport-output',
                filename: 'ntp_mcnp.out',
                sectionId: 'tally-results',
                location: {line: 282},
            }],
        }]);
    });

    it('reports an unknown Evidence Artifact instead of projecting an untraceable claim', () => {
        const projection = projectEvidenceClaims({
            artifacts: [transportArtifact],
            definitions: [{
                id: 'missing-artifact-claim',
                statement: 'This claim has no supporting artifact.',
                limitation: 'No source is available.',
                nextAction: 'Add a parsed artifact before review.',
                sources: [{artifactId: 'missing-artifact', sectionId: 'tally-results'}],
            }],
        });

        expect(projection.claims).toEqual([]);
        expect(projection.diagnostics).toContainEqual({
            severity: 'error',
            source: 'evidenceProjection',
            message: 'Evidence Claim missing-artifact-claim references unknown Evidence Artifact missing-artifact.',
            hint: 'Add the artifact to the projection or correct artifactId.',
        });
    });

    it('projects cross-artifact relationships through the same review seam', () => {
        const propulsionArtifact: ParsedFileViewModel = {
            ...transportArtifact,
            id: 'rocets-output',
            filename: 'ntp_rocet.out',
            family: 'rocets',
        };
        const transportWithCrossLink: ParsedFileViewModel = {
            ...transportArtifact,
            crossLinks: [{
                id: 'transport-to-propulsion',
                targetFilename: 'ntp_rocet.out',
                relationship: 'references_file',
                label: 'Compare flow-path evidence',
            }],
        };

        const projection = projectEvidenceClaims({
            artifacts: [transportWithCrossLink, propulsionArtifact],
            definitions: [],
        });

        expect(projection.relationships).toEqual([{
            sourceArtifactId: 'mcnp-transport-output',
            targetArtifactId: 'rocets-output',
            targetFilename: 'ntp_rocet.out',
            relationship: 'references_file',
            label: 'Compare flow-path evidence',
        }]);
    });

    it('projects every supporting Evidence Artifact for a cross-artifact claim', () => {
        const propulsionArtifact: ParsedFileViewModel = {
            ...transportArtifact,
            id: 'rocets-output',
            filename: 'ntp_rocet.out',
            family: 'rocets',
        };

        const projection = projectEvidenceClaims({
            artifacts: [transportArtifact, propulsionArtifact],
            definitions: [{
                id: 'transport-and-propulsion',
                statement: 'The fixture pair supports a flow-path handoff question.',
                limitation: 'Both artifacts are static synthetic evidence.',
                nextAction: 'Compare the channel and system pressure records.',
                sources: [
                    {artifactId: 'mcnp-transport-output', sectionId: 'tally-results'},
                    {artifactId: 'rocets-output', tableId: 'feed-turbomachinery-history'},
                ],
            }],
        });

        expect(projection.claims[0]?.sourceLocators).toEqual([
            {
                artifactId: 'mcnp-transport-output',
                filename: 'ntp_mcnp.out',
                sectionId: 'tally-results',
                tableId: undefined,
                recordId: undefined,
                location: undefined,
            },
            {
                artifactId: 'rocets-output',
                filename: 'ntp_rocet.out',
                sectionId: undefined,
                tableId: 'feed-turbomachinery-history',
                recordId: undefined,
                location: undefined,
            },
        ]);
    });

    it('rejects a claim source that has no Source Locator beyond artifact identity', () => {
        const projection = projectEvidenceClaims({
            artifacts: [transportArtifact],
            definitions: [{
                id: 'unlocated-claim',
                statement: 'This claim cannot point to a supporting record.',
                limitation: 'The supporting record is not identified.',
                nextAction: 'Add a section, table, record, or line locator.',
                sources: [{artifactId: 'mcnp-transport-output'} as EvidenceClaimSourceDefinition],
            }],
        });

        expect(projection.claims).toEqual([]);
        expect(projection.diagnostics).toContainEqual({
            severity: 'error',
            source: 'evidenceProjection',
            message: 'Evidence Claim unlocated-claim source mcnp-transport-output has no Source Locator beyond artifact identity.',
            hint: 'Identify the supporting section, table, record, or source location.',
        });
    });

    it('rejects a section locator that is absent from its Evidence Artifact', () => {
        const projection = projectEvidenceClaims({
            artifacts: [transportArtifact],
            definitions: [{
                id: 'unknown-section-claim',
                statement: 'This claim points to a nonexistent section.',
                limitation: 'The cited section cannot be found.',
                nextAction: 'Select a section supplied by the Evidence Artifact.',
                sources: [{artifactId: 'mcnp-transport-output', sectionId: 'missing-section'}],
            }],
        });

        expect(projection.claims).toEqual([]);
        expect(projection.diagnostics).toContainEqual({
            severity: 'error',
            source: 'evidenceProjection',
            message: 'Evidence Claim unknown-section-claim source mcnp-transport-output references unknown section missing-section.',
            hint: 'Use a section present in the supporting Evidence Artifact.',
        });
    });

    it('rejects a source location with non-positive positions', () => {
        const projection = projectEvidenceClaims({
            artifacts: [transportArtifact],
            definitions: [{
                id: 'invalid-location-claim',
                statement: 'This claim uses an invalid source location.',
                limitation: 'Line zero is not a valid source position.',
                nextAction: 'Use a positive source location.',
                sources: [{artifactId: 'mcnp-transport-output', location: {line: 0}}],
            }],
        });

        expect(projection.claims).toEqual([]);
        expect(projection.diagnostics).toContainEqual({
            severity: 'error',
            source: 'evidenceProjection',
            message: 'Evidence Claim invalid-location-claim source mcnp-transport-output has an invalid source location.',
            hint: 'Source location positions must be positive integers.',
        });
    });

    it('rejects a claim without a supporting Evidence Artifact', () => {
        const projection = projectEvidenceClaims({
            artifacts: [transportArtifact],
            definitions: [{
                id: 'source-free-claim',
                statement: 'This claim has no supporting artifact.',
                limitation: 'The evidence is absent.',
                nextAction: 'Add a supporting Evidence Artifact.',
                sources: [] as unknown as readonly [EvidenceClaimSourceDefinition, ...EvidenceClaimSourceDefinition[]],
            }],
        });

        expect(projection.claims).toEqual([]);
        expect(projection.diagnostics).toContainEqual({
            severity: 'error',
            source: 'evidenceProjection',
            message: 'Evidence Claim source-free-claim has no supporting Evidence Artifact.',
            hint: 'Add one or more located supporting artifacts before review.',
        });
    });

    it('rejects ambiguous Evidence Artifact identities instead of choosing a last artifact', () => {
        const projection = projectEvidenceClaims({
            artifacts: [
                transportArtifact,
                {...transportArtifact, filename: 'ntp_mcnp_copy.out'},
            ],
            definitions: [{
                id: 'ambiguous-claim',
                statement: 'This claim points at a duplicate artifact identity.',
                limitation: 'The supporting artifact is ambiguous.',
                nextAction: 'Assign a unique artifact identifier.',
                sources: [{artifactId: 'mcnp-transport-output', sectionId: 'tally-results'}],
            }],
        });

        expect(projection.claims).toEqual([]);
        expect(projection.diagnostics).toContainEqual({
            severity: 'error',
            source: 'evidenceProjection',
            message: 'Evidence Artifact identifier mcnp-transport-output is duplicated.',
            hint: 'Every Evidence Artifact identifier must be unique within a review projection.',
        });
    });

    it('does not resolve a relationship through a duplicated Evidence Artifact filename', () => {
        const projection = projectEvidenceClaims({
            artifacts: [
                transportArtifact,
                {...transportArtifact, id: 'transport-copy'},
                {
                    ...transportArtifact,
                    id: 'rocets-output',
                    filename: 'ntp_rocet.out',
                    family: 'rocets',
                    crossLinks: [{
                        id: 'rocets-to-transport',
                        targetFilename: 'ntp_mcnp.out',
                        relationship: 'references_file',
                    }],
                },
            ],
            definitions: [],
        });

        expect(projection.relationships).toContainEqual({
            sourceArtifactId: 'rocets-output',
            targetArtifactId: undefined,
            targetFilename: 'ntp_mcnp.out',
            relationship: 'references_file',
            label: undefined,
            description: undefined,
        });
        expect(projection.diagnostics).toContainEqual({
            severity: 'error',
            source: 'evidenceProjection',
            message: 'Evidence Artifact filename ntp_mcnp.out is duplicated.',
            hint: 'Every Evidence Artifact filename must be unique within a review projection.',
        });
    });

    it('preserves an external relationship and warns when its target artifact is absent', () => {
        const projection = projectEvidenceClaims({
            artifacts: [{
                ...transportArtifact,
                crossLinks: [{
                    id: 'transport-to-missing',
                    targetFilename: 'ntp_missing.out',
                    relationship: 'references_file',
                }],
            }],
            definitions: [],
        });

        expect(projection.relationships).toEqual([{
            sourceArtifactId: 'mcnp-transport-output',
            targetFilename: 'ntp_missing.out',
            relationship: 'references_file',
            label: undefined,
            description: undefined,
        }]);
        expect(projection.diagnostics).toContainEqual({
            severity: 'warning',
            source: 'evidenceProjection',
            message: 'Evidence Artifact mcnp-transport-output relationship transport-to-missing references unknown Evidence Artifact ntp_missing.out.',
            hint: 'Add the target artifact to the projection or retain this relationship as an external reference.',
        });
    });
});
