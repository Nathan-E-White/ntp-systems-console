import type {MooseOutputParseResult, MooseOutputScalarValue} from '../parser/moose/moose.output.parser';
import type {
    ParsedRocetsOutput,
    RocetsFeedTurbomachinerySample,
    RocetsOverviewSnapshot,
    RocetsSolverResidual,
    RocetsTransientLogEntry,
    RocetsWarningNote,
} from '../parser/rocets/rocets.output.parser';
import {DEFAULT_ANALYSIS_EVIDENCE, type AnalysisEvidence} from './demoModel';

type ExtremumDirection = 'min' | 'max';

export interface StabilityExtremum {
    readonly id: string;
    readonly label: string;
    readonly source: 'ROCETS' | 'MOOSE';
    readonly direction: ExtremumDirection;
    readonly timeSeconds: number;
    readonly value: number;
    readonly unit?: string;
}

export interface ControllingIntervalSummary {
    readonly timeSeconds: number;
    readonly windowLabel: string;
    readonly alignedExtremaCount: number;
    readonly rankReason: string;
    readonly contributions: readonly StabilityExtremum[];
}

export interface AdvisoryStateSample {
    readonly timeSeconds: number;
    readonly phase: string;
    readonly ledinegg: string;
    readonly margin: number;
    readonly massFlowKgPerSecond: number;
    readonly xenon: number;
}

export interface AdvisoryStateSummary {
    readonly statePath: readonly string[];
    readonly minimumMargin: AdvisoryStateSample;
    readonly watchStart: AdvisoryStateSample | null;
    readonly watchEnd: AdvisoryStateSample | null;
    readonly finalState: AdvisoryStateSample;
}

export interface SolverResidualUtilization {
    readonly name: string;
    readonly maxAbs: number;
    readonly tolerance: number;
    readonly utilization: number;
    readonly status: string;
}

export interface SolverHealthSummary {
    readonly rejectedSteps: number;
    readonly maximumTimeCuts: number;
    readonly totalStepCuts: number;
    readonly stepCutEvents: readonly RocetsTransientLogEntry[];
    readonly residualPassCount: number;
    readonly residualCount: number;
    readonly worstResidual: SolverResidualUtilization;
}

export interface HydraulicResistancePoint {
    readonly timeSeconds: number;
    readonly phase: string;
    readonly massFlowKgPerSecond: number;
    readonly pumpDeltaPressurePa: number;
    readonly apparentResistance: number;
}

export interface HydraulicResistanceGroup {
    readonly label: string;
    readonly points: readonly HydraulicResistancePoint[];
    readonly average: number;
    readonly minimum: number;
    readonly maximum: number;
}

export interface HydraulicComparisonSummary {
    readonly ratedBurn: HydraulicResistanceGroup;
    readonly restartCooldown: HydraulicResistanceGroup;
    readonly boundary: string;
}

export interface StabilityEventAlignmentSummary {
    readonly restartWindowLabel: string;
    readonly stepCutEvent: RocetsTransientLogEntry | null;
    readonly ledineggWarning: RocetsWarningNote | null;
}

export interface StabilityInvestigationSummary {
    readonly controllingInterval: ControllingIntervalSummary;
    readonly advisoryState: AdvisoryStateSummary;
    readonly coupledProxyExtrema: readonly StabilityExtremum[];
    readonly solverHealth: SolverHealthSummary;
    readonly hydraulicComparison: HydraulicComparisonSummary;
    readonly eventAlignment: StabilityEventAlignmentSummary;
    readonly boundary: readonly string[];
}

interface CoupledProxyDefinition {
    readonly id: string;
    readonly key: string;
    readonly label: string;
    readonly direction: ExtremumDirection;
    readonly unit?: string;
    readonly includeInAlignmentTable: boolean;
}

