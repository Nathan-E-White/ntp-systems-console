import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import {useEngineeringDataWorkspace, useOutputWorkspace} from '../../analysis';
import {useGuidedInvestigation} from '../GuidedInvestigation/GuidedInvestigation';
import type {EvidenceDataset} from '../../../demo/evidenceModel';
import type {SceneComponentId} from '../GuidedInvestigation/GuidedInvestigation.model';

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
                        Calculated values are shown separately. The synthetic fixture was not rerun for this case.
                    </p>
                </div>
            </div>

            <EvidenceReviewTable dataset={dataset}/>
        </section>
    );
}

function EvidenceChart({dataset}: Readonly<{dataset: EvidenceDataset}>) {
    const data = dataset.points.map((point) => ({
        x: point.x,
        label: point.label,
        ...point.values,
    }));

    return (
        <div className="evidence-chart">
            <div className="evidence-chart__heading">
                <h3>{dataset.title}</h3>
                <span>{dataset.family.toUpperCase()}-like synthetic fixture</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{top: 12, right: 18, bottom: 8, left: 2}}>
                    <CartesianGrid stroke="rgba(148, 163, 184, .16)" strokeDasharray="3 3"/>
                    <XAxis
                        dataKey="x"
                        stroke="#94a3b8"
                        tickFormatter={(value) => dataset.points.find((point) => point.x === value)?.label ?? String(value)}
                    />
                    <YAxis stroke="#94a3b8"/>
                    <Tooltip
                        contentStyle={{background: '#111b26', border: '1px solid #405163', borderRadius: 8}}
                        labelFormatter={(value) => `${dataset.xLabel}: ${value}${dataset.xUnit ? ` ${dataset.xUnit}` : ''}`}
                    />
                    <Legend/>
                    {dataset.traces.map((trace) => (
                        <Line
                            dataKey={trace.id}
                            dot={{r: 2}}
                            key={trace.id}
                            name={`${trace.label}${trace.unit ? ` (${trace.unit})` : ''}`}
                            stroke={trace.color}
                            strokeWidth={2.3}
                            type="monotone"
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function EvidenceReviewTable({dataset}: Readonly<{dataset: EvidenceDataset}>) {
    return (
        <div className="evidence-review-table">
            <div className="evidence-chart__heading">
                <h3>Review values</h3>
                <span>Exact fixture records</span>
            </div>
            <div className="parsed-table-wrap">
                <table>
                    <thead>
                        <tr>
                            {dataset.table.columns.map((column) => (
                                <th key={column.id}>
                                    {column.label}{column.unit ? ` (${column.unit})` : ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataset.table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {dataset.table.columns.map((column) => (
                                    <td key={column.id}>{formatValue(row[column.id])}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'number') {
        if (Math.abs(value) > 0 && Math.abs(value) < 0.001) return value.toExponential(3);
        return value.toLocaleString(undefined, {maximumFractionDigits: 4});
    }
    return value;
}
