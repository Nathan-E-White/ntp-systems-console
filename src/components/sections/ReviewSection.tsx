import {buildIntegratedReview} from '../../demo/demoModel';
import {buildStabilityInvestigationSummary} from '../../demo/stabilityInvestigationSummary';
import {useEngineStore} from '../../state/EngineStore';
import type {EngineInputs, EngineOutputs} from '../../types/EngineState';
import {SectionShell} from '../layout/SectionShell';
import type {PropsWithChildren} from 'react';
import {useEngineeringDataWorkspace} from '../analysis';
import {InvestigationThread, useGuidedInvestigation} from '../visualization';
import {buildReviewPacket, exportReviewPacket, ReviewPacket} from '../ReviewPacket';

const MATERIAL_CONSTRAINTS = [
    {name: 'Fuel matrix', basis: 'BISON scaffold + MCNP material M2', concern: 'Peak fuel temperature, burnup proxy, hydrogen exposure, and damage index'},
    {name: 'Coating / liner', basis: 'BISON barrier-margin proxy', concern: 'Coating margin, hydrogen attack margin, and hot-wall profile summary'},
    {name: 'Control absorber', basis: 'MCNP/ROCETS restart-memory proxy', concern: 'Worth, xenon penalty, poison hold-down, and shutdown margin'},
];

export function ReviewSection({inputs, outputs}: Readonly<{inputs: EngineInputs; outputs: EngineOutputs}>) {
    const selection = useEngineStore((state) => state.selectedPresetId);
    const workspace = useEngineeringDataWorkspace();
    const investigation = useGuidedInvestigation();
    const component = investigation.model.components.find(
        (candidate) => candidate.id === investigation.state.selectedComponentId,
    ) ?? investigation.model.components[0];
    const review = buildIntegratedReview(selection, inputs, outputs, workspace.model, component);
    const stabilitySummary = buildStabilityInvestigationSummary();
    const sourceLocator = workspace.model.fixtures.fixtures.find((item) => review.selectedFocus.fixtureIds.includes(item.id))?.filename ?? 'Selected fixture record';
    const packet = buildReviewPacket(review, sourceLocator);
    const downloadPacket = () => {
        const blob = new Blob([exportReviewPacket(packet)], {type: 'text/markdown'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ntp-review-packet.md';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <SectionShell eyebrow="design milestone communication" title="Integrated Engineering Review"
                      titleId="review-title"
                      description="Decision posture, evidence basis, and resolution path.">
            <InvestigationThread/>
            <ReviewPacket packet={packet} onExport={downloadPacket}/>
            <section aria-label="Integrated engineering review" className="panel review-summary print-review">
                <div className="review-summary__header">
                    <div><p className="eyebrow">review recommendation</p><h2>{review.customerObjective}</h2></div>
                    <div className="review-summary__actions">
                        <span className={`posture-chip ${review.posture}`}>{review.posture}</span>
                        <button type="button" onClick={() => window.print()}>Print focused review</button>
                    </div>
                </div>
                <div className="review-decision-grid">
                    <ReviewBlock title="Selected case">
                        <p><strong>{review.selectedFocus.label}</strong> · {review.selectedFocus.discipline}</p>
                        <p>{Math.round(outputs.thrustKn)} kN thrust, {Math.round(outputs.specificImpulseSec)} s Isp,
                            {' '}{Math.round(outputs.channelWallCriterionMarginK)} K wall criterion margin,
                            {' '}basis completeness {outputs.basisCompletenessPercent}%.</p>
                    </ReviewBlock>
                    <ReviewBlock title="Controlling concern"><p>{review.controllingConcern}</p></ReviewBlock>
                    <ReviewBlock title="Supporting model evidence">
                        <ul>{review.supportingEvidence.map((item) => <li key={item}>{item}</li>)}</ul>
                    </ReviewBlock>
                    <ReviewBlock title="Assumptions and limitations">
                        <ul>{review.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
                    </ReviewBlock>
                </div>
                <div className="review-callout">
                    <h3>Recommended analyses and trades</h3>
                    <ol>{review.recommendedActions.map((item) => <li key={item}>{item}</li>)}</ol>
                </div>
            </section>

            <section className="panel review-stability-summary">
                <p className="eyebrow">ROCETS stability support</p>
                <h2>Compact Stability Disposition</h2>
                <div className="review-stability-grid">
                    <div>
                        <span>Controlling interval</span>
                        <strong>{Math.round(stabilitySummary.controllingInterval.timeSeconds)} s</strong>
                        <small>{stabilitySummary.controllingInterval.alignedExtremaCount} adverse extrema align</small>
                    </div>
                    <div>
                        <span>Advisory path</span>
                        <strong>{stabilitySummary.advisoryState.statePath.join(' -> ')}</strong>
                        <small>not a qualified margin</small>
                    </div>
                    <div>
                        <span>Solver health</span>
                        <strong>{stabilitySummary.solverHealth.totalStepCuts} cut</strong>
                        <small>{stabilitySummary.solverHealth.residualPassCount}/{stabilitySummary.solverHealth.residualCount} residuals pass</small>
                    </div>
                </div>
            </section>

            <section className="panel">
                <p className="eyebrow">core materials / fuel performance</p>
                <h2>Constraint Handoff</h2>
                <div className="material-constraint-grid">
                    {MATERIAL_CONSTRAINTS.map((item) => (
                        <article key={item.name}><h3>{item.name}</h3><strong>{item.basis}</strong><p>{item.concern}</p></article>
                    ))}
                </div>
                <p className="muted-copy">
                    These are model-interface constraints, not selected or qualified materials. Shielding remains a
                    deferred radiation, dose, and mass trade.
                </p>
            </section>

            <section className="panel evidence-register">
                <p className="eyebrow">review evidence register</p>
                <h2>Traceability</h2>
                {workspace.model.fixtures.fixtures.map((item) => (
                    <div
                        className={review.selectedFocus.fixtureIds.includes(item.id) ? 'evidence-register__focused' : ''}
                        key={item.id}
                    >
                        <strong>{item.family.toUpperCase()}</strong>
                        <span>{item.filename}</span>
                        <span>{review.selectedFocus.fixtureIds.includes(item.id) ? 'selected' : item.parserStatus}</span>
                    </div>
                ))}
            </section>
        </SectionShell>
    );
}

function ReviewBlock({title, children}: PropsWithChildren<{title: string}>) {
    return <section><h3>{title}</h3>{children}</section>;
}