const COUPLED_PROXY_DEFINITIONS: readonly CoupledProxyDefinition[] = [
    {
        id: 'moose-ledinegg-margin',
        key: 'minimum_ledinegg_margin_proxy',
        label: 'Ledinegg margin proxy',
        direction: 'min',
        includeInAlignmentTable: true,
    },
    {
        id: 'moose-point-kinetics',
        key: 'minimum_point_kinetics_matrix_stability',
        label: 'Point-kinetics stability proxy',
        direction: 'min',
        includeInAlignmentTable: true,
    },
    {
        id: 'moose-net-coupled-gain',
        key: 'net_coupled_gain_report',
        label: 'Net coupled gain',
        direction: 'max',
        includeInAlignmentTable: true,
    },
    {
        id: 'moose-thrust-frame-gain',
        key: 'thrust_frame_resonance_gain_report',
        label: 'Thrust-frame resonance gain',
        direction: 'max',
        includeInAlignmentTable: true,
    },
    {
        id: 'moose-feedline-wave',
        key: 'feedline_pressure_wave_report',
        label: 'Feedline pressure wave',
        direction: 'max',
        includeInAlignmentTable: true,
    },
    {
        id: 'moose-fluid-phase-angle',
        key: 'fluid_phase_angle_report',
        label: 'Fluid phase angle',
        direction: 'min',
        unit: 'deg',
        includeInAlignmentTable: true,
    },
    {
        id: 'moose-grid-pressure-drop',
        key: 'grid_coupled_pressure_drop_report',
        label: 'Grid coupled pressure drop',
        direction: 'max',
        unit: 'Pa',
        includeInAlignmentTable: false,
    },
];

export function buildStabilityInvestigationSummary(
    evidence: readonly AnalysisEvidence[] = DEFAULT_ANALYSIS_EVIDENCE,
): StabilityInvestigationSummary {
    const rocets = findParsedEvidence<ParsedRocetsOutput>(evidence, 'rocets-output');
    const moose = findParsedEvidence<MooseOutputParseResult>(evidence, 'moose-output');
    const coupledExtrema = buildCoupledProxyExtrema(moose);
    const displayedCoupledExtrema = coupledExtrema.filter((extremum) =>
        COUPLED_PROXY_DEFINITIONS.find((definition) => definition.id === extremum.id)?.includeInAlignmentTable,
    );
    const rocetsMarginExtremum = overviewMinimum(rocets.overviewSnapshots, 'rocets-margin', 'ROCETS margin proxy');
    const controllingInterval = buildControllingInterval(
        [rocetsMarginExtremum, ...coupledExtrema],
        [
            ...rocets.overviewSnapshots.map((snapshot) => snapshot.timeSeconds),
            ...couplingRows(moose).map((row) => numberValue(row.time) ?? 0),
        ],
    );

    return {
        controllingInterval,
        advisoryState: buildAdvisoryState(rocets),
        coupledProxyExtrema: displayedCoupledExtrema,
        solverHealth: buildSolverHealth(rocets),
        hydraulicComparison: buildHydraulicComparison(rocets),
        eventAlignment: buildEventAlignment(rocets),
        boundary: [
            'Advisory fixture diagnosis, not qualified engine stability margin.',
            'Hydraulic resistance is an operating-point comparison, not a Ledinegg slope proof.',
        ],
    };
}

function findParsedEvidence<TParsed>(
    evidence: readonly AnalysisEvidence[],
    id: string,
): TParsed {
    const parsed = evidence.find((item) => item.id === id)?.artifact.parsed?.rawParsed;

    if (parsed === undefined) {
        throw new Error(`Missing parsed fixture evidence: ${id}.`);
    }

    return parsed as TParsed;
}

function buildCoupledProxyExtrema(moose: MooseOutputParseResult): StabilityExtremum[] {
    const rows = couplingRows(moose);

    return COUPLED_PROXY_DEFINITIONS.map((definition) =>
        rowExtremum(rows, definition),
    );
}

function couplingRows(moose: MooseOutputParseResult): readonly Record<string, MooseOutputScalarValue>[] {
    return moose.couplingProxyTimeHistory?.rows.map((row) => row.values) ?? [];
}

function rowExtremum(
    rows: readonly Record<string, MooseOutputScalarValue>[],
    definition: CoupledProxyDefinition,
): StabilityExtremum {
    const candidates = rows.flatMap((row) => {
        const value = numberValue(row[definition.key]);
        const timeSeconds = numberValue(row.time);

        if (value === null || timeSeconds === null) {
            return [];
        }

        return [{value, timeSeconds}];
    });

    if (candidates.length === 0) {
        throw new Error(`No MOOSE coupling proxy values found for ${definition.key}.`);
    }

    const selected = candidates.reduce((current, candidate) => {
        if (definition.direction === 'min') {
            return candidate.value < current.value ? candidate : current;
        }

        return candidate.value > current.value ? candidate : current;
    });

    return {
        id: definition.id,
        label: definition.label,
        source: 'MOOSE',
        direction: definition.direction,
        timeSeconds: selected.timeSeconds,
        value: selected.value,
        unit: definition.unit,
    };
}

