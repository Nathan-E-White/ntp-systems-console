import type {IntegratedReview} from "../demo/demoModel";

export interface ReviewPacketData {
  readonly posture: string;
  readonly evidenceClaim: string;
  readonly sourceLocator: string;
  readonly limitation: string;
  readonly nextAction: string;
}

export const buildReviewPacket = (review: IntegratedReview, sourceLocator: string): ReviewPacketData => ({
  posture: review.posture,
  evidenceClaim: review.controllingConcern,
  sourceLocator,
  limitation: review.assumptions[0] ?? "Synthetic fixture evidence is not a recalculated or validated result.",
  nextAction: review.recommendedActions[0] ?? "Close the controlling evidence gap before advancing the case.",
});

export const exportReviewPacket = (packet: ReviewPacketData): string => [
  "# Review Packet",
  "",
  `## Review posture\n${packet.posture}`,
  `## Evidence claim\n${packet.evidenceClaim}`,
  `## Source locator\n${packet.sourceLocator}`,
  `## Limitation\n${packet.limitation}`,
  `## Next action\n${packet.nextAction}`,
  "",
  "Browser-session export only; no persistent review record is implied.",
].join("\n\n");

export function ReviewPacket({packet, onExport}: Readonly<{packet: ReviewPacketData; onExport: () => void}>) {
  return <article className="review-packet print-review" aria-label="Review Packet">
    <header><p className="eyebrow">decision brief</p><h2>Review Packet</h2><span className={`posture-chip ${packet.posture}`}>{packet.posture}</span></header>
    <dl>
      <div><dt>Evidence claim</dt><dd>{packet.evidenceClaim}</dd></div>
      <div><dt>Source locator</dt><dd>{packet.sourceLocator}</dd></div>
      <div><dt>Limitation</dt><dd>{packet.limitation}</dd></div>
      <div><dt>Next action</dt><dd>{packet.nextAction}</dd></div>
    </dl>
    <footer><button onClick={onExport} type="button">Export review packet</button><small>Browser-session export; no persistent storage.</small></footer>
  </article>;
}
