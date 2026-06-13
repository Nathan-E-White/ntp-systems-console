

import type {
  ParsedDomainSlices,
  ParsedFileViewModel,
  ParsedGraphModel,
  ParsedRecordValue,
  ParsedSection,
  ParsedSummaryCard,
  ParsedTable,
  ParsedTimeSeries,
  ParsedTimeSeriesPoint,
  ParserDescriptor,
  ParserDiagnostic,
} from "./parserTypes";
import { createParsedFileViewModel } from "./parsedFileViewModel";

type UnknownRecord = Record<string, unknown>;

export interface RocetsOutputAdapterInput<TParsed = unknown> {
  id: string;
  filename: string;
  descriptor: ParserDescriptor<TParsed>;
  parsed: TParsed;
  diagnostics?: ParserDiagnostic[];
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const asRecordArray = (value: unknown): UnknownRecord[] => asArray(value).filter(isRecord);

const getRecordValue = (record: UnknownRecord, keys: string[]): unknown =>
  keys.map((key) => record[key]).find((value) => value !== undefined && value !== null);

const getString = (record: UnknownRecord, keys: string[], fallback = ""): string => {
  const value = getRecordValue(record, keys);

  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const getNumber = (record: UnknownRecord, keys: string[]): number | undefined => {
  const value = getRecordValue(record, keys);

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const toParsedRecordValue = (value: unknown): ParsedRecordValue => {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
    return value as ParsedRecordValue;
  }

  if (Array.isArray(value)) {
    const scalarValues = value.filter(
      (entry): entry is string | number | boolean | null =>
        entry === null || ["string", "number", "boolean"].includes(typeof entry),
    );

    return scalarValues.length === value.length ? scalarValues : JSON.stringify(value);
  }

  if (value === undefined) {
    return null;
  }

  return JSON.stringify(value);
};

const recordToParsedRecord = (record: UnknownRecord): Record<string, ParsedRecordValue> =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key, toParsedRecordValue(value)]));

const humanizeKey = (key: string): string =>
  key
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll(/\s+/g, " ")
    .trim()
    .replace(/^./, (firstCharacter) => firstCharacter.toUpperCase());

const getParsedArray = (parsed: unknown, candidateKeys: string[]): UnknownRecord[] => {
  if (!isRecord(parsed)) {
    return [];
  }

  const value = getRecordValue(parsed, candidateKeys);

  return asRecordArray(value);
};

const getParsedRecord = (parsed: unknown, candidateKeys: string[]): UnknownRecord | undefined => {
  if (!isRecord(parsed)) {
    return undefined;
  }

  const value = getRecordValue(parsed, candidateKeys);

  return isRecord(value) ? value : undefined;
};

const findTitle = (parsed: unknown, filename: string): string => {
  if (!isRecord(parsed)) {
    return filename;
  }

  const title = getRecordValue(parsed, ["title", "caseTitle", "name", "description", "runTitle"]);

  return typeof title === "string" && title.trim().length > 0 ? title : filename;
};

const findCaseId = (parsed: unknown): string | undefined => {
  if (!isRecord(parsed)) {
    return undefined;
  }

  const caseId = getRecordValue(parsed, ["caseId", "case", "caseName", "id", "runId"]);

  return typeof caseId === "string" && caseId.trim().length > 0 ? caseId : undefined;
};

const findRunStatus = (parsed: unknown): string | undefined => {
  if (!isRecord(parsed)) {
    return undefined;
  }

  const finalSummary = getParsedRecord(parsed, ["finalSummary", "summary", "runSummary"]);
  const status = getRecordValue(parsed, ["status", "runStatus", "terminationStatus"]);
  const finalStatus = finalSummary
    ? getRecordValue(finalSummary, ["status", "runStatus", "terminationStatus", "solveStatus"])
    : undefined;
  const selectedStatus = finalStatus ?? status;

  return typeof selectedStatus === "string" && selectedStatus.trim().length > 0 ? selectedStatus : undefined;
};