function overviewMinimum(
    snapshots: readonly RocetsOverviewSnapshot[],
    id: string,
    label: string,
): StabilityExtremum {
    if (snapshots.length === 0) {
        throw new Error('No ROCETS overview snapshots available for stability investigation.');
    }

    const selected = snapshots.reduce((current, candidate) =>
        candidate.margin < current.margin ? candidate : current,
    );

    return {
        id,
        label,
        source: 'ROCETS',
        direction: 'min',
        timeSeconds: selected.timeSeconds,
        value: selected.margin,
    };
}

function buildControllingInterval(
    extrema: readonly StabilityExtremum[],
    availableTimes: readonly number[],
): ControllingIntervalSummary {
    const uniqueTimes = Array.from(new Set(availableTimes.filter((time) => Number.isFinite(time))));
    const grouped = new Map<number, StabilityExtremum[]>();

    extrema.forEach((extremum) => {
        const timeSeconds = nearestTime(extremum.timeSeconds, uniqueTimes);
        grouped.set(timeSeconds, [...(grouped.get(timeSeconds) ?? []), {...extremum, timeSeconds}]);
    });

    const [timeSeconds, contributions] = Array.from(grouped.entries()).sort(
        ([timeA, extremaA], [timeB, extremaB]) => extremaB.length - extremaA.length || timeA - timeB,
    )[0];

    return {
        timeSeconds,
        windowLabel: `${formatWholeNumber(timeSeconds)} s restart/cooldown transition`,
        alignedExtremaCount: contributions.length,
        rankReason: `${contributions.length} adverse stability and coupled-response extrema align at ${formatWholeNumber(timeSeconds)} s.`,
        contributions,
    };
}

function nearestTime(target: number, availableTimes: readonly number[]): number {
    if (availableTimes.length === 0) {
        return target;
    }

    return availableTimes.reduce((current, candidate) =>
        Math.abs(candidate - target) < Math.abs(current - target) ? candidate : current,
    );
}

function buildAdvisoryState(rocets: ParsedRocetsOutput): AdvisoryStateSummary {
    const snapshots = rocets.overviewSnapshots;

    if (snapshots.length === 0) {
        throw new Error('No ROCETS overview snapshots available for advisory state summary.');
    }

    const statePath = snapshots.reduce<string[]>((states, snapshot) => {
        if (states.at(-1) !== snapshot.ledinegg) {
            return [...states, snapshot.ledinegg];
        }

        return states;
    }, []);
    const watchSamples = snapshots.filter((snapshot) => snapshot.ledinegg.toLowerCase() === 'watch');

    return {
        statePath,
        minimumMargin: overviewSample(snapshots.reduce((current, candidate) =>
            candidate.margin < current.margin ? candidate : current,
        )),
        watchStart: watchSamples[0] ? overviewSample(watchSamples[0]) : null,
        watchEnd: watchSamples.at(-1) ? overviewSample(watchSamples.at(-1)!) : null,
        finalState: overviewSample(snapshots.at(-1)!),
    };
}

function overviewSample(snapshot: RocetsOverviewSnapshot): AdvisoryStateSample {
    return {
        timeSeconds: snapshot.timeSeconds,
        phase: snapshot.phase,
        ledinegg: snapshot.ledinegg,
        margin: snapshot.margin,
        massFlowKgPerSecond: snapshot.massFlowKgPerSecond,
        xenon: snapshot.xenon,
    };
}

function buildSolverHealth(rocets: ParsedRocetsOutput): SolverHealthSummary {
    const stepCutEvents = rocets.transientLog.filter((entry) => entry.cuts > 0);
    const totalStepCuts = stepCutEvents.reduce((total, entry) => total + entry.cuts, 0);
    const worstResidual = worstResidualUtilization(rocets.solverResiduals);

    return {
        rejectedSteps: rocets.finalSummary.rejectedSteps ?? totalStepCuts,
        maximumTimeCuts: rocets.finalSummary.maximumTimeCuts ?? Math.max(0, ...rocets.transientLog.map((entry) => entry.cuts)),
        totalStepCuts,
        stepCutEvents,
        residualPassCount: rocets.solverResiduals.filter((residual) => residual.status.toLowerCase() === 'pass').length,
        residualCount: rocets.solverResiduals.length,
        worstResidual,
    };
}

