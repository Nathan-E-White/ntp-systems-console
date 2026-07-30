import {describe, expect, it} from "vitest";

import {canonicalFixture} from "../fixtures/canonicalFixtures";
import {createFileArtifactFromText} from "./createFileArtifactFromText";
import {
  projectBisonArtifactForReview,
  projectMooseArtifactForReview,
  validateReviewProjection,
} from "./reviewProjection";

describe("schema-driven review projection", () => {
  it("projects MOOSE and BISON artifacts through the shared declarative contract", () => {
    const moose = createFileArtifactFromText({...canonicalFixture("moose-output"), id: "moose-evidence"});
    const bison = createFileArtifactFromText({...canonicalFixture("bison-output"), id: "bison-evidence"});

    const mooseProjection = projectMooseArtifactForReview(moose);
    const bisonProjection = projectBisonArtifactForReview(bison);

    expect(mooseProjection?.claims).toMatchObject([{id: "moose-output-summary", strength: "observed"}]);
    expect(mooseProjection?.claims[0]?.sources).toEqual([{artifactId: "moose-evidence", filename: "ntp_moose.out", label: "MOOSE output"}]);
    expect(bisonProjection?.claims).toMatchObject([{id: "bison-output-summary", strength: "qualified"}]);
    expect(bisonProjection?.limitations).toEqual(expect.arrayContaining([
      expect.objectContaining({id: "synthetic-bison-fixture", severity: "caution"}),
    ]));
  });

  it("rejects claims and relationships that cannot be cited", () => {
    expect(() => validateReviewProjection({
      artifactId: "",
      family: "moose",
      claims: [{id: "uncited", statement: "Unsupported claim", strength: "observed", sources: []}],
      sourceLocators: [],
      limitations: [],
      relationships: [{id: "missing-target", relationship: "references_file", sourceArtifactId: "source"}],
      diagnostics: [],
    })).toThrow(/must identify its artifact.*cite at least one source.*requires a target/);
  });
});
