export interface BisonPostprocessorRow {
  readonly time: number;
  readonly peakFuelTemperature: number;
  readonly averageFuelTemperature: number;
  readonly averageHydrogenInventory: number;
  readonly averageBurnupProxy: number;
  readonly maximumDamageIndex: number;
  readonly minimumLedineggMargin: number;
  readonly meanThermalMargin: number;
  readonly meanGridPressureDrop: number;
  readonly meanGimbalBleed: number;
  readonly meanCoatingBarrierMargin: number;
  readonly meanHydrogenAttackMargin: number;
  readonly restartMemoryIndex: number;
}

export interface BisonTransientSolveStep {
  readonly step: number;
  readonly time: number;
  readonly dt?: number;
  readonly nonlinearIterations?: number;
  readonly linearIterations?: number;
  readonly residual?: number;
  readonly power?: number;
  readonly peakFuelTemperature?: number;
  readonly ledineggMargin?: number;
  readonly note: string;
}

export interface BisonProfilePoint {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly temperature: number;
}

export interface BisonVectorProfileSummary {
  readonly name: string;
  readonly variable?: string;
  readonly points?: number;
  readonly finalFile?: string;
  readonly finalMin?: number;
  readonly finalMean?: number;
  readonly finalMax?: number;
}

export interface BisonFinalReviewSummary {
  readonly caseId?: string;
  readonly inputDeck?: string;
  readonly metadataPairing?: string;
  readonly missionProfile?: string;
  readonly peakFuelTemperatureK?: number;
  readonly peakFuelTemperatureTimeSeconds?: number;
  readonly peakRestartTemperatureK?: number;
  readonly peakRestartTemperatureTimeSeconds?: number;
  readonly finalPeakFuelTemperatureK?: number;
  readonly finalAverageFuelTemperatureK?: number;
  readonly minimumLedineggMargin?: number;
  readonly minimumThermalMargin?: number;
  readonly minimumCoatingMargin?: number;
  readonly minimumHydrogenAttackMargin?: number;
  readonly finalBurnupProxy?: number;
  readonly finalDamageIndexProxy?: number;
  readonly finalRestartMemoryIndex?: number;
}

export interface BisonOutputParseResult {
  readonly metadata: {
    readonly application?: string;
    readonly inputFile?: string;
    readonly validationStatus?: string;
    readonly runMode?: string;
    readonly coordinateSystem?: string;
    readonly meshSource?: string;
    readonly meshType?: string;
  };
  readonly transientSolveLog: readonly BisonTransientSolveStep[];
  readonly postprocessorHistory: readonly BisonPostprocessorRow[];
  readonly vectorProfiles: readonly BisonVectorProfileSummary[];
  readonly axialTemperatureProfile: readonly BisonProfilePoint[];
  readonly finalReview: BisonFinalReviewSummary;
  readonly notes: readonly string[];
}

const TOP_LEVEL_FIELD_PATTERN = /^([A-Za-z][A-Za-z\s/-]*?):\s*(.*?)\s*$/;
const SCI_NUMBER_PATTERN = /[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i;

export function parseBisonOutput(input: string): BisonOutputParseResult {
  const lines = normalizeLines(input);
  const metadata = parseMetadata(lines);
  const postprocessorHistory = parsePostprocessorHistory(lines);
  const transientSolveLog = parseTransientSolveLog(lines);
  const vectorProfiles = parseVectorProfileSummary(lines);
  const axialTemperatureProfile = parseAxialTemperatureProfile(lines);
  const finalReview = parseFinalReview(lines);
  const notes = lines
    .filter((line) => /not validated|synthetic|parser and visualization/i.test(line))
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    metadata,
    transientSolveLog,
    postprocessorHistory,
    vectorProfiles,
    axialTemperatureProfile,
    finalReview,
    notes,
  };
}

function normalizeLines(text: string): string[] {
  return text.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
}