const createSummaryCards = (parsed: unknown): ParsedSummaryCard[] => {
  const finalSummary = getParsedRecord(parsed, ["finalSummary", "summary", "runSummary"]);
  const performance = getParsedRecord(parsed, ["performance", "performanceSummary", "solverPerformance"]);
  const steadyInitialization = getParsedRecord(parsed, ["steadyInitialization", "steadyState", "initialization"]);
  const transientLog = getParsedArray(parsed, ["transientLog", "transientIntegrationLog", "timeHistory", "history"]);
  const warnings = getParsedArray(parsed, ["warnings", "notes", "diagnostics"]);
  const missionPhases = getParsedArray(parsed, ["missionPhases", "phases", "runPhases"]);

  const runStatus = findRunStatus(parsed);
  const finalTime = finalSummary ? getNumber(finalSummary, ["finalTime", "time", "t", "stopTime"]) : undefined;
  const thrust = finalSummary ? getNumber(finalSummary, ["thrust", "finalThrust", "thrustN", "thrust_kN"]) : undefined;
  const specificImpulse = finalSummary
    ? getNumber(finalSummary, ["specificImpulse", "isp", "isp_s", "finalIsp"])
    : undefined;
  const chamberPressure = finalSummary
    ? getNumber(finalSummary, ["chamberPressure", "pc", "pcMPa", "chamberPressureMPa"])
    : undefined;
  const solveStatus = performance
    ? getString(performance, ["solveStatus", "status", "convergence", "convergenceStatus"], "")
    : "";

  return [
    {
      id: "run-status",
      label: "Run status",
      value: runStatus ?? "unknown",
      severity: runStatus?.toLowerCase().includes("fail") ? "error" : "info",
      description: "Termination or final status reported by the ROCETS output.",
    },
    {
      id: "solve-status",
      label: "Solve status",
      value: solveStatus || "unknown",
      severity: solveStatus.toLowerCase().includes("fail") ? "error" : "info",
      description: "Solver convergence status, when available.",
    },
    {
      id: "final-time",
      label: "Final time",
      value: finalTime ?? null,
      description: "Final reported simulation time.",
    },
    {
      id: "thrust",
      label: "Thrust",
      value: thrust ?? null,
      description: "Final or representative engine thrust from the run summary.",
    },
    {
      id: "specific-impulse",
      label: "Specific impulse",
      value: specificImpulse ?? null,
      unit: "s",
      description: "Final or representative specific impulse from the run summary.",
    },
    {
      id: "chamber-pressure",
      label: "Chamber pressure",
      value: chamberPressure ?? null,
      description: "Final or representative chamber pressure from the run summary.",
    },
    {
      id: "transient-steps",
      label: "Transient steps",
      value: transientLog.length,
      description: "Number of transient integration records parsed from the output.",
    },
    {
      id: "mission-phases",
      label: "Mission phases",
      value: missionPhases.length,
      description: "Number of mission or operating phases reported in the output.",
    },
    {
      id: "warnings",
      label: "Warnings / notes",
      value: warnings.length,
      severity: warnings.length > 0 ? "warning" : "info",
      description: "Warning, note, or diagnostic records parsed from the output.",
    },
    {
      id: "steady-initialization",
      label: "Steady initialization",
      value: steadyInitialization ? "present" : "missing",
      severity: steadyInitialization ? "info" : "warning",
      description: "Whether a steady-initialization summary was detected.",
    },
  ];
};

const createSectionFromRecord = (
  id: string,
  title: string,
  record: UnknownRecord | undefined,
  description?: string,
): ParsedSection[] => {
  if (!record) {
    return [];
  }

  return [
    {
      id,
      title,
      description,
      records: [recordToParsedRecord(record)],
    },
  ];
};

const createSections = (parsed: unknown): ParsedSection[] => [
  ...createSectionFromRecord(
    "run-summary",
    "Run summary",
    getParsedRecord(parsed, ["finalSummary", "summary", "runSummary"]),
    "Final ROCETS run status and representative output quantities.",
  ),
  ...createSectionFromRecord(
    "steady-initialization",
    "Steady initialization",
    getParsedRecord(parsed, ["steadyInitialization", "steadyState", "initialization"]),
    "Steady-state initialization values used before transient integration.",
  ),
  ...createSectionFromRecord(
    "performance",
    "Solver performance",
    getParsedRecord(parsed, ["performance", "performanceSummary", "solverPerformance"]),
    "Solver convergence, iteration, and residual information.",
  ),
  ...createSectionFromRecord(
    "input-echo",
    "Input deck echo",
    getParsedRecord(parsed, ["inputEcho", "deckEcho", "echo"]),
    "Input-deck metadata echoed by the ROCETS run.",
  ),
];

