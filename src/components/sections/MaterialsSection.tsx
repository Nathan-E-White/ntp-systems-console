

import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';

export function MaterialsSection() {
    return (
        <SectionShell
            description="Review fuel, moderator, cladding, and structural-material assumptions as dedicated materials models are promoted into the console."
            eyebrow="Material limits"
            title="Materials"
            titleId="materials-section-title"
        >
            <SectionGrid>
                <section className="panel section-placeholder">
                    <p className="eyebrow">Materials model</p>
                    <h3>Materials workspace pending</h3>
                    <p>
                        This section is reserved for fuel-form, moderator, cladding, coating, and structural-material
                        indicators. Dedicated materials panels can be added here without crowding the Overview or
                        Thermal workspaces.
                    </p>
                </section>
            </SectionGrid>
        </SectionShell>
    );
}