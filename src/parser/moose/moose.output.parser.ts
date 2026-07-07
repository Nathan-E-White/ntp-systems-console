

export type MooseOutputScalarValue = string | number | boolean;

export interface MooseOutputMetadata {
  readonly inputFile?: string;
  readonly caseId?: string;
  readonly problemType?: string;
  readonly coordinateSystem?: string;
  readonly meshType?: string;
  readonly meshDimension?: number;
  readonly elements?: number;
  readonly elementType?: string;
  readonly nodes?: number;
  readonly primaryVariableCount?: number;
  readonly auxiliaryVariableCount?: number;
  readonly functionCount?: number;
  readonly auxKernelCount?: number;
  readonly kernelCount?: number;
  readonly materialCount?: number;
  readonly boundaryConditionCount?: number;
  readonly postprocessorCount?: number;
  readonly outputs: string[];
  readonly pairing: string[];
  readonly discipline?: string;
}

export interface MooseOutputBlock {
  readonly name: string;
  readonly path: string;
  readonly parameters: Record<string, MooseOutputScalarValue | MooseOutputScalarValue[]>;
  readonly children: readonly MooseOutputBlock[];
}

export interface MooseTransientSolveStep {
  readonly step: number;
  readonly time: number;
  readonly dt?: number;
  readonly nonlinearIterations?: number;
  readonly linearIterations?: number;
  readonly status: string;
}

export interface MooseCsvTable {
  readonly name: string;
  readonly columns: string[];
  readonly rows: MooseCsvRow[];
}

export interface MooseCsvRow {
  readonly values: Record<string, MooseOutputScalarValue>;
}

export interface MooseKeyValueSection {
  readonly name: string;
  readonly values: Record<string, MooseOutputScalarValue>;
}

export interface MooseValidationSummary {
  readonly status?: string;
  readonly warnings: string[];
  readonly parameters: Record<string, MooseOutputScalarValue | MooseOutputScalarValue[]>;
}

export interface MooseMeshOutputSummary {
  readonly dimension?: number;
  readonly coordinateSystem?: string;
  readonly xmin?: number;
  readonly xmax?: number;
  readonly ymin?: number;
  readonly ymax?: number;
  readonly nx?: number;
  readonly ny?: number;
  readonly elementType?: string;
  readonly activeElements?: number;
  readonly activeNodes?: number;
  readonly parameters: Record<string, MooseOutputScalarValue | MooseOutputScalarValue[]>;
}

export interface MooseVariableOutputSummary {
  readonly primary: string[];
  readonly auxiliary: string[];
}

export interface MooseExecutionerOutputSummary {
  readonly type?: string;
  readonly scheme?: string;
  readonly solveType?: string;
  readonly dtInitial?: number;
  readonly dtMax?: number;
  readonly endTime?: number;
  readonly nonlinearAbsoluteTolerance?: number;
  readonly nonlinearRelativeTolerance?: number;
  readonly linearTolerance?: number;
  readonly parameters: Record<string, MooseOutputScalarValue | MooseOutputScalarValue[]>;
}

export interface MooseCrossLinkEcho {
  readonly mcnpInputs: string[];
  readonly rocetsInputs: string[];
  readonly importedProxies: string[];
  readonly architectureLinks: Record<string, string>;
  readonly blocks: MooseOutputBlock[];
}

export interface MoosePerformanceSummary {
  readonly totalNonlinearIterations?: number;
  readonly totalLinearIterations?: number;
  readonly averageNonlinearIterationsPerStep?: number;
  readonly averageLinearIterationsPerStep?: number;
  readonly finalTime?: number;
  readonly finalDt?: number;
  readonly solveStatus?: string;
  readonly fixtureStatus?: string;
  readonly values: Record<string, MooseOutputScalarValue>;
}

export interface MooseOutputParserWarning {
  readonly line: number;
  readonly message: string;
}

export interface MooseOutputParseResult {
  readonly metadata: MooseOutputMetadata;
  readonly validation: MooseValidationSummary;
  readonly mesh?: MooseMeshOutputSummary;
  readonly variables: MooseVariableOutputSummary;
  readonly executioner?: MooseExecutionerOutputSummary;
  readonly transientSolveLog: MooseTransientSolveStep[];
  readonly postprocessorTimeHistory?: MooseCsvTable;
  readonly couplingProxyTimeHistory?: MooseCsvTable;
  readonly finalPostprocessorValues: Record<string, MooseOutputScalarValue>;
  readonly appSummary: Record<string, MooseOutputScalarValue>;
  readonly appSummaryByPanel: Record<string, Record<string, MooseOutputScalarValue>>;
  readonly crossLinks: MooseCrossLinkEcho;
  readonly performance: MoosePerformanceSummary;
  readonly blocks: MooseOutputBlock[];
  readonly tables: MooseCsvTable[];
  readonly keyValueSections: MooseKeyValueSection[];
  readonly warnings: MooseOutputParserWarning[];
}

