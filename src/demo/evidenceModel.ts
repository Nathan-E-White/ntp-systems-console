import type {McnpOutputParseResult} from '../parser/mcnp/mcnp.output.parser';
import type {MooseOutputParseResult, MooseOutputScalarValue} from '../parser/moose/moose.output.parser';
import type {ParsedRocetsOutput} from '../parser/rocets/rocets.output.parser';
import type {ParserDiagnostic, ParserFamily} from '../parser/parserTypes';
import type {NumericOutputKey} from '../components/analysis';
import type {AnalysisEvidence} from './demoModel';

export interface EvidenceTrace {
    readonly id: string;
    readonly label: string;
    readonly unit: string;
    readonly color: string;
}

export interface EvidencePoint {
    readonly x: number;
    readonly label?: string;
    readonly values: Readonly<Record<string, number | null>>;
}

export interface EvidenceTableColumn {
    readonly id: string;
    readonly label: string;
    readonly unit?: string;
}

export interface EvidenceTable {
    readonly columns: readonly EvidenceTableColumn[];
    readonly rows: readonly Readonly<Record<string, string | number | null>>[];
}

export interface EvidenceDataset {
    readonly id: string;
    readonly title: string;
    readonly sourceFile: string;
    readonly family: ParserFamily;
    readonly validationLabel: string;
    readonly diagnostics: readonly ParserDiagnostic[];
    readonly xLabel: string;
    readonly xUnit: string;
    readonly traces: readonly EvidenceTrace[];
    readonly points: readonly EvidencePoint[];
    readonly table: EvidenceTable;
}

export interface EvidenceViewDefinition {
    readonly id: string;
    readonly title: string;
    readonly interpretation: string;
    readonly datasetId: string;
    readonly comparisonOutputKeys: readonly NumericOutputKey[];
}

export interface EvidenceWorkspace {
    readonly datasets: readonly EvidenceDataset[];
    readonly views: readonly EvidenceViewDefinition[];
}

const colors = ['#d6ad62', '#65b9d8', '#bb8cc6', '#79bf8d'];

export function buildEvidenceWorkspace(evidence: readonly AnalysisEvidence[]): EvidenceWorkspace {
    const mcnp = evidence.find((item) => item.id === 'mcnp-output');
    const criticality = evidence.find((item) => item.id === 'mcnp-criticality-output');
    const moose = evidence.find((item) => item.id === 'moose-output');
    const rocets = evidence.find((item) => item.id === 'rocets-output');
    const datasets = [
        mcnp && buildTransportDataset(mcnp),
        criticality && buildCriticalityDataset(criticality),
        moose && buildThermalDataset(moose),
        rocets && buildFeedDataset(rocets),
        rocets && buildNozzleDataset(rocets),
        rocets && buildStabilityDataset(rocets),
    ].filter((dataset): dataset is EvidenceDataset => Boolean(dataset));

    return {
        datasets,
        views: [
            view('reactor-transport', 'Reactor transport evidence', 'Compare the three fixture axial regions and their reported relative errors.', 'mcnp-transport-axial', ['channelWallCriterionMarginK']),
            view('reactor-criticality', 'Criticality and restart evidence', 'Track the synthetic burnup k-effective trend while reviewing xenon and decay-heat restart memory.', 'mcnp-criticality-burnup', ['channelWallCriterionMarginK']),
            view('thermal-margin', 'Thermal response evidence', 'Relate the static MOOSE-like temperature history to the calculated channel-wall criterion margin.', 'moose-thermal-history', ['peakChannelWallTemperatureK', 'channelWallCriterionMarginK']),
            view('feed-system', 'Feed and turbomachinery evidence', 'Inspect mass flow, pump pressure rise, shaft speed, and turbine power through the ROCETS-like mission history.', 'rocets-feed-history', ['pressureDropMpa', 'basisCompletenessPercent']),
            view('nozzle-performance', 'Nozzle performance evidence', 'Inspect chamber pressure, nozzle mass flow, specific impulse, and thrust as independent fixture evidence.', 'rocets-nozzle-history', ['thrustKn', 'pressureDropMpa']),
            view('propulsion-stability', 'Transient stability evidence', 'Review fixture stability events separately from the current channel pressure drop and model-basis completeness.', 'rocets-stability-history', ['basisCompletenessPercent', 'pressureDropMpa']),
        ],
    };
}

