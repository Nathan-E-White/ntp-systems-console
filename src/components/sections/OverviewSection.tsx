import {DesignReviewPanel} from '../DesignReviewPanel';
import {EngineScene} from '../EngineScene';
import {FocusedPanel} from '../FocusedPanel';
import {ParameterPanel} from '../ParameterPanel';
import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';
import {useEngineInputs, useEngineOutputs} from '../../state/EngineSelectors';

interface OverviewSectionProps {
    inputs: ReturnType<typeof useEngineInputs>;
    outputs: ReturnType<typeof useEngineOutputs>;
}

export function OverviewSection({inputs, outputs}: Readonly<OverviewSectionProps>) {
    return (
        <SectionShell
            description="Review the current design point, operating inputs, engine view, and design-review summary before drilling into the focused discipline tabs."
            eyebrow="System summary"
            title="Overview"
            titleId="overview-section-title"
        >
            <SectionGrid variant="console">
                <ParameterPanel inputs={inputs}/>
                <FocusedPanel className="panel engine-panel" workspace="reactor">
                    <EngineScene inputs={inputs} outputs={outputs}/>
                </FocusedPanel>
            </SectionGrid>

            <SectionGrid>
                <FocusedPanel className="panel review-panel" workspace="review">
                    <DesignReviewPanel inputs={inputs} outputs={outputs}/>
                </FocusedPanel>
            </SectionGrid>
        </SectionShell>
    );
}