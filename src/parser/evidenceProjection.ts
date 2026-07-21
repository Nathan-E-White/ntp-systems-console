import type {
    ParsedFileRelationship,
    ParsedFileViewModel,
    ParserDiagnostic,
    SourceLocation,
} from './parserTypes';

export interface EvidenceSourceLocator {
    artifactId: string;
    filename: string;
    sectionId?: string;
    tableId?: string;
    recordId?: string;
    location?: SourceLocation;
}

export interface EvidenceClaim {
    id: string;
    statement: string;
    limitation: string;
    nextAction: string;
    sourceLocators: EvidenceSourceLocator[];
}

type EvidenceClaimSourceReference = Omit<EvidenceSourceLocator, 'filename'>;

export type EvidenceClaimSourceDefinition =
    | (EvidenceClaimSourceReference & {sectionId: string})
    | (EvidenceClaimSourceReference & {tableId: string})
    | (EvidenceClaimSourceReference & {recordId: string})
    | (EvidenceClaimSourceReference & {location: SourceLocation});

export interface EvidenceClaimDefinition {
    id: string;
    statement: string;
    limitation: string;
    nextAction: string;
    sources: readonly [EvidenceClaimSourceDefinition, ...EvidenceClaimSourceDefinition[]];
}

export interface EvidenceReviewProjection {
    claims: EvidenceClaim[];
    relationships: ParsedFileRelationship[];
    diagnostics: ParserDiagnostic[];
}

const unknownArtifactDiagnostic = (
    definition: EvidenceClaimDefinition,
    source: EvidenceClaimSourceDefinition,
): ParserDiagnostic => ({
    severity: 'error',
    source: 'evidenceProjection',
    message: `Evidence Claim ${definition.id} references unknown Evidence Artifact ${source.artifactId}.`,
    hint: 'Add the artifact to the projection or correct artifactId.',
});

const unknownRelationshipArtifactDiagnostic = (
    artifact: ParsedFileViewModel,
    relationshipId: string,
    target: string,
): ParserDiagnostic => ({
    severity: 'warning',
    source: 'evidenceProjection',
    message: `Evidence Artifact ${artifact.id} relationship ${relationshipId} references unknown Evidence Artifact ${target}.`,
    hint: 'Add the target artifact to the projection or retain this relationship as an external reference.',
});

const unlocatedClaimSourceDiagnostic = (
    definition: EvidenceClaimDefinition,
    source: EvidenceClaimSourceReference,
): ParserDiagnostic => ({
    severity: 'error',
    source: 'evidenceProjection',
    message: `Evidence Claim ${definition.id} source ${source.artifactId} has no Source Locator beyond artifact identity.`,
    hint: 'Identify the supporting section, table, record, or source location.',
});

const unknownSourceLocatorDiagnostic = (
    definition: EvidenceClaimDefinition,
    source: EvidenceClaimSourceDefinition,
    kind: 'section' | 'table',
    value: string,
): ParserDiagnostic => ({
    severity: 'error',
    source: 'evidenceProjection',
    message: `Evidence Claim ${definition.id} source ${source.artifactId} references unknown ${kind} ${value}.`,
    hint: `Use a ${kind} present in the supporting Evidence Artifact.`,
});

const invalidSourceLocationDiagnostic = (
    definition: EvidenceClaimDefinition,
    source: EvidenceClaimSourceDefinition,
): ParserDiagnostic => ({
    severity: 'error',
    source: 'evidenceProjection',
    message: `Evidence Claim ${definition.id} source ${source.artifactId} has an invalid source location.`,
    hint: 'Source location positions must be positive integers.',
});

const missingClaimSourceDiagnostic = (definition: EvidenceClaimDefinition): ParserDiagnostic => ({
    severity: 'error',
    source: 'evidenceProjection',
    message: `Evidence Claim ${definition.id} has no supporting Evidence Artifact.`,
    hint: 'Add one or more located supporting artifacts before review.',
});

const duplicateArtifactDiagnostic = (kind: 'identifier' | 'filename', value: string): ParserDiagnostic => ({
    severity: 'error',
    source: 'evidenceProjection',
    message: `Evidence Artifact ${kind} ${value} is duplicated.`,
    hint: `Every Evidence Artifact ${kind} must be unique within a review projection.`,
});

const uniqueArtifactIndex = (
    artifacts: readonly ParsedFileViewModel[],
    kind: 'identifier' | 'filename',
    keyFor: (artifact: ParsedFileViewModel) => string,
): {artifactsByKey: Map<string, ParsedFileViewModel>; diagnostics: ParserDiagnostic[]} => {
    const artifactsByKey = new Map<string, ParsedFileViewModel>();
    const duplicateKeys = new Set<string>();

    for (const artifact of artifacts) {
        const key = keyFor(artifact);

        if (artifactsByKey.has(key)) {
            artifactsByKey.delete(key);
            duplicateKeys.add(key);
            continue;
        }

        if (!duplicateKeys.has(key)) {
            artifactsByKey.set(key, artifact);
        }
    }

    return {
        artifactsByKey,
        diagnostics: [...duplicateKeys].map((key) => duplicateArtifactDiagnostic(kind, key)),
    };
};

