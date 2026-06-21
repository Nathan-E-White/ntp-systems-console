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

import type {EvidenceDataset} from '../../../demo/evidenceModel';

export function EvidenceDatasetPanels({dataset}: Readonly<{dataset: EvidenceDataset}>) {
    return (
        <div className="evidence-dataset-panels">
            <EvidenceChart dataset={dataset}/>
            <EvidenceReviewTable dataset={dataset}/>
        </div>
    );
}

export function EvidenceChart({dataset}: Readonly<{dataset: EvidenceDataset}>) {
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

export function EvidenceReviewTable({dataset}: Readonly<{dataset: EvidenceDataset}>) {
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
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number') {
        if (Math.abs(value) > 0 && Math.abs(value) < 0.001) return value.toExponential(3);
        return value.toLocaleString(undefined, {maximumFractionDigits: 4});
    }
    return value;
}
