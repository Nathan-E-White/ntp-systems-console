export interface BisonInputVariable {
  readonly name: string;
  readonly kind: "primary" | "auxiliary";
  readonly family?: string;
  readonly order?: string;
  readonly initialCondition?: number;
  readonly line: number;
}

export interface BisonInputFunction {
  readonly name: string;
  readonly type?: string;
  readonly x: readonly number[];
  readonly y: readonly number[];
  readonly line: number;
}

export interface BisonInputMetadata {
  readonly inputFile?: string;
  readonly meshPosture?: string;
  readonly sourceContext: readonly string[];
  readonly validationStatus?: string;
}

export interface BisonInputParseResult {
  readonly metadata: BisonInputMetadata;
  readonly problem: Record<string, string | number>;
  readonly mesh: Record<string, string | number>;
  readonly variables: readonly BisonInputVariable[];
  readonly functions: readonly BisonInputFunction[];
  readonly warnings: readonly {line: number; message: string}[];
}

interface MutableVariable {
  name: string;
  kind: "primary" | "auxiliary";
  family?: string;
  order?: string;
  initialCondition?: number;
  line: number;
}

interface MutableFunction {
  name: string;
  type?: string;
  x: number[];
  y: number[];
  line: number;
}

const BLOCK_OPEN_PATTERN = /^\s*\[([^\]]*)]\s*$/;
const ASSIGNMENT_PATTERN = /^\s*([A-Za-z0-9_./:-]+)\s*=\s*(.*?)\s*$/;
const NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[Ee][+-]?\d+)?$/;

export function parseBisonInput(input: string): BisonInputParseResult {
  const lines = normalizeLines(input);
  const stack: string[] = [];
  const problem: Record<string, string | number> = {};
  const mesh: Record<string, string | number> = {};
  const variables: MutableVariable[] = [];
  const functions: MutableFunction[] = [];
  const warnings: {line: number; message: string}[] = [];
  const sourceContext = new Set<string>();
  let inputFile: string | undefined;
  let meshPosture: string | undefined;
  let validationStatus: string | undefined;

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const lineNumber = index + 1;
    const fileMatch = rawLine.match(/#\s*File:\s*(.+)$/);
    const meshMatch = rawLine.match(/#\s*Mesh posture:\s*(.+)$/);

    if (fileMatch) inputFile = fileMatch[1].trim();
    if (meshMatch) meshPosture = meshMatch[1].trim();
    if (/not a validated bison model/i.test(rawLine)) {
      validationStatus = "not_validated";
    }
    for (const sourceFile of rawLine.matchAll(/\bntp[._][A-Za-z0-9_.-]+\b/g)) {
      sourceContext.add(sourceFile[0]);
    }

    const blockMatch = line.match(BLOCK_OPEN_PATTERN);
    if (blockMatch) {
      const blockName = blockMatch[1].trim();
      if (blockName === "") {
        stack.pop();
        return;
      }
      stack.push(blockName);
      if (stack[0] === "Variables" && stack.length === 2) {
        variables.push({name: blockName, kind: "primary", line: lineNumber});
      } else if (stack[0] === "AuxVariables" && stack.length === 2) {
        variables.push({name: blockName, kind: "auxiliary", line: lineNumber});
      } else if (stack[0] === "Functions" && stack.length === 2) {
        functions.push({name: blockName, x: [], y: [], line: lineNumber});
      }
      return;
    }

    const assignmentMatch = line.match(ASSIGNMENT_PATTERN);
    if (!assignmentMatch) return;

    const key = assignmentMatch[1];
    const value = parseValue(assignmentMatch[2]);
    const root = stack[0];
    const child = stack[1];

    if (root === "Problem" && stack.length === 1) {
      problem[key] = value;
      return;
    }
    if (root === "Mesh" && stack.length === 1) {
      mesh[key] = value;
      return;
    }
    if ((root === "Variables" || root === "AuxVariables") && child) {
      const variable = variables.at(-1);
      if (!variable || variable.name !== child) return;
      if (key === "family") variable.family = String(value);
      if (key === "order") variable.order = String(value);
      if (key === "initial_condition" && typeof value === "number") variable.initialCondition = value;
      return;
    }
    if (root === "Functions" && child) {
      const fn = functions.at(-1);
      if (!fn || fn.name !== child) return;
      if (key === "type") fn.type = String(value);
      if (key === "x") fn.x = parseNumberList(assignmentMatch[2]);
      if (key === "y") fn.y = parseNumberList(assignmentMatch[2]);
    }
  });

  if (variables.length === 0) {
    warnings.push({line: 1, message: "No BISON variables were detected."});
  }
  if (functions.length === 0) {
    warnings.push({line: 1, message: "No BISON schedule functions were detected."});
  }

  return {
    metadata: {
      inputFile,
      meshPosture,
      sourceContext: Array.from(sourceContext),
      validationStatus,
    },
    problem,
    mesh,
    variables,
    functions,
    warnings,
  };
}

function normalizeLines(text: string): string[] {
  return text.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
}

function parseValue(value: string): string | number {
  const stripped = value.trim().replace(/^['"]|['"]$/g, "");
  return NUMBER_PATTERN.test(stripped) ? Number(stripped) : stripped;
}

function parseNumberList(value: string): number[] {
  return value
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .split(/\s+/)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry));
}
