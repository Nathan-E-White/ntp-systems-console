import type {ReactNode} from 'react';

export type ThermomechanicsPosture = 'nominal' | 'watch' | 'limit' | 'non-converged';

export interface ThermomechanicsTimePoint {
    timeSec: number;
    peakFuelTemperatureK: number;
    maxVonMisesStressMpa: number;
    thermalStrainPercent: number;
    minimumThermalMarginK: number;
    converged: boolean;
}

export interface ThermomechanicsSummary {
    sourceLabel: string;
    converged: boolean;
    meshElements: number;
    nonlinearIterations: number;
    peakFuelTemperatureK: number;
    peakWebTemperatureK: number;
    fuelTemperatureLimitK: number;
    maxVonMisesStressMpa: number;
    stressLimitMpa: number;
    thermalStrainPercent: number;
    strainWatchPercent: number;
    minimumThermalMarginK: number;
    hotChannelFactor: number;
    peakStressAxialStation: string;
    peakTemperatureRegion: string;
    posture: ThermomechanicsPosture;
    timeHistory: ThermomechanicsTimePoint[];
    recommendedFollowup: string[];
}

export interface ThermomechanicsProps {
    summary?: ThermomechanicsSummary;
}


const DEFAULT_THERMOMECHANICS_SUMMARY: ThermomechanicsSummary = {
    sourceLabel: 'Synthetic MOOSE-like fixture',
    converged: true,
    meshElements: 18_432,
    nonlinearIterations: 7,
    peakFuelTemperatureK: 2_925,
    peakWebTemperatureK: 2_810,
    fuelTemperatureLimitK: 3_050,
    maxVonMisesStressMpa: 184,
    stressLimitMpa: 240,
    thermalStrainPercent: 0.34,
    strainWatchPercent: 0.5,
    minimumThermalMarginK: 125,
    hotChannelFactor: 1.19,
    peakStressAxialStation: 'z/L = 0.62',
    peakTemperatureRegion: 'inner coolant-channel ligament',
    posture: 'nominal',
    timeHistory: [
        {
            timeSec: 0,
            peakFuelTemperatureK: 710,
            maxVonMisesStressMpa: 24,
            thermalStrainPercent: 0.03,
            minimumThermalMarginK: 2_340,
            converged: true
        },
        {
            timeSec: 5,
            peakFuelTemperatureK: 1_285,
            maxVonMisesStressMpa: 52,
            thermalStrainPercent: 0.08,
            minimumThermalMarginK: 1_765,
            converged: true
        },
        {
            timeSec: 10,
            peakFuelTemperatureK: 1_760,
            maxVonMisesStressMpa: 88,
            thermalStrainPercent: 0.14,
            minimumThermalMarginK: 1_290,
            converged: true
        },
        {
            timeSec: 15,
            peakFuelTemperatureK: 2_230,
            maxVonMisesStressMpa: 126,
            thermalStrainPercent: 0.21,
            minimumThermalMarginK: 820,
            converged: true
        },
        {
            timeSec: 20,
            peakFuelTemperatureK: 2_605,
            maxVonMisesStressMpa: 158,
            thermalStrainPercent: 0.28,
            minimumThermalMarginK: 445,
            converged: true
        },
        {
            timeSec: 25,
            peakFuelTemperatureK: 2_840,
            maxVonMisesStressMpa: 178,
            thermalStrainPercent: 0.32,
            minimumThermalMarginK: 210,
            converged: true
        },
        {
            timeSec: 30,
            peakFuelTemperatureK: 2_948,
            maxVonMisesStressMpa: 189,
            thermalStrainPercent: 0.35,
            minimumThermalMarginK: 102,
            converged: true
        },
        {
            timeSec: 35,
            peakFuelTemperatureK: 2_925,
            maxVonMisesStressMpa: 184,
            thermalStrainPercent: 0.34,
            minimumThermalMarginK: 125,
            converged: true
        },
    ],
    recommendedFollowup: [
        'Compare hot-channel factor against neutronics axial and radial peaking assumptions.',
        'Check whether the peak stress station coincides with peak fuel temperature during startup ramp.',
        'Run a mesh and material-property sensitivity before treating this as a design-quality result.',
    ],
};

