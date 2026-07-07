

export type MooseScalarValue = string | number | boolean;

export type MooseParameterValue = MooseScalarValue | MooseScalarValue[];

export interface MooseParameterMap {
  readonly [name: string]: MooseParameterValue;
}

export interface MooseInputBlock {
  readonly name: string;
  readonly path: string;
  readonly parameters: MooseParameterMap;
  readonly children: readonly MooseInputBlock[];
}

export interface MooseNamedObject {
  readonly name: string;
  readonly type?: string;
  readonly parameters: MooseParameterMap;
}

export interface MooseVariable extends MooseNamedObject {
  readonly initialCondition?: number;
  readonly family?: string;
  readonly order?: string;
}

export interface MooseFunction extends MooseNamedObject {
  readonly x?: number[];
  readonly y?: number[];
  readonly expression?: string;
}

export interface MooseMaterial extends MooseNamedObject {
  readonly blockNames: string[];
  readonly propertyName?: string;
  readonly expression?: string;
  readonly coupledVariables: string[];
}

export interface MooseBoundaryCondition extends MooseNamedObject {
  readonly variable?: string;
  readonly boundaryNames: string[];
}

export interface MoosePostprocessor extends MooseNamedObject {
  readonly variable?: string;
  readonly blockNames: string[];
  readonly boundaryNames: string[];
  readonly executeOn: string[];
}

export interface MooseKernel extends MooseNamedObject {
  readonly variable?: string;
  readonly functionName?: string;
}

export interface MooseExecutionerSummary {
  readonly type?: string;
  readonly scheme?: string;
  readonly solveType?: string;
  readonly endTime?: number;
  readonly dtInitial?: number;
  readonly dtMax?: number;
  readonly nonlinearAbsoluteTolerance?: number;
  readonly nonlinearRelativeTolerance?: number;
  readonly linearTolerance?: number;
  readonly parameters: MooseParameterMap;
}

export interface MooseMeshSummary {
  readonly type?: string;
  readonly dimension?: number;
  readonly coordinateSystem?: string;
  readonly nx?: number;
  readonly ny?: number;
  readonly xmin?: number;
  readonly xmax?: number;
  readonly ymin?: number;
  readonly ymax?: number;
  readonly elementType?: string;
  readonly parameters: MooseParameterMap;
}

export interface MooseInputMetadata {
  readonly file?: string;
  readonly caseId?: string;
  readonly family?: string;
  readonly discipline?: string;
  readonly agencies?: string;
  readonly pairing: string[];
  readonly scope: string[];
  readonly verificationStatus: string[];
}

export interface MooseCrossLinks {
  readonly mcnpInputs: string[];
  readonly rocetsInputs: string[];
  readonly importedProxies: string[];
  readonly architectureLinks: Record<string, string>;
}

export interface MooseParserWarning {
  readonly line: number;
  readonly message: string;
}

export interface MooseInputParseResult {
  readonly metadata: MooseInputMetadata;
  readonly rootBlocks: MooseInputBlock[];
  readonly problem?: MooseNamedObject;
  readonly mesh?: MooseMeshSummary;
  readonly executioner?: MooseExecutionerSummary;
  readonly variables: MooseVariable[];
  readonly auxiliaryVariables: MooseVariable[];
  readonly functions: MooseFunction[];
  readonly auxKernels: MooseKernel[];
  readonly kernels: MooseKernel[];
  readonly materials: MooseMaterial[];
  readonly boundaryConditions: MooseBoundaryCondition[];
  readonly postprocessors: MoosePostprocessor[];
  readonly outputs: MooseNamedObject[];
  readonly crossLinks: MooseCrossLinks;
  readonly warnings: MooseParserWarning[];
}

interface MutableMooseInputBlock {
  name: string;
  path: string;
  parameters: Record<string, MooseParameterValue>;
  children: MutableMooseInputBlock[];
}

interface BlockStackEntry {
  readonly block: MutableMooseInputBlock;
  readonly line: number;
}

const ROOT_PATH = '';
const COMMENT_PREFIX = '#';
const BLOCK_OPEN_PATTERN = /^\[([^\]]+)]\s*$/;
const ASSIGNMENT_PATTERN = /^([A-Za-z0-9_./:-]+)\s*=\s*(.*)$/;
const METADATA_FIELD_PATTERN = /^#\s*([A-Za-z][A-Za-z\s/-]*?):\s*(.*)$/;

