import {PowerProfile} from "./PowerProfile";
import {SummaryCard} from "./SummaryCard";
import {Metric} from "./Metric";
import {SourceBadge} from "./SourceBadge";

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
        'Peak relative power occurs in the upper-middle axial region of the synthetic core fixture.',
        'Radial profile is mildly center-weighted and should be compared against coolant-channel thermomechanical margins.',
        'Use this profile as a UI/parser fixture only; it is not a validated MCNP tally or design-basis distribution.',
    ],
};

export function PowerProfilePanel({summary = DEFAULT_POWER_PROFILE}: Readonly<PowerProfilePanelProps>) {
    const axialPeak = findPeakPoint(summary.axialProfile);
    const radialPeak = findPeakPoint(summary.radialProfile);
    const axialAverage = averageRelativePower(summary.axialProfile);
    const radialAverage = averageRelativePower(summary.radialProfile);

    return (
        <section className="panel power-profile-panel">
            <div className="panel-heading">
                <p className="eyebrow">neutronics power distribution</p>
                <h2>Power Profile Review</h2>
            </div>

            <p className="muted-copy">
                {summary.sourceLabel}: normalized axial and radial power-shape data for public UI demonstration.
                Values are synthetic and are not validated tally output.
            </p>

            <div className="analysis-source-grid">
                <SourceBadge label="Profile posture" value={summary.posture} tone={summary.posture}/>
                <SourceBadge label="Power peaking" value={`${summary.powerPeakingFactor.toFixed(2)} peak / avg`} tone={buildPeakingPosture(summary.powerPeakingFactor)}/>
                <SourceBadge label="Peak location" value={`${summary.axialPeakLocation}, ${summary.radialPeakLocation}`} tone="nominal"/>
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
                    <Metric label="thermal coupling" value="compare to fuel margin"/>
                    <Metric label="FE coupling" value="compare to peak stress station"/>
                    <Metric label="propulsion coupling" value="compare to hydrogen flow"/>
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
        </section>
    );
}

// TODO(Is duplicate?)
function findPeakPoint(points: PowerProfilePoint[]): PowerProfilePoint {
    return points.reduce((currentPeak, point) => {
        if (point.relativePower > currentPeak.relativePower) {
            return point;
        }

        return currentPeak;
    }, points[0]);
}

// TODO(Is duplicate?)
function averageRelativePower(points: PowerProfilePoint[]): number {
    const total = points.reduce((sum, point) => sum + point.relativePower, 0);
    return total / points.length;
}

// TODO(Is duplicate?)
function buildPeakingPosture(powerPeakingFactor: number): PowerProfilePosture {
    if (powerPeakingFactor >= 1.35) {
        return 'limit';
    }

    if (powerPeakingFactor >= 1.2) {
        return 'watch';
    }

    return 'nominal';
}

// TODO(Is duplicate?)
function buildProfilePosture(relativePower: number): PowerProfilePosture {
    if (relativePower >= 1.35) {
        return 'limit';
    }

    if (relativePower >= 1.15) {
        return 'watch';
    }

    return 'nominal';
}

// TODO(Integrate, is duplicate?)
function buildPostureClassName(posture: PowerProfilePosture): string {
    if (posture === 'limit') {
        return 'posture-chip limit';
    }

    if (posture === 'watch') {
        return 'posture-chip watch';
    }

    return 'posture-chip nominal';
}

// TODO(Integrate, is duplicate?)
function buildPowerBarClassName(posture: PowerProfilePosture): string {
    if (posture === 'limit') {
        return 'power-profile-fill limit';
    }

    if (posture === 'watch') {
        return 'power-profile-fill watch';
    }

    return 'power-profile-fill nominal';
}