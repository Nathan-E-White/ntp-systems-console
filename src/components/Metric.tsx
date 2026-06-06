export function Metric({label, value}: Readonly<{ label: string; value: string }>) {
    return (
        <div className="metric-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}