interface MutableMooseOutputBlock {
  name: string;
  path: string;
  parameters: Record<string, MooseOutputScalarValue | MooseOutputScalarValue[]>;
  children: MutableMooseOutputBlock[];
}

interface BlockStackEntry {
  readonly block: MutableMooseOutputBlock;
  readonly line: number;
}

interface SectionRange {
  readonly title: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly lines: string[];
}

const ROOT_PATH = '';
const BLOCK_OPEN_PATTERN = /^\[([^\]]+)]\s*$/;
const ASSIGNMENT_PATTERN = /^([A-Za-z0-9_./:-]+)\s*=\s*(.*)$/;
const HEADER_FIELD_PATTERN = /^\*{3}\s*([A-Za-z][A-Za-z\s/-]*?):\s*(.*?)\s*\*{3}\s*$/;
const TOP_LEVEL_FIELD_PATTERN = /^([A-Za-z][A-Za-z\s/-]*?):\s*(.*)$/;
const SECTION_RULE = /^={8,}\s*$/;
const NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[Ee][+-]?\d+)?$/;
const INTEGER_PATTERN = /^[+-]?\d+$/;

export function parseMooseOutput(input: string): MooseOutputParseResult {
  const lines = normalizeLines(input);
  const warnings: MooseOutputParserWarning[] = [];
  const blocks = parseOutputBlocks(lines, warnings);
  const sections = parseSections(lines);
  const metadata = parseMetadata(lines);

  const validationBlock = findFirstRootBlock(blocks, 'InputValidation');
  const meshBlock = findFirstRootBlock(blocks, 'MeshSummary');
  const variableBlock = findFirstRootBlock(blocks, 'VariableSummary');
  const executionerBlock = findFirstRootBlock(blocks, 'Executioner');

  const tables = parseCsvTables(sections, warnings);
  const keyValueSections = parseKeyValueSections(sections);
  const finalPostprocessorValues = parseNamedKeyValueSection(
    keyValueSections,
    'Final postprocessor values',
  );
  const appSummary = parseNamedKeyValueSection(keyValueSections, 'App-facing derived summary');

  return {
    metadata,
    validation: toValidationSummary(validationBlock),
    mesh: meshBlock ? toMeshSummary(meshBlock) : undefined,
    variables: toVariableSummary(variableBlock),
    executioner: executionerBlock ? toExecutionerSummary(executionerBlock) : undefined,
    transientSolveLog: parseTransientSolveLog(sections, warnings),
    postprocessorTimeHistory: findTable(tables, 'Postprocessor time history'),
    couplingProxyTimeHistory: findTable(tables, 'Coupling proxy time history'),
    finalPostprocessorValues,
    appSummary,
    appSummaryByPanel: groupAppSummaryByPanel(appSummary),
    crossLinks: parseCrossLinks(blocks),
    performance: parsePerformanceSummary(keyValueSections),
    blocks,
    tables,
    keyValueSections,
    warnings,
  };
}

export function parseMooseOutputTables(input: string): MooseCsvTable[] {
  const warnings: MooseOutputParserWarning[] = [];
  return parseCsvTables(parseSections(normalizeLines(input)), warnings);
}

export function parseMooseOutputBlocks(input: string): MooseOutputBlock[] {
  const warnings: MooseOutputParserWarning[] = [];
  return parseOutputBlocks(normalizeLines(input), warnings);
}

function normalizeLines(input: string): string[] {
  return input.replace(/\r\n?/g, '\n').split('\n');
}

