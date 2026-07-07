

export interface McnpOutputParseResult {
    metadata: Record<string, string>;
    warnings: McnpOutputMessage[];
    notes: McnpOutputMessage[];
    problemControls: Record<string, string>;
    cellPopulation?: McnpCellPopulationSummary;
    materials: McnpOutputMaterial[];
    source?: McnpOutputSourceSummary;
    tallyFluctuations: McnpTallyFluctuation[];
    tallies: McnpOutputTally[];
    derivedQuantities: McnpDerivedQuantity[];
    reflectorGammaHeating: McnpReflectorGammaHeatingRow[];
    restartPoisoning?: McnpRestartPoisoningSummary;
    componentMap: McnpComponentMapRow[];
    termination: Record<string, string>;
    diagnostics: McnpOutputParserDiagnostic[];
}

export interface McnpOutputMessage {
    kind: "warning" | "note";
    lineNumber: number;
    message: string;
    raw: string;
}

export interface McnpCellPopulationSummary {
    ranges: McnpCellPopulationRange[];
    totalCells?: number;
    totalSurfaces?: number;
    totalMaterials?: number;
}

export interface McnpCellPopulationRange {
    lineNumber: number;
    cellRange: string;
    description: string;
    importance?: number;
    raw: string;
}

export interface McnpOutputMaterial {
    lineNumber: number;
    materialId: number;
    shortName: string;
    nominalDensityUse: string;
    raw: string;
}

export interface McnpOutputSourceSummary {
    parameters: Record<string, string>;
    sampledChecks: Record<string, string>;
}

export interface McnpTallyFluctuation {
    lineNumber: number;
    tallyName: string;
    description: string;
    meanRelativeError?: number;
    figureOfMeritStatus?: string;
    raw: string;
}

export interface McnpOutputTally {
    lineNumber: number;
    name: string;
    description: string;
    cells: number[];
    rows: McnpOutputTallyRow[];
    total?: McnpOutputTallyTotal;
    rawHeader: string;
}

export interface McnpOutputTallyRow {
    lineNumber: number;
    cellId: number;
    result: number;
    relativeError: number;
    appRegion?: string;
    raw: string;
}

export interface McnpOutputTallyTotal {
    lineNumber: number;
    result: number;
    relativeError: number;
    raw: string;
}

export interface McnpDerivedQuantity {
    lineNumber: number;
    quantity: string;
    value: number;
    units: string;
    source: string;
    raw: string;
}

export interface McnpReflectorGammaHeatingRow {
    lineNumber: number;
    region: string;
    sourceTally: string;
    proxyHeatFraction: number;
    status: string;
    raw: string;
}

export interface McnpRestartPoisoningSummary {
    metadata: Record<string, string>;
    phases: McnpRestartPoisoningPhase[];
}

export interface McnpRestartPoisoningPhase {
    lineNumber: number;
    phase: string;
    timeSpanSeconds: string;
    normalizedPower: string;
    xenonWorthProxy: string;
    status: string;
    raw: string;
}

export interface McnpComponentMapRow {
    lineNumber: number;
    mcnpCells: string;
    component: string;
    panel: string;
    primaryTally: string;
    raw: string;
}

export interface McnpOutputParserDiagnostic {
    severity: "info" | "warning" | "error";
    lineNumber: number;
    message: string;
    raw?: string;
}

export interface McnpOutputSummary {
    warnings: number;
    notes: number;
    problemControls: number;
    materials: number;
    tallyFluctuations: number;
    tallies: number;
    tallyRows: number;
    derivedQuantities: number;
    reflectorGammaHeatingRows: number;
    restartPoisoningPhases: number;
    componentMapRows: number;
    terminationFields: number;
    diagnostics: number;
}

type OutputSection =
    | "header"
    | "inputEcho"
    | "messageSummary"
    | "problemControls"
    | "cellPopulation"
    | "materialTable"
    | "sourceSummary"
    | "tallyFluctuation"
    | "tallyResults"
    | "derivedSummary"
    | "reflectorGammaHeating"
    | "restartPoisoning"
    | "componentMap"
    | "runTermination";

