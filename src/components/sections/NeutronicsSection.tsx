import {SectionGrid} from "../layout/SectionGrid";
import {SectionShell} from "../layout/SectionShell";
import {PowerProfilePanel} from '../PowerProfilePanel';
import {ReactorPhysicsPanel} from '../ReactorPhysicsPanel';

export function NeutronicsSection() {

    return <SectionShell
        description="Track the reduced-order reactor-physics signals that drive the current design posture, including reactivity behavior, spatial peaking, and power-shape coupling notes."
        eyebrow="Reactor physics"
        title="Neutronics"
        titleId="neutronics-section-title"
    >
        <SectionGrid>
            <ReactorPhysicsPanel/>
            <PowerProfilePanel/>
        </SectionGrid>
    </SectionShell>;
}