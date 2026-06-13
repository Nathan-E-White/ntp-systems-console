import {lazy, Suspense} from 'react';
import {DesignReviewPanel} from '../DesignReviewPanel';
import {KpiCards} from '../KpiCards';
import {ParameterPanel} from '../ParameterPanel';
import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';
import type {EngineInputs, EngineOutputs} from '../../types/EngineState';
import {EvidenceInspector, type SceneComponentId} from '../visualization';
import {CalculationBasisInspector} from '../CalculationBasisInspector';
import {ModelBasisPanel} from '../ModelBasisPanel';
import {ChannelAnalysisPanel} from '../ChannelAnalysisPanel';

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
                      description="Define an operating phase, inspect the reduced-order response, and identify the condition that should drive higher-fidelity model handoff.">
            <SectionGrid variant="console">
                <ParameterPanel inputs={inputs}/>
                <section className="panel engine-panel">
                    <Suspense fallback={<div className="scene-loading">Loading interactive engine schematic…</div>}>
                        <EngineScene inputs={inputs} outputs={outputs}/>
                    </Suspense>
                </section>
                <KpiCards outputs={outputs}/>
            </SectionGrid>
            <ModelBasisPanel inputs={inputs}/>
            <ChannelAnalysisPanel inputs={inputs}/>
            <CalculationBasisInspector inputs={inputs}/>
            <EvidenceInspector onOpenModelEvidence={onOpenModelEvidence}/>
            <SectionGrid>
                <DesignReviewPanel inputs={inputs} outputs={outputs}/>
                <section className="panel model-boundary-panel">
                    <p className="eyebrow">claim boundary</p>
                    <h2>What changed?</h2>
                    <p>Performance, channel-wall criterion margin, channel pressure drop, and model-basis completeness are recalculated from the controls.</p>
                    <p>MCNP-like, MOOSE-like, and ROCETS-like evidence remains static until a fixture is explicitly reparsed.</p>
                </section>
            </SectionGrid>
        </SectionShell>
    );
}
