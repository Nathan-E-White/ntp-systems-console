

import type {
  ParsedDomainSlices,
  ParsedFileViewModel,
  ParsedGraphModel,
  ParsedRecordValue,
  ParsedSection,
  ParsedSummaryCard,
  ParsedTable,
  ParserDescriptor,
  ParserDiagnostic,
} from "./parserTypes";
import { createParsedFileViewModel } from "./parsedFileViewModel";

type UnknownRecord = Record<string, unknown>;

export interface RocetsInputAdapterInput<TParsed = unknown> {
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
    return value;
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

  const title = getRecordValue(parsed, ["title", "caseTitle", "name", "description"]);

  return typeof title === "string" && title.trim().length > 0 ? title : filename;
};

const findCaseId = (parsed: unknown): string | undefined => {
  if (!isRecord(parsed)) {
    return undefined;
  }

  const caseId = getRecordValue(parsed, ["caseId", "case", "caseName", "id"]);

  return typeof caseId === "string" && caseId.trim().length > 0 ? caseId : undefined;
};

const createSummaryCards = (parsed: unknown): ParsedSummaryCard[] => {
  const components = getParsedArray(parsed, ["components", "componentDefinitions", "componentCards"]);
  const connections = getParsedArray(parsed, ["connects", "connections", "connectors", "connectCards", "links"]);
  const fluids = getParsedArray(parsed, ["fluids", "fluidDefinitions"]);
  const controls = getParsedArray(parsed, ["schedules", "controls", "controlBlocks", "controlDefinitions"]);
  const initialConditions = getParsedArray(parsed, ["initialConditions", "initials", "ic"]);
  const solver = getParsedRecord(parsed, ["solver", "solverControl", "solverControls"]);
  const timeControl = getParsedRecord(parsed, ["timeControl", "timeControls", "time"]);

  const stopTime = timeControl ? getNumber(timeControl, ["stopTime", "tStop", "endTime", "duration"]) : undefined;
  const timeStep = timeControl ? getNumber(timeControl, ["timeStep", "dt", "step"]) : undefined;
  return [
    {
      id: "components",
      label: "Components",
      value: components.length,
      description: "ROCETS component blocks found in the input deck.",
    },
    {
      id: "connections",
      label: "Connections",
      value: connections.length,
      description: "Flow or signal connections found in the input deck.",
    },
    {
      id: "fluids",
      label: "Fluids",
      value: fluids.length,
      description: "Working-fluid definitions found in the input deck.",
    },
    {
      id: "controls",
      label: "Controls",
      value: controls.length,
      description: "Control or schedule blocks found in the input deck.",
    },
    {
      id: "initial-conditions",
      label: "Initial conditions",
      value: initialConditions.length,
      description: "Initialization cards available to seed the system solve.",
    },
    {
      id: "solver",
      label: "Solver block",
      value: solver ? "present" : "missing",
      severity: solver ? "info" : "warning",
      description: "Whether the parser found a solver-control block.",
    },
    {
      id: "stop-time",
      label: "Stop time",
      value: stopTime ?? null,
      description: "Detected transient stop time, when available.",
    },
    {
      id: "time-step",
      label: "Time step",
      value: timeStep ?? null,
      description: "Detected nominal integration time step, when available.",
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
    "case",
    "Case metadata",
    getParsedRecord(parsed, ["case", "caseMetadata", "metadata"]),
    "Top-level ROCETS case information.",
  ),
  ...createSectionFromRecord(
    "units",
    "Units",
    getParsedRecord(parsed, ["units", "unitSystem"]),
    "Detected unit-system information.",
  ),
  ...createSectionFromRecord(
    "time-control",
    "Time control",
    getParsedRecord(parsed, ["timeControl", "timeControls", "time"]),
    "Transient integration settings.",
  ),
  ...createSectionFromRecord(
    "solver-control",
    "Solver control",
    getParsedRecord(parsed, ["solver", "solverControl", "solverControls"]),
    "Numerical solver settings and tolerances.",
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
      "fluids",
      "Fluids",
      getParsedArray(parsed, ["fluids", "fluidDefinitions"]),
      "Working-fluid cards parsed from the ROCETS input deck.",
    ),
    createTable(
      "nodes",
      "Nodes",
      getParsedArray(parsed, ["nodes", "nodeDefinitions", "nodeCards"]),
      "Network nodes parsed from the ROCETS input deck.",
    ),
    createTable(
      "boundaries",
      "Boundaries",
      getParsedArray(parsed, ["boundaries", "boundaryDefinitions", "boundaryCards"]),
      "Boundary condition nodes and external interfaces parsed from the ROCETS input deck.",
    ),
    createTable(
      "components",
      "Components",
      getParsedArray(parsed, ["components", "componentDefinitions", "componentCards"]),
      "System components parsed from the ROCETS input deck.",
    ),
    createTable(
      "sensors",
      "Sensors",
      getParsedArray(parsed, ["sensors", "sensorDefinitions", "sensorCards"]),
      "Sensor and monitor definitions parsed from the ROCETS input deck.",
    ),
    createTable(
      "connections",
      "Connections",
      getParsedArray(parsed, ["connects", "connections", "connectors", "connectCards", "links"]),
      "Flow, control, or signal connectivity parsed from the ROCETS input deck.",
    ),
    createTable(
      "solver-residuals",
      "Solver residuals",
      getParsedArray(parsed, ["solverResiduals", "residuals", "solverResidualDefinitions"]),
      "Solver residual monitors declared in the ROCETS input deck.",
    ),
    createTable(
      "maps",
      "Maps",
      getParsedArray(parsed, ["maps", "mapDefinitions", "performanceMaps"]),
      "Performance maps parsed from the ROCETS input deck.",
    ),
    createTable(
      "schedules",
      "Schedules",
      getParsedArray(parsed, ["schedules", "scheduleDefinitions", "profiles"]),
      "Time schedules, profiles, and command tables parsed from the ROCETS input deck.",
    ),
    createTable(
      "initial-conditions",
      "Initial conditions",
      getParsedArray(parsed, ["initialConditions", "initials", "ic"]),
      "Initial state cards parsed from the ROCETS input deck.",
    ),
    createTable(
      "outputs",
      "Output requests",
      getParsedArray(parsed, ["outputs", "outputRequests", "requestedOutputs"]),
      "Output requests and panel bindings parsed from the ROCETS input deck.",
    ),
  ].filter((table): table is ParsedTable => table !== undefined);

const componentId = (component: UnknownRecord, index: number): string =>
  getString(component, ["id", "name", "component", "componentId"], `component-${index + 1}`);

const connectionEndpoint = (connection: UnknownRecord, keys: string[]): string | undefined => {
  const value = getRecordValue(connection, keys);

  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
};

const createGraph = (parsed: unknown): ParsedGraphModel | undefined => {
  const components = getParsedArray(parsed, ["components", "componentDefinitions", "componentCards"]);
  const connections = getParsedArray(parsed, ["connects", "connections", "connectors", "connectCards", "links"]);

  if (components.length === 0 && connections.length === 0) {
    return undefined;
  }

  const nodes = components.map((component, index) => {
    const id = componentId(component, index);

    return {
      id,
      label: id,
      family: "rocets" as const,
      group: getString(component, ["type", "kind", "componentType"], "component"),
      metadata: recordToParsedRecord(component),
    };
  });

  const knownNodeIds = new Set(nodes.map((node) => node.id));
  const inferredNodeIds = new Set<string>();

  const edges = connections.flatMap((connection, index) => {
    const source = connectionEndpoint(connection, ["source", "from", "upstream", "fromComponent"]);
    const target = connectionEndpoint(connection, ["target", "to", "downstream", "toComponent"]);

    if (!source || !target) {
      return [];
    }

    if (!knownNodeIds.has(source)) {
      inferredNodeIds.add(source);
    }

    if (!knownNodeIds.has(target)) {
      inferredNodeIds.add(target);
    }

    return [
      {
        id: getString(connection, ["id", "name", "connectionId"], `connection-${index + 1}`),
        source,
        target,
        label: getString(connection, ["label", "fluid", "signal", "type"], "connection"),
        metadata: recordToParsedRecord(connection),
      },
    ];
  });

  const inferredNodes = Array.from(inferredNodeIds).map((id) => ({
    id,
    label: id,
    family: "rocets" as const,
    group: "referenced component",
  }));

  return {
    nodes: [...nodes, ...inferredNodes],
    edges,
  };
};

const createDomainSlices = (
  summaryCards: ParsedSummaryCard[],
  sections: ParsedSection[],
  tables: ParsedTable[],
  graph: ParsedGraphModel | undefined,
  diagnostics: ParserDiagnostic[],
): ParsedDomainSlices => ({
  propulsion: {
    summaryCards,
    diagnostics,
    sections,
    tables,
  },
  stability: {
    summaryCards: summaryCards.filter((card) => ["solver", "time-step"].includes(card.id)),
    diagnostics,
    sections: sections.filter((section) => ["time-control", "solver-control"].includes(section.id)),
    tables: tables.filter((table) => ["controls", "initial-conditions"].includes(table.id)),
  },
  thermal: {
    tables: tables.filter((table) => ["fluids", "components"].includes(table.id)),
  },
  neutronics: {
    summaryCards: [],
    diagnostics: graph
      ? []
      : [
          {
            severity: "info",
            message: "ROCETS input decks usually provide system-flow context rather than direct neutronics data.",
            source: "rocets.input.adapter",
          },
        ],
  },
});

export const adaptRocetsInputToViewModel = <TParsed = unknown>(
  input: RocetsInputAdapterInput<TParsed>,
): ParsedFileViewModel<TParsed> => {
  const title = findTitle(input.parsed, input.filename);
  const caseId = findCaseId(input.parsed);
  const diagnostics = input.diagnostics ?? [];
  const summaryCards = createSummaryCards(input.parsed);
  const sections = createSections(input.parsed);
  const tables = createTables(input.parsed);
  const graph = createGraph(input.parsed);
  const domainSlices = createDomainSlices(summaryCards, sections, tables, graph, diagnostics);

  return createParsedFileViewModel(input, {
    title,
    caseId,
    status: "parsed",
    summaryCards,
    diagnostics,
    sections,
    tables,
    graph,
    domainSlices,
  });
};
