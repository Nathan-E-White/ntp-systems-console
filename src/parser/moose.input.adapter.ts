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
import {createParsedFileViewModel} from "./parsedFileViewModel";

type UnknownRecord = Record<string, unknown>;

export interface MooseInputAdapterInput<TParsed = unknown> {
    id: string;
    filename: string;
    descriptor: ParserDescriptor<TParsed>;
    parsed: TParsed;
    diagnostics?: ParserDiagnostic[];
}

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

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

const getParsedRecord = (parsed: unknown, candidateKeys: string[]): UnknownRecord | undefined => {
    if (!isRecord(parsed)) {
        return undefined;
    }

    const value = getRecordValue(parsed, candidateKeys);

    return isRecord(value) ? value : undefined;
};

const flattenNamedBlockRecord = (blockName: string, value: unknown): UnknownRecord[] => {
    if (Array.isArray(value)) {
        return value.filter(isRecord);
    }

    if (!isRecord(value)) {
        return [];
    }

    const explicitChildren = getRecordValue(value, ["children", "blocks", "subblocks", "entries"]);

    if (Array.isArray(explicitChildren)) {
        return explicitChildren.filter(isRecord);
    }

    const nestedRecords = Object.entries(value)
        .filter(([, entryValue]) => isRecord(entryValue))
        .map(([name, entryValue]) => ({
            name,
            ...(entryValue as UnknownRecord),
        }));

    if (nestedRecords.length > 0) {
        return nestedRecords;
    }

    return [
        {
            name: blockName,
            ...value,
        },
    ];
};

const getBlockRows = (parsed: unknown, candidateKeys: string[]): UnknownRecord[] => {
    if (!isRecord(parsed)) {
        return [];
    }

    const match = candidateKeys
        .map((key) => [key, parsed[key]] as const)
        .find(([, value]) => value !== undefined && value !== null);

    if (!match) {
        return [];
    }

    const [blockName, value] = match;

    return flattenNamedBlockRecord(blockName, value);
};

const findTitle = (parsed: unknown, filename: string): string => {
    if (!isRecord(parsed)) {
        return filename;
    }

    const title = getRecordValue(parsed, ["title", "problemTitle", "name", "description", "appName"]);

    return typeof title === "string" && title.trim().length > 0 ? title : filename;
};

const findCaseId = (parsed: unknown): string | undefined => {
    if (!isRecord(parsed)) {
        return undefined;
    }

    const caseId = getRecordValue(parsed, ["caseId", "problemId", "id", "name", "appName"]);

    return typeof caseId === "string" && caseId.trim().length > 0 ? caseId : undefined;
};