function parseMetadata(lines: readonly string[]): MooseOutputMetadata {
  const headerFields: Record<string, string> = {};
  const topLevelFields: Record<string, string> = {};

  for (const rawLine of lines) {
    const headerMatch = HEADER_FIELD_PATTERN.exec(rawLine);

    if (headerMatch) {
      const [, key, value] = headerMatch;
      headerFields[normalizeFieldKey(key)] = value.trim();
      continue;
    }

    const topLevelMatch = TOP_LEVEL_FIELD_PATTERN.exec(rawLine.trim());

    if (topLevelMatch) {
      const [, key, value] = topLevelMatch;
      topLevelFields[normalizeFieldKey(key)] = value.trim();
    }
  }

  const elementInfo = splitElementInfo(topLevelFields.elements);

  return {
    inputFile: topLevelFields.input_file ?? headerFields.input,
    caseId: topLevelFields.case_id ?? headerFields.case,
    problemType: topLevelFields.problem_type,
    coordinateSystem: topLevelFields.coordinate_system,
    meshType: topLevelFields.mesh_type,
    meshDimension: parseOptionalNumber(topLevelFields.mesh_dimension),
    elements: elementInfo.count,
    elementType: elementInfo.type,
    nodes: parseOptionalNumber(topLevelFields.nodes),
    primaryVariableCount: parseOptionalNumber(topLevelFields.primary_variables),
    auxiliaryVariableCount: parseOptionalNumber(topLevelFields.auxiliary_variables),
    functionCount: parseOptionalNumber(topLevelFields.functions),
    auxKernelCount: parseOptionalNumber(topLevelFields.auxkernels),
    kernelCount: parseOptionalNumber(topLevelFields.kernels),
    materialCount: parseOptionalNumber(topLevelFields.materials),
    boundaryConditionCount: parseOptionalNumber(topLevelFields.boundary_conditions),
    postprocessorCount: parseOptionalNumber(topLevelFields.postprocessors),
    outputs: splitWhitespaceTokens(topLevelFields.outputs),
    pairing: splitCommaList(headerFields.pairing),
    discipline: headerFields.discipline,
  };
}

function splitElementInfo(value: string | undefined): { count?: number; type?: string } {
  if (!value) {
    return {};
  }

  const [count, type] = splitWhitespaceTokens(value);
  return {
    count: parseOptionalNumber(count),
    type,
  };
}

function parseOutputBlocks(
  lines: readonly string[],
  warnings: MooseOutputParserWarning[],
): MooseOutputBlock[] {
  const rootBlocks: MutableMooseOutputBlock[] = [];
  const stack: BlockStackEntry[] = [];

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.trim();

    if (line.length === 0) {
      return;
    }

    const blockMatch = BLOCK_OPEN_PATTERN.exec(line);

    if (blockMatch) {
      const blockName = blockMatch[1].trim();

      if (blockName === '') {
        closeBlock(stack, warnings, lineNumber);
        return;
      }

      const parentPath = stack.at(-1)?.block.path ?? ROOT_PATH;
      const block = createBlock(blockName, parentPath);
      const parent = stack.at(-1)?.block;

      if (parent) {
        parent.children.push(block);
      } else {
        rootBlocks.push(block);
      }

      stack.push({ block, line: lineNumber });
      return;
    }

    const assignmentMatch = ASSIGNMENT_PATTERN.exec(line);

    if (!assignmentMatch || stack.length === 0) {
      return;
    }

    const [, key, value] = assignmentMatch;
    const currentBlock = stack.at(-1)?.block;

    if (currentBlock) {
      addBlockParameter(currentBlock.parameters, key, parseOutputValue(value));
    }
  });

  while (stack.length > 0) {
    const dangling = stack.pop();

    if (dangling) {
      warnings.push({
        line: dangling.line,
        message: `Block [${dangling.block.path}] was not explicitly closed.`,
      });
    }
  }

  return rootBlocks.map(freezeBlock);
}

function createBlock(name: string, parentPath: string): MutableMooseOutputBlock {
  return {
    name,
    path: parentPath === ROOT_PATH ? name : `${parentPath}/${name}`,
    parameters: {},
    children: [],
  };
}

function closeBlock(
  stack: BlockStackEntry[],
  warnings: MooseOutputParserWarning[],
  lineNumber: number,
): void {
  const closed = stack.pop();

  if (!closed) {
    warnings.push({
      line: lineNumber,
      message: 'Encountered a closing [] without a matching open block.',
    });
  }
}

function addBlockParameter(
  parameters: Record<string, MooseOutputScalarValue | MooseOutputScalarValue[]>,
  key: string,
  value: MooseOutputScalarValue | MooseOutputScalarValue[],
): void {
  const existing = parameters[key];

  if (existing === undefined) {
    parameters[key] = value;
    return;
  }

  parameters[key] = [...asArray(existing), ...asArray(value)];
}

function freezeBlock(block: MutableMooseOutputBlock): MooseOutputBlock {
  return {
    name: block.name,
    path: block.path,
    parameters: Object.freeze({ ...block.parameters }),
    children: Object.freeze(block.children.map(freezeBlock)),
  };
}

