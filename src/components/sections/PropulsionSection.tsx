import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';
import {FocusedPanel} from '../FocusedPanel';
import {KpiCards} from '../KpiCards';
import {TransientPlots} from '../TransientPlots';
import {useEngineOutputs, useEngineTransient} from '../../state/EngineSelectors';

interface PropulsionSectionProps {
    outputs: ReturnType<typeof useEngineOutputs>;
    transient: ReturnType<typeof useEngineTransient>;
}

export function PropulsionSection({outputs, transient}: Readonly<PropulsionSectionProps>) {
    return (
        <SectionShell
            description="Review thrust, specific impulse, propellant flow, and transient response for the current operating point without competing for space with reactor-physics or review content."
            eyebrow="Engine performance"
            title="Propulsion"
            titleId="propulsion-section-title"
        >
            <SectionGrid>
                <FocusedPanel className="panel kpi-panel" workspace="propulsion">
                    <KpiCards outputs={outputs}/>
                </FocusedPanel>
                <FocusedPanel className="panel plot-panel" workspace="transients">
                    <TransientPlots data={transient}/>
                </FocusedPanel>
            </SectionGrid>
        </SectionShell>
    );
}