function parseMetadata(lines: string[]): BisonOutputParseResult["metadata"] {
  const metadata: Record<string, string> = {};

  for (const rawLine of lines.slice(0, 90)) {
    const match = rawLine.match(TOP_LEVEL_FIELD_PATTERN);
    if (!match) continue;
    const key = toCamelKey(match[1]);
    metadata[key] = match[2].trim();
  }

  return {
    application: metadata.application,
    inputFile: metadata.inputFile,
    validationStatus: metadata.validationStatus,
    runMode: metadata.runMode,
    coordinateSystem: metadata.coordinateSystem,
    meshSource: metadata.meshSource,
    meshType: metadata.meshType,
  };
}

function parseTransientSolveLog(lines: readonly string[]): BisonTransientSolveStep[] {
  const startIndex = lines.findIndex((line) => line.includes("TRANSIENT SOLVE LOG"));
  if (startIndex < 0) return [];

  const rows: BisonTransientSolveStep[] = [];
  for (const line of lines.slice(startIndex)) {
    const match = line.match(/^\s*(\d+)\s+([+-]?\d+\.\d+e[+-]?\d+)\s+([+-]?\d+\.\d+e[+-]?\d+)\s+(\d+|-)\s+(\d+|-)\s+([+-]?\d+\.\d+e[+-]?\d+|-)\s+([+-]?\d+\.\d+)\s+([+-]?\d+\.\d+)\s+([+-]?\d+\.\d+)\s+(.+)$/i);
    if (!match) {
      if (rows.length && line.includes("Solve completed")) break;
      continue;
    }

    rows.push({
      step: Number(match[1]),
      time: Number(match[2]),
      dt: Number(match[3]),
      nonlinearIterations: toOptionalNumber(match[4]),
      linearIterations: toOptionalNumber(match[5]),
      residual: toOptionalNumber(match[6]),
      power: Number(match[7]),
      peakFuelTemperature: Number(match[8]),
      ledineggMargin: Number(match[9]),
      note: match[10].trim(),
    });
  }
  return rows;
}

function parsePostprocessorHistory(lines: readonly string[]): BisonPostprocessorRow[] {
  const headerIndex = lines.findIndex((line) => line.startsWith("time,peak_fuel_temperature"));
  if (headerIndex < 0) return [];

  const columns = lines[headerIndex].split(",");
  const rows: BisonPostprocessorRow[] = [];
  for (const line of lines.slice(headerIndex + 1)) {
    if (!line.trim()) break;
    const values = line.split(",").map((value) => Number(value));
    if (values.length !== columns.length || values.some((value) => !Number.isFinite(value))) break;
    const record = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
    rows.push({
      time: record.time,
      peakFuelTemperature: record.peak_fuel_temperature,
      averageFuelTemperature: record.average_fuel_temperature,
      averageHydrogenInventory: record.average_hydrogen_inventory,
      averageBurnupProxy: record.average_burnup_proxy,
      maximumDamageIndex: record.maximum_damage_index,
      minimumLedineggMargin: record.minimum_ledinegg_margin,
      meanThermalMargin: record.mean_thermal_margin,
      meanGridPressureDrop: record.mean_grid_pressure_drop,
      meanGimbalBleed: record.mean_gimbal_bleed,
      meanCoatingBarrierMargin: record.mean_coating_barrier_margin,
      meanHydrogenAttackMargin: record.mean_hydrogen_attack_margin,
      restartMemoryIndex: record.restart_memory_index,
    });
  }
  return rows;
}

function parseVectorProfileSummary(lines: readonly string[]): BisonVectorProfileSummary[] {
  const startIndex = lines.findIndex((line) => line.includes("VECTOR POSTPROCESSOR SUMMARY"));
  if (startIndex < 0) return [];

  const summaries: BisonVectorProfileSummary[] = [];
  let current: {
    name: string;
    variable?: string;
    points?: number;
    finalFile?: string;
    finalMin?: number;
    finalMean?: number;
    finalMax?: number;
  } | null = null;

  for (const rawLine of lines.slice(startIndex + 1)) {
    const line = rawLine.trim();
    if (line.includes("SELECTED FINAL AXIAL TEMPERATURE PROFILE")) break;
    if (!line) continue;
    if (/^[a-z_]+$/.test(line)) {
      if (current) summaries.push(current);
      current = {name: line};
      continue;
    }
    if (!current) continue;
    const match = line.match(/^([A-Za-z ]+):\s*(.+)$/);
    if (!match) continue;
    const key = toCamelKey(match[1]);
    const value = match[2].trim();
    if (key === "variable") current.variable = value;
    if (key === "points") current.points = Number(value);
    if (key === "finalFile") current.finalFile = value;
    if (key === "finalMin") current.finalMin = firstNumber(value);
    if (key === "finalMean") current.finalMean = firstNumber(value);
    if (key === "finalMax") current.finalMax = firstNumber(value);
  }
  if (current) summaries.push(current);
  return summaries;
}

