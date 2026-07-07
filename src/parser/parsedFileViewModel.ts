import type {
    ParsedDomainSlices,
    ParsedFileViewModel,
    ParsedGraphModel,
    ParsedRecordValue,
    ParsedSection,
    ParsedSummaryCard,
    ParsedTable,
    ParsedTimeSeries,
    ParserDescriptor,
    ParserDiagnostic,
    ParserExecutionResult,
} from "./parserTypes";

export interface ParsedFileViewModelInput<TParsed = unknown> {
    id: string;
    filename: string;
    descriptor: ParserDescriptor<TParsed>;
    parsed: TParsed;
    diagnostics?: ParserDiagnostic[];
}

export interface ParsedFileViewModelOverrides {
    title?: string;
    caseId?: string;
    status?: string;
    summaryCards?: ParsedSummaryCard[];
    diagnostics?: ParserDiagnostic[];
    sections?: ParsedSection[];
    tables?: ParsedTable[];
    timeSeries?: ParsedTimeSeries[];
    graph?: ParsedGraphModel;
    crossLinks?: ParsedFileViewModel["crossLinks"];
    domainSlices?: ParsedDomainSlices;
}

type UnknownRecord = Record<string, unknown>;

const emptyDomainSlices = (): ParsedDomainSlices => ({});

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isParsedRecordValue = (value: unknown): value is ParsedRecordValue => {
    if (value === null) {
        return true;
    }

    if (["string", "number", "boolean"].includes(typeof value)) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every((entry) => entry === null || ["string", "number", "boolean"].includes(typeof entry));
    }

    if (isRecord(value)) {
        return Object.values(value).every(
            (entry) =>
                entry === null ||
                ["string", "number", "boolean"].includes(typeof entry) ||
                (Array.isArray(entry) &&
                    entry.every((arrayEntry) =>
                        arrayEntry === null || ["string", "number", "boolean"].includes(typeof arrayEntry),
                    )),
        );
    }

    return false;
};

const toParsedRecordValue = (value: unknown): ParsedRecordValue => {
    if (isParsedRecordValue(value)) {
        return value;
    }

    if (value === undefined) {
        return null;
    }

    return JSON.stringify(value);
};

const toSummaryCardValue = (value: unknown): ParsedSummaryCard["value"] => {
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
        return value as ParsedSummaryCard["value"];
    }

    if (value === undefined) {
        return null;
    }

    return JSON.stringify(value);
};

const humanizeKey = (key: string): string =>
    key
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
        .replaceAll(/\s+/g, " ")
        .trim()
        .replace(/^./, (firstCharacter) => firstCharacter.toUpperCase());

const createSummaryCardsFromDescriptor = <TParsed>(
    descriptor: ParserDescriptor<TParsed>,
    parsed: TParsed,
): ParsedSummaryCard[] => {
    const summary = descriptor.summarize?.(parsed);

    if (!summary) {
        return [];
    }

    return Object.entries(summary).map(([key, value]) => ({
        id: key,
        label: humanizeKey(key),
        value: toSummaryCardValue(value),
    }));
};

const createGenericSection = (parsed: unknown): ParsedSection[] => {
    if (!isRecord(parsed)) {
        return [];
    }

    const records = Object.entries(parsed)
        .filter(([, value]) => !Array.isArray(value))
        .map(([key, value]) => ({
            key,
            value: toParsedRecordValue(value),
        }));

    if (records.length === 0) {
        return [];
    }

    return [
        {
            id: "parsed-overview",
            title: "Parsed overview",
            description: "Top-level values extracted from the parsed result.",
            records,
        },
    ];
};

const createGenericTables = (parsed: unknown): ParsedTable[] => {
    if (!isRecord(parsed)) {
        return [];
    }

    return Object.entries(parsed)
        .filter(([, value]) => Array.isArray(value))
        .map(([key, value]) => {
            const rows = (value as unknown[]).map((entry, index) => {
                if (isRecord(entry)) {
                    return Object.fromEntries(
                        Object.entries(entry).map(([entryKey, entryValue]) => [entryKey, toParsedRecordValue(entryValue)]),
                    );
                }

                return {
                    index,
                    value: toParsedRecordValue(entry),
                };
            });

            const columnIds = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

            return {
                id: key,
                title: humanizeKey(key),
                columns: columnIds.map((columnId) => ({
                    id: columnId,
                    label: humanizeKey(columnId),
                })),
                rows,
            };
        });
};

export const createParsedFileViewModel = <TParsed = unknown>(
    input: ParsedFileViewModelInput<TParsed>,
    overrides: ParsedFileViewModelOverrides = {},
): ParsedFileViewModel<TParsed> => {
    const summaryCards = overrides.summaryCards ?? createSummaryCardsFromDescriptor(input.descriptor, input.parsed);
    const diagnostics = overrides.diagnostics ?? input.diagnostics ?? [];
    const sections = overrides.sections ?? createGenericSection(input.parsed);
    const tables = overrides.tables ?? createGenericTables(input.parsed);

    return {
        id: input.id,
        filename: input.filename,
        family: input.descriptor.family,
        direction: input.descriptor.direction,
        displayName: input.descriptor.displayName,
        title: overrides.title,
        caseId: overrides.caseId,
        status: overrides.status,
        summaryCards,
        diagnostics,
        sections,
        tables,
        timeSeries: overrides.timeSeries ?? [],
        graph: overrides.graph,
        crossLinks: overrides.crossLinks ?? [],
        domainSlices: overrides.domainSlices ?? emptyDomainSlices(),
        rawParsed: input.parsed,
    };
};

export const createParsedFileViewModelFromExecutionResult = <TParsed = unknown>(input: {
    id: string;
    filename: string;
    result: ParserExecutionResult<TParsed>;
    overrides?: ParsedFileViewModelOverrides;
}): ParsedFileViewModel<TParsed> | undefined => {
    if (input.result.status !== "parsed") {
        return undefined;
    }

    return createParsedFileViewModel(
        {
            id: input.id,
            filename: input.filename,
            descriptor: input.result.descriptor,
            parsed: input.result.parsed,
            diagnostics: input.result.diagnostics,
        },
        input.overrides,
    );
};

export const createParsedFileId = (filename: string, text: string): string => {
    const normalizedFilename = filename.trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
    const boundedFilename = normalizedFilename.replaceAll(/^-|-$/g, "") || "parsed-file";
    const contentHash = Array.from(text).reduce(
        (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
        0,
    );

    return `${boundedFilename}-${contentHash.toString(16)}`;
};