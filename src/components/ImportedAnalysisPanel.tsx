import {createContext, useContext, type ReactNode} from 'react';

interface ImportedAnalysisSource {
    neutronics: string;
    propulsion: string;
    thermomechanics?: string;
}

interface ImportedNeutronicsSummary {
    keff: number;
    keffStdDev: number;
    reactivityPcm: number;
    shutdownMarginPcm: number;
    controlDrumAngleDeg: number;
    powerPeakingFactor: number;
    posture: string;
}

interface ImportedThermalHydraulicSummary {
    thermalPowerMw: number;
    coreOutletTemperatureK: number;
    peakFuelTemperatureK: number;
    fuelTemperatureLimitK: number;
    thermalMarginK: number;
}

interface ImportedPropulsionSummary {
    chamberPressureMpa: number;
    thrustKn: number;
    specificImpulseSec: number;
    massFlowKgPerSec: number;
}

interface ImportedThermomechanicsSummary {
    converged: boolean;
    maxVonMisesStressMpa: number;
    stressLimitMpa: number;
    thermalStrainPercent: number;
    hotChannelFactor: number;
    posture: string;
}

interface ImportedReviewSummary {
    criticalityPosture: string;
    thermalPosture: string;
    propulsionPosture: string;
    recommendedFollowup: string[];
}

export interface ImportedAnalysisCase {
    caseId: string;
    source: ImportedAnalysisSource;
    neutronics: ImportedNeutronicsSummary;
    thermalHydraulic: ImportedThermalHydraulicSummary;
    propulsion: ImportedPropulsionSummary;
    thermomechanics?: ImportedThermomechanicsSummary;
    review: ImportedReviewSummary;
}

export interface ImportedAnalysisProps {
    analysis?: ImportedAnalysisCase;
}

export interface ImportedAnalysisBoundaryProps {
    analysis?: ImportedAnalysisCase;
    children: ReactNode;
    fallback?: ReactNode;
}

export interface ImportedAnalysisProviderProps {
    analysis?: ImportedAnalysisCase;
    children: ReactNode;
}

export interface ImportedAnalysisContextProps {
    children: ReactNode;
    className?: string;
}

export interface ImportedAnalysisScopeProps {
    children: ReactNode;
    workspace: 'reactor' | 'propulsion' | 'transients' | 'review';
}

export interface ImportedAnalysisState {
    importedCaseMode: 'fixture' | 'what-if';
    selectedCaseId: string;
}

export const importedAnalysisState: ImportedAnalysisState = {
    importedCaseMode: 'fixture',
    selectedCaseId: 'NTP_BASELINE_STARTUP',
};

const ImportedAnalysisReactContext = createContext<ImportedAnalysisCase | null>(null);

const DEFAULT_ANALYSIS: ImportedAnalysisCase = {
    caseId: 'NTP_BASELINE_STARTUP',
    source: {
        neutronics: 'Synthetic MCNP-like fixture',
        propulsion: 'Synthetic ROCETS-like fixture',
        thermomechanics: 'Synthetic MOOSE-like fixture',
    },
    neutronics: {
        keff: 1.00342,
        keffStdDev: 0.00058,
        reactivityPcm: 341,
        shutdownMarginPcm: -1840,
        controlDrumAngleDeg: 42,
        powerPeakingFactor: 1.19,
        posture: 'critical operating band',
    },
    thermalHydraulic: {
        thermalPowerMw: 515,
        coreOutletTemperatureK: 2760,
        peakFuelTemperatureK: 2925,
        fuelTemperatureLimitK: 3050,
        thermalMarginK: 125,
    },
    propulsion: {
        chamberPressureMpa: 4.15,
        thrustKn: 112.4,
        specificImpulseSec: 865.2,
        massFlowKgPerSec: 13.8,
    },
    thermomechanics: {
        converged: true,
        maxVonMisesStressMpa: 184,
        stressLimitMpa: 240,
        thermalStrainPercent: 0.34,
        hotChannelFactor: 1.19,
        posture: 'nominal',
    },
    review: {
        criticalityPosture: 'nominal',
        thermalPosture: 'nominal',
        propulsionPosture: 'nominal',
        recommendedFollowup: [
            'Compare axial power peaking against the peak fuel-temperature location.',
            'Run a coupled sensitivity on hydrogen mass-flow perturbations during startup.',
            'Review shutdown margin and drum worth assumptions before treating this as a design case.',
        ],
    },
};

export function ImportedAnalysisBoundary({analysis, children, fallback}: Readonly<ImportedAnalysisBoundaryProps>) {
    if (!analysis && fallback) {
        return <>{fallback}</>;
    }

    return <ImportedAnalysisProvider analysis={analysis ?? DEFAULT_ANALYSIS}>{children}</ImportedAnalysisProvider>;
}

export function ImportedAnalysisProvider({analysis = DEFAULT_ANALYSIS, children}: Readonly<ImportedAnalysisProviderProps>) {
    return (
        <ImportedAnalysisReactContext.Provider value={analysis}>
            {children}
        </ImportedAnalysisReactContext.Provider>
    );
}

export function ImportedAnalysisContext({children, className = ''}: Readonly<ImportedAnalysisContextProps>) {
    const analysis = useImportedAnalysis();
    const contextClassName = ['imported-analysis-context', className].filter(Boolean).join(' ');

    return (
        <div className={contextClassName} data-case-id={analysis.caseId}>
            {children}
        </div>
    );
}

