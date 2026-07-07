import type {BisonInputParseResult} from "./bison/bison.input.parser";
import {createParsedFileViewModel} from "./parsedFileViewModel";
import type {
  ParsedFileViewModel,
  ParsedSummaryCard,
  ParsedTable,
  ParserDiagnostic,
  ParserDescriptor,
} from "./parserTypes";

export function adaptBisonInputToViewModel<TParsed = unknown>(input: {
  id: string;
  filename: string;
  descriptor: ParserDescriptor<TParsed>;
  parsed: TParsed;
  diagnostics?: readonly ParserDiagnostic[];
}): ParsedFileViewModel<TParsed> {
  const parsed = input.parsed as BisonInputParseResult;
  const diagnostics = [
    ...(input.diagnostics ?? []),
    ...parsed.warnings.map((warning): ParserDiagnostic => ({
      severity: "warning",
      message: warning.message,
      source: "bison.input.parser",
      location: {line: warning.line},
    })),
  ];

  return createParsedFileViewModel(
    {
      id: input.id,
      filename: input.filename,
      descriptor: input.descriptor,
      parsed: input.parsed,
      diagnostics,
    },
    {
      title: "BISON fuel-performance input scaffold",
      caseId: parsed.metadata.inputFile ?? input.filename,
      status: parsed.metadata.validationStatus,
      summaryCards: buildSummaryCards(parsed),
      diagnostics,
      tables: buildTables(parsed),
      domainSlices: {
        thermal: {
          summaryCards: [
            {id: "schedule-count", label: "Schedules", value: parsed.functions.length},
          ],
          tables: [buildFunctionTable(parsed)],
        },
        materials: {
          summaryCards: [
            {id: "primary-variable-count", label: "Primary variables", value: parsed.variables.filter((variable) => variable.kind === "primary").length},
          ],
          tables: [buildVariableTable(parsed)],
        },
      },
    },
  );
}

function buildSummaryCards(parsed: BisonInputParseResult): ParsedSummaryCard[] {
  return [
    {id: "mesh", label: "Mesh posture", value: parsed.metadata.meshPosture ?? parsed.mesh.type ?? "fixture-defined"},
    {id: "primary-variables", label: "Primary variables", value: parsed.variables.filter((variable) => variable.kind === "primary").length},
    {id: "aux-variables", label: "Aux variables", value: parsed.variables.filter((variable) => variable.kind === "auxiliary").length},
    {id: "functions", label: "Schedule functions", value: parsed.functions.length},
  ];
}

function buildTables(parsed: BisonInputParseResult): ParsedTable[] {
  return [
    buildVariableTable(parsed),
    buildFunctionTable(parsed),
    {
      id: "source-context",
      title: "Companion source context",
      columns: [
        {id: "sourceFile", label: "Source file"},
      ],
      rows: parsed.metadata.sourceContext.map((sourceFile) => ({sourceFile})),
    },
  ];
}

function buildVariableTable(parsed: BisonInputParseResult): ParsedTable {
  return {
    id: "variables",
    title: "Fuel-performance variables",
    columns: [
      {id: "name", label: "Variable"},
      {id: "kind", label: "Kind"},
      {id: "family", label: "Family"},
      {id: "order", label: "Order"},
      {id: "initialCondition", label: "Initial condition"},
    ],
    rows: parsed.variables.map((variable) => ({
      name: variable.name,
      kind: variable.kind,
      family: variable.family ?? "",
      order: variable.order ?? "",
      initialCondition: variable.initialCondition ?? null,
    })),
  };
}

function buildFunctionTable(parsed: BisonInputParseResult): ParsedTable {
  return {
    id: "mission-functions",
    title: "Mission and boundary-condition schedules",
    columns: [
      {id: "name", label: "Function"},
      {id: "type", label: "Type"},
      {id: "points", label: "Points"},
      {id: "start", label: "Start"},
      {id: "end", label: "End"},
    ],
    rows: parsed.functions.map((fn) => ({
      name: fn.name,
      type: fn.type ?? "",
      points: Math.max(fn.x.length, fn.y.length),
      start: fn.y.at(0) ?? null,
      end: fn.y.at(-1) ?? null,
    })),
  };
}
