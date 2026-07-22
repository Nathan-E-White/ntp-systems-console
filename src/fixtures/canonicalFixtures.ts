import bisonInput from "./bison/ntp.bison.i?raw";
import bisonOutput from "./bison/ntp.bison.o?raw";
import bisonMetadata from "./ntp.bison.metadata.json";
import criticalityInput from "./mcnp/ntp_crit.inp?raw";
import criticalityOutput from "./mcnp/ntp_crit.out?raw";
import fixedSourceInput from "./mcnp/ntp_mcnp.inp?raw";
import fixedSourceOutput from "./mcnp/ntp_mcnp.out?raw";
import mooseInput from "./moose/ntp_moose.inp?raw";
import mooseOutput from "./moose/ntp_moose.out?raw";
import rocetsInput from "./rocets/ntp_rocet.inp?raw";
import rocetsOutput from "./rocets/ntp_rocet.out?raw";

export interface CanonicalFixture {
  readonly filename: string;
  readonly text: string;
}

export const canonicalFixtures = {
  "mcnp-fixed-source-input": {filename: "ntp_mcnp.inp", text: fixedSourceInput},
  "mcnp-fixed-source-output": {filename: "ntp_mcnp.out", text: fixedSourceOutput},
  "mcnp-criticality-input": {filename: "ntp_crit.inp", text: criticalityInput},
  "mcnp-criticality-output": {filename: "ntp_crit.out", text: criticalityOutput},
  "bison-input": {filename: "ntp.bison.i", text: bisonInput},
  "bison-output": {filename: "ntp.bison.o", text: bisonOutput},
  "moose-input": {filename: "ntp_moose.inp", text: mooseInput},
  "moose-output": {filename: "ntp_moose.out", text: mooseOutput},
  "rocets-input": {filename: "ntp_rocet.inp", text: rocetsInput},
  "rocets-output": {filename: "ntp_rocet.out", text: rocetsOutput},
} as const satisfies Record<string, CanonicalFixture>;

export type CanonicalFixtureId = keyof typeof canonicalFixtures;

export const canonicalFixture = (id: CanonicalFixtureId): CanonicalFixture => canonicalFixtures[id];

/** The raw fixture payload intentionally bundled with the product. */
export const canonicalFixtureBundleImpact = Object.freeze({
  fixtureCount: Object.keys(canonicalFixtures).length,
  rawTextBytes: Object.values(canonicalFixtures).reduce(
    (total, fixture) => total + new TextEncoder().encode(fixture.text).byteLength,
    0,
  ),
});

export const BISON_FUEL_PERFORMANCE_METADATA = bisonMetadata;
