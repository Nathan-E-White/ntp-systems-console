// === REQUIRES NODE ===
// import { readFile } from 'node:fs/promises'

type PrimitiveParsedValue = string | number | boolean

export type ParsedReferenceKind = 'state' | 'schedule' | 'map'

export type ParsedValue =
    | PrimitiveParsedValue
    | ParsedValue[]
    | { kind: 'reference'; refType: ParsedReferenceKind; path: string }
    | { kind: 'tuple'; entries: Record<string, ParsedValue> }

export interface KeyValueBlock {
    entries: Record<string, ParsedValue>
    line: number
}

export interface FluidDefinition extends KeyValueBlock {
    name: string
}

export interface MissionProfile extends KeyValueBlock {
    name: string
}

export interface GraphicsSpec {
    x?: number
    y?: number
    w?: number
    h?: number
    icon?: string
    color?: string

    [key: string]: ParsedValue | undefined
}

export interface NodeDefinition {
    name: string
    tag?: string
    graphics?: GraphicsSpec
    properties: Record<string, ParsedValue>
    line: number
}

export interface ComponentLikeDefinition extends KeyValueBlock {
    name: string
    componentType?: string
}

export interface ComponentDefinition extends ComponentLikeDefinition {
    tag?: string
    graphics?: GraphicsSpec
}

export interface SensorDefinition extends ComponentLikeDefinition {
    sensorType?: string
    graphics?: GraphicsSpec
}

export interface SolverVariable extends KeyValueBlock {
    name: string
}

export interface SolverResidual extends KeyValueBlock {
    name: string
}

export interface GraphEdge {
    source: string
    sourcePort?: string
    target: string
    targetPort?: string
    properties: Record<string, ParsedValue>
    line: number
}

export interface TableMap {
    name: string
    columns: string[]
    units?: string[]
    rows: Array<Record<string, ParsedValue>>
    line: number
}

export interface ScheduleTable {
    name: string
    columns: string[]
    units?: string[]
    rows: Array<Record<string, ParsedValue>>
    line: number
}

export interface InitialCondition {
    target: string
    properties: Record<string, ParsedValue>
    line: number
}

export interface OutputRequest {
    kind: string
    name?: string
    target?: string
    panel?: string
    properties: Record<string, ParsedValue>
    line: number
}

export interface GraphicsLayout extends KeyValueBlock {
    primaryFlow?: string[]
}

export interface InputMetadata {
    key: string
    value: string
    line: number
}

export type ParseDiagnosticSeverity = 'info' | 'warning' | 'error'

export interface ParseDiagnostic {
    severity: ParseDiagnosticSeverity
    message: string
    line?: number
}

export type ParsedNtpRocetsDeck = {
    caseId: string
    title: string
    units: string

    metadata: Record<string, string>
    timeControl: KeyValueBlock
    solverControl: KeyValueBlock

    fluids: FluidDefinition[]
    missionProfile?: MissionProfile

    nodes: NodeDefinition[]
    boundaries: ComponentLikeDefinition[]
    components: ComponentDefinition[]
    sensors: SensorDefinition[]

    solverVariables: SolverVariable[]
    solverResiduals: SolverResidual[]

    connects: GraphEdge[]
    maps: TableMap[]
    schedules: ScheduleTable[]
    initialConditions: InitialCondition[]
    outputs: OutputRequest[]

    graphicsLayout: GraphicsLayout
    meta: InputMetadata[]
    diagnostics: ParseDiagnostic[]
}


type SourceLine = {
    text: string
    number: number
}

type Block = {
    kind: string
    header: string
    body: SourceLine[]
    line: number
}

const BLOCK_KINDS = new Set([
    'SYSTEM_METADATA',
    'TIME_CONTROL',
    'SOLVER_CONTROL',
    'FLUID',
    'MISSION_PROFILE',
    'BOUNDARY',
    'COMPONENT',
    'SENSOR',
    'SOLVER_VARIABLE',
    'SOLVER_RESIDUAL',
    'MAP',
    'SCHEDULE',
    'GRAPHICS_LAYOUT',
]);