const createTable = (
  id: string,
  title: string,
  rows: UnknownRecord[],
  description?: string,
): ParsedTable | undefined => {
  if (rows.length === 0) {
    return undefined;
  }

  const parsedRows = rows.map(recordToParsedRecord);
  const columnIds = Array.from(new Set(parsedRows.flatMap((row) => Object.keys(row))));

  return {
    id,
    title,
    description,
    columns: columnIds.map((columnId) => ({
      id: columnId,
      label: humanizeKey(columnId),
    })),
    rows: parsedRows,
  };
};

const createTables = (parsed: unknown): ParsedTable[] =>
  [
    createTable(
      "transient-log",
      "Transient integration log",
      getParsedArray(parsed, ["transientLog", "transientIntegrationLog", "timeHistory", "history"]),
      "Time-marching records parsed from the ROCETS output.",
    ),
    createTable(
      "mission-phases",
      "Mission phases",
      getParsedArray(parsed, ["missionPhases", "phases", "runPhases"]),
      "Operating phases reported by the simulation.",
    ),
    createTable(
      "feed-turbomachinery-history",
      "Feed and turbomachinery history",
      getParsedArray(parsed, ["feedHistory", "turbomachineryHistory", "pumpHistory", "turbineHistory"]),
      "Feed-system, pump, turbine, or expander quantities parsed from the output.",
    ),
    createTable(
      "nozzle-performance-history",
      "Nozzle performance history",
      getParsedArray(parsed, ["nozzleHistory", "nozzlePerformance", "performanceHistory"]),
      "Nozzle and thrust-performance quantities parsed from the output.",
    ),
    createTable(
      "thermal-history",
      "Thermal history",
      getParsedArray(parsed, ["thermalHistory", "wallTemperatureHistory", "coreThermalHistory"]),
      "Thermal state quantities parsed from the output.",
    ),
    createTable(
      "neutronics-history",
      "Neutronics coupling history",
      getParsedArray(parsed, ["neutronicsHistory", "reactorHistory", "powerHistory"]),
      "Reactor, power, or neutronic coupling quantities reported by the run.",
    ),
    createTable(
      "warnings",
      "Warnings and notes",
      getParsedArray(parsed, ["warnings", "notes", "diagnostics"]),
      "Warnings, notes, or diagnostic messages emitted by the run.",
    ),
  ].filter((table): table is ParsedTable => table !== undefined);

const numericRecordKeys = (record: UnknownRecord): string[] =>
  Object.entries(record)
    .filter(([, value]) => typeof value === "number" || (typeof value === "string" && Number.isFinite(Number(value))))
    .map(([key]) => key);

const timeValueFromRecord = (record: UnknownRecord): number | undefined =>
  getNumber(record, ["time", "t", "seconds", "elapsedTime", "missionTime"]);

const createTimeSeriesFromRows = (
  id: string,
  title: string,
  rows: UnknownRecord[],
  valueUnits?: Record<string, string>,
): ParsedTimeSeries | undefined => {
  const points: ParsedTimeSeriesPoint[] = rows.flatMap((row, index) => {
    const time = timeValueFromRecord(row) ?? index;
    const numericKeys = numericRecordKeys(row).filter(
      (key) => !["time", "t", "seconds", "elapsedTime", "missionTime"].includes(key),
    );

    if (numericKeys.length === 0) {
      return [];
    }

    return [
      {
        time,
        values: Object.fromEntries(
          numericKeys.map((key) => {
            const value = getNumber(row, [key]);

            return [key, value ?? null];
          }),
        ),
      },
    ];
  });

  if (points.length === 0) {
    return undefined;
  }

  return {
    id,
    title,
    timeUnit: "s",
    valueUnits,
    points,
  };
};

const createTimeSeries = (parsed: unknown): ParsedTimeSeries[] =>
  [
    createTimeSeriesFromRows(
      "transient-log",
      "Transient integration log",
      getParsedArray(parsed, ["transientLog", "transientIntegrationLog", "timeHistory", "history"]),
    ),
    createTimeSeriesFromRows(
      "feed-turbomachinery-history",
      "Feed and turbomachinery history",
      getParsedArray(parsed, ["feedHistory", "turbomachineryHistory", "pumpHistory", "turbineHistory"]),
    ),
    createTimeSeriesFromRows(
      "nozzle-performance-history",
      "Nozzle performance history",
      getParsedArray(parsed, ["nozzleHistory", "nozzlePerformance", "performanceHistory"]),
      {
        isp: "s",
        specificImpulse: "s",
      },
    ),
    createTimeSeriesFromRows(
      "thermal-history",
      "Thermal history",
      getParsedArray(parsed, ["thermalHistory", "wallTemperatureHistory", "coreThermalHistory"]),
    ),
    createTimeSeriesFromRows(
      "neutronics-history",
      "Neutronics coupling history",
      getParsedArray(parsed, ["neutronicsHistory", "reactorHistory", "powerHistory"]),
    ),
  ].filter((series): series is ParsedTimeSeries => series !== undefined);