function parseSections(lines: readonly string[]): SectionRange[] {
  const sections: SectionRange[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!SECTION_RULE.test(lines[index].trim())) {
      continue;
    }

    const titleLine = lines[index + 1]?.trim();
    const closingRule = lines[index + 2]?.trim();

    if (!titleLine || !SECTION_RULE.test(closingRule ?? '')) {
      continue;
    }

    const contentStart = index + 3;
    let contentEnd = lines.length;

    for (let cursor = contentStart; cursor < lines.length; cursor += 1) {
      if (SECTION_RULE.test(lines[cursor].trim())) {
        contentEnd = cursor;
        break;
      }
    }

    sections.push({
      title: titleLine,
      startLine: contentStart + 1,
      endLine: contentEnd,
      lines: lines.slice(contentStart, contentEnd),
    });
  }

  return sections;
}

function parseTransientSolveLog(
  sections: readonly SectionRange[],
  warnings: MooseOutputParserWarning[],
): MooseTransientSolveStep[] {
  const section = findSection(sections, 'Transient solve log');

  if (!section) {
    return [];
  }

  return section.lines.flatMap((rawLine, index) => {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith('time_step')) {
      return [];
    }

    const tokens = splitWhitespaceTokens(line);

    if (tokens.length < 6 || !INTEGER_PATTERN.test(tokens[0]) || !NUMBER_PATTERN.test(tokens[1])) {
      warnings.push({
        line: section.startLine + index,
        message: `Ignored malformed transient solve row: ${line}`,
      });
      return [];
    }

    return [
      {
        step: Number(tokens[0]),
        time: Number(tokens[1]),
        dt: parseDashableNumber(tokens[2]),
        nonlinearIterations: parseDashableNumber(tokens[3]),
        linearIterations: parseDashableNumber(tokens[4]),
        status: tokens.slice(5).join(' '),
      },
    ];
  });
}

function parseCsvTables(
  sections: readonly SectionRange[],
  warnings: MooseOutputParserWarning[],
): MooseCsvTable[] {
  return sections.flatMap((section) => {
    const csvLines = section.lines
      .map((line, index) => ({ line: line.trim(), lineNumber: section.startLine + index }))
      .filter((entry) => entry.line.length > 0);

    const header = csvLines.find((entry) => entry.line.includes(','));

    if (!header) {
      return [];
    }

    const columns = splitCsvLine(header.line);

    if (columns.length === 0) {
      return [];
    }

    const rows = csvLines
      .filter((entry) => entry.lineNumber > header.lineNumber && entry.line.includes(','))
      .flatMap((entry) => parseCsvRow(section.title, columns, entry.line, entry.lineNumber, warnings));

    return [
      {
        name: section.title,
        columns,
        rows,
      },
    ];
  });
}

function parseCsvRow(
  tableName: string,
  columns: readonly string[],
  line: string,
  lineNumber: number,
  warnings: MooseOutputParserWarning[],
): MooseCsvRow[] {
  const cells = splitCsvLine(line);

  if (cells.length !== columns.length) {
    warnings.push({
      line: lineNumber,
      message: `Ignored malformed ${tableName} CSV row: expected ${columns.length} cells, found ${cells.length}.`,
    });
    return [];
  }

  return [
    {
      values: Object.fromEntries(
        columns.map((column, index) => [column, parseCsvCellValue(cells[index])]),
      ),
    },
  ];
}

function parseCsvCellValue(rawValue: string): MooseOutputScalarValue {
  const value = rawValue.trim();

  if (value.length === 0) {
    return '';
  }

  if (isQuoted(value)) {
    return value.slice(1, -1).trim();
  }

  return parseScalarToken(value);
}

function splitCsvLine(line: string): string[] {
  return line.split(',').map((cell) => cell.trim());
}

function parseKeyValueSections(sections: readonly SectionRange[]): MooseKeyValueSection[] {
  return sections.flatMap((section) => {
    const values: Record<string, MooseOutputScalarValue> = {};

    for (const rawLine of section.lines) {
      const line = rawLine.trim();
      const assignmentMatch = ASSIGNMENT_PATTERN.exec(line);

      if (!assignmentMatch) {
        continue;
      }

      const [, key, value] = assignmentMatch;
      const parsedValue = parseOutputValue(value);

      if (!Array.isArray(parsedValue)) {
        values[key] = parsedValue;
      }
    }

    return Object.keys(values).length > 0
      ? [
          {
            name: section.title,
            values,
          },
        ]
      : [];
  });
}