const SECTION_RE = /^\s*1(.+?)\s*$/;
const KEY_VALUE_RE = /^\s*([^:=]+?)\s*(?::|=)\s*(.+?)\s*$/;
const MESSAGE_RE = /^\s*(warning|note)\.\s*(.*)$/i;
const CELL_POPULATION_RE = /^\s*(\d+(?:-\d+)?(?:,\d+)?)\s{2,}(.+?)\s{2,}(-?\d+(?:\.\d+)?)\s*$/;
const MATERIAL_RE = /^\s*(\d+)\s{2,}(.+?)\s{2,}(.+?)\s*$/;
const TALLY_FLUCTUATION_RE = /^\s*(f\d+:\w+)\s{2,}(.+?)\s{2,}(\d*\.\d+)\s{2,}(.+?)\s*$/i;
const TALLY_HEADER_RE = /^\s*tally\s+(f\d+:\w+)\s+(.+?)\s*$/i;
const TALLY_CELLS_RE = /^\s*cells\s+(.+?)\s*$/i;
const TALLY_ROW_RE = /^\s*(\d+)\s+([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:e[-+]?\d+)?)(?:\s+(.+?))?\s*$/i;
const TALLY_TOTAL_RE = /^\s*total\s+([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*$/i;
const DERIVED_QUANTITY_RE = /^\s*([a-zA-Z0-9_]+)\s+([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s+([^\s]+)\s+(.+?)\s*$/i;
const GAMMA_HEATING_RE = /^\s*([a-zA-Z0-9_]+)\s{2,}(f\d+\s+cell\s+\d+)\s{2,}([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s{2,}(.+?)\s*$/i;
const RESTART_PHASE_RE = /^\s*([a-zA-Z0-9_]+)\s{2,}(\d+\.\d+-\d+\.\d+)\s{2,}(.+?)\s{2,}(.+?)\s{2,}(.+?)\s*$/;
const COMPONENT_MAP_RE = /^\s*(\d+(?:-\d+)?)\s{2,}(.+?)\s{2,}(.+?)\s{2,}(.+?)\s*$/;
const INTEGER_RE = /^[-+]?\d+$/;
const NUMERIC_RE = /^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i;

export function parseMcnpOutput(input: string): McnpOutputParseResult {
    const result: McnpOutputParseResult = {
        metadata: {},
        warnings: [],
        notes: [],
        problemControls: {},
        materials: [],
        tallyFluctuations: [],
        tallies: [],
        derivedQuantities: [],
        reflectorGammaHeating: [],
        componentMap: [],
        termination: {},
        diagnostics: [],
    };

    let section: OutputSection = "header";
    let currentTally: McnpOutputTally | undefined;
    let inSampledSourceChecks = false;
    const sourceSummary: McnpOutputSourceSummary = { parameters: {}, sampledChecks: {} };
    const cellPopulation: McnpCellPopulationSummary = { ranges: [] };
    const restartPoisoning: McnpRestartPoisoningSummary = { metadata: {}, phases: [] };

    input
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .forEach((raw, index) => {
            const lineNumber = index + 1;
            const trimmed = raw.trim();

            const nextSection = detectSection(raw, section);
            if (nextSection !== section) {
                if (section === "tallyResults") {
                    currentTally = undefined;
                }
                section = nextSection;
                inSampledSourceChecks = false;
                return;
            }

            if (trimmed.length === 0 || isSeparator(trimmed) || isBannerLine(trimmed)) {
                return;
            }

            parseHeaderMetadata(raw, result);

            if (section === "sourceSummary" && trimmed.toLowerCase() === "sampled source checks") {
                inSampledSourceChecks = true;
                return;
            }

            switch (section) {
                case "messageSummary":
                    parseMessageSummary(raw, lineNumber, result);
                    break;
                case "problemControls":
                    parseKeyValueInto(raw, result.problemControls);
                    break;
                case "cellPopulation":
                    parseCellPopulation(raw, lineNumber, cellPopulation, result);
                    break;
                case "materialTable":
                    parseMaterial(raw, lineNumber, result);
                    break;
                case "sourceSummary":
                    parseSourceSummary(raw, inSampledSourceChecks, sourceSummary);
                    break;
                case "tallyFluctuation":
                    parseTallyFluctuation(raw, lineNumber, result);
                    break;
                case "tallyResults":
                    currentTally = parseTallyResult(raw, lineNumber, result, currentTally);
                    break;
                case "derivedSummary":
                    parseDerivedQuantity(raw, lineNumber, result);
                    break;
                case "reflectorGammaHeating":
                    parseReflectorGammaHeating(raw, lineNumber, result);
                    break;
                case "restartPoisoning":
                    parseRestartPoisoning(raw, lineNumber, restartPoisoning);
                    break;
                case "componentMap":
                    parseComponentMap(raw, lineNumber, result);
                    break;
                case "runTermination":
                    parseKeyValueInto(raw, result.termination);
                    break;
                case "header":
                case "inputEcho":
                    break;
            }
        });

    if (cellPopulation.ranges.length > 0) {
        result.cellPopulation = cellPopulation;
    }

    if (Object.keys(sourceSummary.parameters).length > 0 || Object.keys(sourceSummary.sampledChecks).length > 0) {
        result.source = sourceSummary;
    }

    if (Object.keys(restartPoisoning.metadata).length > 0 || restartPoisoning.phases.length > 0) {
        result.restartPoisoning = restartPoisoning;
    }

    return result;
}

export function summarizeMcnpOutput(result: McnpOutputParseResult): McnpOutputSummary {
    return {
        warnings: result.warnings.length,
        notes: result.notes.length,
        problemControls: Object.keys(result.problemControls).length,
        materials: result.materials.length,
        tallyFluctuations: result.tallyFluctuations.length,
        tallies: result.tallies.length,
        tallyRows: result.tallies.reduce((sum, tally) => sum + tally.rows.length, 0),
        derivedQuantities: result.derivedQuantities.length,
        reflectorGammaHeatingRows: result.reflectorGammaHeating.length,
        restartPoisoningPhases: result.restartPoisoning?.phases.length ?? 0,
        componentMapRows: result.componentMap.length,
        terminationFields: Object.keys(result.termination).length,
        diagnostics: result.diagnostics.length,
    };
}

function detectSection(raw: string, current: OutputSection): OutputSection {
    const match = raw.match(SECTION_RE);
    if (match === null) return current;

    const title = normalizeKey(match[1]);

    if (title === "input_file_echo") return "inputEcho";
    if (title === "message_summary") return "messageSummary";
    if (title === "problem_controls") return "problemControls";
    if (title === "cell_population_and_importance_summary") return "cellPopulation";
    if (title === "material_table_summary") return "materialTable";
    if (title === "source_summary") return "sourceSummary";
    if (title === "tally_fluctuation_chart_summary") return "tallyFluctuation";
    if (title === "tally_results_neutron_flux_proxies_per_source_neutron") return "tallyResults";
    if (title === "derived_app_facing_summary_quantities") return "derivedSummary";
    if (title === "reflector_gamma_heating_proxy_table") return "reflectorGammaHeating";
    if (title === "restart_poisoning_and_kinetics_metadata_echo") return "restartPoisoning";
    if (title === "component_map_echo_for_ntp_sys_console") return "componentMap";
    if (title === "run_termination") return "runTermination";

    return current;
}

function parseHeaderMetadata(raw: string, result: McnpOutputParseResult): void {
    const match = raw.match(KEY_VALUE_RE);
    if (match === null) return;

    const key = normalizeKey(match[1]);

    if (key === "name" || key === "title" || key === "case" || key === "input") {
        result.metadata[key] = match[2].trim();
    }
}

function parseMessageSummary(raw: string, lineNumber: number, result: McnpOutputParseResult): void {
    const match = raw.match(MESSAGE_RE);
    if (match === null) return;

    const kind = match[1].toLowerCase() as "warning" | "note";
    const message: McnpOutputMessage = {
        kind,
        lineNumber,
        message: match[2].trim(),
        raw,
    };

    if (kind === "warning") {
        result.warnings.push(message);
    } else {
        result.notes.push(message);
    }
}

function parseCellPopulation(
    raw: string,
    lineNumber: number,
    cellPopulation: McnpCellPopulationSummary,
    result: McnpOutputParseResult,
): void {
    const rangeMatch = raw.match(CELL_POPULATION_RE);
    if (rangeMatch !== null) {
        cellPopulation.ranges.push({
            lineNumber,
            cellRange: rangeMatch[1],
            description: rangeMatch[2].trim(),
            importance: Number.parseFloat(rangeMatch[3]),
            raw,
        });
        return;
    }

    const keyValue = raw.match(KEY_VALUE_RE);
    if (keyValue === null) return;

    const key = normalizeKey(keyValue[1]);
    const value = Number.parseInt(keyValue[2], 10);

    if (!Number.isFinite(value)) return;

    if (key === "total_cells_processed") cellPopulation.totalCells = value;
    else if (key === "total_surfaces_processed") cellPopulation.totalSurfaces = value;
    else if (key === "total_materials_processed") cellPopulation.totalMaterials = value;
    else {
        result.diagnostics.push({
            severity: "info",
            lineNumber,
            message: `Unrecognized cell population summary field: ${key}.`,
            raw,
        });
    }
}

function parseMaterial(raw: string, lineNumber: number, result: McnpOutputParseResult): void {
    const match = raw.match(MATERIAL_RE);
    if (match === null || !INTEGER_RE.test(match[1])) return;

    const materialId = Number.parseInt(match[1], 10);

    result.materials.push({
        lineNumber,
        materialId,
        shortName: match[2].trim(),
        nominalDensityUse: match[3].trim(),
        raw,
    });
}

function parseSourceSummary(
    raw: string,
    inSampledSourceChecks: boolean,
    sourceSummary: McnpOutputSourceSummary,
): void {
    const match = raw.match(KEY_VALUE_RE);
    if (match === null) return;

    const target = inSampledSourceChecks ? sourceSummary.sampledChecks : sourceSummary.parameters;
    target[normalizeKey(match[1])] = match[2].trim();
}

function parseTallyFluctuation(raw: string, lineNumber: number, result: McnpOutputParseResult): void {
    const match = raw.match(TALLY_FLUCTUATION_RE);
    if (match === null) return;

    result.tallyFluctuations.push({
        lineNumber,
        tallyName: match[1].toLowerCase(),
        description: match[2].trim(),
        meanRelativeError: Number.parseFloat(match[3]),
        figureOfMeritStatus: match[4].trim(),
        raw,
    });
}

function parseTallyResult(
    raw: string,
    lineNumber: number,
    result: McnpOutputParseResult,
    currentTally: McnpOutputTally | undefined,
): McnpOutputTally | undefined {
    const tallyMatch = raw.match(TALLY_HEADER_RE);
    if (tallyMatch !== null) {
        const tally: McnpOutputTally = {
            lineNumber,
            name: tallyMatch[1].toLowerCase(),
            description: tallyMatch[2].trim(),
            cells: [],
            rows: [],
            rawHeader: raw,
        };

        result.tallies.push(tally);
        return tally;
    }

    if (currentTally === undefined) return undefined;

    const cellsMatch = raw.match(TALLY_CELLS_RE);
    if (cellsMatch !== null) {
        currentTally.cells = parseIntegerList(cellsMatch[1]);
        return currentTally;
    }

    const totalMatch = raw.match(TALLY_TOTAL_RE);
    if (totalMatch !== null) {
        currentTally.total = {
            lineNumber,
            result: Number.parseFloat(totalMatch[1]),
            relativeError: Number.parseFloat(totalMatch[2]),
            raw,
        };
        return currentTally;
    }

    const rowMatch = raw.match(TALLY_ROW_RE);
    if (rowMatch !== null) {
        currentTally.rows.push({
            lineNumber,
            cellId: Number.parseInt(rowMatch[1], 10),
            result: Number.parseFloat(rowMatch[2]),
            relativeError: Number.parseFloat(rowMatch[3]),
            appRegion: rowMatch[4]?.trim(),
            raw,
        });
    }

    return currentTally;
}

function parseDerivedQuantity(raw: string, lineNumber: number, result: McnpOutputParseResult): void {
    const match = raw.match(DERIVED_QUANTITY_RE);
    if (match === null || !NUMERIC_RE.test(match[2])) return;

    result.derivedQuantities.push({
        lineNumber,
        quantity: match[1],
        value: Number.parseFloat(match[2]),
        units: match[3].trim(),
        source: match[4].trim(),
        raw,
    });
}

function parseReflectorGammaHeating(raw: string, lineNumber: number, result: McnpOutputParseResult): void {
    const match = raw.match(GAMMA_HEATING_RE);
    if (match === null) return;

    result.reflectorGammaHeating.push({
        lineNumber,
        region: match[1],
        sourceTally: match[2].trim(),
        proxyHeatFraction: Number.parseFloat(match[3]),
        status: match[4].trim(),
        raw,
    });
}

function parseRestartPoisoning(
    raw: string,
    lineNumber: number,
    restartPoisoning: McnpRestartPoisoningSummary,
): void {
    const phaseMatch = raw.match(RESTART_PHASE_RE);
    if (phaseMatch !== null) {
        restartPoisoning.phases.push({
            lineNumber,
            phase: phaseMatch[1],
            timeSpanSeconds: phaseMatch[2],
            normalizedPower: phaseMatch[3].trim(),
            xenonWorthProxy: phaseMatch[4].trim(),
            status: phaseMatch[5].trim(),
            raw,
        });
        return;
    }

    const keyValue = raw.match(KEY_VALUE_RE);
    if (keyValue !== null) {
        restartPoisoning.metadata[normalizeKey(keyValue[1])] = keyValue[2].trim();
    }
}

function parseComponentMap(raw: string, lineNumber: number, result: McnpOutputParseResult): void {
    const match = raw.match(COMPONENT_MAP_RE);
    if (match === null) return;

    result.componentMap.push({
        lineNumber,
        mcnpCells: match[1],
        component: match[2].trim(),
        panel: match[3].trim(),
        primaryTally: match[4].trim(),
        raw,
    });
}

function parseKeyValueInto(raw: string, target: Record<string, string>): void {
    const match = raw.match(KEY_VALUE_RE);
    if (match === null) return;

    target[normalizeKey(match[1])] = match[2].trim();
}

function parseIntegerList(input: string): number[] {
    return input
        .trim()
        .split(/\s+/)
        .flatMap((token) => parseIntegerToken(token));
}

function parseIntegerToken(token: string): number[] {
    const range = token.match(/^(\d+)-(\d+)$/);
    if (range === null) {
        const value = Number.parseInt(token, 10);
        return Number.isFinite(value) ? [value] : [];
    }

    const start = Number.parseInt(range[1], 10);
    const stop = Number.parseInt(range[2], 10);
    const values: number[] = [];

    for (let value = start; value <= stop; value += 1) {
        values.push(value);
    }

    return values;
}

function normalizeKey(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function isSeparator(trimmed: string): boolean {
    return /^[-=]+$/.test(trimmed);
}

function isBannerLine(trimmed: string): boolean {
    return /^\*+$/.test(trimmed) || /^\*.*\*$/.test(trimmed);
}