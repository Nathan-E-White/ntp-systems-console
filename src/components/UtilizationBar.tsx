export function UtilizationBar({label, value}: Readonly<{ label: string; value: number }>) {
    const boundedValue = Math.min(Math.max(value, 0), 1.25);
    const percent = Math.round(boundedValue * 100);

    return (
        <div className="utilization-row">
            <div className="metric-row">
                <dt>{label}</dt>
                <dd>{percent}%</dd>
            </div>
            <div className="utilization-track" aria-label={`${label}: ${percent}%`}>
                <span className={buildUtilizationClassName(value)} style={{width: `${Math.min(percent, 100)}%`}}/>
            </div>
        </div>
    );
}