function parseAxialTemperatureProfile(lines: readonly string[]): BisonProfilePoint[] {
  const headerIndex = lines.findIndex((line) => line.trim() === "# columns: id,x,y,z,temp");
  if (headerIndex < 0) return [];

  const rows: BisonProfilePoint[] = [];
  for (const line of lines.slice(headerIndex + 1)) {
    if (!line.trim()) break;
    const cells = line.split(",").map((entry) => Number(entry));
    if (cells.length !== 5 || cells.some((value) => !Number.isFinite(value))) break;
    rows.push({id: cells[0], x: cells[1], y: cells[2], z: cells[3], temperature: cells[4]});
  }
  return rows;
}

function parseFinalReview(lines: readonly string[]): BisonFinalReviewSummary {
  const startIndex = lines.findIndex((line) => line.includes("FINAL REVIEW SUMMARY"));
  if (startIndex < 0) return {};
  const summaryLines = lines.slice(startIndex, lines.findIndex((line, index) => index > startIndex && line.includes("Interpretation:")));
  const byLabel = new Map<string, string>();

  for (const line of summaryLines) {
    const match = line.match(/^([A-Za-z][A-Za-z\s]+?):\s*(.+)$/);
    if (match) byLabel.set(match[1].trim(), match[2].trim());
  }

  const peak = byLabel.get("Peak fuel temperature");
  const peakRestart = byLabel.get("Peak restart temperature");
  const finalFuelTemperature = byLabel.get("Final fuel temperature");

  return {
    caseId: byLabel.get("Case ID"),
    inputDeck: byLabel.get("Input deck"),
    metadataPairing: byLabel.get("Metadata pairing"),
    missionProfile: byLabel.get("Mission profile"),
    peakFuelTemperatureK: firstNumber(peak),
    peakFuelTemperatureTimeSeconds: numberAfter(peak, "approximately"),
    peakRestartTemperatureK: firstNumber(peakRestart),
    peakRestartTemperatureTimeSeconds: numberAfter(peakRestart, "approximately"),
    finalPeakFuelTemperatureK: firstNumber(finalFuelTemperature),
    finalAverageFuelTemperatureK: numberAfter(finalFuelTemperature, "average"),
    minimumLedineggMargin: firstNumber(byLabel.get("Minimum Ledinegg margin proxy")),
    minimumThermalMargin: firstNumber(byLabel.get("Minimum thermal margin proxy")),
    minimumCoatingMargin: firstNumber(byLabel.get("Minimum coating margin proxy")),
    minimumHydrogenAttackMargin: firstNumber(byLabel.get("Minimum hydrogen attack margin")),
    finalBurnupProxy: firstNumber(byLabel.get("Final burnup proxy")),
    finalDamageIndexProxy: firstNumber(byLabel.get("Final damage index proxy")),
    finalRestartMemoryIndex: firstNumber(byLabel.get("Final restart memory index")),
  };
}

function firstNumber(value: string | undefined): number | undefined {
  const match = value?.match(SCI_NUMBER_PATTERN);
  return match ? Number(match[0]) : undefined;
}

function numberAfter(value: string | undefined, token: string): number | undefined {
  const index = value?.toLowerCase().indexOf(token.toLowerCase()) ?? -1;
  if (!value || index < 0) return undefined;
  return firstNumber(value.slice(index + token.length));
}

function toOptionalNumber(value: string): number | undefined {
  return value === "-" ? undefined : Number(value);
}

function toCamelKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+([a-z0-9])/g, (_, next: string) => next.toUpperCase());
}
