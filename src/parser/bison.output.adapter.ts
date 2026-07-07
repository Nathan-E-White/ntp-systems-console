import type {BisonOutputParseResult} from "./bison/bison.output.parser";
import {createParsedFileViewModel} from "./parsedFileViewModel";
import type {
  ParsedFileViewModel,
  ParsedSummaryCard,
  ParsedTable,
  ParsedTimeSeries,
  ParserDiagnostic,
  ParserDescriptor,
} from "./parserTypes";

export function adaptBisonOutputToViewModel<TParsed = unknown>(input: {
  id: string;
  filename: string;
  descriptor: ParserDescriptor<TParsed>;
  parsed: TParsed;
  diagnostics?: readonly ParserDiagnostic[];
}): ParsedFileViewModel<TParsed> {
  const parsed = input.parsed as BisonOutputParseResult;
  const diagnostics = [
    ...(input.diagnostics ?? []),
    {
      severity: "warning" as const,
      message: "BISON fixture is synthetic executable-lite evidence, not validated fuel-performance output.",
      source: "bison.output.adapter",
    },
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
      title: "BISON fuel-performance output fixture",
      caseId: parsed.finalReview.caseId,
      status: parsed.metadata.validationStatus,
      summaryCards: buildSummaryCards(parsed),
      diagnostics,
      tables: buildTables(parsed),
      timeSeries: buildTimeSeries(parsed),
      domainSlices: {
        thermal: {
          summaryCards: buildSummaryCards(parsed).slice(0, 4),
          tables: [buildPostprocessorTable(parsed), buildAxialProfileTable(parsed)],
          timeSeries: [buildFuelPerformanceSeries(parsed)],
        },
        materials: {
          summaryCards: buildSummaryCards(parsed).slice(2),
          tables: [buildFinalReviewTable(parsed)],
          timeSeries: [buildFuelPerformanceSeries(parsed)],
        },
      },
    },
  );
}

function buildSummaryCards(parsed: BisonOutputParseResult): ParsedSummaryCard[] {
  const final = parsed.finalReview;

  return [
    {id: "peak-fuel-temperature", label: "Peak fuel temperature", value: final.peakFuelTemperatureK ?? null, unit: "K"},
    {id: "peak-restart-temperature", label: "Peak restart temperature", value: final.peakRestartTemperatureK ?? null, unit: "K"},
    {id: "minimum-coating-margin", label: "Minimum coating margin", value: final.minimumCoatingMargin ?? null},
    {id: "minimum-hydrogen-attack-margin", label: "Hydrogen attack margin", value: final.minimumHydrogenAttackMargin ?? null},
    {id: "final-burnup-proxy", label: "Final burnup proxy", value: final.finalBurnupProxy ?? null},
    {id: "final-damage-index", label: "Final damage index", value: final.finalDamageIndexProxy ?? null},
  ];
}

function buildTables(parsed: BisonOutputParseResult): ParsedTable[] {
  return [
    buildPostprocessorTable(parsed),
    buildFinalReviewTable(parsed),
    buildAxialProfileTable(parsed),
    buildVectorProfileTable(parsed),
    buildTransientSolveTable(parsed),
  ];
}

function buildTimeSeries(parsed: BisonOutputParseResult): ParsedTimeSeries[] {
  return [
    buildFuelPerformanceSeries(parsed),
    {
      id: "bison-axial-temperature-profile",
      title: "Final axial temperature profile",
      timeUnit: "m",
      valueUnits: {temperature: "K"},
      points: parsed.axialTemperatureProfile.map((point) => ({
        time: point.y,
        values: {temperature: point.temperature},
      })),
    },
  ];
}

function buildFuelPerformanceSeries(parsed: BisonOutputParseResult): ParsedTimeSeries {
  return {
    id: "bison-fuel-performance-history",
    title: "BISON-like fuel performance history",
    timeUnit: "s",
    valueUnits: {
      peakFuelTemperature: "K",
      averageFuelTemperature: "K",
      averageHydrogenInventory: "arb",
      averageBurnupProxy: "proxy",
      maximumDamageIndex: "proxy",
      meanCoatingBarrierMargin: "ratio",
      meanHydrogenAttackMargin: "ratio",
      restartMemoryIndex: "ratio",
    },
    points: parsed.postprocessorHistory.map((row) => ({
      time: row.time,
      values: {
        peakFuelTemperature: row.peakFuelTemperature,
        averageFuelTemperature: row.averageFuelTemperature,
        averageHydrogenInventory: row.averageHydrogenInventory,
        averageBurnupProxy: row.averageBurnupProxy,
        maximumDamageIndex: row.maximumDamageIndex,
        meanCoatingBarrierMargin: row.meanCoatingBarrierMargin,
        meanHydrogenAttackMargin: row.meanHydrogenAttackMargin,
        restartMemoryIndex: row.restartMemoryIndex,
      },
    })),
  };
}