export class RocetFileParser {

    // === REQUIRES NODE ===
    // static async parseFromFilename(fname: string): Promise<ParsedNtpRocetsDeck> {
    //     const text = await readFile(fname, { encoding: 'utf8' })
    //     return RocetFileParser.parseText(text)
    // }

    static async parseFile(file: File): Promise<ParsedNtpRocetsDeck> {
        const text = await file.text()
        return RocetFileParser.parseText(text)
    }

    static parseText(text: string): ParsedNtpRocetsDeck {
        const parser = new RocetFileParser(text)
        return parser.parse()
    }

    private readonly diagnostics: ParseDiagnostic[] = []
    private readonly lines: SourceLine[]
    private index = 0

    private constructor(text: string) {
        this.lines = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n')
            .map((line, index) => ({text: this.stripComment(line).trim(), number: index + 1}))
            .filter((line) => line.text.length > 0)
    }

    private parse(): ParsedNtpRocetsDeck {
        const deck: ParsedNtpRocetsDeck = {
            caseId: '',
            title: '',
            units: '',
            metadata: {},
            timeControl: this.emptyBlock(),
            solverControl: this.emptyBlock(),
            fluids: [],
            nodes: [],
            boundaries: [],
            components: [],
            sensors: [],
            solverVariables: [],
            solverResiduals: [],
            connects: [],
            maps: [],
            schedules: [],
            initialConditions: [],
            outputs: [],
            graphicsLayout: this.emptyGraphicsLayout(),
            meta: [],
            diagnostics: this.diagnostics,
        }

        while (this.index < this.lines.length) {
            const line = this.lines[this.index]
            const firstToken = this.firstToken(line.text)

            if (firstToken === 'END_CASE') {
                this.index += 1
                break
            }

            if (firstToken === 'CASE') {
                deck.caseId = this.parseHeaderRemainder(line.text)
                this.index += 1
                continue
            }

            if (firstToken === 'TITLE') {
                deck.title = this.unquote(this.parseHeaderRemainder(line.text))
                this.index += 1
                continue
            }

            if (firstToken === 'UNITS') {
                deck.units = this.parseHeaderRemainder(line.text)
                this.index += 1
                continue
            }

            if (firstToken === 'NODE') {
                deck.nodes.push(this.parseNode(line))
                this.index += 1
                continue
            }

            if (firstToken === 'CONNECT') {
                deck.connects.push(this.parseConnect(line))
                this.index += 1
                continue
            }

            if (firstToken === 'INITIAL_CONDITION') {
                deck.initialConditions.push(this.parseInitialCondition(line))
                this.index += 1
                continue
            }

            if (firstToken === 'OUTPUT') {
                deck.outputs.push(this.parseOutput(line))
                this.index += 1
                continue
            }

            if (firstToken === 'META') {
                const meta = this.parseMeta(line)
                deck.meta.push(meta)
                deck.metadata[meta.key] = meta.value
                this.index += 1
                continue
            }

            if (BLOCK_KINDS.has(firstToken)) {
                const block = this.collectBlock(line)
                this.applyBlock(deck, block)
                continue
            }

            this.addDiagnostic('warning', `Ignored unrecognized statement: ${line.text}`, line.number)
            this.index += 1
        }

        this.validateRequiredHeader(deck)
        this.validateUniqueNames('node', deck.nodes.map((node) => ({name: node.name, line: node.line})))
        this.validateUniqueNames('component', deck.components.map((component) => ({
            name: component.name,
            line: component.line
        })))
        this.validateUniqueNames('schedule', deck.schedules.map((schedule) => ({
            name: schedule.name,
            line: schedule.line
        })))
        this.validateUniqueNames('map', deck.maps.map((map) => ({name: map.name, line: map.line})))

        return deck
    }