function parseNamedKeyValueSection(
  sections: readonly MooseKeyValueSection[],
  name: string,
): Record<string, MooseOutputScalarValue> {
  return sections.find((section) => section.name === name)?.values ?? {};
}

function groupAppSummaryByPanel(
  values: Record<string, MooseOutputScalarValue>,
): Record<string, Record<string, MooseOutputScalarValue>> {
  const grouped: Record<string, Record<string, MooseOutputScalarValue>> = {};

  for (const [key, value] of Object.entries(values)) {
    const [panel, metric] = key.split('.', 2);

    if (!panel || !metric) {
      continue;
    }

    grouped[panel] ??= {};
    grouped[panel][metric] = value;
  }

  return grouped;
}

function toValidationSummary(block: MooseOutputBlock | undefined): MooseValidationSummary {
  const warnings = getStringList(block?.parameters ?? {}, 'warning');

  return {
    status: getString(block?.parameters ?? {}, 'status'),
    warnings,
    parameters: block?.parameters ?? {},
  };
}

function toMeshSummary(block: MooseOutputBlock): MooseMeshOutputSummary {
  return {
    dimension: getNumber(block.parameters, 'dim'),
    coordinateSystem: getString(block.parameters, 'coordinate_system'),
    xmin: getNumber(block.parameters, 'xmin'),
    xmax: getNumber(block.parameters, 'xmax'),
    ymin: getNumber(block.parameters, 'ymin'),
    ymax: getNumber(block.parameters, 'ymax'),
    nx: getNumber(block.parameters, 'nx'),
    ny: getNumber(block.parameters, 'ny'),
    elementType: getString(block.parameters, 'elem_type'),
    activeElements: getNumber(block.parameters, 'active_elements'),
    activeNodes: getNumber(block.parameters, 'active_nodes'),
    parameters: block.parameters,
  };
}

function toVariableSummary(block: MooseOutputBlock | undefined): MooseVariableOutputSummary {
  return {
    primary: getStringList(block?.parameters ?? {}, 'primary'),
    auxiliary: getStringList(block?.parameters ?? {}, 'auxiliary'),
  };
}

function toExecutionerSummary(block: MooseOutputBlock): MooseExecutionerOutputSummary {
  return {
    type: getString(block.parameters, 'type'),
    scheme: getString(block.parameters, 'scheme'),
    solveType: getString(block.parameters, 'solve_type'),
    dtInitial: getNumber(block.parameters, 'dt_initial'),
    dtMax: getNumber(block.parameters, 'dt_max'),
    endTime: getNumber(block.parameters, 'end_time'),
    nonlinearAbsoluteTolerance: getNumber(block.parameters, 'nl_abs_tol'),
    nonlinearRelativeTolerance: getNumber(block.parameters, 'nl_rel_tol'),
    linearTolerance: getNumber(block.parameters, 'l_tol'),
    parameters: block.parameters,
  };
}

function parseCrossLinks(blocks: readonly MooseOutputBlock[]): MooseCrossLinkEcho {
  const crossLinkBlocks = flattenBlocks(blocks).filter((block) => block.path.startsWith('CrossLinks/'));
  const mcnpInputs = new Set<string>();
  const rocetsInputs = new Set<string>();
  const importedProxies = new Set<string>();
  const architectureLinks: Record<string, string> = {};

  for (const block of crossLinkBlocks) {
    for (const [key, value] of Object.entries(block.parameters)) {
      const values = getValueStrings(value);

      if (/mcnp/i.test(key)) {
        values.forEach((item) => mcnpInputs.add(item));
      }

      if (/rocets?/i.test(key)) {
        values.forEach((item) => rocetsInputs.add(item));
      }

      if (/imported|proxy|cross/i.test(key)) {
        values.forEach((item) => importedProxies.add(item));
      }

      architectureLinks[key] = values.join(' ');
    }
  }

  return {
    mcnpInputs: [...mcnpInputs],
    rocetsInputs: [...rocetsInputs],
    importedProxies: [...importedProxies],
    architectureLinks,
    blocks: crossLinkBlocks,
  };
}