const createGraph = (parsed: unknown): ParsedGraphModel | undefined => {
  const phaseRows = getParsedArray(parsed, ["missionPhases", "phases", "runPhases"]);

  if (phaseRows.length === 0) {
    return undefined;
  }

  const nodes = phaseRows.map((phase, index) => {
    const id = getString(phase, ["id", "name", "phase", "label"], `phase-${index + 1}`);

    return {
      id,
      label: id,
      family: "rocets" as const,
      group: "mission phase",
      metadata: recordToParsedRecord(phase),
    };
  });

  const edges = nodes.slice(1).map((node, index) => ({
    id: `phase-transition-${index + 1}`,
    source: nodes[index].id,
    target: node.id,
    label: "then",
  }));

  return {
    nodes,
    edges,
  };
};

const diagnosticsFromWarnings = (parsed: unknown): ParserDiagnostic[] =>
  getParsedArray(parsed, ["warnings", "notes", "diagnostics"]).map((warning, index) => {
    const severity = getString(warning, ["severity", "level", "type"], "warning").toLowerCase();

    return {
      id: getString(warning, ["id", "code"], `rocets-output-warning-${index + 1}`),
      severity: severity === "error" ? "error" : severity === "info" ? "info" : "warning",
      message: getString(warning, ["message", "text", "description"], JSON.stringify(warning)),
      source: "rocets.output.adapter",
    };
  });

const createDomainSlices = (
  summaryCards: ParsedSummaryCard[],
  sections: ParsedSection[],
  tables: ParsedTable[],
  timeSeries: ParsedTimeSeries[],
  diagnostics: ParserDiagnostic[],
): ParsedDomainSlices => ({
  propulsion: {
    summaryCards,
    diagnostics,
    sections,
    tables: tables.filter((table) =>
      [
        "transient-log",
        "mission-phases",
        "feed-turbomachinery-history",
        "nozzle-performance-history",
        "warnings",
      ].includes(table.id),
    ),
    timeSeries: timeSeries.filter((series) =>
      ["transient-log", "feed-turbomachinery-history", "nozzle-performance-history"].includes(series.id),
    ),
  },
  thermal: {
    tables: tables.filter((table) => table.id === "thermal-history"),
    timeSeries: timeSeries.filter((series) => series.id === "thermal-history"),
  },
  neutronics: {
    tables: tables.filter((table) => table.id === "neutronics-history"),
    timeSeries: timeSeries.filter((series) => series.id === "neutronics-history"),
  },
  stability: {
    summaryCards: summaryCards.filter((card) =>
      ["run-status", "solve-status", "transient-steps", "warnings"].includes(card.id),
    ),
    diagnostics,
    sections: sections.filter((section) => ["performance", "steady-initialization"].includes(section.id)),
    tables: tables.filter((table) => ["transient-log", "warnings"].includes(table.id)),
    timeSeries: timeSeries.filter((series) => series.id === "transient-log"),
  },
});

export const adaptRocetsOutputToViewModel = <TParsed = unknown>(
  input: RocetsOutputAdapterInput<TParsed>,
): ParsedFileViewModel<TParsed> => {
  const warningDiagnostics = diagnosticsFromWarnings(input.parsed);
  const diagnostics = [...(input.diagnostics ?? []), ...warningDiagnostics];
  const summaryCards = createSummaryCards(input.parsed);
  const sections = createSections(input.parsed);
  const tables = createTables(input.parsed);
  const timeSeries = createTimeSeries(input.parsed);
  const graph = createGraph(input.parsed);
  const domainSlices = createDomainSlices(summaryCards, sections, tables, timeSeries, diagnostics);

  return createParsedFileViewModel(input, {
    title: findTitle(input.parsed, input.filename),
    caseId: findCaseId(input.parsed),
    status: findRunStatus(input.parsed) ?? "parsed",
    summaryCards,
    diagnostics,
    sections,
    tables,
    timeSeries,
    graph,
    domainSlices,
  });
};