export function parseMooseInput(input: string): MooseInputParseResult {
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const warnings: MooseParserWarning[] = [];
  const rootBlocks = parseBlocks(lines, warnings);
  const metadata = parseMetadata(lines);

  const problemBlock = findFirstRootBlock(rootBlocks, 'Problem');
  const meshBlock = findFirstRootBlock(rootBlocks, 'Mesh');
  const executionerBlock = findFirstRootBlock(rootBlocks, 'Executioner');

  return {
    metadata,
    rootBlocks,
    problem: problemBlock ? toNamedObject(problemBlock) : undefined,
    mesh: meshBlock ? toMeshSummary(meshBlock) : undefined,
    executioner: executionerBlock ? toExecutionerSummary(executionerBlock) : undefined,
    variables: parseVariables(findFirstRootBlock(rootBlocks, 'Variables')),
    auxiliaryVariables: parseVariables(findFirstRootBlock(rootBlocks, 'AuxVariables')),
    functions: parseFunctions(findFirstRootBlock(rootBlocks, 'Functions')),
    auxKernels: parseKernels(findFirstRootBlock(rootBlocks, 'AuxKernels')),
    kernels: parseKernels(findFirstRootBlock(rootBlocks, 'Kernels')),
    materials: parseMaterials(findFirstRootBlock(rootBlocks, 'Materials')),
    boundaryConditions: parseBoundaryConditions(findFirstRootBlock(rootBlocks, 'BCs')),
    postprocessors: parsePostprocessors(findFirstRootBlock(rootBlocks, 'Postprocessors')),
    outputs: parseNamedChildren(findFirstRootBlock(rootBlocks, 'Outputs')),
    crossLinks: parseCrossLinks(rootBlocks),
    warnings,
  };
}

export function parseMooseInputBlocks(input: string): MooseInputBlock[] {
  return parseMooseInput(input).rootBlocks;
}