    private applyBlock(deck: ParsedNtpRocetsDeck, block: Block): void {
        switch (block.kind) {
            case 'SYSTEM_METADATA': {
                const parsed = this.parseKeyValueBlock(block)
                for (const [key, value] of Object.entries(parsed.entries)) {
                    deck.metadata[key] = String(value)
                }
                return
            }
            case 'TIME_CONTROL':
                deck.timeControl = this.parseKeyValueBlock(block)
                return
            case 'SOLVER_CONTROL':
                deck.solverControl = this.parseKeyValueBlock(block)
                return
            case 'FLUID':
                deck.fluids.push({...this.parseKeyValueBlock(block), name: this.secondToken(block.header)})
                return
            case 'MISSION_PROFILE':
                deck.missionProfile = {...this.parseKeyValueBlock(block), name: this.secondToken(block.header)}
                return
            case 'BOUNDARY':
                deck.boundaries.push(this.parseComponentLikeBlock(block))
                return
            case 'COMPONENT':
                deck.components.push(this.parseComponentBlock(block))
                return
            case 'SENSOR':
                deck.sensors.push(this.parseSensorBlock(block))
                return
            case 'SOLVER_VARIABLE':
                deck.solverVariables.push({...this.parseKeyValueBlock(block), name: this.secondToken(block.header)})
                return
            case 'SOLVER_RESIDUAL':
                deck.solverResiduals.push({...this.parseKeyValueBlock(block), name: this.secondToken(block.header)})
                return
            case 'MAP':
                deck.maps.push(this.parseTableMap(block))
                return
            case 'SCHEDULE':
                deck.schedules.push(this.parseSchedule(block))
                return
            case 'GRAPHICS_LAYOUT':
                deck.graphicsLayout = this.parseGraphicsLayout(block)
                return
            default:
                this.addDiagnostic('warning', `Ignored unsupported block type: ${block.kind}`, block.line)
        }
    }

    private collectBlock(startLine: SourceLine): Block {
        const kind = this.firstToken(startLine.text)
        const block: Block = {
            kind,
            header: startLine.text,
            body: [],
            line: startLine.number,
        }

        this.index += 1

        while (this.index < this.lines.length) {
            const line = this.lines[this.index]
            if (line.text === 'END') {
                this.index += 1
                return block
            }

            block.body.push(line)
            this.index += 1
        }

        this.addDiagnostic('error', `Missing END for ${kind} block`, startLine.number)
        return block
    }

    private parseKeyValueBlock(block: Block): KeyValueBlock {
        return {
            entries: this.parseKeyValueLines(block.body),
            line: block.line,
        }
    }

    private parseComponentLikeBlock(block: Block): ComponentLikeDefinition {
        const [, name, componentType] = this.tokens(block.header)
        return {
            ...this.parseKeyValueBlock(block),
            name: name ?? '',
            componentType,
        }
    }

    private parseComponentBlock(block: Block): ComponentDefinition {
        const parsed = this.parseComponentLikeBlock(block)
        return {
            ...parsed,
            tag: this.stringValue(parsed.entries.tag),
            graphics: this.graphicsValue(parsed.entries.graphics),
        }
    }

    private parseSensorBlock(block: Block): SensorDefinition {
        const [, name, sensorType] = this.tokens(block.header)
        const parsed = this.parseKeyValueBlock(block)
        return {
            ...parsed,
            name: name ?? '',
            componentType: sensorType,
            sensorType,
            graphics: this.graphicsValue(parsed.entries.graphics),
        }
    }

    private parseNode(line: SourceLine): NodeDefinition {
        const [, name, ...rest] = this.tokens(line.text)
        const properties = this.parseInlineKeyValues(rest.join(' '), line.number)
        return {
            name: name ?? '',
            tag: this.stringValue(properties.tag),
            graphics: this.graphicsValue(properties.graphics),
            properties,
            line: line.number,
        }
    }