function buildTransportDataset(evidence: AnalysisEvidence): EvidenceDataset {
    const parsed = evidence.artifact.parsed?.rawParsed as McnpOutputParseResult;
    const axialTallies = parsed.tallies.slice(0, 3);
    return dataset(evidence, 'mcnp-transport-axial', 'MCNP-like axial flux proxy', 'Axial region', '', [
        trace('flux', 'Flux proxy', 'a.u.', colors[0]),
    ], axialTallies.map((tally, index) => ({
        x: index + 1,
        label: ['Core A', 'Core B', 'Core C'][index],
        values: {flux: tally.total?.result ?? null},
    })), {
        columns: [
            {id: 'region', label: 'Region'},
            {id: 'tally', label: 'Tally'},
            {id: 'flux', label: 'Flux proxy', unit: 'a.u.'},
            {id: 'relativeError', label: 'Rel. error'},
        ],
        rows: axialTallies.map((tally, index) => ({
            region: ['Core A', 'Core B', 'Core C'][index],
            tally: tally.name,
            flux: tally.total?.result ?? null,
            relativeError: tally.total?.relativeError ?? null,
        })),
    });
}

function buildCriticalityDataset(evidence: AnalysisEvidence): EvidenceDataset {
    const burnup = parseRows(evidence.artifact.text, /^\s*(?<step>\d+)\s+(?<burnup>\d+\.\d+)\s+(?<time>\d+\.\d+)\s+(?<keff>\d+\.\d+)\s+(?<sigma>\d+\.\d+)\s+(?<pcm>[+-]\d+)\s+(?<status>[\w-]+)/gm, '1burnup step summary');
    const xenon = parseRows(evidence.artifact.text, /^\s*(?<step>\d+)\s+(?<burnup>\d+\.\d+)\s+(?<iodine>\d+\.\d+)\s+(?<xenon>\d+\.\d+)\s+(?<worth>-?\d+)\s+(?<posture>[\w-]+)/gm, '1iodine / xenon restart-memory proxy table');
    const decay = parseRows(evidence.artifact.text, /^\s*(?<step>\d+)\s+(?<burnup>\d+\.\d+)\s+(?<one>\d+\.\d+)\s+(?<ten>\d+\.\d+)\s+(?<hundred>\d+\.\d+)\s+(?<thousand>\d+\.\d+)\s+(?<status>[\w-]+)/gm, '1decay heat proxy table');
    return dataset(evidence, 'mcnp-criticality-burnup', 'MCNP-like burnup and restart memory', 'Burnup', 'MWd/kgHM proxy', [
        trace('keff', 'k-effective', '', colors[0]),
    ], burnup.map((row) => ({
        x: number(row.burnup) ?? 0,
        values: {keff: number(row.keff)},
    })), {
        columns: [
            {id: 'burnup', label: 'Burnup', unit: 'MWd/kgHM proxy'},
            {id: 'keff', label: 'k-effective'},
            {id: 'xenonWorth', label: 'Xe worth', unit: 'pcm'},
            {id: 'decay100s', label: 'Decay heat +100 s', unit: 'normalized'},
            {id: 'posture', label: 'Posture'},
        ],
        rows: burnup.map((row, index) => ({
            burnup: number(row.burnup),
            keff: number(row.keff),
            xenonWorth: number(xenon[index]?.worth),
            decay100s: number(decay[index]?.hundred),
            posture: xenon[index]?.posture ?? row.status ?? '',
        })),
    });
}

function buildThermalDataset(evidence: AnalysisEvidence): EvidenceDataset {
    const parsed = evidence.artifact.parsed?.rawParsed as MooseOutputParseResult;
    const rows = parsed.postprocessorTimeHistory?.rows ?? [];
    const final = parsed.appSummary;
    return dataset(evidence, 'moose-thermal-history', 'MOOSE-like component temperature history', 'Mission time', 's', [
        trace('peakFuel', 'Peak fuel', 'K', '#e46f3c'),
        trace('coolant', 'Core coolant', 'K', '#65b9d8'),
        trace('reflector', 'Reflector', 'K', colors[0]),
        trace('nozzleWall', 'Nozzle wall', 'K', colors[2]),
    ], rows.map(({values}) => ({
        x: scalar(values.time) ?? 0,
        values: {
            peakFuel: scalar(values.peak_fuel_temperature),
            coolant: scalar(values.average_core_coolant_temperature),
            reflector: scalar(values.peak_reflector_temperature),
            nozzleWall: scalar(values.peak_nozzle_wall_temperature),
        },
    })), {
        columns: [
            {id: 'metric', label: 'Constraint'},
            {id: 'value', label: 'Fixture value'},
            {id: 'unit', label: 'Unit'},
        ],
        rows: [
            finalRow('Peak fuel temperature', final['thermal_panel.peak_fuel_temperature_K'], 'K'),
            finalRow('Peak fuel time', final['thermal_panel.peak_fuel_time_s'], 's'),
            finalRow('Minimum thermal margin', final['thermal_panel.minimum_thermal_margin_K'], 'K'),
            finalRow('Core support-grid peak', parsed.finalPostprocessorValues.peak_core_support_grid_temperature, 'K'),
        ],
    });
}