const hasSourceLocator = (source: EvidenceClaimSourceReference): boolean =>
    Boolean(source.sectionId || source.tableId || source.recordId)
    || Boolean(
        source.location
        && (source.location.line !== undefined
            || source.location.column !== undefined
            || source.location.endLine !== undefined
            || source.location.endColumn !== undefined),
    );

const hasValidSourceLocation = (location: SourceLocation): boolean =>
    Object.values(location).every((position) => Number.isInteger(position) && position > 0);

const sourceLocatorDiagnostic = (
    definition: EvidenceClaimDefinition,
    source: EvidenceClaimSourceDefinition,
    artifact: ParsedFileViewModel,
): ParserDiagnostic | undefined => {
    if (source.sectionId && !artifact.sections.some((section) => section.id === source.sectionId)) {
        return unknownSourceLocatorDiagnostic(definition, source, 'section', source.sectionId);
    }

    if (source.tableId && !artifact.tables.some((table) => table.id === source.tableId)) {
        return unknownSourceLocatorDiagnostic(definition, source, 'table', source.tableId);
    }

    if (source.location && !hasValidSourceLocation(source.location)) {
        return invalidSourceLocationDiagnostic(definition, source);
    }

    return undefined;
};

export const projectEvidenceClaims = (input: {
    artifacts: readonly ParsedFileViewModel[];
    definitions: readonly EvidenceClaimDefinition[];
}): EvidenceReviewProjection => {
    const artifactIds = uniqueArtifactIndex(input.artifacts, 'identifier', (artifact) => artifact.id);
    const artifactFilenames = uniqueArtifactIndex(input.artifacts, 'filename', (artifact) => artifact.filename);
    const artifactsById = artifactIds.artifactsByKey;
    const artifactsByFilename = artifactFilenames.artifactsByKey;
    const claims: EvidenceClaim[] = [];
    const relationships: ParsedFileRelationship[] = [];
    const diagnostics: ParserDiagnostic[] = [...artifactIds.diagnostics, ...artifactFilenames.diagnostics];

    for (const definition of input.definitions) {
        if (definition.sources.length === 0) {
            diagnostics.push(missingClaimSourceDiagnostic(definition));
            continue;
        }

        const sourceLocators: EvidenceSourceLocator[] = [];
        let hasInvalidSource = false;

        for (const source of definition.sources) {
            if (!hasSourceLocator(source)) {
                diagnostics.push(unlocatedClaimSourceDiagnostic(definition, source));
                hasInvalidSource = true;
                continue;
            }

            const artifact = artifactsById.get(source.artifactId);

            if (!artifact) {
                diagnostics.push(unknownArtifactDiagnostic(definition, source));
                hasInvalidSource = true;
                continue;
            }

            const locatorDiagnostic = sourceLocatorDiagnostic(definition, source, artifact);

            if (locatorDiagnostic) {
                diagnostics.push(locatorDiagnostic);
                hasInvalidSource = true;
                continue;
            }

            sourceLocators.push({
                artifactId: artifact.id,
                filename: artifact.filename,
                sectionId: source.sectionId,
                tableId: source.tableId,
                recordId: source.recordId,
                location: source.location,
            });
        }

        if (hasInvalidSource) {
            continue;
        }

        claims.push({
            id: definition.id,
            statement: definition.statement,
            limitation: definition.limitation,
            nextAction: definition.nextAction,
            sourceLocators,
        });
    }

    for (const artifact of input.artifacts) {
        for (const crossLink of artifact.crossLinks) {
            const targetArtifact = crossLink.targetArtifactId
                ? artifactsById.get(crossLink.targetArtifactId)
                : artifactsByFilename.get(crossLink.targetFilename ?? '');
            const targetReference = crossLink.targetArtifactId ?? crossLink.targetFilename;

            if (targetReference && !targetArtifact) {
                diagnostics.push(unknownRelationshipArtifactDiagnostic(artifact, crossLink.id, targetReference));
            }

            relationships.push({
                sourceArtifactId: crossLink.sourceArtifactId ?? artifact.id,
                targetArtifactId: targetArtifact?.id ?? crossLink.targetArtifactId,
                targetFilename: crossLink.targetFilename,
                relationship: crossLink.relationship,
                label: crossLink.label,
                description: crossLink.description,
            });
        }
    }

    return {claims, relationships, diagnostics};
};
