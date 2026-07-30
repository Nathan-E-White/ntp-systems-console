import {lazy, Suspense} from 'react';
import {DesignReviewPanel} from '../DesignReviewPanel';
import {KpiCards} from '../KpiCards';
import {ParameterPanel} from '../ParameterPanel';
import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';
import type {EngineInputs, EngineOutputs} from '../../types/EngineState';
import {EvidenceInspector, InvestigationThread, type SceneComponentId} from '../visualization';
import {CalculationBasisInspector} from '../CalculationBasisInspector';
import {ModelBasisPanel} from '../ModelBasisPanel';
import {ChannelAnalysisPanel} from '../ChannelAnalysisPanel';
import {RecoveryState} from '../RecoveryState';
import {DecisionCockpit} from '../DecisionCockpit';

const EngineScene = lazy(async () => {
    const module = await import('../EngineScene');
    return {default: module.EngineScene};
});

export function OperatingCaseSection({
    inputs,
    outputs,
    onOpenModelEvidence,
}: Readonly<{
    inputs: EngineInputs;
    outputs: EngineOutputs;
    onOpenModelEvidence: (componentId: SceneComponentId) => void;
}>) {
    return (
            <SectionShell eyebrow="engine operations" title="Operating Case"
                      titleId="operating-case-title"
                      description="Set the operating point and identify the controlling condition.">
            <DecisionCockpit inputs={inputs} outputs={outputs}/>
            <section className="portrait-decision-lead" aria-label="Controlling condition">
                <p className="eyebrow">review posture</p>
                <strong>Channel-wall criterion margin: {outputs.channelWallCriterionMarginK.toFixed(0)} K</strong>
                <p>{outputs.channelWallCriterionMarginK < 0
                    ? 'Limit exceeded. Reduce thermal loading or increase hydrogen flow before using this case for review.'
                    : 'Screening margin remains positive. Inspect its assumptions and evidence before treating it as a decision.'}</p>
             </section>
            <SectionGrid variant="console">
                <div className="operating-workspace">
                    <section className="panel engine-panel">
                        <Suspense fallback={<RecoveryState kind="loading" detail="Loading interactive engine schematic…"/>}>
                            <EngineScene inputs={inputs} outputs={outputs}/>
                        </Suspense>
                    </section>
                    <aside className="operating-side-rail" aria-label="Operating case summary">
                        <KpiCards outputs={outputs}/>
                        <InvestigationThread/>
                        <ParameterPanel inputs={inputs}/>
                    </aside>
                </div>
            </SectionGrid>
            <ModelBasisPanel inputs={inputs}/>
            <ChannelAnalysisPanel inputs={inputs}/>
            <CalculationBasisInspector inputs={inputs}/>
            <EvidenceInspector onOpenModelEvidence={onOpenModelEvidence}/>
            <SectionGrid>
                <DesignReviewPanel inputs={inputs} outputs={outputs}/>
            </SectionGrid>
        </SectionShell>
    );
}