function worstResidualUtilization(residuals: readonly RocetsSolverResidual[]): SolverResidualUtilization {
    const utilizations = residuals.flatMap((residual) => {
        if (residual.tolerance <= 0) {
            return [];
        }

        return [{
            name: residual.name,
            maxAbs: residual.maxAbs,
            tolerance: residual.tolerance,
            utilization: residual.maxAbs / residual.tolerance,
            status: residual.status,
        }];
    });

    if (utilizations.length === 0) {
        throw new Error('No ROCETS residual tolerances available for solver health summary.');
    }

    return utilizations.reduce((current, candidate) =>
        candidate.utilization > current.utilization ? candidate : current,
    );
}

function buildHydraulicComparison(rocets: ParsedRocetsOutput): HydraulicComparisonSummary {
    const points = rocets.feedTurbomachineryHistory.flatMap((sample) => hydraulicPoint(sample, rocets));
    const ratedBurn = groupHydraulicPoints(
        'Rated burn',
        points.filter((point) => point.phase === 'rated_burn'),
    );
    const restartCooldown = groupHydraulicPoints(
        'Restart/cooldown powered samples',
        points.filter((point) =>
            ['restart_ramp', 'cooldown'].includes(point.phase) && point.massFlowKgPerSecond >= 5,
        ),
    );

    return {
        ratedBurn,
        restartCooldown,
        boundary: 'Operating-point comparison only; not a Ledinegg slope proof.',
    };
}

function hydraulicPoint(
    sample: RocetsFeedTurbomachinerySample,
    rocets: ParsedRocetsOutput,
): HydraulicResistancePoint[] {
    if (sample.pumpMassFlowKgPerSecond <= 0) {
        return [];
    }

    return [{
        timeSeconds: sample.timeSeconds,
        phase: phaseForTime(sample.timeSeconds, rocets),
        massFlowKgPerSecond: sample.pumpMassFlowKgPerSecond,
        pumpDeltaPressurePa: sample.pumpDeltaPressurePa,
        apparentResistance: sample.pumpDeltaPressurePa / sample.pumpMassFlowKgPerSecond ** 2,
    }];
}

function phaseForTime(timeSeconds: number, rocets: ParsedRocetsOutput): string {
    const exactSnapshot = rocets.overviewSnapshots.find((snapshot) => snapshot.timeSeconds === timeSeconds);

    if (exactSnapshot) {
        return exactSnapshot.phase;
    }

    return rocets.missionPhases.find((phase) =>
        timeSeconds >= phase.startSeconds && timeSeconds <= phase.stopSeconds,
    )?.phase ?? 'unassigned';
}

function groupHydraulicPoints(
    label: string,
    points: readonly HydraulicResistancePoint[],
): HydraulicResistanceGroup {
    if (points.length === 0) {
        throw new Error(`No hydraulic resistance points available for ${label}.`);
    }

    const values = points.map((point) => point.apparentResistance);

    return {
        label,
        points,
        average: values.reduce((sum, value) => sum + value, 0) / values.length,
        minimum: Math.min(...values),
        maximum: Math.max(...values),
    };
}

function buildEventAlignment(rocets: ParsedRocetsOutput): StabilityEventAlignmentSummary {
    const restart = rocets.missionPhases.find((phase) => phase.phase === 'restart_ramp');
    const stepCutEvent = rocets.transientLog.find((entry) => entry.cuts > 0) ?? null;
    const ledineggWarning = rocets.warningsAndNotes.find((warning) =>
        warning.kind === 'WARN' && warning.message.toLowerCase().includes('ledinegg'),
    ) ?? null;

    return {
        restartWindowLabel: restart
            ? `${formatWholeNumber(restart.startSeconds)}-${formatWholeNumber(restart.stopSeconds)} s`
            : 'restart interval unavailable',
        stepCutEvent,
        ledineggWarning,
    };
}

function numberValue(value: MooseOutputScalarValue | undefined): number | null {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function formatWholeNumber(value: number): string {
    return Math.round(value).toString();
}
