import {ENGINE_INPUT_PRESETS} from '../../state/EngineStore';
import {computeEngineOutputs} from '../../physics/propulsionModel';
import type {EngineInputs, EngineOutputs} from '../../types/EngineState';
import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';
import {InvestigationThread, useGuidedInvestigation} from '../visualization';
import {useEngineeringDataWorkspace} from '../analysis';
import {evaluateEngineCase} from '../../physics/evaluateEngineCase';
import {buildChannelAnalysisResult} from '../../physics/channelAnalysisModel';
import {useEngineStore} from '../../state/EngineStore';
import {
    buildStabilityInvestigationSummary,
    type StabilityExtremum,
    type StabilityInvestigationSummary,
} from '../../demo/stabilityInvestigationSummary';

export function StabilitySection({inputs, outputs}: Readonly<{
    inputs: EngineInputs;
    outputs: EngineOutputs;
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
    const stabilitySummary = buildStabilityInvestigationSummary();

    return (
        <SectionShell eyebrow="ROCETS-result interpretation" title="Stability Investigation"
                      titleId="stability-title"
                      description="Compare prepared cases and disposition the controlling flags.">
            <StabilityInvestigationSummaryPanel summary={stabilitySummary}/>
            <StabilityInvestigationDetails summary={stabilitySummary}/>
            <section className="panel stability-disclaimer">
                <strong>Flag basis:</strong> thermal, hydraulic, correlation-range, and completeness checks; no composite score.
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
            <section className="panel review-callout">
                <p className="eyebrow">evidence context</p>
                <h3>{selectedEvidence?.title ?? component.label}</h3>
                <p>{selectedEvidence?.interpretation ?? component.claimBoundary}</p>
            </section>
        </SectionShell>
    );
}

function StabilityInvestigationSummaryPanel({summary}: Readonly<{summary: StabilityInvestigationSummary}>) {
    const solverCutLabel = `${summary.solverHealth.totalStepCuts} cut`;
    const solverResidualLabel = `${summary.solverHealth.residualPassCount}/${summary.solverHealth.residualCount} residuals pass`;

    return (
        <section className="panel stability-investigation-summary" aria-labelledby="stability-investigation-summary-title">
            <p className="eyebrow">fixture-derived summary</p>
            <h2 id="stability-investigation-summary-title">Stability investigation</h2>
            <p>
                Restart/cooldown evidence concentrates at {formatTime(summary.controllingInterval.timeSeconds)};
                no composite stability score is produced.
            </p>
            <div className="stability-summary-grid" aria-label="Stability investigation links">
                <SummaryLink
                    href="#stability-controlling-interval"
                    label="Controlling Interval"
                    value={formatTime(summary.controllingInterval.timeSeconds)}
                    detail={`${summary.controllingInterval.alignedExtremaCount} adverse extrema align`}
                />
                <SummaryLink
                    href="#stability-advisory-state"
                    label="Advisory state"
                    value={summary.advisoryState.statePath.join(' -> ')}
                    detail={`watch sampled ${formatTime(summary.advisoryState.watchStart?.timeSeconds)}-${formatTime(summary.advisoryState.watchEnd?.timeSeconds)}`}
                />
                <SummaryLink
                    href="#stability-coupled-proxy-alignment"
                    label="Coupled proxy alignment"
                    value={formatTime(summary.controllingInterval.timeSeconds)}
                    detail={`${summary.coupledProxyExtrema.length} displayed MOOSE extrema`}
                />
                <SummaryLink
                    href="#stability-solver-health"
                    label="Solver health"
                    value={solverCutLabel}
                    detail={solverResidualLabel}
                />
                <SummaryLink
                    href="#stability-boundary"
                    label="Boundary"
                    value="Advisory"
                    detail="not a qualified margin"
                />
            </div>
        </section>
    );
}

function SummaryLink({
    href,
    label,
    value,
    detail,
}: Readonly<{
    href: string;
    label: string;
    value: string;
    detail: string;
}>) {
    return (
        <a className="stability-summary-link" href={href}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
        </a>
    );
}

function StabilityInvestigationDetails({summary}: Readonly<{summary: StabilityInvestigationSummary}>) {
    const stepCutEvent = summary.eventAlignment.stepCutEvent;
    const ledineggWarning = summary.eventAlignment.ledineggWarning;

    return (
        <div className="stability-detail-grid" aria-label="Stability investigation supporting details">
            <section className="panel stability-detail-panel" id="stability-controlling-interval">
                <p className="eyebrow">supporting detail</p>
                <h3>Controlling interval detector</h3>
                <p>{summary.controllingInterval.rankReason} The selected window is the {summary.controllingInterval.windowLabel}.</p>
                <dl className="stability-metric-list">
                    <div>
                        <dt>Selected interval</dt>
                        <dd>{formatTime(summary.controllingInterval.timeSeconds)}</dd>
                    </div>
                    <div>
                        <dt>Aligned extrema</dt>
                        <dd>{summary.controllingInterval.alignedExtremaCount}</dd>
                    </div>
                    <div>
                        <dt>Evidence basis</dt>
                        <dd>ROCETS advisory history plus MOOSE coupling proxies</dd>
                    </div>
                </dl>
            </section>

            <section className="panel stability-detail-panel" id="stability-advisory-state">
                <p className="eyebrow">supporting detail</p>
                <h3>Ledinegg advisory state machine</h3>
                <p>{summary.advisoryState.statePath.join(' -> ')}</p>
                <dl className="stability-metric-list">
                    <div>
                        <dt>Minimum ROCETS margin</dt>
                        <dd>{formatFixed(summary.advisoryState.minimumMargin.margin, 3)} at {formatTime(summary.advisoryState.minimumMargin.timeSeconds)}</dd>
                    </div>
                    <div>
                        <dt>Watch samples</dt>
                        <dd>{formatTime(summary.advisoryState.watchStart?.timeSeconds)} through {formatTime(summary.advisoryState.watchEnd?.timeSeconds)}</dd>
                    </div>
                    <div>
                        <dt>Final state</dt>
                        <dd>{summary.advisoryState.finalState.ledinegg} at {formatTime(summary.advisoryState.finalState.timeSeconds)}</dd>
                    </div>
                </dl>
            </section>

            <section className="panel stability-detail-panel stability-detail-panel--wide" id="stability-coupled-proxy-alignment">
                <p className="eyebrow">supporting detail</p>
                <h3>Coupled proxy alignment</h3>
                <p>
                    Event alignment: {stepCutEvent ? `${stepCutEvent.cuts} step cut at ${formatTime(stepCutEvent.timeSeconds)}` : 'no step cut'},
                    restart window {summary.eventAlignment.restartWindowLabel},
                    {ledineggWarning?.timeSeconds ? ` Ledinegg warning at ${formatTime(ledineggWarning.timeSeconds)}` : ' no Ledinegg warning'}.
                </p>
                <table className="comparison-table stability-extrema-table">
                    <thead>
                    <tr><th>Proxy</th><th>Extremum</th><th>Time</th><th>Direction</th></tr>
                    </thead>
                    <tbody>
                    {summary.coupledProxyExtrema.map((extremum) => (
                        <tr key={extremum.id}>
                            <th>{extremum.label}</th>
                            <td>{formatExtremumValue(extremum)}</td>
                            <td>{formatTime(extremum.timeSeconds)}</td>
                            <td>{extremum.direction}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>

            <section className="panel stability-detail-panel" id="stability-solver-health">
                <p className="eyebrow">supporting detail</p>
                <h3>Numerical run stability</h3>
                <p>
                    Separate from physical stability: ROCETS reports {summary.solverHealth.rejectedSteps} rejected/time-cut step
                    and {summary.solverHealth.residualPassCount} of {summary.solverHealth.residualCount} residual summaries pass.
                </p>
                <dl className="stability-metric-list">
                    <div>
                        <dt>Maximum time cuts</dt>
                        <dd>{summary.solverHealth.maximumTimeCuts}</dd>
                    </div>
                    <div>
                        <dt>Worst residual utilization</dt>
                        <dd>{humanizeKey(summary.solverHealth.worstResidual.name)} at {formatPercent(summary.solverHealth.worstResidual.utilization)}</dd>
                    </div>
                    <div>
                        <dt>Step cut event</dt>
                        <dd>{stepCutEvent ? `${stepCutEvent.phase} at ${formatTime(stepCutEvent.timeSeconds)}` : 'none'}</dd>
                    </div>
                </dl>
            </section>

            <section className="panel stability-detail-panel" id="stability-boundary">
                <p className="eyebrow">supporting detail</p>
                <h3>Boundary and hydraulic comparison</h3>
                <ul className="stability-boundary-list">
                    {summary.boundary.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <dl className="stability-metric-list">
                    <div>
                        <dt>{summary.hydraulicComparison.ratedBurn.label}</dt>
                        <dd>{formatResistance(summary.hydraulicComparison.ratedBurn.average)} average</dd>
                    </div>
                    <div>
                        <dt>{summary.hydraulicComparison.restartCooldown.label}</dt>
                        <dd>
                            {formatResistance(summary.hydraulicComparison.restartCooldown.minimum)}
                            -{formatResistance(summary.hydraulicComparison.restartCooldown.maximum)}
                        </dd>
                    </div>
                </dl>
            </section>
        </div>
    );
}

function CompareRow({label, baseline, investigation}: {label: string; baseline: string; investigation: string}) {
    return <tr><th>{label}</th><td>{baseline}</td><td>{investigation}</td></tr>;
}

function formatTime(timeSeconds: number | undefined): string {
    return timeSeconds === undefined ? 'unavailable' : `${Math.round(timeSeconds)} s`;
}

function formatFixed(value: number, digits: number): string {
    return value.toFixed(digits);
}

function formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

function formatResistance(value: number): string {
    return `${Math.round(value / 1000).toLocaleString()}k`;
}

function formatExtremumValue(extremum: StabilityExtremum): string {
    const value = Math.abs(extremum.value) >= 1000
        ? Math.round(extremum.value).toLocaleString()
        : extremum.value.toFixed(3).replace(/\.?0+$/u, '');

    return extremum.unit ? `${value} ${extremum.unit}` : value;
}

function humanizeKey(value: string): string {
    return value.replaceAll('_', ' ');
}