    private parseConnect(line: SourceLine): GraphEdge {
        const match = /^CONNECT\s+([^\s]+)\s*->\s*([^\s]+)\s*(.*)$/u.exec(line.text)
        if (!match) {
            this.addDiagnostic('error', `Malformed CONNECT statement: ${line.text}`, line.number)
            return {source: '', target: '', properties: {}, line: line.number}
        }

        const [, source, target, trailing] = match
        const sourcePort = this.portName(source)
        const targetPort = this.portName(target)

        return {
            source: this.componentName(source),
            sourcePort,
            target: this.componentName(target),
            targetPort,
            properties: this.parseInlineKeyValues(trailing, line.number),
            line: line.number,
        }
    }

    private parseInitialCondition(line: SourceLine): InitialCondition {
        const [, target, ...rest] = this.tokens(line.text)
        return {
            target: target ?? '',
            properties: this.parseInlineKeyValues(rest.join(' '), line.number),
            line: line.number,
        }
    }

    private parseOutput(line: SourceLine): OutputRequest {
        const [, kind, ...rest] = this.tokens(line.text)
        const properties = this.parseInlineKeyValues(rest.join(' '), line.number)
        return {
            kind: kind ?? '',
            name: this.stringValue(properties.name),
            target: this.stringValue(properties.target),
            panel: this.stringValue(properties.panel),
            properties,
            line: line.number,
        }
    }

    private parseMeta(line: SourceLine): InputMetadata {
        const raw = line.text.slice('META'.length).trim()
        const equalsIndex = raw.indexOf('=')

        if (equalsIndex < 0) {
            this.addDiagnostic('warning', `Malformed META statement: ${line.text}`, line.number)
            return {key: raw, value: '', line: line.number}
        }

        return {
            key: raw.slice(0, equalsIndex).trim(),
            value: this.unquote(raw.slice(equalsIndex + 1).trim()),
            line: line.number,
        }
    }

    private parseTableMap(block: Block): TableMap {
        const table = this.parseTable(block)
        return {
            name: table.name,
            columns: table.columns,
            units: table.units,
            rows: table.rows,
            line: block.line,
        }
    }

    private parseSchedule(block: Block): ScheduleTable {
        const table = this.parseTable(block)
        return {
            name: table.name,
            columns: table.columns,
            units: table.units,
            rows: table.rows,
            line: block.line,
        }
    }

    private parseTable(block: Block): TableMap {
        const [, name, ...headerRest] = this.tokens(block.header)
        const headerProperties = this.parseInlineKeyValues(headerRest.join(' '), block.line)
        const columns = this.stringListValue(headerProperties.columns)
        const units = this.stringListValue(headerProperties.units)

        if (columns.length === 0) {
            this.addDiagnostic('error', `${block.kind} ${name ?? '<unnamed>'} is missing columns`, block.line)
        }

        const rows = block.body.map((line) => {
            const cells = this.tokens(line.text)
            if (columns.length > 0 && cells.length !== columns.length) {
                this.addDiagnostic(
                    'warning',
                    `${block.kind} ${name ?? '<unnamed>'} row has ${cells.length} cells but ${columns.length} columns`,
                    line.number,
                )
            }

            return columns.reduce<Record<string, ParsedValue>>((row, column, index) => {
                row[column] = this.parseValue(cells[index] ?? '')
                return row
            }, {})
        })

        return {
            name: name ?? '',
            columns,
            units: units.length > 0 ? units : undefined,
            rows,
            line: block.line,
        }
    }

    private parseGraphicsLayout(block: Block): GraphicsLayout {
        const parsed = this.parseKeyValueBlock(block)
        return {
            ...parsed,
            primaryFlow: this.stringListValue(parsed.entries.primary_flow),
        }
    }

