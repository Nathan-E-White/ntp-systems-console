

export type ParserFamily = "mcnp" | "moose" | "rocets";

export type ParserDirection = "input" | "output";

export type ParserStatus = "unparsed" | "parsed" | "unsupported" | "error";

export type ParserSeverity = "info" | "warning" | "error";

export type ParsedScalarValue = string | number | boolean | null;

export type ParsedRecordValue =
  | ParsedScalarValue
  | ParsedScalarValue[]
  | Record<string, ParsedScalarValue | ParsedScalarValue[]>;

export interface SourceLocation {
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
}

export interface ParserDetectionContext {
  filename?: string;
  extension?: string;
  text: string;
}

export interface ParserDiagnostic {
  id?: string;
  severity: ParserSeverity;
  message: string;
  source?: string;
  location?: SourceLocation;
  hint?: string;
}

export interface ParserDescriptor<TParsed = unknown> {
  family: ParserFamily;
  direction: ParserDirection;
  displayName: string;
  extensions: string[];
  detect: (context: ParserDetectionContext) => boolean;
  parse: (text: string) => TParsed;
  summarize?: (parsed: TParsed) => Record<string, ParsedRecordValue>;
}

export interface ParserSuccess<TParsed = unknown> {
  status: "parsed";
  descriptor: ParserDescriptor<TParsed>;
  parsed: TParsed;
  diagnostics: ParserDiagnostic[];
}

export interface ParserUnsupported {
  status: "unsupported";
  diagnostics: ParserDiagnostic[];
}

export interface ParserFailure {
  status: "error";
  descriptor?: ParserDescriptor;
  error: string;
  diagnostics: ParserDiagnostic[];
}

export type ParserExecutionResult<TParsed = unknown> =
  | ParserSuccess<TParsed>
  | ParserUnsupported
  | ParserFailure;

export interface ParsedSummaryCard {
  id: string;
  label: string;
  value: ParsedScalarValue;
  unit?: string;
  description?: string;
  severity?: ParserSeverity;
}

export interface ParsedSection {
  id: string;
  title: string;
  description?: string;
  records: Record<string, ParsedRecordValue>[];
}

export interface ParsedTableColumn {
  id: string;
  label: string;
  unit?: string;
  align?: "left" | "center" | "right";
}

export interface ParsedTable {
  id: string;
  title: string;
  description?: string;
  columns: ParsedTableColumn[];
  rows: Record<string, ParsedRecordValue>[];
}

export interface ParsedTimeSeriesPoint {
  time: number;
  values: Record<string, number | null>;
}

export interface ParsedTimeSeries {
  id: string;
  title: string;
  timeUnit?: string;
  valueUnits?: Record<string, string>;
  points: ParsedTimeSeriesPoint[];
}

export interface ParsedGraphNode {
  id: string;
  label: string;
  family?: ParserFamily;
  group?: string;
  metadata?: Record<string, ParsedRecordValue>;
}

export interface ParsedGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  metadata?: Record<string, ParsedRecordValue>;
}

export interface ParsedGraphModel {
  nodes: ParsedGraphNode[];
  edges: ParsedGraphEdge[];
}

export type ParsedRelationshipKind =
  | "imports_geometry_from"
  | "imports_mass_flow_from"
  | "shares_case_id"
  | "coupled_stability_link"
  | "references_file"
  | "unknown_reference";

export interface ParsedCrossLink {
  id: string;
  sourceArtifactId?: string;
  targetArtifactId?: string;
  targetFilename?: string;
  relationship: ParsedRelationshipKind;
  label?: string;
  description?: string;
}

export interface ParsedDomainSlice {
  summaryCards?: ParsedSummaryCard[];
  diagnostics?: ParserDiagnostic[];
  sections?: ParsedSection[];
  tables?: ParsedTable[];
  timeSeries?: ParsedTimeSeries[];
}

export interface ParsedDomainSlices {
  neutronics?: ParsedDomainSlice;
  thermal?: ParsedDomainSlice;
  propulsion?: ParsedDomainSlice;
  materials?: ParsedDomainSlice;
  structures?: ParsedDomainSlice;
  stability?: ParsedDomainSlice;
}

export interface ParsedFileViewModel<TParsed = unknown> {
  id: string;
  filename: string;
  family: ParserFamily;
  direction: ParserDirection;
  displayName: string;
  title?: string;
  caseId?: string;
  status?: string;
  summaryCards: ParsedSummaryCard[];
  diagnostics: ParserDiagnostic[];
  sections: ParsedSection[];
  tables: ParsedTable[];
  timeSeries: ParsedTimeSeries[];
  graph?: ParsedGraphModel;
  crossLinks: ParsedCrossLink[];
  domainSlices: ParsedDomainSlices;
  rawParsed: TParsed;
}

export interface FileArtifact<TParsed = unknown> {
  id: string;
  filename: string;
  text: string;
  parserStatus: ParserStatus;
  parsed?: ParsedFileViewModel<TParsed>;
  diagnostics: ParserDiagnostic[];
  error?: string;
}

export interface ParsedFileRelationship {
  sourceArtifactId: string;
  targetArtifactId?: string;
  targetFilename?: string;
  relationship: ParsedRelationshipKind;
  label?: string;
  description?: string;
}

export interface ParsedNtpProject {
  artifacts: ParsedFileViewModel[];
  relationships: ParsedFileRelationship[];
  aggregateSummary: ParsedSummaryCard[];
  diagnostics: ParserDiagnostic[];
}