function parsePerformanceSummary(sections: readonly MooseKeyValueSection[]): MoosePerformanceSummary {
  const values = parseNamedKeyValueSection(sections, 'Performance summary');

  return {
    totalNonlinearIterations: getRecordNumber(values, 'Total nonlinear iterations'),
    totalLinearIterations: getRecordNumber(values, 'Total linear iterations'),
    averageNonlinearIterationsPerStep: getRecordNumber(values, 'Average nonlinear iterations per step'),
    averageLinearIterationsPerStep: getRecordNumber(values, 'Average linear iterations per step'),
    finalTime: getRecordNumber(values, 'Final time'),
    finalDt: getRecordNumber(values, 'Final dt'),
    solveStatus: getRecordString(values, 'Solve status'),
    fixtureStatus: getRecordString(values, 'Fixture status'),
    values,
  };
}

function findSection(
  sections: readonly SectionRange[],
  title: string,
): SectionRange | undefined {
  return sections.find((section) => section.title === title);
}

function findTable(
  tables: readonly MooseCsvTable[],
  name: string,
): MooseCsvTable | undefined {
  return tables.find((table) => table.name === name);
}

function findFirstRootBlock(
  blocks: readonly MooseOutputBlock[],
  name: string,
): MooseOutputBlock | undefined {
  return blocks.find((block) => block.name === name);
}

function flattenBlocks(blocks: readonly MooseOutputBlock[]): MooseOutputBlock[] {
  return blocks.flatMap((block) => [block, ...flattenBlocks(block.children)]);
}

function parseOutputValue(rawValue: string): MooseOutputScalarValue | MooseOutputScalarValue[] {
  const value = rawValue.trim();

  if (value.length === 0) {
    return '';
  }

  if (isQuoted(value)) {
    const unquoted = value.slice(1, -1).trim();
    const tokens = splitWhitespaceTokens(unquoted);

    if (tokens.length > 1 && tokens.every(isScalarToken)) {
      return tokens.map(parseScalarToken);
    }

    return unquoted;
  }

  if (value.includes(' ')) {
    const tokens = splitWhitespaceTokens(value);

    if (tokens.length > 1 && tokens.every(isScalarToken)) {
      return tokens.map(parseScalarToken);
    }
  }

  return parseScalarToken(value);
}

function parseScalarToken(token: string): MooseOutputScalarValue {
  if (/^true$/i.test(token)) {
    return true;
  }

  if (/^false$/i.test(token)) {
    return false;
  }

  if (NUMBER_PATTERN.test(token)) {
    return Number(token);
  }

  return token;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value || !NUMBER_PATTERN.test(value.trim())) {
    return undefined;
  }

  return Number(value);
}

function parseDashableNumber(value: string | undefined): number | undefined {
  if (!value || value === '----' || !NUMBER_PATTERN.test(value)) {
    return undefined;
  }

  return Number(value);
}

function isQuoted(value: string): boolean {
  return (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  );
}

function isScalarToken(token: string): boolean {
  return /^(?:true|false)$/i.test(token) || NUMBER_PATTERN.test(token) || token.length > 0;
}

function splitWhitespaceTokens(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value.split(/\s+/).filter(Boolean);
}

function splitCommaList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeFieldKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

function getNumber(
  parameters: Record<string, MooseOutputScalarValue | MooseOutputScalarValue[]>,
  key: string,
): number | undefined {
  const value = parameters[key];

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && NUMBER_PATTERN.test(value)) {
    return Number(value);
  }

  return undefined;
}

function getString(
  parameters: Record<string, MooseOutputScalarValue | MooseOutputScalarValue[]>,
  key: string,
): string | undefined {
  const value = parameters[key];

  if (Array.isArray(value)) {
    return value.map(String).join(' ');
  }

  if (value === undefined) {
    return undefined;
  }

  return String(value);
}

function getStringList(
  parameters: Record<string, MooseOutputScalarValue | MooseOutputScalarValue[]>,
  key: string,
): string[] {
  const value = parameters[key];

  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === 'string') {
    return splitWhitespaceTokens(value);
  }

  if (value === undefined) {
    return [];
  }

  return [String(value)];
}

function getRecordNumber(
  values: Record<string, MooseOutputScalarValue>,
  key: string,
): number | undefined {
  const value = values[key];
  return typeof value === 'number' ? value : undefined;
}

function getRecordString(
  values: Record<string, MooseOutputScalarValue>,
  key: string,
): string | undefined {
  const value = values[key];
  return value === undefined ? undefined : String(value);
}

function getValueStrings(value: MooseOutputScalarValue | MooseOutputScalarValue[]): string[] {
  return asArray(value).map(String);
}

function asArray(
  value: MooseOutputScalarValue | MooseOutputScalarValue[],
): MooseOutputScalarValue[] {
  return Array.isArray(value) ? value : [value];
}