    private parseKeyValueLines(lines: SourceLine[]): Record<string, ParsedValue> {
        return lines.reduce<Record<string, ParsedValue>>((entries, line) => {
            const equalsIndex = line.text.indexOf('=')
            if (equalsIndex < 0) {
                this.addDiagnostic('warning', `Ignored non key-value line: ${line.text}`, line.number)
                return entries
            }

            const key = line.text.slice(0, equalsIndex).trim()
            const value = line.text.slice(equalsIndex + 1).trim()
            entries[key] = this.parseValue(value)
            return entries
        }, {})
    }

    private parseInlineKeyValues(text: string, lineNumber: number): Record<string, ParsedValue> {
        const entries: Record<string, ParsedValue> = {}

        for (const token of this.splitRespectingGroups(text)) {
            const equalsIndex = token.indexOf('=')
            if (equalsIndex < 0) {
                if (token.length > 0) {
                    this.addDiagnostic('warning', `Ignored inline token without '=': ${token}`, lineNumber)
                }
                continue
            }

            const key = token.slice(0, equalsIndex).trim()
            const value = token.slice(equalsIndex + 1).trim()
            entries[key] = this.parseValue(value)
        }

        return entries
    }

    private parseValue(rawValue: string): ParsedValue {
        const value = rawValue.trim()

        if (value.length === 0) {
            return ''
        }

        if (this.isQuoted(value)) {
            return this.unquote(value)
        }

        const reference = /^(state|schedule|map)\(([^)]+)\)$/u.exec(value)
        if (reference) {
            return {
                kind: 'reference',
                refType: reference[1] as ParsedReferenceKind,
                path: reference[2].trim(),
            }
        }

        if (value.startsWith('(') && value.endsWith(')')) {
            return {
                kind: 'tuple',
                entries: this.parseTuple(value.slice(1, -1)),
            }
        }

        if (value.includes(',')) {
            return this.splitCommaRespectingGroups(value).map((item) => this.parseValue(item))
        }

        if (/^(true|false)$/iu.test(value)) {
            return value.toLowerCase() === 'true'
        }