export function ThermomechanicsPanel({summary = DEFAULT_THERMOMECHANICS_SUMMARY}: Readonly<ThermomechanicsProps>) {
    const stressUtilization = summary.maxVonMisesStressMpa / summary.stressLimitMpa;
    const strainUtilization = summary.thermalStrainPercent / summary.strainWatchPercent;
    const thermalMarginUtilization = summary.peakFuelTemperatureK / summary.fuelTemperatureLimitK;
    const limitingPoint = findLimitingTimePoint(summary.timeHistory);

    return (
        <section className="panel thermomechanics-panel">
            <div className="panel-heading">
                <p className="eyebrow">finite-element thermomechanics</p>
                <h2>Fuel Element FE Margin</h2>
            </div>

            <p className="muted-copy">
                {summary.sourceLabel}: synthetic MOOSE-like FE fixture for UI/parser.
                Not a validated finite-element calculation.
            </p>

            <div className="analysis-source-grid">
                <SourceBadge label="Convergence"
                             value={summary.converged ? 'nonlinear solve converged' : 'nonlinear solve failed'}
                             tone={summary.converged ? 'nominal' : 'limit'}/>
                <SourceBadge label="Mesh" value={`${summary.meshElements.toLocaleString()} elements`}/>
                <SourceBadge label="Iterations" value={`${summary.nonlinearIterations} nonlinear iterations`}/>
            </div>

            <div className="analysis-summary-grid">
                <SummaryCard title="Thermal margin" posture={summary.posture}>
                    <Metric label="peak fuel temp" value={`${summary.peakFuelTemperatureK.toFixed(0)} K`}/>
                    <Metric label="peak web temp" value={`${summary.peakWebTemperatureK.toFixed(0)} K`}/>
                    <Metric label="fuel limit" value={`${summary.fuelTemperatureLimitK.toFixed(0)} K`}/>
                    <Metric label="minimum margin" value={`${formatSigned(summary.minimumThermalMarginK)} K`}/>
                    <UtilizationBar label="fuel temperature utilization" value={thermalMarginUtilization}/>
                </SummaryCard>

                <SummaryCard title="Stress / strain" posture={buildStressPosture(summary)}>
                    <Metric label="max von Mises" value={`${summary.maxVonMisesStressMpa.toFixed(0)} MPa`}/>
                    <Metric label="stress limit" value={`${summary.stressLimitMpa.toFixed(0)} MPa`}/>
                    <Metric label="thermal strain" value={`${summary.thermalStrainPercent.toFixed(2)}%`}/>
                    <Metric label="strain watch" value={`${summary.strainWatchPercent.toFixed(2)}%`}/>
                    <UtilizationBar label="stress utilization" value={stressUtilization}/>
                    <UtilizationBar label="strain watch utilization" value={strainUtilization}/>
                </SummaryCard>

                <SummaryCard title="Location / peaking" posture="nominal">
                    <Metric label="hot-channel factor" value={summary.hotChannelFactor.toFixed(2)}/>
                    <Metric label="peak stress station" value={summary.peakStressAxialStation}/>
                    <Metric label="peak temp region" value={summary.peakTemperatureRegion}/>
                    <Metric label="limiting time" value={`${limitingPoint.timeSec.toFixed(1)} s`}/>
                    <Metric label="limiting stress" value={`${limitingPoint.maxVonMisesStressMpa.toFixed(0)} MPa`}/>
                </SummaryCard>
            </div>

            <div className="thermomechanics-timeline" aria-label="Thermomechanics transient timeline">
                {summary.timeHistory.map((point) => (
                    <div className="timeline-sample" key={point.timeSec} title={`t=${point.timeSec.toFixed(1)} s`}>
                        <span style={{height: `${computeTimelineHeight(point, summary)}%`}}/>
                    </div>
                ))}
            </div>

            <div className="review-callout">
                <h3>Thermomechanics follow-up</h3>
                <ul>
                    {summary.recommendedFollowup.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function SourceBadge({label, tone = 'nominal', value}: Readonly<{
    label: string;
    tone?: ThermomechanicsPosture;
    value: string
}>) {
    return (
        <div className="source-badge">
            <span>{label}</span>
            <strong className={buildPostureClassName(tone)}>{value}</strong>
        </div>
    );
}

function SummaryCard({children, posture, title}: Readonly<{
    children: ReactNode;
    posture: ThermomechanicsPosture | string;
    title: string
}>) {
    return (
        <article className="analysis-summary-card">
            <div className="summary-card-heading">
                <h3>{title}</h3>
                <span className={buildPostureClassName(posture)}>{posture}</span>
            </div>
            <dl>{children}</dl>
        </article>
    );
}

function Metric({label, value}: Readonly<{ label: string; value: string }>) {
    return (
        <div className="metric-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}

function UtilizationBar({label, value}: Readonly<{ label: string; value: number }>) {
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

function findLimitingTimePoint(points: ThermomechanicsTimePoint[]): ThermomechanicsTimePoint {
    return points.reduce((current, candidate) => {
        if (candidate.minimumThermalMarginK < current.minimumThermalMarginK) {
            return candidate;
        }

        return current;
    }, points[0]);
}

function computeTimelineHeight(point: ThermomechanicsTimePoint, summary: ThermomechanicsSummary): number {
    const utilization = point.peakFuelTemperatureK / summary.fuelTemperatureLimitK;
    return Math.min(Math.max(utilization * 100, 8), 100);
}

function buildStressPosture(summary: ThermomechanicsSummary): ThermomechanicsPosture {
    if (!summary.converged) {
        return 'non-converged';
    }

    const stressUtilization = summary.maxVonMisesStressMpa / summary.stressLimitMpa;
    const strainUtilization = summary.thermalStrainPercent / summary.strainWatchPercent;

    if (stressUtilization >= 1 || strainUtilization >= 1) {
        return 'limit';
    }

    if (stressUtilization >= 0.85 || strainUtilization >= 0.85) {
        return 'watch';
    }

    return 'nominal';
}

function buildPostureClassName(posture: ThermomechanicsPosture | string): string {
    const normalizedPosture = posture.toLowerCase();

    if (normalizedPosture.includes('limit') || normalizedPosture.includes('non-converged')) {
        return 'posture-chip limit';
    }

    if (normalizedPosture.includes('watch')) {
        return 'posture-chip watch';
    }

    return 'posture-chip nominal';
}

function buildUtilizationClassName(value: number): string {
    if (value >= 1) {
        return 'utilization-fill limit';
    }

    if (value >= 0.85) {
        return 'utilization-fill watch';
    }

    return 'utilization-fill nominal';
}

function formatSigned(value: number): string {
    return value > 0 ? `+${value.toFixed(0)}` : value.toFixed(0);
}