function buildPostprocessorTable(parsed: BisonOutputParseResult): ParsedTable {
  return {
    id: "postprocessor-history",
    title: "BISON postprocessor history",
    columns: [
      {id: "time", label: "Time", unit: "s"},
      {id: "peakFuelTemperature", label: "Peak fuel", unit: "K"},
      {id: "averageFuelTemperature", label: "Average fuel", unit: "K"},
      {id: "averageHydrogenInventory", label: "Hydrogen inventory"},
      {id: "averageBurnupProxy", label: "Burnup proxy"},
      {id: "maximumDamageIndex", label: "Damage index"},
      {id: "meanCoatingBarrierMargin", label: "Coating margin"},
      {id: "meanHydrogenAttackMargin", label: "Hydrogen attack margin"},
    ],
    rows: parsed.postprocessorHistory.map((row) => ({
      time: row.time,
      peakFuelTemperature: row.peakFuelTemperature,
      averageFuelTemperature: row.averageFuelTemperature,
      averageHydrogenInventory: row.averageHydrogenInventory,
      averageBurnupProxy: row.averageBurnupProxy,
      maximumDamageIndex: row.maximumDamageIndex,
      meanCoatingBarrierMargin: row.meanCoatingBarrierMargin,
      meanHydrogenAttackMargin: row.meanHydrogenAttackMargin,
    })),
  };
}

function buildFinalReviewTable(parsed: BisonOutputParseResult): ParsedTable {
  const final = parsed.finalReview;

  return {
    id: "final-review-summary",
    title: "Final fuel-performance review summary",
    columns: [
      {id: "metric", label: "Metric"},
      {id: "value", label: "Fixture value"},
      {id: "unit", label: "Unit"},
    ],
    rows: [
      {metric: "Peak fuel temperature", value: final.peakFuelTemperatureK ?? null, unit: "K"},
      {metric: "Peak restart temperature", value: final.peakRestartTemperatureK ?? null, unit: "K"},
      {metric: "Minimum coating margin", value: final.minimumCoatingMargin ?? null, unit: "ratio"},
      {metric: "Minimum hydrogen attack margin", value: final.minimumHydrogenAttackMargin ?? null, unit: "ratio"},
      {metric: "Final burnup proxy", value: final.finalBurnupProxy ?? null, unit: "proxy"},
      {metric: "Final damage index", value: final.finalDamageIndexProxy ?? null, unit: "proxy"},
    ],
  };
}

function buildAxialProfileTable(parsed: BisonOutputParseResult): ParsedTable {
  return {
    id: "axial-temperature-profile",
    title: "Final axial temperature profile",
    columns: [
      {id: "id", label: "Sample"},
      {id: "y", label: "Axial position", unit: "m"},
      {id: "temperature", label: "Temperature", unit: "K"},
    ],
    rows: parsed.axialTemperatureProfile.map((point) => ({
      id: point.id,
      y: point.y,
      temperature: point.temperature,
    })),
  };
}

function buildVectorProfileTable(parsed: BisonOutputParseResult): ParsedTable {
  return {
    id: "vector-profile-summary",
    title: "Vector profile summary",
    columns: [
      {id: "name", label: "Profile"},
      {id: "variable", label: "Variable"},
      {id: "points", label: "Points"},
      {id: "finalMin", label: "Final min"},
      {id: "finalMean", label: "Final mean"},
      {id: "finalMax", label: "Final max"},
    ],
    rows: parsed.vectorProfiles.map((profile) => ({
      name: profile.name,
      variable: profile.variable ?? "",
      points: profile.points ?? null,
      finalMin: profile.finalMin ?? null,
      finalMean: profile.finalMean ?? null,
      finalMax: profile.finalMax ?? null,
    })),
  };
}

function buildTransientSolveTable(parsed: BisonOutputParseResult): ParsedTable {
  return {
    id: "transient-solve-log",
    title: "Transient solve log",
    columns: [
      {id: "step", label: "Step"},
      {id: "time", label: "Time", unit: "s"},
      {id: "power", label: "Power"},
      {id: "peakFuelTemperature", label: "Peak fuel", unit: "K"},
      {id: "ledineggMargin", label: "Ledinegg margin"},
      {id: "note", label: "Note"},
    ],
    rows: parsed.transientSolveLog.map((row) => ({
      step: row.step,
      time: row.time,
      power: row.power ?? null,
      peakFuelTemperature: row.peakFuelTemperature ?? null,
      ledineggMargin: row.ledineggMargin ?? null,
      note: row.note,
    })),
  };
}
