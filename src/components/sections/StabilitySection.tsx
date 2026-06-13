import {ENGINE_INPUT_PRESETS} from '../../state/EngineStore';
import {computeEngineOutputs} from '../../physics/propulsionModel';
import type {EngineInputs, EngineOutputs} from '../../types/EngineState';
import type {TransientPoint} from '../../types/TransientPoint';
import {TransientPlots} from '../TransientPlots';
import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';
import {InvestigationThread, useGuidedInvestigation} from '../visualization';
import {useEngineeringDataWorkspace} from '../analysis';
import {evaluateEngineCase} from '../../physics/evaluateEngineCase';
import {buildChannelAnalysisResult} from '../../physics/channelAnalysisModel';
import {useEngineStore} from '../../state/EngineStore';

export function StabilitySection({inputs, outputs, transient}: Readonly<{
    inputs: EngineInputs;
    outputs: EngineOutputs;
    transient: TransientPoint[];
}>) {
    const baseline = computeEngineOutputs(ENGINE_INPUT_PRESETS.baselineStartup);
    const investigation = computeEngineOutputs(ENGINE_INPUT_PRESETS.thermalMarginInvestigation);
    const selectedStationIndex = useEngineStore((state) => state.selectedChannelStationIndex);
    const evaluation = evaluateEngineCase(inputs);
    const channelAnalysis = buildChannelAnalysisResult(
        inputs,
        outputs,
        evaluation.channel,
        selectedStationIndex,
    );
    const investigationThread = useGuidedInvestigation();
    const workspace = useEngineeringDataWorkspace();
    const component = investigationThread.model.components.find(
        (candidate) => candidate.id === investigationThread.state.selectedComponentId,
    ) ?? investigationThread.model.components[0];
    const selectedEvidence = workspace.model.investigationEvidence.views.find(
        (view) => view.id === component.evidenceViewId,
    );

    return (
        <SectionShell eyebrow="ROCETS-result interpretation" title="Stability Investigation"
                      titleId="stability-title"
                      description="Interpret channel hydraulics, model-basis completeness, and prepared-case review flags before requesting higher-fidelity analysis.">
            <section className="panel stability-disclaimer">
                <strong>Interpretation boundary:</strong> no synthetic 0-100 engine-stability score is used.
                This section routes explicit thermal, hydraulic, correlation-range, and completeness flags to follow-up analysis.
            </section>
            <InvestigationThread/>
            <SectionGrid>
                <section className="panel">
                    <p className="eyebrow">engineering review flags</p>
                    <h2>Current posture: {outputs.reviewPosture}</h2>
                    <div className="contributor-list">
                        {channelAnalysis.reviewFlags.map((item) => (
                            <div className={item.severity} key={item.id}>
                                <span>{item.severity}</span><strong>{item.title}</strong>
                                <small>{item.message}</small>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="panel">
                    <p className="eyebrow">prepared case comparison</p>
                    <h2>Baseline vs. Investigation</h2>
                    <table className="comparison-table">
                        <thead><tr><th>Metric</th><th>Baseline</th><th>Investigation</th></tr></thead>
                        <tbody>
                            <CompareRow label="Wall criterion margin" baseline={`${Math.round(baseline.channelWallCriterionMarginK)} K`} investigation={`${Math.round(investigation.channelWallCriterionMarginK)} K`}/>
                            <CompareRow label="Thrust" baseline={`${Math.round(baseline.thrustKn)} kN`} investigation={`${Math.round(investigation.thrustKn)} kN`}/>
                            <CompareRow label="Pressure drop" baseline={`${baseline.pressureDropMpa.toFixed(2)} MPa`} investigation={`${investigation.pressureDropMpa.toFixed(2)} MPa`}/>
                            <CompareRow label="Basis completeness" baseline={`${baseline.basisCompletenessPercent}%`} investigation={`${investigation.basisCompletenessPercent}%`}/>
                            <CompareRow label="Posture" baseline={baseline.reviewPosture} investigation={investigation.reviewPosture}/>
                        </tbody>
                    </table>
                </section>
            </SectionGrid>
            <TransientPlots data={transient}/>
            <section className="panel review-callout">
                <p className="eyebrow">selected evidence interpretation</p>
                <h3>{selectedEvidence?.title ?? component.label}</h3>
                <p>{selectedEvidence?.interpretation ?? component.claimBoundary}</p>
                <h3>Discipline follow-up</h3>
                <ul>
                    <li>Neutronics: correlate control-drum schedule and power peaking with the limiting time.</li>
                    <li>Thermal/fuel: evaluate hot-channel conduction, qualified material criteria, and property sensitivity.</li>
                    <li>Propulsion: close feed-system, regenerative, pump, and turbine pressure losses using applicable maps or geometry.</li>
                    <li>Transient analysis: replace the illustrative timeline with a time-integrated model before startup or restart conclusions.</li>
                </ul>
            </section>
        </SectionShell>
    );
}

function CompareRow({label, baseline, investigation}: {label: string; baseline: string; investigation: string}) {
    return <tr><th>{label}</th><td>{baseline}</td><td>{investigation}</td></tr>;
}
