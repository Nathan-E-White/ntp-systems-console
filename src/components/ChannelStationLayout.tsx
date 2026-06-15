import {useState} from 'react';

import type {AxialRegionMapping} from '../physics/channelAnalysisModel';
import type {ChannelStation} from '../physics/representativeChannelModel';

type LayoutMetric = 'wallTemperatureK' | 'bulkTemperatureK' | 'pressureMpa';

const METRICS: Record<LayoutMetric, {label: string; shortLabel: string; unit: string}> = {
    wallTemperatureK: {label: 'Wall temperature', shortLabel: 'Wall T', unit: 'K'},
    bulkTemperatureK: {label: 'Bulk temperature', shortLabel: 'Bulk T', unit: 'K'},
    pressureMpa: {label: 'Static pressure', shortLabel: 'Pressure', unit: 'MPa'},
};

export function ChannelStationLayout({
    stations,
    regions,
    selectedStation,
    onSelectStation,
}: Readonly<{
    stations: readonly ChannelStation[];
    regions: readonly AxialRegionMapping[];
    selectedStation: ChannelStation | null;
    onSelectStation: (stationIndex: number) => void;
}>) {
    const [metric, setMetric] = useState<LayoutMetric>('wallTemperatureK');
    const values = stations.map((station) => station[metric]);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const selectedValue = selectedStation?.[metric];
    const metricDefinition = METRICS[metric];

    return (
        <section className="channel-layout" aria-labelledby="channel-layout-title">
            <header className="channel-layout__header">
                <div>
                    <p className="eyebrow">axial station layout</p>
                    <h3 id="channel-layout-title">Representative Channel Cutaway</h3>
                    <p>Station spacing and A/B/C boundaries follow normalized axial position. Color shows the selected result.</p>
                </div>
                <div className="channel-layout__metric-control" aria-label="Station color metric" role="group">
                    {(Object.keys(METRICS) as LayoutMetric[]).map((metricKey) => (
                        <button
                            aria-pressed={metric === metricKey}
                            key={metricKey}
                            onClick={() => setMetric(metricKey)}
                            type="button"
                        >
                            {METRICS[metricKey].shortLabel}
                        </button>
                    ))}
                </div>
            </header>

            <div className="channel-layout__canvas">
                <svg
                    aria-label={`Longitudinal cutaway of ${stations.length} channel stations colored by ${metricDefinition.label.toLowerCase()}`}
                    role="img"
                    viewBox="0 0 1120 300"
                >
                    <defs>
                        <marker id="channel-flow-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                            <path d="M0,0 L8,4 L0,8 Z" fill="#8fcfe5"/>
                        </marker>
                    </defs>

                    <text className="channel-layout__end-label" x="72" y="34">INLET</text>
                    <text className="channel-layout__end-label" textAnchor="end" x="1048" y="34">OUTLET</text>
                    <line
                        className="channel-layout__flow-line"
                        markerEnd="url(#channel-flow-arrow)"
                        x1="132"
                        x2="990"
                        y1="29"
                        y2="29"
                    />

                    <rect className="channel-layout__shell" height="150" rx="6" width="976" x="72" y="58"/>
                    {regions.map((region, index) => {
                        const x = layoutX(region.normalizedStart);
                        const width = (region.normalizedEnd - region.normalizedStart) * 976;
                        return (
                            <g key={region.id}>
                                <rect
                                    className={`channel-layout__region channel-layout__region--${index + 1}`}
                                    height="146"
                                    width={width}
                                    x={x}
                                    y="60"
                                />
                                <text className="channel-layout__region-label" textAnchor="middle" x={x + width / 2} y="86">
                                    {region.label}
                                </text>
                                <text className="channel-layout__region-evidence" textAnchor="middle" x={x + width / 2} y="103">
                                    {region.evidenceLabel}
                                </text>
                            </g>
                        );
                    })}

                    <rect className="channel-layout__wall" height="60" rx="30" width="1016" x="52" y="112"/>
                    <rect className="channel-layout__coolant" height="34" rx="17" width="1016" x="52" y="125"/>
                    <text className="channel-layout__layer-label" x="16" y="109">WALL</text>
                    <text className="channel-layout__layer-label" x="16" y="190">CORE</text>

                    {stations.map((station) => {
                        const selected = station.index === selectedStation?.index;
                        const color = metricColor(station[metric], minimum, maximum);
                        return (
                            <g
                                aria-label={`Station ${station.index + 1}, ${metricDefinition.label} ${formatValue(station[metric], metric)} ${metricDefinition.unit}`}
                                className={`channel-layout__station${selected ? ' selected' : ''}`}
                                key={station.index}
                                onClick={() => onSelectStation(station.index)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        onSelectStation(station.index);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                <line x1={layoutX(station.normalizedPosition)} x2={layoutX(station.normalizedPosition)} y1="118" y2="166"/>
                                <circle
                                    cx={layoutX(station.normalizedPosition)}
                                    cy="142"
                                    fill={color}
                                    r={selected ? 11 : 7}
                                />
                                {selected ? (
                                    <>
                                        <line
                                            className="channel-layout__selection-line"
                                            x1={layoutX(station.normalizedPosition)}
                                            x2={layoutX(station.normalizedPosition)}
                                            y1="174"
                                            y2="224"
                                        />
                                        <text
                                            className="channel-layout__selection-label"
                                            textAnchor="middle"
                                            x={layoutX(station.normalizedPosition)}
                                            y="242"
                                        >
                                            STATION {station.index + 1}
                                        </text>
                                    </>
                                ) : null}
                                <title>
                                    Station {station.index + 1}: {formatValue(station[metric], metric)} {metricDefinition.unit}
                                </title>
                            </g>
                        );
                    })}

                    {[0, .25, .5, .75, 1].map((position) => (
                        <g className="channel-layout__axis-tick" key={position}>
                            <line x1={layoutX(position)} x2={layoutX(position)} y1="208" y2="216"/>
                            <text textAnchor="middle" x={layoutX(position)} y="274">{Math.round(position * 100)}%</text>
                        </g>
                    ))}
                    <text className="channel-layout__axis-label" textAnchor="middle" x="560" y="294">Normalized axial position (x/L)</text>
                </svg>
            </div>

            <footer className="channel-layout__legend">
                <div>
                    <span>{formatValue(minimum, metric)} {metricDefinition.unit}</span>
                    <i aria-hidden="true"/>
                    <span>{formatValue(maximum, metric)} {metricDefinition.unit}</span>
                </div>
                <p>
                    Selected: <strong>{selectedStation ? `Station ${selectedStation.index + 1}` : 'None'}</strong>
                    {selectedValue === undefined ? null : ` · ${formatValue(selectedValue, metric)} ${metricDefinition.unit}`}
                </p>
            </footer>
        </section>
    );
}

function layoutX(normalizedPosition: number): number {
    return 72 + normalizedPosition * 976;
}

function metricColor(value: number, minimum: number, maximum: number): string {
    const normalized = maximum === minimum ? .5 : (value - minimum) / (maximum - minimum);
    const hue = 196 - normalized * 164;
    return `hsl(${hue} 72% ${52 + normalized * 10}%)`;
}

function formatValue(value: number, metric: LayoutMetric): string {
    return metric === 'pressureMpa' ? value.toFixed(3) : value.toFixed(0);
}