function buildFeedDataset(evidence: AnalysisEvidence): EvidenceDataset {
    const parsed = evidence.artifact.parsed?.rawParsed as ParsedRocetsOutput;
    return dataset(evidence, 'rocets-feed-history', 'ROCETS-like feed and turbomachinery history', 'Mission time', 's', [
        trace('massFlow', 'Pump mass flow', 'kg/s', '#65b9d8'),
        trace('pumpDp', 'Pump ΔP', 'MPa', colors[0]),
        trace('shaftSpeed', 'Main shaft speed', 'krpm', colors[2]),
        trace('turbinePower', 'Turbine power', 'MW', colors[3]),
    ], parsed.feedTurbomachineryHistory.map((row) => ({
        x: row.timeSeconds,
        values: {
            massFlow: row.pumpMassFlowKgPerSecond,
            pumpDp: row.pumpDeltaPressurePa / 1e6,
            shaftSpeed: row.mainRpm / 1e3,
            turbinePower: row.turbinePowerW / 1e6,
        },
    })), phaseTable(parsed));
}

function buildNozzleDataset(evidence: AnalysisEvidence): EvidenceDataset {
    const parsed = evidence.artifact.parsed?.rawParsed as ParsedRocetsOutput;
    return dataset(evidence, 'rocets-nozzle-history', 'ROCETS-like nozzle performance history', 'Mission time', 's', [
        trace('pressure', 'Chamber pressure', 'MPa', colors[0]),
        trace('massFlow', 'Nozzle mass flow', 'kg/s', '#65b9d8'),
        trace('isp', 'Specific impulse', 's', colors[2]),
        trace('thrust', 'Thrust proxy', 'kN', colors[3]),
    ], parsed.nozzlePerformanceHistory.map((row) => ({
        x: row.timeSeconds,
        values: {
            pressure: row.chamberPressurePa / 1e6,
            massFlow: row.nozzleMassFlowKgPerSecond,
            isp: row.ispProxySeconds,
            thrust: row.thrustProxyN / 1e3,
        },
    })), phaseTable(parsed));
}

function buildStabilityDataset(evidence: AnalysisEvidence): EvidenceDataset {
    const parsed = evidence.artifact.parsed?.rawParsed as ParsedRocetsOutput;
    return dataset(evidence, 'rocets-stability-history', 'ROCETS-like advisory stability history', 'Mission time', 's', [
        trace('margin', 'Ledinegg margin proxy', '', colors[2]),
        trace('massFlow', 'Mass flow', 'kg/s', '#65b9d8'),
    ], parsed.overviewSnapshots.map((row) => ({
        x: row.timeSeconds,
        values: {margin: row.margin, massFlow: row.massFlowKgPerSecond},
    })), {
        columns: [
            {id: 'time', label: 'Time', unit: 's'},
            {id: 'event', label: 'Transient event'},
            {id: 'cuts', label: 'Cuts'},
        ],
        rows: parsed.transientLog.filter((row) => row.event !== '-').map((row) => ({
            time: row.timeSeconds,
            event: row.event,
            cuts: row.cuts,
        })),
    });
}

function dataset(
    evidence: AnalysisEvidence,
    id: string,
    title: string,
    xLabel: string,
    xUnit: string,
    traces: readonly EvidenceTrace[],
    points: readonly EvidencePoint[],
    table: EvidenceTable,
): EvidenceDataset {
    return {
        id,
        title,
        sourceFile: evidence.sourceFile,
        family: evidence.family,
        validationLabel: evidence.validationLabel,
        diagnostics: evidence.diagnostics,
        xLabel,
        xUnit,
        traces,
        points,
        table,
    };
}

function phaseTable(parsed: ParsedRocetsOutput): EvidenceTable {
    return {
        columns: [
            {id: 'phase', label: 'Mission phase'},
            {id: 'span', label: 'Time span', unit: 's'},
            {id: 'status', label: 'Status'},
        ],
        rows: parsed.missionPhases.map((phase) => ({
            phase: phase.phase,
            span: `${phase.startSeconds}-${phase.stopSeconds}`,
            status: phase.status,
        })),
    };
}

function view(id: string, title: string, interpretation: string, datasetId: string, comparisonOutputKeys: readonly NumericOutputKey[]): EvidenceViewDefinition {
    return {id, title, interpretation, datasetId, comparisonOutputKeys};
}

function trace(id: string, label: string, unit: string, color: string): EvidenceTrace {
    return {id, label, unit, color};
}

function finalRow(metric: string, value: MooseOutputScalarValue | undefined, unit: string) {
    return {metric, value: scalar(value), unit};
}

function scalar(value: MooseOutputScalarValue | undefined): number | null {
    if (value === undefined) return null;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function number(value: string | undefined): number | null {
    if (value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function parseRows(text: string, expression: RegExp, sectionStart?: string): Record<string, string>[] {
    const sectionIndex = sectionStart ? text.indexOf(sectionStart) : 0;
    const source = sectionIndex >= 0 ? text.slice(sectionIndex) : text;
    return Array.from(source.matchAll(expression), (match) => match.groups ?? {});
}
