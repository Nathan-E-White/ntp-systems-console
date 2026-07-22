import {describe, expect, it} from "vitest";
import {buildReviewPacket, exportReviewPacket} from "./ReviewPacket";

describe("Review Packet", () => {
  it("preserves decision and evidence ordering in its export", () => {
    const packet = buildReviewPacket({posture: "watch", controllingConcern: "Wall margin", assumptions: ["Fixture only"], recommendedActions: ["Run analysis"]} as never, "ntp_moose.out");
    expect(exportReviewPacket(packet)).toMatch(/Review posture[\s\S]*Evidence claim[\s\S]*Source locator[\s\S]*Limitation[\s\S]*Next action/);
    expect(exportReviewPacket(packet)).toContain("no persistent review record");
  });
});
