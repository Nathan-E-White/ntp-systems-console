import {PowerProfile} from "./PowerProfile";
import {SummaryCard} from "./cards/SummaryCard";
import {Metric} from "./Metric";
import {SourceBadge} from "./SourceBadge";
import {buildProfilePosture} from "./BuildProfilePosture";
import {buildPeakingPosture} from "./BuildPeakingPosture";
import {averageRelativePower} from "./AverageRelativePower";
import {findPeakPoint} from "./FindPeakPoint";

export type PowerProfilePosture = 'nominal' | 'watch' | 'limit';

export interface PowerProfilePoint {
    id: string;
    label: string;
    relativePower: number;
}

export interface PowerProfileSummary {
    sourceLabel: string;
    axialProfile: PowerProfilePoint[];
    radialProfile: PowerProfilePoint[];
    powerPeakingFactor: number;
    axialPeakLocation: string;
    radialPeakLocation: string;
    posture: PowerProfilePosture;
    interpretation: string[];
}

export interface PowerProfilePanelProps {
    summary?: PowerProfileSummary;
}

const DEFAULT_POWER_PROFILE: PowerProfileSummary = {
    sourceLabel: 'Synthetic MCNP-like power distribution fixture',
    axialProfile: [
        {id: 'axial-01', label: '01', relativePower: 0.61},
        {id: 'axial-02', label: '02', relativePower: 0.78},
        {id: 'axial-03', label: '03', relativePower: 0.94},
        {id: 'axial-04', label: '04', relativePower: 1.08},
        {id: 'axial-05', label: '05', relativePower: 1.16},
        {id: 'axial-06', label: '06', relativePower: 1.19},
        {id: 'axial-07', label: '07', relativePower: 1.13},
        {id: 'axial-08', label: '08', relativePower: 0.98},
        {id: 'axial-09', label: '09', relativePower: 0.82},
        {id: 'axial-10', label: '10', relativePower: 0.63},
    ],
    radialProfile: [
        {id: 'radial-01', label: 'R1', relativePower: 1.12},
        {id: 'radial-02', label: 'R2', relativePower: 1.08},
        {id: 'radial-03', label: 'R3', relativePower: 1.02},
        {id: 'radial-04', label: 'R4', relativePower: 0.96},
        {id: 'radial-05', label: 'R5', relativePower: 0.87},
    ],
    powerPeakingFactor: 1.19,
    axialPeakLocation: 'axial zone 06',
    radialPeakLocation: 'inner ring R1',
    posture: 'nominal',
    interpretation: [
        'Peak axial power is in the upper-middle core region.',
        'Radial profile is center-weighted; review against coolant-channel and stress margins.',
        'Thermal coupling: compare peak bins to channel-wall criterion margin.',
        'Finite-element coupling: compare peak-power and peak-stress stations.',
        'Propulsion coupling: compare power-shape vs hydrogen-flow/chamber-pressure assumptions.',
        'Fixture-only UI/parser profile; not validated tally or design-basis output.',
    ],
};

export function PowerProfilePanel({summary = DEFAULT_POWER_PROFILE}: Readonly<PowerProfilePanelProps>) {
    const axialPeak = findPeakPoint(summary.axialProfile);
    const radialPeak = findPeakPoint(summary.radialProfile);
    const axialAverage = averageRelativePower(summary.axialProfile);
    const radialAverage = averageRelativePower(summary.radialProfile);

    return <section className="panel power-profile-panel">
        <div className="panel-heading">
            <p className="eyebrow">neutronics power distribution</p>
            <h2>Power Profile Review</h2>
        </div>

        <p className="muted-copy">
            {summary.sourceLabel}: synthetic power-shape fixture for UI/parser.
            Not validated tally output.
        </p>

        <div className="analysis-source-grid">
            <SourceBadge label="Profile posture" value={summary.posture} tone={summary.posture}/>
            <SourceBadge label="Power peaking" value={`${summary.powerPeakingFactor.toFixed(2)} peak / avg`}
                         tone={buildPeakingPosture(summary.powerPeakingFactor)}/>
            <SourceBadge label="Peak location" value={`${summary.axialPeakLocation}, ${summary.radialPeakLocation}`}
                         tone="nominal"/>
        </div>

        <div className="analysis-summary-grid">
            <SummaryCard title="Axial shape" posture={buildProfilePosture(axialPeak.relativePower)}>
                <Metric label="peak zone" value={axialPeak.label}/>
                <Metric label="peak relative power" value={axialPeak.relativePower.toFixed(2)}/>
                <Metric label="average bin value" value={axialAverage.toFixed(2)}/>
                <Metric label="zones" value={summary.axialProfile.length.toString()}/>
            </SummaryCard>

            <SummaryCard title="Radial shape" posture={buildProfilePosture(radialPeak.relativePower)}>
                <Metric label="peak ring" value={radialPeak.label}/>
                <Metric label="peak relative power" value={radialPeak.relativePower.toFixed(2)}/>
                <Metric label="average ring value" value={radialAverage.toFixed(2)}/>
                <Metric label="rings" value={summary.radialProfile.length.toString()}/>
            </SummaryCard>

            <SummaryCard title="Coupling note" posture={summary.posture}>
                <ul className="summary-note-list" aria-label="Power-profile coupling checks">
                    <li>Thermal: wall criterion margin</li>
                    <li>FE: peak stress</li>
                    <li>Propulsion: H2 flow</li>
                </ul>
            </SummaryCard>
        </div>

        <div className="power-profile-grid">
            <PowerProfile title="Axial relative power" points={summary.axialProfile}/>
            <PowerProfile title="Radial relative power" points={summary.radialProfile}/>
        </div>

        <div className="review-callout">
            <h3>Power-profile interpretation</h3>
            <ul>
                {summary.interpretation.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    </section>;
}