function parseBlocks(
  lines: readonly string[],
  warnings: MooseParserWarning[],
): MooseInputBlock[] {
  const rootBlocks: MutableMooseInputBlock[] = [];
  const stack: BlockStackEntry[] = [];

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = stripInlineComment(rawLine).trim();

    if (line.length === 0 || line.startsWith(COMMENT_PREFIX)) {
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
    if (assignmentMatch) {
      const currentBlock = stack.at(-1)?.block;

      if (!currentBlock) {
        warnings.push({
          line: lineNumber,
          message: `Ignored assignment outside a MOOSE block: ${line}`,
        });
        return;
      }

      const [, key, value] = assignmentMatch;
      currentBlock.parameters[key] = parseMooseValue(value);
      return;
    }

    warnings.push({
      line: lineNumber,
      message: `Ignored unrecognized MOOSE input line: ${line}`,
    });
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

function createBlock(name: string, parentPath: string): MutableMooseInputBlock {
  const path = parentPath === ROOT_PATH ? name : `${parentPath}/${name}`;

  return {
    name,
    path,
    parameters: {},
    children: [],
  };
}

function closeBlock(
  stack: BlockStackEntry[],
  warnings: MooseParserWarning[],
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

function freezeBlock(block: MutableMooseInputBlock): MooseInputBlock {
  return {
    name: block.name,
    path: block.path,
    parameters: Object.freeze({ ...block.parameters }),
    children: Object.freeze(block.children.map(freezeBlock)),
  };
}

function stripInlineComment(rawLine: string): string {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < rawLine.length; index += 1) {
    const char = rawLine[index];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    }

    if (char === COMMENT_PREFIX && !inSingleQuote && !inDoubleQuote) {
      return rawLine.slice(0, index);
    }
  }

  return rawLine;
}

function parseMooseValue(rawValue: string): MooseParameterValue {
  const value = rawValue.trim();

  if (isQuoted(value)) {
    const unquoted = value.slice(1, -1).trim();
    const tokens = splitWhitespaceTokens(unquoted);

    if (tokens.length > 1 && tokens.every(isScalarToken)) {
      return tokens.map(parseScalarToken);
    }

    return unquoted;
  }

  if (value.includes(' ')) {
    return splitWhitespaceTokens(value).map(parseScalarToken);
  }

  return parseScalarToken(value);
}

function isQuoted(value: string): boolean {
  return (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  );
}

function splitWhitespaceTokens(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

function isScalarToken(token: string): boolean {
  return /^(?:true|false)$/i.test(token) || isFiniteNumberToken(token) || token.length > 0;
}

function parseScalarToken(token: string): MooseScalarValue {
  if (/^true$/i.test(token)) {
    return true;
  }

  if (/^false$/i.test(token)) {
    return false;
  }

  if (isFiniteNumberToken(token)) {
    return Number(token);
  }

  return token;
}

function isFiniteNumberToken(token: string): boolean {
  return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[Ee][+-]?\d+)?$/.test(token);
}

function parseMetadata(lines: readonly string[]): MooseInputMetadata {
  const fields: Record<string, string> = {};
  const scope: string[] = [];
  const verificationStatus: string[] = [];
  let activeList: 'scope' | 'verification' | undefined;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const fieldMatch = METADATA_FIELD_PATTERN.exec(line);

    if (fieldMatch) {
      activeList = undefined;
      const [, rawKey, rawValue] = fieldMatch;
      const key = normalizeMetadataKey(rawKey);
      fields[key] = rawValue.trim();
      continue;
    }

    const normalizedComment = line.replace(/^#\s?/, '').trim();

    if (/^Scope represented$/i.test(normalizedComment)) {
      activeList = 'scope';
      continue;
    }

    if (/^Verification status$/i.test(normalizedComment)) {
      activeList = 'verification';
      continue;
    }

    if (normalizedComment.startsWith('- ') && activeList === 'scope') {
      scope.push(normalizedComment.slice(2).trim());
      continue;
    }

    if (activeList === 'verification' && normalizedComment.length > 0) {
      verificationStatus.push(normalizedComment);
    }
  }

  return {
    file: fields.file,
    caseId: fields.case_id,
    family: fields.family,
    discipline: fields.discipline,
    agencies: fields.agencies,
    pairing: splitListField(fields.pairing),
    scope,
    verificationStatus,
  };
}

function normalizeMetadataKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

function splitListField(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function findFirstRootBlock(
  blocks: readonly MooseInputBlock[],
  name: string,
): MooseInputBlock | undefined {
  return blocks.find((block) => block.name === name);
}

function parseVariables(block: MooseInputBlock | undefined): MooseVariable[] {
  if (!block) {
    return [];
  }

  return block.children.map((child) => ({
    ...toNamedObject(child),
    initialCondition: getNumber(child.parameters, 'initial_condition'),
    family: getString(child.parameters, 'family'),
    order: getString(child.parameters, 'order'),
  }));
}

function parseFunctions(block: MooseInputBlock | undefined): MooseFunction[] {
  if (!block) {
    return [];
  }

  return block.children.map((child) => ({
    ...toNamedObject(child),
    x: getNumberList(child.parameters, 'x'),
    y: getNumberList(child.parameters, 'y'),
    expression: getString(child.parameters, 'expression'),
  }));
}

function parseKernels(block: MooseInputBlock | undefined): MooseKernel[] {
  return parseNamedChildren(block).map((kernel) => ({
    ...kernel,
    variable: getString(kernel.parameters, 'variable'),
    functionName: getString(kernel.parameters, 'function'),
  }));
}

function parseMaterials(block: MooseInputBlock | undefined): MooseMaterial[] {
  return parseNamedChildren(block).map((material) => ({
    ...material,
    blockNames: getStringList(material.parameters, 'block'),
    propertyName: getString(material.parameters, 'property_name'),
    expression: getString(material.parameters, 'expression'),
    coupledVariables: getStringList(material.parameters, 'coupled_variables'),
  }));
}

function parseBoundaryConditions(
  block: MooseInputBlock | undefined,
): MooseBoundaryCondition[] {
  return parseNamedChildren(block).map((condition) => ({
    ...condition,
    variable: getString(condition.parameters, 'variable'),
    boundaryNames: getStringList(condition.parameters, 'boundary'),
  }));
}

function parsePostprocessors(
  block: MooseInputBlock | undefined,
): MoosePostprocessor[] {
  return parseNamedChildren(block).map((postprocessor) => ({
    ...postprocessor,
    variable: getString(postprocessor.parameters, 'variable'),
    blockNames: getStringList(postprocessor.parameters, 'block'),
    boundaryNames: getStringList(postprocessor.parameters, 'boundary'),
    executeOn: getStringList(postprocessor.parameters, 'execute_on'),
  }));
}

function parseNamedChildren(block: MooseInputBlock | undefined): MooseNamedObject[] {
  if (!block) {
    return [];
  }

  return block.children.map(toNamedObject);
}

function toNamedObject(block: MooseInputBlock): MooseNamedObject {
  return {
    name: block.name,
    type: getString(block.parameters, 'type'),
    parameters: block.parameters,
  };
}

function toMeshSummary(block: MooseInputBlock): MooseMeshSummary {
  return {
    type: getString(block.parameters, 'type'),
    dimension: getNumber(block.parameters, 'dim'),
    coordinateSystem: getString(block.parameters, 'coord_type'),
    nx: getNumber(block.parameters, 'nx'),
    ny: getNumber(block.parameters, 'ny'),
    xmin: getNumber(block.parameters, 'xmin'),
    xmax: getNumber(block.parameters, 'xmax'),
    ymin: getNumber(block.parameters, 'ymin'),
    ymax: getNumber(block.parameters, 'ymax'),
    elementType: getString(block.parameters, 'elem_type'),
    parameters: block.parameters,
  };
}

function toExecutionerSummary(block: MooseInputBlock): MooseExecutionerSummary {
  return {
    type: getString(block.parameters, 'type'),
    scheme: getString(block.parameters, 'scheme'),
    solveType: getString(block.parameters, 'solve_type'),
    endTime: getNumber(block.parameters, 'end_time'),
    dtInitial: getNumber(block.parameters, 'dt_initial'),
    dtMax: getNumber(block.parameters, 'dt_max'),
    nonlinearAbsoluteTolerance: getNumber(block.parameters, 'nl_abs_tol'),
    nonlinearRelativeTolerance: getNumber(block.parameters, 'nl_rel_tol'),
    linearTolerance: getNumber(block.parameters, 'l_tol'),
    parameters: block.parameters,
  };
}

function parseCrossLinks(blocks: readonly MooseInputBlock[]): MooseCrossLinks {
  const mcnpInputs = new Set<string>();
  const rocetsInputs = new Set<string>();
  const importedProxies = new Set<string>();
  const architectureLinks: Record<string, string> = {};

  for (const block of flattenBlocks(blocks)) {
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

      if (block.path.startsWith('CrossLinks/')) {
        architectureLinks[key] = values.join(' ');
      }
    }
  }

  return {
    mcnpInputs: [...mcnpInputs],
    rocetsInputs: [...rocetsInputs],
    importedProxies: [...importedProxies],
    architectureLinks,
  };
}

function flattenBlocks(blocks: readonly MooseInputBlock[]): MooseInputBlock[] {
  return blocks.flatMap((block) => [block, ...flattenBlocks(block.children)]);
}

function getValueStrings(value: MooseParameterValue): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  return [String(value)];
}

function getString(
  parameters: MooseParameterMap,
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

function getNumber(
  parameters: MooseParameterMap,
  key: string,
): number | undefined {
  const value = parameters[key];

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && isFiniteNumberToken(value)) {
    return Number(value);
  }

  return undefined;
}

function getStringList(
  parameters: MooseParameterMap,
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

function getNumberList(
  parameters: MooseParameterMap,
  key: string,
): number[] | undefined {
  const value = parameters[key];

  if (Array.isArray(value)) {
    const numbers = value.filter((item): item is number => typeof item === 'number');
    return numbers.length > 0 ? numbers : undefined;
  }

  if (typeof value === 'number') {
    return [value];
  }

  if (typeof value === 'string') {
    const numbers = splitWhitespaceTokens(value)
      .filter(isFiniteNumberToken)
      .map(Number);

    return numbers.length > 0 ? numbers : undefined;
  }

  return undefined;
}