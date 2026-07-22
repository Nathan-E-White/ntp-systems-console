import {describe, expect, it} from "vitest";

import {DEFAULT_ANALYSIS_EVIDENCE} from "../demo/demoModel";
import {canonicalFixture, canonicalFixtureBundleImpact, canonicalFixtures} from "./canonicalFixtures";

describe("canonical fixture catalog", () => {
  it("is the shared source for every product-loaded evidence artifact", () => {
    const productFixtureIds = {
      "mcnp-fixed-source-input": "mcnp-fixed-source-input",
      "mcnp-output": "mcnp-fixed-source-output",
      "mcnp-criticality-input": "mcnp-criticality-input",
      "mcnp-criticality-output": "mcnp-criticality-output",
      "bison-input": "bison-input",
      "bison-output": "bison-output",
      "moose-input": "moose-input",
      "moose-output": "moose-output",
      "rocets-input": "rocets-input",
      "rocets-output": "rocets-output",
    } as const;

    for (const evidence of DEFAULT_ANALYSIS_EVIDENCE) {
      const fixture = canonicalFixture(productFixtureIds[evidence.id as keyof typeof productFixtureIds]);
      expect(evidence.sourceFile).toBe(fixture.filename);
      expect(evidence.artifact.text).toBe(fixture.text);
    }
  });

  it("keeps every canonical fixture named and non-empty for bundle accounting", () => {
    expect(Object.values(canonicalFixtures)).toHaveLength(10);
    expect(Object.values(canonicalFixtures).every((fixture) => fixture.filename.length > 0 && fixture.text.length > 0)).toBe(true);
    expect(canonicalFixtureBundleImpact).toMatchObject({fixtureCount: 10});
    expect(canonicalFixtureBundleImpact.rawTextBytes).toBeGreaterThan(250_000);
  });
});