export function ImportedAnalysisScope({children, workspace}: Readonly<ImportedAnalysisScopeProps>) {
    const analysis = useImportedAnalysis();

    return (
        <section className="imported-analysis-scope" data-case-id={analysis.caseId} data-workspace={workspace}>
            {children}
        </section>
    );
}

export function useImportedAnalysis(): ImportedAnalysisCase {
    return useContext(ImportedAnalysisReactContext) ?? DEFAULT_ANALYSIS;
}

export function ImportedAnalysisPanel({analysis}: Readonly<ImportedAnalysisProps>) {
    const activeAnalysis = analysis ?? useImportedAnalysis();
    return (
        <section className="panel imported-analysis-panel">
            <div className="panel-heading">
                <p className="eyebrow">synthetic imported analysis</p>
                <h2>{activeAnalysis.caseId}</h2>
            </div>

            <p className="muted-copy">
                Public MCNP/ROCETS/MOOSE fixture summaries for parser/UI only; synthetic and not validated.
            </p>

            <div className="analysis-source-grid">
                <SourceBadge label="Neutronics" value={activeAnalysis.source.neutronics}/>
                <SourceBadge label="Propulsion" value={activeAnalysis.source.propulsion}/>
                {activeAnalysis.source.thermomechanics ? (
                    <SourceBadge label="Thermomechanics" value={activeAnalysis.source.thermomechanics}/>
                ) : null}
            </div>

            <div className="analysis-summary-grid">
                <SummaryCard title="Neutronics" posture={activeAnalysis.neutronics.posture}>
                    <Metric label="k-eff" value={activeAnalysis.neutronics.keff.toFixed(5)}/>
                    <Metric label="σ(k-eff)" value={activeAnalysis.neutronics.keffStdDev.toFixed(5)}/>
                    <Metric label="reactivity" value={`${formatSigned(activeAnalysis.neutronics.reactivityPcm)} pcm`}/>
                    <Metric label="shutdown margin" value={`${activeAnalysis.neutronics.shutdownMarginPcm.toFixed(0)} pcm`}/>
                    <Metric label="drum angle" value={`${activeAnalysis.neutronics.controlDrumAngleDeg.toFixed(1)}°`}/>
                    <Metric label="peaking factor" value={activeAnalysis.neutronics.powerPeakingFactor.toFixed(2)}/>
                </SummaryCard>

                <SummaryCard title="Thermal" posture={activeAnalysis.review.thermalPosture}>
                    <Metric label="thermal power" value={`${activeAnalysis.thermalHydraulic.thermalPowerMw.toFixed(1)} MW`}/>
                    <Metric label="outlet temp" value={`${activeAnalysis.thermalHydraulic.coreOutletTemperatureK.toFixed(0)} K`}/>
                    <Metric label="peak fuel temp" value={`${activeAnalysis.thermalHydraulic.peakFuelTemperatureK.toFixed(0)} K`}/>
                    <Metric label="fuel limit" value={`${activeAnalysis.thermalHydraulic.fuelTemperatureLimitK.toFixed(0)} K`}/>
                    <Metric label="thermal margin" value={`${formatSigned(activeAnalysis.thermalHydraulic.thermalMarginK)} K`}/>
                </SummaryCard>

                <SummaryCard title="Propulsion" posture={activeAnalysis.review.propulsionPosture}>
                    <Metric label="chamber pressure" value={`${activeAnalysis.propulsion.chamberPressureMpa.toFixed(2)} MPa`}/>
                    <Metric label="mass flow" value={`${activeAnalysis.propulsion.massFlowKgPerSec.toFixed(2)} kg/s`}/>
                    <Metric label="thrust" value={`${activeAnalysis.propulsion.thrustKn.toFixed(1)} kN`}/>
                    <Metric label="Isp" value={`${activeAnalysis.propulsion.specificImpulseSec.toFixed(1)} s`}/>
                </SummaryCard>

                {activeAnalysis.thermomechanics ? (
                    <SummaryCard title="Thermomechanics" posture={activeAnalysis.thermomechanics.posture}>
                        <Metric label="converged" value={activeAnalysis.thermomechanics.converged ? 'yes' : 'no'}/>
                        <Metric label="max stress" value={`${activeAnalysis.thermomechanics.maxVonMisesStressMpa.toFixed(0)} MPa`}/>
                        <Metric label="stress limit" value={`${activeAnalysis.thermomechanics.stressLimitMpa.toFixed(0)} MPa`}/>
                        <Metric label="thermal strain" value={`${activeAnalysis.thermomechanics.thermalStrainPercent.toFixed(2)}%`}/>
                        <Metric label="hot-channel factor" value={activeAnalysis.thermomechanics.hotChannelFactor.toFixed(2)}/>
                    </SummaryCard>
                ) : null}
            </div>

            <div className="review-callout">
                <h3>Recommended follow-up</h3>
                <ul>
                    {activeAnalysis.review.recommendedFollowup.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function SourceBadge({label, value}: Readonly<{ label: string; value: string }>) {
    return (
        <div className="source-badge">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function SummaryCard({children, posture, title}: Readonly<{ children: ReactNode; posture: string; title: string }>) {
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

function formatSigned(value: number): string {
    return value > 0 ? `+${value.toFixed(0)}` : value.toFixed(0);
}

function buildPostureClassName(posture: string): string {
    const normalizedPosture = posture.toLowerCase();

    if (normalizedPosture.includes('limit') || normalizedPosture.includes('concern')) {
        return 'posture-chip limit';
    }

    if (normalizedPosture.includes('watch')) {
        return 'posture-chip watch';
    }

    return 'posture-chip nominal';
}
