import {useEngineeringDataWorkspace, useOutputWorkspace} from '../../analysis';
import {useGuidedInvestigation} from '../GuidedInvestigation/GuidedInvestigation';
import type {SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';
import {EvidenceChart, EvidenceReviewTable} from './EvidenceDatasetPanels';

export function EvidenceInspector({onOpenModelEvidence}: Readonly<{
    onOpenModelEvidence: (componentId: SceneComponentId) => void;
}>) {
    const workspace = useEngineeringDataWorkspace();
    const outputs = useOutputWorkspace();
    const investigation = useGuidedInvestigation();
    const component = investigation.model.components.find(
        (candidate) => candidate.id === investigation.state.selectedComponentId,
    ) ?? investigation.model.components[0];
    const view = workspace.model.investigationEvidence.views.find(
        (candidate) => candidate.id === component.evidenceViewId,
    ) ?? workspace.model.investigationEvidence.views[0];
    const dataset = workspace.model.investigationEvidence.datasets.find(
        (candidate) => candidate.id === view.datasetId,
    );

    if (!dataset) return null;

    return (
        <section className="panel evidence-inspector" aria-labelledby="evidence-inspector-title">
            <header className="evidence-inspector__header">
                <div>
                    <p className="eyebrow">selected engineering evidence</p>
                    <h2 id="evidence-inspector-title">{component.label}</h2>
                    <p>{view.interpretation}</p>
                </div>
                <div className="evidence-inspector__source">
                    <span>{dataset.sourceFile}</span>
                    <strong>{dataset.validationLabel}</strong>
                    <button
                        type="button"
                        onClick={() => onOpenModelEvidence(component.id)}
                    >
                        Open full parsed records
                    </button>
                </div>
            </header>

            <div className="evidence-inspector__comparison">
                <EvidenceChart dataset={dataset}/>
                <div className="evidence-inspector__current">
                    <p className="eyebrow">current reduced-order case</p>
                    <h3>{workspace.model.caseLabel}</h3>
                    <dl>
                        {view.comparisonOutputKeys.map((key) => {
                            const definition = outputs.model.definitions.find((candidate) => candidate.key === key);
                            return (
                                <div key={key}>
                                    <dt>{definition?.label ?? key}</dt>
                                    <dd>
                                        {outputs.model.values[key].toFixed(definition?.precision ?? 1)}
                                        {definition?.unit ? ` ${definition.unit}` : ''}
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>
                    <p className="evidence-inspector__separation">
                        Calculated case · fixture reference
                    </p>
                </div>
            </div>

            <EvidenceReviewTable dataset={dataset}/>
        </section>
    );
}
