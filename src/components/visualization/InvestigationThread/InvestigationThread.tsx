import {useEngineeringDataWorkspace, useOutputWorkspace} from '../../analysis';
import {useGuidedInvestigation} from '../GuidedInvestigation/GuidedInvestigation';

export function InvestigationThread({
    onReturnToOperatingCase,
}: Readonly<{onReturnToOperatingCase?: () => void}>) {
    const investigation = useGuidedInvestigation();
    const workspace = useEngineeringDataWorkspace();
    const outputs = useOutputWorkspace();
    const component = investigation.model.components.find(
        (candidate) => candidate.id === investigation.state.selectedComponentId,
    ) ?? investigation.model.components[0];
    const fixtures = workspace.model.fixtures.fixtures.filter(
        (fixture) => component.fixtureIds.includes(fixture.id),
    );

    return (
        <aside className="panel investigation-thread" aria-label="Active investigation thread">
            <div>
                <p className="eyebrow">investigation thread</p>
                <h2>{component.label}</h2>
                <p>{component.discipline} · {workspace.model.caseLabel}</p>
            </div>
            <dl>
                <div>
                    <dt>Evidence</dt>
                    <dd>{fixtures.map((fixture) => fixture.filename).join(', ') || 'Integrated review set'}</dd>
                </div>
                <div>
                    <dt>Current result</dt>
                    <dd>{formatOutput(component.outputKeys[0], outputs.model)}</dd>
                </div>
            </dl>
            {onReturnToOperatingCase && (
                <button type="button" onClick={onReturnToOperatingCase}>Return to engine view</button>
            )}
        </aside>
    );
}

function formatOutput(
    key: (ReturnType<typeof useGuidedInvestigation>)['model']['components'][number]['outputKeys'][number],
    outputs: ReturnType<typeof useOutputWorkspace>['model'],
): string {
    const definition = outputs.definitions.find((candidate) => candidate.key === key);
    return `${outputs.values[key].toFixed(definition?.precision ?? 1)}${definition?.unit ? ` ${definition.unit}` : ''}`;
}