        if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/iu.test(value)) {
            return Number(value)
        }

        return value
    }

    private parseTuple(text: string): Record<string, ParsedValue> {
        const entries: Record<string, ParsedValue> = {}

        for (const token of this.splitCommaRespectingGroups(text)) {
            const colonIndex = token.indexOf(':')
            if (colonIndex < 0) {
                this.addDiagnostic('warning', `Ignored malformed tuple entry: ${token}`)
                continue
            }

            const key = token.slice(0, colonIndex).trim()
            const value = token.slice(colonIndex + 1).trim()
            entries[key] = this.parseValue(value)
        }

        return entries
    }

    private splitRespectingGroups(text: string): string[] {
        const parts: string[] = []
        let current = ''
        let depth = 0
        let inQuote = false

        for (const char of text.trim()) {
            if (char === '"') {
                inQuote = !inQuote
            }

            if (!inQuote && char === '(') {
                depth += 1
            }

            if (!inQuote && char === ')') {
                depth -= 1
            }

            if (!inQuote && depth === 0 && /\s/u.test(char)) {
                if (current.trim().length > 0) {
                    parts.push(current.trim())
                    current = ''
                }
                continue
            }

            current += char
        }

        if (current.trim().length > 0) {
            parts.push(current.trim())
        }

        return parts
    }

    private splitCommaRespectingGroups(text: string): string[] {
        const parts: string[] = []
        let current = ''
        let depth = 0
        let inQuote = false

        for (const char of text) {
            if (char === '"') {
                inQuote = !inQuote
            }

            if (!inQuote && char === '(') {
                depth += 1
            }

            if (!inQuote && char === ')') {
                depth -= 1
            }

            if (!inQuote && depth === 0 && char === ',') {
                parts.push(current.trim())
                current = ''
                continue
            }

            current += char
        }

        if (current.trim().length > 0) {
            parts.push(current.trim())
        }

        return parts
    }

    private tokens(text: string): string[] {
        return this.splitRespectingGroups(text)
    }

    private firstToken(text: string): string {
        return this.tokens(text)[0] ?? ''
    }

    private secondToken(text: string): string {
        return this.tokens(text)[1] ?? ''
    }

    private parseHeaderRemainder(text: string): string {
        const token = this.firstToken(text)
        return text.slice(token.length).trim()
    }

    private componentName(endpoint: string): string {
        return endpoint.split('.')[0]
    }

    private portName(endpoint: string): string | undefined {
        return endpoint.includes('.') ? endpoint.split('.').slice(1).join('.') : undefined
    }

    private stripComment(line: string): string {
        let inQuote = false

        for (let index = 0; index < line.length; index += 1) {
            const char = line[index]
            if (char === '"') {
                inQuote = !inQuote
            }

            if (!inQuote && char === '#') {
                return line.slice(0, index)
            }
        }

        return line
    }

    private isQuoted(value: string): boolean {
        return value.length >= 2 && value.startsWith('"') && value.endsWith('"')
    }

    private unquote(value: string): string {
        return this.isQuoted(value) ? value.slice(1, -1) : value
    }

    private stringValue(value: ParsedValue | undefined): string | undefined {
        if (typeof value === 'string') {
            return value
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value)
        }

        return undefined
    }

    private stringListValue(value: ParsedValue | undefined): string[] {
        if (value === undefined) {
            return []
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.stringValue(item)).filter((item): item is string => item !== undefined)
        }

        const singleValue = this.stringValue(value)
        return singleValue === undefined ? [] : [singleValue]
    }

    private graphicsValue(value: ParsedValue | undefined): GraphicsSpec | undefined {
        if (value === undefined || typeof value !== 'object' || Array.isArray(value) || value.kind !== 'tuple') {
            return undefined
        }

        return value.entries as GraphicsSpec
    }

    private emptyBlock(): KeyValueBlock {
        return {
            entries: {},
            line: 0,
        }
    }

    private emptyGraphicsLayout(): GraphicsLayout {
        return {
            ...this.emptyBlock(),
            primaryFlow: [],
        }
    }

    private validateRequiredHeader(deck: ParsedNtpRocetsDeck): void {
        if (deck.caseId.length === 0) {
            this.addDiagnostic('error', 'Missing CASE statement')
        }

        if (deck.title.length === 0) {
            this.addDiagnostic('warning', 'Missing TITLE statement')
        }

        if (deck.units.length === 0) {
            this.addDiagnostic('warning', 'Missing UNITS statement')
        }
    }

    private validateUniqueNames(kind: string, namedItems: Array<{ name: string; line: number }>): void {
        const seen = new Map<string, number>()

        for (const item of namedItems) {
            if (item.name.length === 0) {
                this.addDiagnostic('error', `Encountered unnamed ${kind}`, item.line)
                continue
            }

            const firstLine = seen.get(item.name)
            if (firstLine !== undefined) {
                this.addDiagnostic('error', `Duplicate ${kind} name "${item.name}" first declared on line ${firstLine}`, item.line)
                continue
            }

            seen.set(item.name, item.line)
        }
    }

    private addDiagnostic(severity: ParseDiagnosticSeverity, message: string, line?: number): void {
        this.diagnostics.push({severity, message, line})
    }
}

export function parseRocetsInput(text: string): ParsedNtpRocetsDeck {
    return RocetFileParser.parseText(text)
}

export const parseRocetsInputDeck = parseRocetsInput
export const parseRocetsDeck = parseRocetsInput
export const parseRocetsFile = parseRocetsInput
export const parseRocetsInputFile = parseRocetsInput
export const parseInput = parseRocetsInput
export const RocetsFileParser = RocetFileParser