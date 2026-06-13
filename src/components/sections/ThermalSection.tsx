

import {ImportedAnalysisPanel} from '../ImportedAnalysisPanel';
import {ThermomechanicsPanel} from '../ThermomechanicsPanel';
import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';

export function ThermalSection() {
    return (
        <SectionShell
            description="Review heat-transfer, temperature, stress, and material-limit indicators for the current operating point."
            eyebrow="Thermomechanics"
            title="Thermal"
            titleId="thermal-section-title"
        >
            <SectionGrid>
                <ThermomechanicsPanel/>
                <ImportedAnalysisPanel/>
            </SectionGrid>
        </SectionShell>
    );
}