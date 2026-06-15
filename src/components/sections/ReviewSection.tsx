import {buildIntegratedReview} from '../../demo/demoModel';
import {useEngineStore} from '../../state/EngineStore';
import type {EngineInputs, EngineOutputs} from '../../types/EngineState';
import {SectionShell} from '../layout/SectionShell';
import type {PropsWithChildren} from 'react';
import {useEngineeringDataWorkspace} from '../analysis';
import {InvestigationThread, useGuidedInvestigation} from '../visualization';

const MATERIAL_CONSTRAINTS = [
    {name: 'Fuel matrix', basis: 'Graphite-composite placeholder', concern: 'Peak fuel temperature and hydrogen compatibility'},
    {name: 'Core support', basis: 'Refractory structural placeholder', concern: 'Thermal stress, creep, and pressure-drop coupling'},
    {name: 'Control absorber', basis: 'Boron-bearing placeholder', concern: 'Worth, temperature response, and shutdown margin'},
];

export function ReviewSection({inputs, outputs}: Readonly<{inputs: EngineInputs; outputs: EngineOutputs}>) {
    const selection = useEngineStore((state) => state.selectedPresetId);
    const workspace = useEngineeringDataWorkspace();
    const investigation = useGuidedInvestigation();
    const component = investigation.model.components.find(
        (candidate) => candidate.id === investigation.state.selectedComponentId,
    ) ?? investigation.model.components[0];
    const review = buildIntegratedReview(selection, inputs, outputs, workspace.model, component);

    return (
        <SectionShell eyebrow="design milestone communication" title="Integrated Engineering Review"
                      titleId="review-title"
                      description="Decision posture, evidence basis, and resolution path.">
            <InvestigationThread/>
            <article className="panel review-summary print-review">
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
            </article>

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
