import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import {buildChannelAnalysisResult, getAxialRegionForStation} from '../physics/channelAnalysisModel';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {useEngineStore} from '../state/EngineStore';
import type {EngineInputs} from '../types/EngineState';
import {ChannelStationLayout} from './ChannelStationLayout';

export function ChannelAnalysisPanel({inputs}: Readonly<{inputs: EngineInputs}>) {
    const selectedStationIndex = useEngineStore((state) => state.selectedChannelStationIndex);
    const setSelectedStationIndex = useEngineStore((state) => state.setSelectedChannelStationIndex);
    const evaluation = evaluateEngineCase(inputs);
    const analysis = buildChannelAnalysisResult(
        inputs,
        evaluation.outputs,
        evaluation.channel,
        selectedStationIndex,
    );
    const selected = analysis.selectedStation;

    if (!analysis.stations.length) {
        return (
            <section className="panel channel-analysis">
                <p className="eyebrow">channel results</p>
                <h2>Reference-Controlled Channel Result Unavailable</h2>
                <p>{analysis.reviewFlags[0]?.message}</p>
            </section>
        );
    }

    const chartData = analysis.stations.map((station) => ({
        ...station,
        axialPercent: station.normalizedPosition * 100,
    }));
    const selectedAxialPercent = selected ? selected.normalizedPosition * 100 : undefined;

    return (
        <section className="panel channel-analysis" aria-labelledby="channel-analysis-title">
            <header className="channel-analysis__header">
                <div>
                    <p className="eyebrow">reference-controlled one-dimensional result</p>
                    <h2 id="channel-analysis-title">Channel Results and Evidence Correlation</h2>
                    <p>Select any station to connect the tabular result, axial charts, and reactor cutaway.</p>
                </div>
                <div className="channel-analysis__selection">
                    <span>Selected station</span>
                    <strong>{selected ? `${selected.index + 1} · ${getRegionLabel(selected)}` : 'None'}</strong>
                    <button
                        type="button"
                        onClick={() => setSelectedStationIndex(analysis.peakWallStation?.index ?? null)}
                    >
                        Focus peak wall
                    </button>
                </div>
            </header>

            <div className="channel-analysis__summary">
                <Metric label="Outlet bulk temperature" value={`${evaluation.outputs.outletTemperatureK.toFixed(0)} K`}/>
                <Metric label="Peak wall temperature" value={`${evaluation.outputs.peakChannelWallTemperatureK.toFixed(0)} K`}/>
                <Metric
                    attention={evaluation.outputs.channelWallCriterionMarginK < 0}
                    label="Wall criterion margin"
                    value={`${evaluation.outputs.channelWallCriterionMarginK.toFixed(0)} K`}
                />
                <Metric label="Channel pressure drop" value={`${evaluation.outputs.pressureDropMpa.toFixed(3)} MPa`}/>
            </div>

            <ChannelStationLayout
                onSelectStation={setSelectedStationIndex}
                regions={analysis.axialRegions}
                selectedStation={selected}
                stations={analysis.stations}
            />

            <div className="channel-analysis__charts">
                <ChannelChart
                    data={chartData}
                    lines={[
                        {key: 'bulkTemperatureK', label: 'Bulk temperature', color: '#79c7d8'},
                        {key: 'wallTemperatureK', label: 'Wall temperature', color: '#f0a45d', primary: true},
                    ]}
                    selectedAxialPercent={selectedAxialPercent}
                    title="Thermal response"
                    unit="K"
                />
                <ChannelChart
                    data={chartData}
                    lines={[
                        {key: 'pressureMpa', label: 'Static pressure', color: '#98b9d6', primary: true},
                        {key: 'machNumber', label: 'Mach number', color: '#e5c36a', axis: 'right'},
                    ]}
                    selectedAxialPercent={selectedAxialPercent}
                    title="Hydraulic response"
                    unit="MPa"
                />
                <ChannelChart
                    data={chartData}
                    lines={[
                        {key: 'reynoldsNumber', label: 'Reynolds number', color: '#82c59a', primary: true},
                        {key: 'nusseltNumber', label: 'Nusselt number', color: '#be8ed8', axis: 'right'},
                    ]}
                    selectedAxialPercent={selectedAxialPercent}
                    title="Correlation state"
                    unit=""
                />
            </div>

            <div className="channel-analysis__detail-grid">
                <section className="channel-station-card">
                    <p className="eyebrow">selected axial station</p>
                    <h3>{selected ? `${selected.axialPositionM.toFixed(3)} m from channel inlet` : 'No station selected'}</h3>
                    {selected ? (
                        <dl>
                            <MetricRow label="Power shape factor" value={selected.powerShapeFactor.toFixed(3)}/>
                            <MetricRow label="Bulk / wall temperature" value={`${selected.bulkTemperatureK.toFixed(0)} / ${selected.wallTemperatureK.toFixed(0)} K`}/>
                            <MetricRow label="Pressure" value={`${selected.pressureMpa.toFixed(3)} MPa`}/>
                            <MetricRow label="Reynolds / Nusselt" value={`${selected.reynoldsNumber.toFixed(0)} / ${selected.nusseltNumber.toFixed(1)}`}/>
                            <MetricRow label="Mach / friction factor" value={`${selected.machNumber.toFixed(3)} / ${selected.frictionFactor.toFixed(5)}`}/>
                        </dl>
                    ) : null}
                </section>
                <section className="channel-review-flags">
                    <p className="eyebrow">engineering review flags</p>
                    <h3>{analysis.reviewFlags.filter((flag) => flag.severity !== 'information').length} controlling or incomplete basis item(s)</h3>
                    <div>
                        {analysis.reviewFlags.map((flag) => (
                            <article className={flag.severity} key={flag.id}>
                                <span>{flag.severity}</span>
                                <strong>{flag.title}</strong>
                                <p>{flag.message}</p>
                                <small><b>Follow-up:</b> {flag.recommendedAction}</small>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            <div className="channel-station-table-wrap">
                <table className="channel-station-table">
                    <caption>Calculated station values. Select a row to focus the corresponding core region.</caption>
                    <thead>
                        <tr>
                            <th>Station</th><th>Region</th><th>x/L</th><th>PSF</th><th>T bulk K</th><th>T wall K</th>
                            <th>p MPa</th><th>Re</th><th>Nu</th><th>Mach</th><th>f</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analysis.stations.map((station) => (
                            <tr
                                className={selected?.index === station.index ? 'selected' : ''}
                                key={station.index}
                                onClick={() => setSelectedStationIndex(station.index)}
                            >
                                <th><button type="button">{station.index + 1}</button></th>
                                <td>{getRegionLabel(station)}</td>
                                <td>{station.normalizedPosition.toFixed(3)}</td>
                                <td>{station.powerShapeFactor.toFixed(3)}</td>
                                <td>{station.bulkTemperatureK.toFixed(0)}</td>
                                <td>{station.wallTemperatureK.toFixed(0)}</td>
                                <td>{station.pressureMpa.toFixed(3)}</td>
                                <td>{station.reynoldsNumber.toFixed(0)}</td>
                                <td>{station.nusseltNumber.toFixed(1)}</td>
                                <td>{station.machNumber.toFixed(3)}</td>
                                <td>{station.frictionFactor.toFixed(5)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <section className="channel-evidence-correlation">
                <div>
                    <p className="eyebrow">immutable evidence handoff</p>
                    <h3>Correlation Questions, Not Merged Results</h3>
                    <p>{analysis.claimBoundary}</p>
                </div>
                <div className="channel-evidence-correlation__grid">
                    {analysis.evidenceCorrelations.map((record) => (
                        <article className={record.discipline} key={record.id}>
                            <span>{record.discipline}</span>
                            <h4>{record.calculatedLabel}</h4>
                            <strong>{record.calculatedValue}</strong>
                            <hr/>
                            <small>Fixture artifact</small>
                            <b>{record.fixtureLabel}</b>
                            <p>{record.interpretation}</p>
                            <footer>{record.claimBoundary}</footer>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}

function ChannelChart({
    data,
    lines,
    selectedAxialPercent,
    title,
    unit,
}: Readonly<{
    data: readonly Record<string, number>[];
    lines: readonly {key: string; label: string; color: string; axis?: 'right'; primary?: boolean}[];
    selectedAxialPercent?: number;
    title: string;
    unit: string;
}>) {
    const hasRightAxis = lines.some((line) => line.axis === 'right');
    const selected = selectedAxialPercent === undefined
        ? undefined
        : data.find((point) => point.axialPercent === selectedAxialPercent);
    return (
        <article>
            <header className="data-graphic__heading">
                <h3>{title}</h3>
                {selected ? <span>Selected x/L {selectedAxialPercent?.toFixed(0)}%</span> : null}
            </header>
            <ResponsiveContainer height={235} width="100%">
                <LineChart data={data} margin={{top: 8, right: 22, bottom: 8, left: 4}}>
                    <CartesianGrid stroke="rgba(171,190,206,.12)" vertical={false}/>
                    <XAxis dataKey="axialPercent" domain={[0, 100]} tickFormatter={(value) => `${value}%`} type="number"/>
                    <YAxis tickFormatter={(value) => Number(value).toLocaleString()} unit={unit}/>
                    {hasRightAxis ? <YAxis orientation="right" yAxisId="right"/> : null}
                    <Tooltip formatter={(value, name) => [Number(value).toLocaleString(undefined, {maximumFractionDigits: 3}), name]}/>
                    <Legend verticalAlign="top" wrapperStyle={{fontSize: '0.72rem'}}/>
                    {selectedAxialPercent === undefined ? null : (
                        <ReferenceLine stroke="#f2d18a" strokeDasharray="4 4" x={selectedAxialPercent}/>
                    )}
                    {lines.map((line) => (
                        <Line
                            dataKey={line.key}
                            dot={false}
                            key={line.key}
                            name={line.label}
                            opacity={line.primary ? 1 : .52}
                            stroke={line.color}
                            strokeWidth={line.primary ? 3 : 1.5}
                            type="monotone"
                            yAxisId={line.axis}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
            <dl className="data-graphic__selected-values">
                {lines.map((line) => (
                    <div key={line.key}>
                        <dt>{line.label}</dt>
                        <dd>{selected ? Number(selected[line.key]).toLocaleString(undefined, {maximumFractionDigits: 3}) : 'No station selected'} {line.axis === 'right' ? '' : unit}</dd>
                    </div>
                ))}
            </dl>
        </article>
    );
}

function Metric({label, value, attention = false}: Readonly<{label: string; value: string; attention?: boolean}>) {
    return <div className={attention ? 'attention' : ''}><span>{label}</span><strong>{value}</strong></div>;
}

function MetricRow({label, value}: Readonly<{label: string; value: string}>) {
    return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function getRegionLabel(station: Parameters<typeof getAxialRegionForStation>[0]): string {
    const region = getAxialRegionForStation(station);
    return region === 'core-a' ? 'Core A' : region === 'core-b' ? 'Core B' : 'Core C';
}
