import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {MODEL_PROFILES} from '../physics/modelProfiles';
import {getReferenceRecord} from '../physics/referenceBasis';
import type {EngineInputs} from '../types/EngineState';

const BADGE_LABELS = {
    published: 'Cited',
    'physical-constant': 'Cited',
    derived: 'Derived',
    calibrated: 'Calibrated',
    'user-supplied': 'User',
    fixture: 'Fixture',
    missing: 'Missing',
} as const;

export function ModelBasisPanel({inputs}: Readonly<{inputs: EngineInputs}>) {
    const evaluation = evaluateEngineCase(inputs);
    const profile = MODEL_PROFILES[inputs.modelProfileId];
    const displayedBasis = inputs.modelProfileId === 'thermalInvestigation'
        ? [...MODEL_PROFILES.peweeInspired.basis, ...profile.basis]
        : profile.basis;
    const warningCount = evaluation.basis.diagnostics.filter((item) => item.severity === 'warning').length;
    const incompleteCount = evaluation.basis.diagnostics.filter((item) => item.severity === 'incomplete').length;

    return (
        <section className={`panel model-basis-panel ${evaluation.basis.completeness}`}>
            <header className="model-basis-panel__header">
                <div>
                    <p className="eyebrow">source-controlled calculation posture</p>
                    <h2>Basis &amp; Limits</h2>
                    <p>{profile.description}</p>
                </div>
                <div className="model-basis-panel__status">
                    <span>Selected profile</span>
                    <strong>{profile.label}</strong>
                    <b>{evaluation.basis.completeness}</b>
                </div>
            </header>

            <div className="model-basis-panel__grid">
                <section>
                    <h3>Value provenance</h3>
                    <div className="basis-badge-list">
                        {displayedBasis.map((item) => {
                            const reference = item.referenceId ? getReferenceRecord(item.referenceId) : undefined;
                            return (
                                <article key={item.id}>
                                    <span className={`basis-badge basis-badge--${item.classification}`}>
                                        {BADGE_LABELS[item.classification]}
                                    </span>
                                    <div>
                                        <strong>{item.label}</strong>
                                        <p>
                                            {item.originalValue === undefined ? '' : `${item.originalValue.toLocaleString()} ${item.unit ?? ''} · `}
                                            {item.rationale}
                                        </p>
                                        {reference ? (
                                            <a href={reference.url} target="_blank" rel="noreferrer">
                                                {reference.reportNumber ?? reference.title} · {item.locator ?? reference.locator}
                                            </a>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section>
                    <h3>Completeness and controls</h3>
                    <dl className="basis-summary-list">
                        <div><dt>Warnings</dt><dd>{warningCount}</dd></div>
                        <div><dt>Missing prerequisites</dt><dd>{incompleteCount}</dd></div>
                        <div><dt>Thermal coupling</dt><dd>{inputs.thermalCouplingMode === 'benchmarkClosure' ? 'Calibrated to 2550 K benchmark' : 'User supplied'}</dd></div>
                        <div><dt>Channel geometry</dt><dd>Representative NERVA-family basis</dd></div>
                        <div><dt>Fixture evidence</dt><dd>Immutable</dd></div>
                    </dl>
                    {inputs.overrideRationale ? (
                        <p className="basis-override"><strong>Active override:</strong> {inputs.overrideRationale}</p>
                    ) : null}
                    <ul className="basis-diagnostic-list">
                        {evaluation.basis.diagnostics.slice(0, 6).map((item) => (
                            <li className={item.severity} key={item.id}>{item.message}</li>
                        ))}
                    </ul>
                </section>
            </div>

            <footer>
                <strong>Claim boundary</strong>
                <p>{evaluation.basis.claimBoundary}</p>
                <a href="/docs/reduced-order-model-basis.html">Open model-data handbook</a>
            </footer>
        </section>
    );
}
