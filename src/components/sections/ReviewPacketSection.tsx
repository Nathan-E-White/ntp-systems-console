import {ReviewPacketExportPanel} from '../ReviewCapabilityPanels';
import {SectionShell} from '../layout/SectionShell';

export function ReviewPacketSection() {
    return (
        <SectionShell
            eyebrow="portfolio workflow"
            title="Review Packet"
            titleId="review-packet-section-title"
            description="Export the current review context without creating a persistent analyst record."
        >
            <ReviewPacketExportPanel/>
        </SectionShell>
    );
}
