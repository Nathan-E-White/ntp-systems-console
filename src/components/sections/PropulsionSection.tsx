import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';
import {FocusedPanel} from '../FocusedPanel';
import {KpiCards} from '../KpiCards';
import {useEngineOutputs} from '../../state/EngineSelectors';

interface PropulsionSectionProps {
    outputs: ReturnType<typeof useEngineOutputs>;
}

export function PropulsionSection({outputs}: Readonly<PropulsionSectionProps>) {
    return (
        <SectionShell
            description="Review thrust, specific impulse, and propellant flow for the current operating point without competing for space with reactor-physics or review content."
            eyebrow="Engine performance"
            title="Propulsion"
            titleId="propulsion-section-title"
        >
            <SectionGrid>
                <FocusedPanel className="panel kpi-panel" workspace="propulsion">
                    <KpiCards outputs={outputs}/>
                </FocusedPanel>
            </SectionGrid>
        </SectionShell>
    );
}
