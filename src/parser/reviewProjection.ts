import type {
  FileArtifact,
  ParsedCrossLink,
  ParsedFileViewModel,
  ParsedRelationshipKind,
  ParserDiagnostic,
  ParserFamily,
  SourceLocation,
} from "./parserTypes";

export type ReviewClaimStrength = "observed" | "derived" | "qualified";

export interface ReviewSourceLocator {
  readonly artifactId: string;
  readonly filename: string;
  readonly location?: SourceLocation;
  readonly label?: string;
}

export interface ReviewEvidenceClaim {
  readonly id: string;
  readonly statement: string;
  readonly strength: ReviewClaimStrength;
  readonly sources: readonly ReviewSourceLocator[];
}

export interface ReviewLimitation {
  readonly id: string;
  readonly statement: string;
  readonly severity: "caution" | "blocking";
  readonly sources: readonly ReviewSourceLocator[];
}

export interface ReviewRelationship {
  readonly id: string;
  readonly relationship: ParsedRelationshipKind;
  readonly sourceArtifactId: string;
  readonly targetArtifactId?: string;
  readonly targetFilename?: string;
  readonly description?: string;
}

export interface ArtifactReviewProjection {
  readonly artifactId: string;
  readonly family: ParserFamily;
  readonly claims: readonly ReviewEvidenceClaim[];
  readonly sourceLocators: readonly ReviewSourceLocator[];
  readonly limitations: readonly ReviewLimitation[];
  readonly relationships: readonly ReviewRelationship[];
  readonly diagnostics: readonly ParserDiagnostic[];
}

export interface DeclarativeReviewProjection {
  readonly claim: {
    readonly id: string;
    readonly statement: (view: ParsedFileViewModel) => string | undefined;
    readonly strength: ReviewClaimStrength;
  };
  readonly limitations?: readonly Omit<ReviewLimitation, "sources">[];
}

const isNonEmpty = (value: string | undefined): value is string => Boolean(value?.trim());

const sourceFor = (view: ParsedFileViewModel): ReviewSourceLocator => ({
  artifactId: view.id,
  filename: view.filename,
  label: view.displayName,
});

const relationshipFromCrossLink = (sourceArtifactId: string, link: ParsedCrossLink): ReviewRelationship => ({
  id: link.id,
  relationship: link.relationship,
  sourceArtifactId,
  targetArtifactId: link.targetArtifactId,
  targetFilename: link.targetFilename,
  description: link.description ?? link.label,
});

/**
 * Performs the runtime half of the review contract at the boundary where parsed
 * artifacts become review evidence. Parser implementations stay free to use
 * their native shapes; consumers only receive valid semantic projections.
 */
export const validateReviewProjection = (projection: ArtifactReviewProjection): ArtifactReviewProjection => {
  const problems: string[] = [];
  const validateSources = (label: string, sources: readonly ReviewSourceLocator[]) => {
    if (sources.length === 0) problems.push(`${label} must cite at least one source.`);
    sources.forEach((source) => {
      if (!isNonEmpty(source.artifactId) || !isNonEmpty(source.filename)) {
        problems.push(`${label} has an incomplete source locator.`);
      }
      if (source.location?.line !== undefined && source.location.line < 1) {
        problems.push(`${label} has an invalid source line.`);
      }
    });
  };

  if (!isNonEmpty(projection.artifactId)) problems.push("Projection must identify its artifact.");
  projection.claims.forEach((claim) => {
    if (!isNonEmpty(claim.id) || !isNonEmpty(claim.statement)) problems.push("Claims require an id and statement.");
    validateSources(`Claim ${claim.id || "<unknown>"}`, claim.sources);
  });
  projection.limitations.forEach((limitation) => {
    if (!isNonEmpty(limitation.id) || !isNonEmpty(limitation.statement)) problems.push("Limitations require an id and statement.");
    validateSources(`Limitation ${limitation.id || "<unknown>"}`, limitation.sources);
  });
  projection.relationships.forEach((relationship) => {
    if (!isNonEmpty(relationship.id) || !isNonEmpty(relationship.sourceArtifactId)) {
      problems.push("Relationships require an id and source artifact.");
    }
    if (!relationship.targetArtifactId && !relationship.targetFilename) {
      problems.push(`Relationship ${relationship.id || "<unknown>"} requires a target.`);
    }
  });

  if (problems.length > 0) throw new Error(`Invalid review projection: ${problems.join(" ")}`);
  return projection;
};

export const projectArtifactForReview = (
  artifact: FileArtifact,
  definition: DeclarativeReviewProjection,
): ArtifactReviewProjection | undefined => {
  if (artifact.parserStatus !== "parsed" || !artifact.parsed) return undefined;

  const view = artifact.parsed;
  const source = sourceFor(view);
  const statement = definition.claim.statement(view);
  const claims = statement
    ? [{...definition.claim, statement, sources: [source]}]
    : [];
  const limitations = [
    ...(definition.limitations ?? []).map((limitation) => ({...limitation, sources: [source]})),
    ...view.diagnostics
      .filter((diagnostic) => diagnostic.severity === "warning" || diagnostic.severity === "error")
      .map((diagnostic, index) => ({
        id: `diagnostic-${index}`,
        statement: diagnostic.message,
        severity: diagnostic.severity === "error" ? "blocking" as const : "caution" as const,
        sources: [{...source, location: diagnostic.location}],
      })),
  ];

  return validateReviewProjection({
    artifactId: artifact.id,
    family: view.family,
    claims,
    sourceLocators: [source],
    limitations,
    relationships: view.crossLinks.map((link) => relationshipFromCrossLink(artifact.id, link)),
    diagnostics: view.diagnostics,
  });
};

const finalCardClaim = (familyLabel: string) => (view: ParsedFileViewModel): string | undefined => {
  const populatedCards = view.summaryCards.filter((card) => card.value !== null);
  if (populatedCards.length === 0) return undefined;
  return `${familyLabel} reported ${populatedCards.length} review summary value${populatedCards.length === 1 ? "" : "s"}.`;
};

// Both adapters use the same projection engine. Their only differences are the
// family-level evidence wording and known limitations.
export const mooseReviewProjection: DeclarativeReviewProjection = {
  claim: {id: "moose-output-summary", strength: "observed", statement: finalCardClaim("MOOSE")},
};

export const bisonReviewProjection: DeclarativeReviewProjection = {
  claim: {id: "bison-output-summary", strength: "qualified", statement: finalCardClaim("BISON")},
  limitations: [{
    id: "synthetic-bison-fixture",
    statement: "This BISON fixture is executable-lite evidence and is not validated fuel-performance output.",
    severity: "caution",
  }],
};

export const projectMooseArtifactForReview = (artifact: FileArtifact) =>
  projectArtifactForReview(artifact, mooseReviewProjection);

export const projectBisonArtifactForReview = (artifact: FileArtifact) =>
  projectArtifactForReview(artifact, bisonReviewProjection);