const createSummaryCards = (parsed: unknown): ParsedSummaryCard[] => {
    const mesh = getParsedRecord(parsed, ["Mesh", "mesh"]);
    const variables = getBlockRows(parsed, ["Variables", "variables"]);
    const auxVariables = getBlockRows(parsed, ["AuxVariables", "auxVariables"]);
    const kernels = getBlockRows(parsed, ["Kernels", "kernels"]);
    const auxKernels = getBlockRows(parsed, ["AuxKernels", "auxKernels"]);
    const materials = getBlockRows(parsed, ["Materials", "materials"]);
    const bcs = getBlockRows(parsed, ["BCs", "BoundaryConditions", "bcs", "boundaryConditions"]);
    const postprocessors = getBlockRows(parsed, ["Postprocessors", "postprocessors"]);
    const executioner = getParsedRecord(parsed, ["Executioner", "executioner"]);
    const preconditioning = getParsedRecord(parsed, ["Preconditioning", "preconditioning"]);
    const outputs = getParsedRecord(parsed, ["Outputs", "outputs"]);
    const meshDim = mesh ? getNumber(mesh, ["dim", "dimension", "meshDimension"]) : undefined;

    return [
        {
            id: "mesh",
            label: "Mesh block",
            value: mesh ? "present" : "missing",
            severity: mesh ? "info" : "warning",
            description: "Whether a MOOSE Mesh block was parsed.",
        },
        {
            id: "mesh-dimension",
            label: "Mesh dimension",
            value: meshDim ?? null,
            description: "Detected mesh dimension, when available.",
        },
        {
            id: "variables",
            label: "Variables",
            value: variables.length,
            description: "Primary nonlinear variables parsed from the input file.",
        },
        {
            id: "aux-variables",
            label: "Aux variables",
            value: auxVariables.length,
            description: "Auxiliary variables parsed from the input file.",
        },
        {
            id: "kernels",
            label: "Kernels",
            value: kernels.length,
            description: "Kernel subblocks parsed from the input file.",
        },
        {
            id: "aux-kernels",
            label: "Aux kernels",
            value: auxKernels.length,
            description: "AuxKernel subblocks parsed from the input file.",
        },
        {
            id: "materials",
            label: "Materials",
            value: materials.length,
            description: "Material subblocks parsed from the input file.",
        },
        {
            id: "boundary-conditions",
            label: "Boundary conditions",
            value: bcs.length,
            description: "Boundary condition subblocks parsed from the input file.",
        },
        {
            id: "postprocessors",
            label: "Postprocessors",
            value: postprocessors.length,
            description: "Postprocessor subblocks parsed from the input file.",
        },
        {
            id: "executioner",
            label: "Executioner",
            value: executioner ? "present" : "missing",
            severity: executioner ? "info" : "warning",
            description: "Whether an Executioner block was parsed.",
        },
        {
            id: "preconditioning",
            label: "Preconditioning",
            value: preconditioning ? "present" : "missing",
            severity: preconditioning ? "info" : "warning",
            description: "Whether a Preconditioning block was parsed.",
        },
        {
            id: "outputs",
            label: "Outputs",
            value: outputs ? "present" : "missing",
            severity: outputs ? "info" : "warning",
            description: "Whether an Outputs block was parsed.",
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
        "mesh",
        "Mesh",
        getParsedRecord(parsed, ["Mesh", "mesh"]),
        "Mesh generation or mesh-file settings.",
    ),
    ...createSectionFromRecord(
        "executioner",
        "Executioner",
        getParsedRecord(parsed, ["Executioner", "executioner"]),
        "Time integration, nonlinear solve, and execution settings.",
    ),
    ...createSectionFromRecord(
        "preconditioning",
        "Preconditioning",
        getParsedRecord(parsed, ["Preconditioning", "preconditioning"]),
        "Preconditioning and solver coupling settings.",
    ),
    ...createSectionFromRecord(
        "outputs",
        "Outputs",
        getParsedRecord(parsed, ["Outputs", "outputs"]),
        "Output configuration and file writing controls.",
    ),
    ...createSectionFromRecord(
        "global-params",
        "Global parameters",
        getParsedRecord(parsed, ["GlobalParams", "globalParams"]),
        "Global MOOSE parameters shared across blocks.",
    ),
    ...createSectionFromRecord(
        "cross-links",
        "Cross-links",
        getParsedRecord(parsed, ["CrossLinks", "crossLinks"]),
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
            "variables",
            "Variables",
            getBlockRows(parsed, ["Variables", "variables"]),
            "Primary nonlinear variables declared in the MOOSE input file.",
        ),
        createTable(
            "aux-variables",
            "Aux variables",
            getBlockRows(parsed, ["AuxVariables", "auxVariables"]),
            "Auxiliary variables declared in the MOOSE input file.",
        ),
        createTable(
            "kernels",
            "Kernels",
            getBlockRows(parsed, ["Kernels", "kernels"]),
            "Physics kernels declared in the input file.",
        ),
        createTable(
            "aux-kernels",
            "Aux kernels",
            getBlockRows(parsed, ["AuxKernels", "auxKernels"]),
            "Auxiliary kernels declared in the input file.",
        ),
        createTable(
            "materials",
            "Materials",
            getBlockRows(parsed, ["Materials", "materials"]),
            "Material models and property definitions declared in the input file.",
        ),
        createTable(
            "boundary-conditions",
            "Boundary conditions",
            getBlockRows(parsed, ["BCs", "BoundaryConditions", "bcs", "boundaryConditions"]),
            "Boundary condition subblocks declared in the input file.",
        ),
        createTable(
            "functions",
            "Functions",
            getBlockRows(parsed, ["Functions", "functions"]),
            "Functions, ramps, schedules, or expressions declared in the input file.",
        ),
        createTable(
            "postprocessors",
            "Postprocessors",
            getBlockRows(parsed, ["Postprocessors", "postprocessors"]),
            "Postprocessor definitions declared in the input file.",
        ),
        createTable(
            "vector-postprocessors",
            "Vector postprocessors",
            getBlockRows(parsed, ["VectorPostprocessors", "vectorPostprocessors"]),
            "Vector postprocessor definitions declared in the input file.",
        ),
    ].filter((table): table is ParsedTable => table !== undefined);

const variableName = (record: UnknownRecord, index: number): string =>
    getString(record, ["name", "variable", "var", "id"], `variable-${index + 1}`);

const blockName = (record: UnknownRecord, fallbackPrefix: string, index: number): string =>
    getString(record, ["name", "id", "block", "type"], `${fallbackPrefix}-${index + 1}`);

const variableReference = (record: UnknownRecord): string | undefined => {
    const value = getRecordValue(record, ["variable", "var", "coupled_variables", "coupledVariable"]);

    if (typeof value === "string" && value.trim().length > 0) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.find((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
    }

    return undefined;
};

const createGraph = (parsed: unknown): ParsedGraphModel | undefined => {
    const variables = getBlockRows(parsed, ["Variables", "variables"]);
    const auxVariables = getBlockRows(parsed, ["AuxVariables", "auxVariables"]);
    const kernels = getBlockRows(parsed, ["Kernels", "kernels"]);
    const auxKernels = getBlockRows(parsed, ["AuxKernels", "auxKernels"]);
    const materials = getBlockRows(parsed, ["Materials", "materials"]);

    if ([variables, auxVariables, kernels, auxKernels, materials].every((rows) => rows.length === 0)) {
        return undefined;
    }

    const variableNodes = variables.map((variable, index) => {
        const id = variableName(variable, index);

        return {
            id,
            label: id,
            family: "moose" as const,
            group: "variable",
            metadata: recordToParsedRecord(variable),
        };
    });

    const auxVariableNodes = auxVariables.map((variable, index) => {
        const id = variableName(variable, index);

        return {
            id,
            label: id,
            family: "moose" as const,
            group: "aux variable",
            metadata: recordToParsedRecord(variable),
        };
    });

    const physicsNodes = [
        ...kernels.map((kernel, index) => ({
            id: blockName(kernel, "kernel", index),
            label: blockName(kernel, "kernel", index),
            family: "moose" as const,
            group: "kernel",
            metadata: recordToParsedRecord(kernel),
        })),
        ...auxKernels.map((kernel, index) => ({
            id: blockName(kernel, "aux-kernel", index),
            label: blockName(kernel, "aux-kernel", index),
            family: "moose" as const,
            group: "aux kernel",
            metadata: recordToParsedRecord(kernel),
        })),
        ...materials.map((material, index) => ({
            id: blockName(material, "material", index),
            label: blockName(material, "material", index),
            family: "moose" as const,
            group: "material",
            metadata: recordToParsedRecord(material),
        })),
    ];

    const knownVariableIds = new Set([...variableNodes, ...auxVariableNodes].map((node) => node.id));
    const inferredVariableIds = new Set<string>();

    const physicsEdges = [...kernels, ...auxKernels].flatMap((physicsBlock, index) => {
        const source = blockName(physicsBlock, "physics", index);
        const target = variableReference(physicsBlock);

        if (!target) {
            return [];
        }

        if (!knownVariableIds.has(target)) {
            inferredVariableIds.add(target);
        }

        return [
            {
                id: `${source}-acts-on-${target}`,
                source,
                target,
                label: "acts on",
            },
        ];
    });

    const inferredVariableNodes = Array.from(inferredVariableIds).map((id) => ({
        id,
        label: id,
        family: "moose" as const,
        group: "referenced variable",
    }));

    return {
        nodes: [...variableNodes, ...auxVariableNodes, ...physicsNodes, ...inferredVariableNodes],
        edges: physicsEdges,
    };
};

const createDomainSlices = (
    summaryCards: ParsedSummaryCard[],
    sections: ParsedSection[],
    tables: ParsedTable[],
    graph: ParsedGraphModel | undefined,
    diagnostics: ParserDiagnostic[],
): ParsedDomainSlices => ({
    thermal: {
        summaryCards: summaryCards.filter((card) =>
            ["mesh", "mesh-dimension", "variables", "kernels", "materials", "boundary-conditions"].includes(card.id),
        ),
        diagnostics,
        sections: sections.filter((section) => ["mesh", "executioner", "preconditioning"].includes(section.id)),
        tables: tables.filter((table) => ["variables", "kernels", "materials", "boundary-conditions", "functions"].includes(table.id)),
    },
    structures: {
        summaryCards: summaryCards.filter((card) => ["mesh", "variables", "kernels", "materials"].includes(card.id)),
        diagnostics,
        sections: sections.filter((section) => ["mesh", "executioner"].includes(section.id)),
        tables: tables.filter((table) => ["variables", "kernels", "materials", "boundary-conditions"].includes(table.id)),
    },
    stability: {
        summaryCards: summaryCards.filter((card) =>
            ["executioner", "preconditioning", "postprocessors", "outputs"].includes(card.id),
        ),
        diagnostics,
        sections: sections.filter((section) => ["executioner", "preconditioning", "outputs", "cross-links"].includes(section.id)),
        tables: tables.filter((table) => ["postprocessors", "vector-postprocessors", "functions"].includes(table.id)),
    },
    materials: {
        summaryCards: summaryCards.filter((card) => card.id === "materials"),
        diagnostics,
        tables: tables.filter((table) => table.id === "materials"),
    },
    neutronics: {
        diagnostics: graph
            ? []
            : [
                {
                    severity: "info",
                    message: "MOOSE input files usually provide multiphysics coupling context; direct neutronics details may be represented through kernels, materials, or cross-links.",
                    source: "moose.input.adapter",
                },
            ],
        sections: sections.filter((section) => section.id === "cross-links"),
        tables: tables.filter((table) => ["kernels", "materials", "postprocessors"].includes(table.id)),
    },
});

export const adaptMooseInputToViewModel = <TParsed = unknown>(
    input: MooseInputAdapterInput<TParsed>,
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
