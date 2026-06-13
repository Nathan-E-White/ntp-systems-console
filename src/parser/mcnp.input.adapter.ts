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

export interface McnpInputAdapterInput<TParsed = unknown> {
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

    const title = getRecordValue(parsed, ["title", "problemTitle", "name", "description"]);

    return typeof title === "string" && title.trim().length > 0 ? title : filename;
};

const findCaseId = (parsed: unknown): string | undefined => {
    if (!isRecord(parsed)) {
        return undefined;
    }

    const caseId = getRecordValue(parsed, ["caseId", "problemId", "id", "name"]);

    return typeof caseId === "string" && caseId.trim().length > 0 ? caseId : undefined;
};

const createSummaryCards = (parsed: unknown): ParsedSummaryCard[] => {
    const cells = getParsedArray(parsed, ["cells", "cellCards", "geometryCells"]);
    const surfaces = getParsedArray(parsed, ["surfaces", "surfaceCards", "geometrySurfaces"]);
    const materials = getParsedArray(parsed, ["materials", "materialCards"]);
    const tallies = getParsedArray(parsed, ["tallies", "tallyCards"]);
    const sources = getParsedArray(parsed, ["sources", "sourceCards", "sdefCards"]);
    const distributions = getParsedArray(parsed, ["distributions", "distributionCards"]);
    const transforms = getParsedArray(parsed, ["transforms", "transformCards"]);
    const importanceCards = getParsedArray(parsed, ["importances", "importanceCards", "impCards"]);
    const mode = getParsedRecord(parsed, ["mode", "modeCard"]);

    return [
        {
            id: "cells",
            label: "Cells",
            value: cells.length,
            description: "Cell cards parsed from the MCNP input deck.",
        },
        {
            id: "surfaces",
            label: "Surfaces",
            value: surfaces.length,
            description: "Surface cards parsed from the MCNP input deck.",
        },
        {
            id: "materials",
            label: "Materials",
            value: materials.length,
            description: "Material cards parsed from the MCNP input deck.",
        },
        {
            id: "tallies",
            label: "Tallies",
            value: tallies.length,
            description: "Tally cards parsed from the MCNP input deck.",
        },
        {
            id: "sources",
            label: "Sources",
            value: sources.length,
            description: "Source definitions parsed from the MCNP input deck.",
        },
        {
            id: "distributions",
            label: "Distributions",
            value: distributions.length,
            description: "SI/SP/DS-style distribution cards parsed from the input deck.",
        },
        {
            id: "transforms",
            label: "Transforms",
            value: transforms.length,
            description: "TR or transform cards parsed from the input deck.",
        },
        {
            id: "importance-cards",
            label: "Importance cards",
            value: importanceCards.length,
            description: "Particle importance or variance-control cards detected in the deck.",
        },
        {
            id: "mode",
            label: "Mode card",
            value: mode ? "present" : "missing",
            severity: mode ? "info" : "warning",
            description: "Whether an MCNP MODE card was detected.",
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
        "problem",
        "Problem metadata",
        getParsedRecord(parsed, ["problem", "metadata", "problemMetadata"]),
        "Top-level MCNP problem metadata.",
    ),
    ...createSectionFromRecord(
        "mode",
        "Mode card",
        getParsedRecord(parsed, ["mode", "modeCard"]),
        "Particle transport mode configuration.",
    ),
    ...createSectionFromRecord(
        "source",
        "Primary source",
        getParsedRecord(parsed, ["source", "primarySource", "sdef"]),
        "Primary source definition, when exposed as a parsed record.",
    ),
    ...createSectionFromRecord(
        "criticality",
        "Criticality settings",
        getParsedRecord(parsed, ["criticality", "kcode", "ksrc"]),
        "Criticality-source settings parsed from KCODE/KSRC-style cards.",
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
            "cells",
            "Cells",
            getParsedArray(parsed, ["cells", "cellCards", "geometryCells"]),
            "Cell cards and region definitions parsed from the MCNP input deck.",
        ),
        createTable(
            "surfaces",
            "Surfaces",
            getParsedArray(parsed, ["surfaces", "surfaceCards", "geometrySurfaces"]),
            "Surface cards parsed from the MCNP input deck.",
        ),
        createTable(
            "materials",
            "Materials",
            getParsedArray(parsed, ["materials", "materialCards"]),
            "Material compositions parsed from the MCNP input deck.",
        ),
        createTable(
            "tallies",
            "Tallies",
            getParsedArray(parsed, ["tallies", "tallyCards"]),
            "Tally cards parsed from the MCNP input deck.",
        ),
        createTable(
            "sources",
            "Sources",
            getParsedArray(parsed, ["sources", "sourceCards", "sdefCards"]),
            "Source definition cards parsed from the MCNP input deck.",
        ),
        createTable(
            "distributions",
            "Distributions",
            getParsedArray(parsed, ["distributions", "distributionCards"]),
            "Distribution cards parsed from the MCNP input deck.",
        ),
        createTable(
            "transforms",
            "Transforms",
            getParsedArray(parsed, ["transforms", "transformCards"]),
            "Coordinate transform cards parsed from the MCNP input deck.",
        ),
    ].filter((table): table is ParsedTable => table !== undefined);

const cellId = (cell: UnknownRecord, index: number): string =>
    getString(cell, ["id", "cell", "cellId", "number"], `cell-${index + 1}`);

const materialIdFromCell = (cell: UnknownRecord): string | undefined => {
    const value = getRecordValue(cell, ["material", "materialId", "mat", "m"]);

    if (typeof value === "number") {
        return `m${value}`;
    }

    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
};

const materialId = (material: UnknownRecord, index: number): string => {
    const value = getRecordValue(material, ["id", "material", "materialId", "number"]);

    if (typeof value === "number") {
        return `m${value}`;
    }

    return typeof value === "string" && value.trim().length > 0 ? value : `material-${index + 1}`;
};

const createGraph = (parsed: unknown): ParsedGraphModel | undefined => {
    const cells = getParsedArray(parsed, ["cells", "cellCards", "geometryCells"]);
    const materials = getParsedArray(parsed, ["materials", "materialCards"]);

    if (cells.length === 0 && materials.length === 0) {
        return undefined;
    }

    const cellNodes = cells.map((cell, index) => {
        const id = cellId(cell, index);

        return {
            id,
            label: id,
            family: "mcnp" as const,
            group: "cell",
            metadata: recordToParsedRecord(cell),
        };
    });

    const materialNodes = materials.map((material, index) => {
        const id = materialId(material, index);

        return {
            id,
            label: id,
            family: "mcnp" as const,
            group: "material",
            metadata: recordToParsedRecord(material),
        };
    });

    const knownMaterialIds = new Set(materialNodes.map((node) => node.id));
    const inferredMaterialIds = new Set<string>();
    const materialEdges = cells.flatMap((cell, index) => {
        const cellNodeId = cellId(cell, index);
        const materialNodeId = materialIdFromCell(cell);

        if (!materialNodeId) {
            return [];
        }

        if (!knownMaterialIds.has(materialNodeId)) {
            inferredMaterialIds.add(materialNodeId);
        }

        return [
            {
                id: `${cellNodeId}-uses-${materialNodeId}`,
                source: cellNodeId,
                target: materialNodeId,
                label: "uses material",
            },
        ];
    });

    const inferredMaterialNodes = Array.from(inferredMaterialIds).map((id) => ({
        id,
        label: id,
        family: "mcnp" as const,
        group: "referenced material",
    }));

    return {
        nodes: [...cellNodes, ...materialNodes, ...inferredMaterialNodes],
        edges: materialEdges,
    };
};

const createDomainSlices = (
    summaryCards: ParsedSummaryCard[],
    sections: ParsedSection[],
    tables: ParsedTable[],
    graph: ParsedGraphModel | undefined,
    diagnostics: ParserDiagnostic[],
): ParsedDomainSlices => ({
    neutronics: {
        summaryCards: summaryCards.filter((card) =>
            ["cells", "surfaces", "tallies", "sources", "mode", "importance-cards"].includes(card.id),
        ),
        diagnostics,
        sections: sections.filter((section) => ["mode", "source", "criticality"].includes(section.id)),
        tables: tables.filter((table) => ["cells", "surfaces", "tallies", "sources", "distributions"].includes(table.id)),
    },
    materials: {
        summaryCards: summaryCards.filter((card) => card.id === "materials"),
        diagnostics,
        tables: tables.filter((table) => table.id === "materials"),
    },
    thermal: {
        tables: tables.filter((table) => ["materials", "cells"].includes(table.id)),
    },
    stability: {
        summaryCards: summaryCards.filter((card) => ["mode", "importance-cards"].includes(card.id)),
        diagnostics,
        sections: sections.filter((section) => section.id === "criticality"),
    },
    structures: graph
        ? {
            summaryCards: summaryCards.filter((card) => ["cells", "surfaces"].includes(card.id)),
            diagnostics,
            tables: tables.filter((table) => ["cells", "surfaces"].includes(table.id)),
        }
        : undefined,
});

export const adaptMcnpInputToViewModel = <TParsed = unknown>(
    input: McnpInputAdapterInput<TParsed>,
): ParsedFileViewModel<TParsed> => {
    const diagnostics = input.diagnostics ?? [];
    const summaryCards = createSummaryCards(input.parsed);
    const sections = createSections(input.parsed);
    const tables = createTables(input.parsed);
    const graph = createGraph(input.parsed);
    const domainSlices = createDomainSlices(summaryCards, sections, tables, graph, diagnostics);

    return createParsedFileViewModel(input, {
        title: findTitle(input.parsed, input.filename),
        caseId: findCaseId(input.parsed),
        status: "parsed",
        summaryCards,
        diagnostics,
        sections,
        tables,
        graph,
        domainSlices,
    });
};
