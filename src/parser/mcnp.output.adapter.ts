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

export interface McnpOutputAdapterInput<TParsed = unknown> {
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

  const title = getRecordValue(parsed, ["title", "problemTitle", "name", "description", "runTitle"]);

  return typeof title === "string" && title.trim().length > 0 ? title : filename;
};

const findCaseId = (parsed: unknown): string | undefined => {
  if (!isRecord(parsed)) {
    return undefined;
  }

  const caseId = getRecordValue(parsed, ["caseId", "problemId", "id", "name", "runId"]);

  return typeof caseId === "string" && caseId.trim().length > 0 ? caseId : undefined;
};

const findRunStatus = (parsed: unknown): string | undefined => {
  if (!isRecord(parsed)) {
    return undefined;
  }

  const summary = getParsedRecord(parsed, ["summary", "runSummary", "termination", "finalSummary"]);
  const status = getRecordValue(parsed, ["status", "runStatus", "terminationStatus"]);
  const summaryStatus = summary ? getRecordValue(summary, ["status", "runStatus", "terminationStatus"]) : undefined;
  const selectedStatus = summaryStatus ?? status;

  return typeof selectedStatus === "string" && selectedStatus.trim().length > 0 ? selectedStatus : undefined;
};

const createSummaryCards = (parsed: unknown): ParsedSummaryCard[] => {
  const tallies = getParsedArray(parsed, ["tallies", "tallyResults", "tallyTables"]);
  const warnings = getParsedArray(parsed, ["warnings", "messages", "diagnostics", "notes"]);
  const kcode = getParsedRecord(parsed, ["kcode", "criticality", "keff", "criticalitySummary"]);
  const summary = getParsedRecord(parsed, ["summary", "runSummary", "termination", "finalSummary"]);
  const performance = getParsedRecord(parsed, ["performance", "timing", "resourceUsage"]);
  const particleBalance = getParsedRecord(parsed, ["particleBalance", "balance", "neutronBalance", "photonBalance"]);

  const runStatus = findRunStatus(parsed);
  const keff = kcode ? getNumber(kcode, ["keff", "kEff", "mean", "value"]) : undefined;
  const keffSigma = kcode ? getNumber(kcode, ["sigma", "stdDev", "standardDeviation", "uncertainty"]) : undefined;
  const histories = summary ? getNumber(summary, ["histories", "nps", "particles", "sourceParticles"]) : undefined;
  const cpuTime = performance ? getNumber(performance, ["cpuTime", "elapsedTime", "wallTime", "time"]) : undefined;
  const lostParticles = particleBalance ? getNumber(particleBalance, ["lostParticles", "lost", "leakageLoss"]) : undefined;

  return [
    {
      id: "run-status",
      label: "Run status",
      value: runStatus ?? "unknown",
      severity:
        runStatus?.toLowerCase().includes("error") || runStatus?.toLowerCase().includes("fail")
          ? "error"
          : "info",
      description: "Termination status reported by the MCNP output.",
    },
    {
      id: "tallies",
      label: "Tallies",
      value: tallies.length,
      description: "Parsed tally-result blocks.",
    },
    {
      id: "keff",
      label: "k-eff",
      value: keff ?? null,
      description: "Criticality eigenvalue estimate, when present.",
    },
    {
      id: "keff-sigma",
      label: "k-eff σ",
      value: keffSigma ?? null,
      description: "Estimated standard deviation or uncertainty on k-eff.",
    },
    {
      id: "histories",
      label: "Histories",
      value: histories ?? null,
      description: "Number of source histories or particles reported by the run.",
    },
    {
      id: "cpu-time",
      label: "CPU / wall time",
      value: cpuTime ?? null,
      description: "Reported runtime or elapsed solve time.",
    },
    {
      id: "lost-particles",
      label: "Lost particles",
      value: lostParticles ?? null,
      severity: lostParticles && lostParticles > 0 ? "warning" : "info",
      description: "Lost-particle count or balance loss indicator.",
    },
    {
      id: "warnings",
      label: "Warnings / messages",
      value: warnings.length,
      severity: warnings.length > 0 ? "warning" : "info",
      description: "Warning, message, or diagnostic records parsed from the output.",
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
    getParsedRecord(parsed, ["summary", "runSummary", "termination", "finalSummary"]),
    "Final MCNP run summary and termination information.",
  ),
  ...createSectionFromRecord(
    "criticality",
    "Criticality summary",
    getParsedRecord(parsed, ["kcode", "criticality", "keff", "criticalitySummary"]),
    "Criticality and k-effective summary values.",
  ),
  ...createSectionFromRecord(
    "particle-balance",
    "Particle balance",
    getParsedRecord(parsed, ["particleBalance", "balance", "neutronBalance", "photonBalance"]),
    "Particle production, loss, leakage, or absorption balance.",
  ),
  ...createSectionFromRecord(
    "performance",
    "Performance",
    getParsedRecord(parsed, ["performance", "timing", "resourceUsage"]),
    "Runtime, timing, and resource-use summary.",
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
      "tallies",
      "Tally results",
      getParsedArray(parsed, ["tallies", "tallyResults", "tallyTables"]),
      "Tally-result records parsed from the MCNP output.",
    ),
    createTable(
      "statistical-checks",
      "Statistical checks",
      getParsedArray(parsed, ["statisticalChecks", "tallyChecks", "tenChecks"]),
      "Tally quality, relative error, variance, or statistical-check records.",
    ),
    createTable(
      "cell-populations",
      "Cell populations",
      getParsedArray(parsed, ["cellPopulations", "populationByCell", "cellSummary"]),
      "Cell-wise particle population or activity summaries.",
    ),
    createTable(
      "heating",
      "Heating / energy deposition",
      getParsedArray(parsed, ["heating", "energyDeposition", "gammaHeating", "doseHeating"]),
      "Heating, dose, or energy-deposition results parsed from the output.",
    ),
    createTable(
      "warnings",
      "Warnings and messages",
      getParsedArray(parsed, ["warnings", "messages", "diagnostics", "notes"]),
      "Warning, note, or diagnostic messages parsed from the output.",
    ),
  ].filter((table): table is ParsedTable => table !== undefined);

const numericRecordKeys = (record: UnknownRecord): string[] =>
  Object.entries(record)
    .filter(([, value]) => typeof value === "number" || (typeof value === "string" && Number.isFinite(Number(value))))
    .map(([key]) => key);

const timeValueFromRecord = (record: UnknownRecord): number | undefined =>
  getNumber(record, ["cycle", "batch", "generation", "time", "t"]);

const createTimeSeriesFromRows = (
  id: string,
  title: string,
  rows: UnknownRecord[],
  timeUnit?: string,
): ParsedTimeSeries | undefined => {
  const points: ParsedTimeSeriesPoint[] = rows.flatMap((row, index) => {
    const time = timeValueFromRecord(row) ?? index;
    const numericKeys = numericRecordKeys(row).filter(
      (key) => !["cycle", "batch", "generation", "time", "t"].includes(key),
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
    timeUnit,
    points,
  };
};

const createTimeSeries = (parsed: unknown): ParsedTimeSeries[] =>
  [
    createTimeSeriesFromRows(
      "criticality-history",
      "Criticality convergence history",
      getParsedArray(parsed, ["criticalityHistory", "keffHistory", "cycleHistory", "batchHistory"]),
      "cycle",
    ),
    createTimeSeriesFromRows(
      "tally-convergence",
      "Tally convergence history",
      getParsedArray(parsed, ["tallyConvergence", "tallyHistory", "relativeErrorHistory"]),
      "cycle",
    ),
    createTimeSeriesFromRows(
      "heating-history",
      "Heating history",
      getParsedArray(parsed, ["heatingHistory", "energyDepositionHistory", "gammaHeatingHistory"]),
      "cycle",
    ),
  ].filter((series): series is ParsedTimeSeries => series !== undefined);

const createGraph = (parsed: unknown): ParsedGraphModel | undefined => {
  const tallies = getParsedArray(parsed, ["tallies", "tallyResults", "tallyTables"]);

  if (tallies.length === 0) {
    return undefined;
  }

  const nodes = tallies.map((tally, index) => {
    const id = getString(tally, ["id", "name", "tally", "tallyId", "number"], `tally-${index + 1}`);

    return {
      id,
      label: id,
      family: "mcnp" as const,
      group: getString(tally, ["type", "particle", "kind"], "tally"),
      metadata: recordToParsedRecord(tally),
    };
  });

  return {
    nodes,
    edges: [],
  };
};

const diagnosticsFromWarnings = (parsed: unknown): ParserDiagnostic[] =>
  getParsedArray(parsed, ["warnings", "messages", "diagnostics", "notes"]).map((warning, index) => {
    const severity = getString(warning, ["severity", "level", "type"], "warning").toLowerCase();

    return {
      id: getString(warning, ["id", "code"], `mcnp-output-warning-${index + 1}`),
      severity: severity === "error" ? "error" : severity === "info" ? "info" : "warning",
      message: getString(warning, ["message", "text", "description"], JSON.stringify(warning)),
      source: "mcnp.output.adapter",
    };
  });

const createDomainSlices = (
  summaryCards: ParsedSummaryCard[],
  sections: ParsedSection[],
  tables: ParsedTable[],
  timeSeries: ParsedTimeSeries[],
  diagnostics: ParserDiagnostic[],
): ParsedDomainSlices => ({
  neutronics: {
    summaryCards: summaryCards.filter((card) =>
      ["run-status", "tallies", "keff", "keff-sigma", "histories", "lost-particles", "warnings"].includes(card.id),
    ),
    diagnostics,
    sections: sections.filter((section) => ["run-summary", "criticality", "particle-balance"].includes(section.id)),
    tables: tables.filter((table) =>
      ["tallies", "statistical-checks", "cell-populations", "warnings"].includes(table.id),
    ),
    timeSeries: timeSeries.filter((series) => ["criticality-history", "tally-convergence"].includes(series.id)),
  },
  thermal: {
    tables: tables.filter((table) => table.id === "heating"),
    timeSeries: timeSeries.filter((series) => series.id === "heating-history"),
  },
  materials: {
    tables: tables.filter((table) => ["cell-populations", "heating"].includes(table.id)),
  },
  stability: {
    summaryCards: summaryCards.filter((card) => ["run-status", "lost-particles", "warnings"].includes(card.id)),
    diagnostics,
    sections: sections.filter((section) => ["particle-balance", "performance"].includes(section.id)),
    tables: tables.filter((table) => ["statistical-checks", "warnings"].includes(table.id)),
  },
});

export const adaptMcnpOutputToViewModel = <TParsed = unknown>(
  input: McnpOutputAdapterInput<TParsed>,
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
