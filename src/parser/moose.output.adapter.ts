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

import {createParsedFileViewModel} from "./parsedFileViewModel";

type UnknownRecord = Record<string, unknown>;

export interface MooseOutputAdapterInput<TParsed = unknown> {
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

const tableRowsFromValue = (value: unknown): UnknownRecord[] => {
    if (Array.isArray(value)) {
        return value.filter(isRecord).map(flattenTableRow);
    }

    if (!isRecord(value)) {
        return [];
    }

    if (Array.isArray(value.rows)) {
        return value.rows.filter(isRecord).map(flattenTableRow);
    }

    return Object.entries(value)
        .filter(([, entryValue]) => entryValue === null || ["string", "number", "boolean"].includes(typeof entryValue))
        .map(([name, value]) => ({name, value}));
};

const flattenTableRow = (row: UnknownRecord): UnknownRecord => {
    const values = row.values;

    if (!isRecord(values)) {
        return row;
    }

    const rest = Object.fromEntries(Object.entries(row).filter(([key]) => key !== "values"));
    return {
        ...rest,
        ...values,
    };
};

const getTableRows = (parsed: unknown, candidateKeys: string[]): UnknownRecord[] => {
    if (!isRecord(parsed)) {
        return [];
    }

    return tableRowsFromValue(getRecordValue(parsed, candidateKeys));
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

    const title = getRecordValue(parsed, ["title", "appName", "problemTitle", "name", "description", "runTitle"]);

    return typeof title === "string" && title.trim().length > 0 ? title : filename;
};

const findCaseId = (parsed: unknown): string | undefined => {
    if (!isRecord(parsed)) {
        return undefined;
    }

    const caseId = getRecordValue(parsed, ["caseId", "problemId", "id", "name", "appName", "runId"]);

    return typeof caseId === "string" && caseId.trim().length > 0 ? caseId : undefined;
};

const findRunStatus = (parsed: unknown): string | undefined => {
    if (!isRecord(parsed)) {
        return undefined;
    }

    const performance = getParsedRecord(parsed, ["performance", "performanceSummary", "solverPerformance"]);
    const finalSummary = getParsedRecord(parsed, ["finalSummary", "summary", "appSummary", "derivedSummary"]);
    const status = getRecordValue(parsed, ["status", "runStatus", "solveStatus", "executionStatus"]);
    const performanceStatus = performance ? getRecordValue(performance, ["solveStatus", "status", "convergenceStatus"]) : undefined;
    const finalStatus = finalSummary ? getRecordValue(finalSummary, ["status", "runStatus", "solveStatus"]) : undefined;
    const selectedStatus = finalStatus ?? performanceStatus ?? status;

    return typeof selectedStatus === "string" && selectedStatus.trim().length > 0 ? selectedStatus : undefined;
};

const createSummaryCards = (parsed: unknown): ParsedSummaryCard[] => {
    const validation = getParsedRecord(parsed, ["inputValidation", "validation", "InputValidation"]);
    const meshSummary = getParsedRecord(parsed, ["meshSummary", "mesh", "MeshSummary"]);
    const executioner = getParsedRecord(parsed, ["executioner", "Executioner"]);
    const performance = getParsedRecord(parsed, ["performance", "performanceSummary", "solverPerformance"]);
    const finalValues = getTableRows(parsed, ["finalPostprocessorValues", "finalValues", "postprocessorFinalValues"]);
    const postprocessorHistory = getTableRows(parsed, ["postprocessorHistory", "postprocessorTimeHistory", "timeHistory"]);
    const couplingHistory = getTableRows(parsed, ["couplingHistory", "couplingProxyHistory", "couplingProxyTimeHistory", "appCouplingHistory"]);
    const warnings = getParsedArray(parsed, ["warnings", "notes", "diagnostics", "messages"]);

    const runStatus = findRunStatus(parsed);
    const validationStatus = validation ? getString(validation, ["status", "result", "validationStatus"], "present") : "missing";
    const elements = meshSummary ? getNumber(meshSummary, ["elements", "numElements", "elementCount"]) : undefined;
    const nodes = meshSummary ? getNumber(meshSummary, ["nodes", "numNodes", "nodeCount"]) : undefined;
    const finalTime = performance ? getNumber(performance, ["finalTime", "time", "endTime"]) : undefined;
    const nonlinearIterations = performance
        ? getNumber(performance, ["nonlinearIterations", "nlIterations", "iterations"])
        : undefined;

    return [
        {
            id: "run-status",
            label: "Run status",
            value: runStatus ?? "unknown",
            severity:
                runStatus?.toLowerCase().includes("fail") || runStatus?.toLowerCase().includes("error") ? "error" : "info",
            description: "Final execution or solve status reported by the MOOSE output.",
        },
        {
            id: "input-validation",
            label: "Input validation",
            value: validationStatus,
            severity: validationStatus.toLowerCase().includes("fail") ? "error" : "info",
            description: "Input validation status parsed from the MOOSE output.",
        },
        {
            id: "mesh-elements",
            label: "Mesh elements",
            value: elements ?? null,
            description: "Number of mesh elements reported by the output.",
        },
        {
            id: "mesh-nodes",
            label: "Mesh nodes",
            value: nodes ?? null,
            description: "Number of mesh nodes reported by the output.",
        },
        {
            id: "executioner",
            label: "Executioner",
            value: executioner ? "present" : "missing",
            severity: executioner ? "info" : "warning",
            description: "Whether executioner information was parsed from the output.",
        },
        {
            id: "final-time",
            label: "Final time",
            value: finalTime ?? null,
            description: "Final reported simulation time.",
        },
        {
            id: "nonlinear-iterations",
            label: "Nonlinear iterations",
            value: nonlinearIterations ?? null,
            description: "Reported nonlinear iteration count, when available.",
        },
        {
            id: "final-postprocessors",
            label: "Final postprocessors",
            value: finalValues.length,
            description: "Final postprocessor values parsed from the output.",
        },
        {
            id: "history-points",
            label: "History points",
            value: postprocessorHistory.length,
            description: "Postprocessor time-history rows parsed from the output.",
        },
        {
            id: "coupling-points",
            label: "Coupling points",
            value: couplingHistory.length,
            description: "Coupling proxy or app-level history rows parsed from the output.",
        },
        {
            id: "warnings",
            label: "Warnings / notes",
            value: warnings.length,
            severity: warnings.length > 0 ? "warning" : "info",
            description: "Warning, note, or diagnostic records parsed from the output.",
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
        "input-validation",
        "Input validation",
        getParsedRecord(parsed, ["inputValidation", "validation", "InputValidation"]),
        "Input validation and parser-facing validation results.",
    ),
    ...createSectionFromRecord(
        "mesh-summary",
        "Mesh summary",
        getParsedRecord(parsed, ["meshSummary", "mesh", "MeshSummary"]),
        "Mesh node, element, block, and boundary summary information.",
    ),
    ...createSectionFromRecord(
        "executioner",
        "Executioner",
        getParsedRecord(parsed, ["executioner", "Executioner"]),
        "Executioner and time-integration information echoed in the output.",
    ),
    ...createSectionFromRecord(
        "performance",
        "Solver performance",
        getParsedRecord(parsed, ["performance", "performanceSummary", "solverPerformance"]),
        "Nonlinear solve, timing, and convergence summary.",
    ),
    ...createSectionFromRecord(
        "app-summary",
        "App-facing derived summary",
        getParsedRecord(parsed, ["appSummary", "derivedSummary", "finalSummary", "summary"]),
        "Derived summary values intended for app-facing visualization panels.",
    ),
    ...createSectionFromRecord(
        "cross-links",
        "Cross-links",
        getParsedRecord(parsed, ["crossLinks", "CrossLinks"]),
        "References to coupled MCNP, ROCETS, or app-level model artifacts.",
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
            "transient-solve-log",
            "Transient solve log",
            getTableRows(parsed, ["transientSolveLog", "solveLog", "executionLog"]),
            "Transient execution steps parsed from the MOOSE output.",
        ),
        createTable(
            "postprocessor-history",
            "Postprocessor time history",
            getTableRows(parsed, ["postprocessorHistory", "postprocessorTimeHistory", "timeHistory"]),
            "Postprocessor values reported over time.",
        ),
        createTable(
            "final-postprocessor-values",
            "Final postprocessor values",
            getTableRows(parsed, ["finalPostprocessorValues", "finalValues", "postprocessorFinalValues"]),
            "Final postprocessor values parsed from the output.",
        ),
        createTable(
            "coupling-history",
            "Coupling proxy history",
            getTableRows(parsed, ["couplingHistory", "couplingProxyHistory", "couplingProxyTimeHistory", "appCouplingHistory"]),
            "App-facing coupling proxy values reported over time.",
        ),
        createTable(
            "residual-history",
            "Residual history",
            getTableRows(parsed, ["residualHistory", "nonlinearResidualHistory", "solverHistory"]),
            "Nonlinear or linear solver residual records.",
        ),
        createTable(
            "materials-history",
            "Material response history",
            getTableRows(parsed, ["materialsHistory", "materialHistory", "propertyHistory"]),
            "Material property or response values reported over time.",
        ),
        createTable(
            "warnings",
            "Warnings and notes",
            getParsedArray(parsed, ["warnings", "notes", "diagnostics", "messages"]),
            "Warning, note, diagnostic, or message records parsed from the output.",
        ),
    ].filter((table): table is ParsedTable => table !== undefined);

const numericRecordKeys = (record: UnknownRecord): string[] =>
    Object.entries(record)
        .filter(([, value]) => typeof value === "number" || (typeof value === "string" && Number.isFinite(Number(value))))
        .map(([key]) => key);

const timeValueFromRecord = (record: UnknownRecord): number | undefined =>
    getNumber(record, ["time", "t", "seconds", "step", "dt"]);

const createTimeSeriesFromRows = (
    id: string,
    title: string,
    rows: UnknownRecord[],
): ParsedTimeSeries | undefined => {
    const points: ParsedTimeSeriesPoint[] = rows.flatMap((row, index) => {
        const time = timeValueFromRecord(row) ?? index;
        const numericKeys = numericRecordKeys(row).filter((key) => !["time", "t", "seconds", "step", "dt"].includes(key));

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
        points,
    };
};

const createTimeSeries = (parsed: unknown): ParsedTimeSeries[] =>
    [
        createTimeSeriesFromRows(
            "postprocessor-history",
            "Postprocessor time history",
            getTableRows(parsed, ["postprocessorHistory", "postprocessorTimeHistory", "timeHistory"]),
        ),
        createTimeSeriesFromRows(
            "coupling-history",
            "Coupling proxy history",
            getTableRows(parsed, ["couplingHistory", "couplingProxyHistory", "couplingProxyTimeHistory", "appCouplingHistory"]),
        ),
        createTimeSeriesFromRows(
            "residual-history",
            "Residual history",
            getTableRows(parsed, ["residualHistory", "nonlinearResidualHistory", "solverHistory"]),
        ),
        createTimeSeriesFromRows(
            "materials-history",
            "Material response history",
            getTableRows(parsed, ["materialsHistory", "materialHistory", "propertyHistory"]),
        ),
    ].filter((series): series is ParsedTimeSeries => series !== undefined);

const createGraph = (parsed: unknown): ParsedGraphModel | undefined => {
    const finalValues = getParsedArray(parsed, ["finalPostprocessorValues", "finalValues", "postprocessorFinalValues"]);
    const appSummary = getParsedRecord(parsed, ["appSummary", "derivedSummary", "finalSummary", "summary"]);

    if (finalValues.length === 0 && !appSummary) {
        return undefined;
    }

    const summaryNode = appSummary
        ? [
            {
                id: "app-summary",
                label: "App summary",
                family: "moose" as const,
                group: "summary",
                metadata: recordToParsedRecord(appSummary),
            },
        ]
        : [];

    const postprocessorNodes = finalValues.map((value, index) => {
        const id = getString(value, ["name", "id", "postprocessor", "key"], `postprocessor-${index + 1}`);

        return {
            id,
            label: id,
            family: "moose" as const,
            group: "postprocessor",
            metadata: recordToParsedRecord(value),
        };
    });

    const edges = summaryNode.length > 0
        ? postprocessorNodes.map((node) => ({
            id: `${node.id}-feeds-app-summary`,
            source: node.id,
            target: "app-summary",
            label: "feeds",
        }))
        : [];

    return {
        nodes: [...postprocessorNodes, ...summaryNode],
        edges,
    };
};

const diagnosticsFromWarnings = (parsed: unknown): ParserDiagnostic[] =>
    getParsedArray(parsed, ["warnings", "notes", "diagnostics", "messages"]).map((warning, index) => {
        const severity = getString(warning, ["severity", "level", "type"], "warning").toLowerCase();

        return {
            id: getString(warning, ["id", "code"], `moose-output-warning-${index + 1}`),
            severity: severity === "error" ? "error" : severity === "info" ? "info" : "warning",
            message: getString(warning, ["message", "text", "description"], JSON.stringify(warning)),
            source: "moose.output.adapter",
        };
    });

const createDomainSlices = (
    summaryCards: ParsedSummaryCard[],
    sections: ParsedSection[],
    tables: ParsedTable[],
    timeSeries: ParsedTimeSeries[],
    diagnostics: ParserDiagnostic[],
): ParsedDomainSlices => ({
    thermal: {
        summaryCards: summaryCards.filter((card) =>
            ["mesh-elements", "mesh-nodes", "final-time", "final-postprocessors", "history-points"].includes(card.id),
        ),
        diagnostics,
        sections: sections.filter((section) => ["mesh-summary", "performance", "app-summary"].includes(section.id)),
        tables: tables.filter((table) =>
            ["postprocessor-history", "final-postprocessor-values", "materials-history", "warnings"].includes(table.id),
        ),
        timeSeries: timeSeries.filter((series) => ["postprocessor-history", "materials-history"].includes(series.id)),
    },
    structures: {
        summaryCards: summaryCards.filter((card) => ["mesh-elements", "mesh-nodes", "history-points"].includes(card.id)),
        diagnostics,
        sections: sections.filter((section) => ["mesh-summary", "app-summary"].includes(section.id)),
        tables: tables.filter((table) => ["postprocessor-history", "final-postprocessor-values"].includes(table.id)),
        timeSeries: timeSeries.filter((series) => series.id === "postprocessor-history"),
    },
    stability: {
        summaryCards: summaryCards.filter((card) =>
            ["run-status", "input-validation", "executioner", "nonlinear-iterations", "warnings"].includes(card.id),
        ),
        diagnostics,
        sections: sections.filter((section) => ["input-validation", "executioner", "performance", "cross-links"].includes(section.id)),
        tables: tables.filter((table) => ["residual-history", "warnings", "coupling-history"].includes(table.id)),
        timeSeries: timeSeries.filter((series) => ["residual-history", "coupling-history"].includes(series.id)),
    },
    materials: {
        tables: tables.filter((table) => ["materials-history", "final-postprocessor-values"].includes(table.id)),
        timeSeries: timeSeries.filter((series) => series.id === "materials-history"),
    },
    neutronics: {
        summaryCards: summaryCards.filter((card) => ["coupling-points", "final-postprocessors"].includes(card.id)),
        diagnostics,
        sections: sections.filter((section) => ["cross-links", "app-summary"].includes(section.id)),
        tables: tables.filter((table) => ["coupling-history", "final-postprocessor-values"].includes(table.id)),
        timeSeries: timeSeries.filter((series) => series.id === "coupling-history"),
    },
});

export const adaptMooseOutputToViewModel = <TParsed = unknown>(
    input: MooseOutputAdapterInput<TParsed>,
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
