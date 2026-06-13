import {ReactorPhysicsSummary} from "../types/ReactorPhysicsSummary";
import {SourceBadge} from "./SourceBadge";
import {SummaryCard} from "./cards/SummaryCard";
import {Metric} from "./Metric";
import {UtilizationBar} from "./UtilizationBar";
import {PowerProfile} from "./PowerProfile";
import {buildReactivityPosture} from "./BuildReactivityPosture";
import {formatPosture} from "./FormatPosture";
import {formatSigned} from "./FormatSigned";


export interface ReactorPhysicsPanelProps {
    summary?: ReactorPhysicsSummary;
}

const fmtPct = (value: number, numDig: number = 2): string => `${(value * 100).toFixed(numDig)}%`;

const DEFAULT_REACTOR_PHYSICS_SUMMARY: ReactorPhysicsSummary = {
    sourceLabel: 'Synthetic MCNP-like fixture',
    keff: 1.00342,
    keffStdDev: 0.00058,
    reactivityPcm: 341,
    shutdownMarginPcm: -1_840,
    controlDrumAngleDeg: 42,
    drumWorthPcm: 2_360,
    temperatureFeedbackPcm: -410,
    leakageFraction: 0.0712,
    fuelAbsorptionFraction: 0.6814,
    nonFissionCaptureFraction: 0.1548,
    powerPeakingFactor: 1.19,
    axialPowerProfile: [
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
    radialPowerProfile: [
        {id: 'radial-01', label: 'R1', relativePower: 1.12},
        {id: 'radial-02', label: 'R2', relativePower: 1.08},
        {id: 'radial-03', label: 'R3', relativePower: 1.02},
        {id: 'radial-04', label: 'R4', relativePower: 0.96},
        {id: 'radial-05', label: 'R5', relativePower: 0.87},
    ],
    posture: 'critical-band',
    recommendedFollowup: [
        'Compare axial peaking against the imported MOOSE-like peak fuel-temperature location.',
        'Run control drum worth sensitivity before treating this as a shutdown-margin-quality case.',
        'Review hydrogen density feedback assumptions during the startup transient.',
    ],
};

export function ReactorPhysicsPanel({summary = DEFAULT_REACTOR_PHYSICS_SUMMARY}: Readonly<ReactorPhysicsPanelProps>) {
    const keffLowerBound = summary.keff - 2 * summary.keffStdDev;
    const keffUpperBound = summary.keff + 2 * summary.keffStdDev;
    const neutronAccountingTotal = summary.leakageFraction + summary.fuelAbsorptionFraction + summary.nonFissionCaptureFraction;


    return <section className="panel reactor-physics-panel">

        <div className="panel-heading">
            <p className="eyebrow">synthetic neutronics import</p>
            <h2>Reactor Physics Summary</h2>
        </div>

        <p className="muted-copy">
            {summary.sourceLabel}: illustrative MCNP-like neutronics summary for UI and parser development.
            These values are synthetic fixture data, not validated criticality or reactor-design results.
        </p>

        <div className="analysis-source-grid">
            <SourceBadge label="Criticality posture" value={formatPosture(summary.posture)}
                         tone={summary.posture}/>
            <SourceBadge label="Control state" value={`${summary.controlDrumAngleDeg.toFixed(1)}° drum angle`}/>
            <SourceBadge label="Power peaking" value={`${summary.powerPeakingFactor.toFixed(2)} peak / avg`}/>
        </div>

        <div className="analysis-summary-grid">
            <SummaryCard title="Criticality" posture={summary.posture}>
                <Metric label="k-eff" value={summary.keff.toFixed(5)}/>
                <Metric label="2σ band" value={`${keffLowerBound.toFixed(5)} – ${keffUpperBound.toFixed(5)}`}/>
                <Metric label="reactivity" value={`${formatSigned(summary.reactivityPcm)} pcm`}/>
                <Metric label="shutdown margin" value={`${summary.shutdownMarginPcm.toFixed(0)} pcm`}/>
                <UtilizationBar label="distance from k=1" value={Math.abs(summary.keff - 1) / 0.01}/>
            </SummaryCard>

            <SummaryCard title="Reactivity effects" posture={buildReactivityPosture(summary)}>
                <Metric label="drum worth" value={`${summary.drumWorthPcm.toFixed(0)} pcm`}/>
                <Metric label="temperature feedback"
                        value={`${formatSigned(summary.temperatureFeedbackPcm)} pcm`}/>
                <Metric label="net excess" value={`${formatSigned(summary.reactivityPcm)} pcm`}/>
                <Metric label="drum angle" value={`${summary.controlDrumAngleDeg.toFixed(1)}°`}/>
            </SummaryCard>

            <SummaryCard title="Neutron balance" posture="nominal">
                <Metric label="leakage" value={fmtPct(summary.leakageFraction)}/>
                <Metric label="fuel absorption" value={fmtPct(summary.fuelAbsorptionFraction)}/>
                <Metric label="non-fission capture" value={fmtPct(summary.nonFissionCaptureFraction)}/>
                <Metric label="tracked subtotal" value={fmtPct(neutronAccountingTotal)}/>
            </SummaryCard>
        </div>

        <div className="power-profile-grid">
            <PowerProfile title="Axial relative power" points={summary.axialPowerProfile}/>
            <PowerProfile title="Radial relative power" points={summary.radialPowerProfile}/>
        </div>

        <div className="review-callout">
            <h3>Neutronics follow-up</h3>
            <ul>
                {summary.recommendedFollowup.map((item) => <li key={item}>{item}</li>)}
            </ul>
        </div>
    </section>;
}
