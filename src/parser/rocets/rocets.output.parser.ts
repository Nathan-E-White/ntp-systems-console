// === REQUIRES NODE ===
// import { readFile } from 'node:fs/promises'

export type RocetsOutputDiagnosticSeverity = 'info' | 'warning' | 'error'

export interface RocetsOutputDiagnostic {
    severity: RocetsOutputDiagnosticSeverity
    message: string
    line?: number
}

export function parseRocetsOutput(text: string): ParsedRocetsOutput {
    return RocetsOutputParser.parseText(text)
}

export const parseRocetsOutputFile = parseRocetsOutput
export const parseRocetsRunOutput = parseRocetsOutput
export const parseROCETSOutput = parseRocetsOutput
export const parseROCETSOutputFile = parseRocetsOutput
export const parseOutput = parseRocetsOutput

export interface RocetsHeader {
    caseId: string
    title: string
    program: string
    units: string
    runPosture: string
}

export interface RocetsScalarSection {
    entries: Record<string, string | number>
}

export interface RocetsFluidReport extends RocetsScalarSection {
    name: string
    species?: string
    phaseModel?: string
    propertyTable?: string
    status?: string
    line: number
}

export interface RocetsComponentGroup {
    name: string
    components: Record<string, string>
    line: number
}

export interface RocetsInitialNodeState {
    node: string
    pressurePa: number
    temperatureK: number
    line: number
}

export interface RocetsSteadyInitializationIteration {
    iteration: number
    massResidual: number
    energyResidual: number
    shaftResidual: number
    status: string
    line: number
}

export interface RocetsSteadyInitialization extends RocetsScalarSection {
    iterations: RocetsSteadyInitializationIteration[]
    nonlinearSolver?: string
    linearSolver?: string
    relativeTolerance?: number
    absoluteTolerance?: number
    maximumNonlinearIterations?: number
    status?: string
    initialShaftSpeedRpm?: number
    initialChamberPressurePa?: number
    initialCorePowerW?: number
}

export interface RocetsTransientLogEntry {
    timeSeconds: number
    dtSeconds: number
    phase: string
    nonlinearIterations: number
    cuts: number
    maxResidual: number
    event: string
    line: number
}

export interface RocetsMissionPhase {
    phase: string
    startSeconds: number
    stopSeconds: number
    samples: number
    status: string
    line: number
}

export interface RocetsSolverResidual {
    name: string
    maxAbs: number
    rms: number
    final: number
    tolerance: number
    status: string
    line: number
}

export interface RocetsAdvisoryDiagnostic {
    name: string
    detail: string
    line: number
}

export interface RocetsWarningNote {
    kind: 'WARN' | 'NOTE'
    code: string
    timeSeconds?: number
    message: string
    line: number
}

export interface RocetsOverviewSnapshot {
    timeSeconds: number
    phase: string
    tankPressurePa: number
    corePowerW: number
    decayHeatW: number
    massFlowKgPerSecond: number
    shaftRpm: number
    chamberPressurePa: number
    thrustN: number
    xenon: number
    margin: number
    ledinegg: string
    line: number
}

export interface RocetsFeedTurbomachinerySample {
    timeSeconds: number
    tankPressurePa: number
    tankTemperatureK: number
    paraEquilibriumFraction: number
    boostRpm: number
    mainRpm: number
    pumpMassFlowKgPerSecond: number
    pumpDeltaPressurePa: number
    turbineSplit: number
    turbinePowerW: number
    line: number
}

export interface RocetsNeutronicsThermalSample {
    timeSeconds: number
    drumDegrees: number
    drumWorth: number
    auxiliaryWorth: number
    xenonWorth: number
    iodine: number
    xenon: number
    corePowerW: number
    reflectorHeatW: number
    shieldHeatW: number
    coreExitTemperatureK: number
    line: number
}

export interface RocetsNozzlePerformanceSample {
    timeSeconds: number
    chamberPressurePa: number
    chamberTemperatureK: number
    nozzleMassFlowKgPerSecond: number
    throatPressurePa: number
    areaRatio: number
    dischargeCoefficient: number
    divergenceEfficiency: number
    ispProxySeconds: number
    thrustProxyN: number
    line: number
}

export interface RocetsOutputRequestStatus {
    panel: string
    name: string
    interval?: number
    snapshots?: number
    status?: string
    properties: Record<string, string | number>
    line: number
}

export interface RocetsFinalRunSummary extends RocetsScalarSection {
    finalTimeSeconds?: number
    acceptedSteps?: number
    rejectedSteps?: number
    nonlinearIterations?: number
    maximumTimeCuts?: number
    wallClockSynthetic?: string
    outputRecordsWritten?: number
    finalMassBalanceResidualKgPerSecond?: number
    finalEnergyResidualW?: number
    finalChamberPressurePa?: number
    finalThrustProxyN?: number
    finalXenonInventory?: number
    finalLedineggStatus?: string
    runStatus?: string
}

export interface ParsedRocetsOutput {
    header: RocetsHeader
    inputDeckEcho: RocetsScalarSection
    parserSummary: RocetsScalarSection
    fluids: RocetsFluidReport[]
    componentInventory: RocetsComponentGroup[]
    connectivityCheck: RocetsScalarSection & { notes: string[] }
    initialConditions: RocetsInitialNodeState[]
    steadyInitialization: RocetsSteadyInitialization
    transientLog: RocetsTransientLogEntry[]
    missionPhases: RocetsMissionPhase[]
    solverResiduals: RocetsSolverResidual[]
    advisoryDiagnostics: RocetsAdvisoryDiagnostic[]
    warningsAndNotes: RocetsWarningNote[]
    overviewSnapshots: RocetsOverviewSnapshot[]
    feedTurbomachineryHistory: RocetsFeedTurbomachinerySample[]
    neutronicsThermalHistory: RocetsNeutronicsThermalSample[]
    nozzlePerformanceHistory: RocetsNozzlePerformanceSample[]
    outputRequests: RocetsOutputRequestStatus[]
    finalSummary: RocetsFinalRunSummary
    diagnostics: RocetsOutputDiagnostic[]
}

type SourceLine = { text: string; number: number }
type OutputSection = { title: string; body: SourceLine[]; line: number }

const SECTION_SEPARATOR = /^-+$/u
const BANNER_SEPARATOR = /^=+$/u
const SCALAR_LINE = /^\s*([^:]+?)\s*:\s*(.*?)\s*$/u
const NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:E[+-]?\d+)?$/iu
const WARNING_NOTE_LINE = /^\s*(WARN|NOTE)\s+(\d+)(?:\s+at\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:E[+-]?\d+)?)\s+s)?:\s*(.*)$/iu

const KEY_ALIASES: Record<string, string> = {
    source_file: 'sourceFile',
    fixture_family: 'fixtureFamily',
    vehicle_context: 'vehicleContext',
    safety_posture: 'safetyPosture',
    solution_mode: 'solutionMode',
    start_time: 'startTimeSeconds',
    stop_time: 'stopTimeSeconds',
    initial_dt: 'initialDtSeconds',
    max_dt: 'maxDtSeconds',
    min_dt: 'minDtSeconds',
    steady_initialization: 'steadyInitialization',
    phase_model: 'phaseModel',
    property_table: 'propertyTable',
    graph_nodes: 'graphNodes',
    graph_edges: 'graphEdges',
    disconnected_components: 'disconnectedComponents',
    disabled_presets: 'disabledPresets',
    primary_flow_path: 'primaryFlowPath',
    turbine_bypass_loop: 'turbineBypassLoop',
    neutronics_control_links: 'neutronicsControlLinks',
    tank_heat_leak_link: 'tankHeatLeakLink',
    advisory_stability_link: 'advisoryStabilityLink',
    nonlinear_solver: 'nonlinearSolver',
    linear_solver: 'linearSolver',
    relative_tolerance: 'relativeTolerance',
    absolute_tolerance: 'absoluteTolerance',
    maximum_nonlinear_iters: 'maximumNonlinearIterations',
    steady_initialization_status: 'status',
    initial_shaft_speed: 'initialShaftSpeedRpm',
    initial_chamber_pressure: 'initialChamberPressurePa',
    initial_core_power: 'initialCorePowerW',
    final_time: 'finalTimeSeconds',
    accepted_steps: 'acceptedSteps',
    rejected_steps: 'rejectedSteps',
    nonlinear_iterations: 'nonlinearIterations',
    maximum_time_cuts: 'maximumTimeCuts',
    wall_clock_synthetic: 'wallClockSynthetic',
    output_records_written: 'outputRecordsWritten',
    final_mass_balance_residual: 'finalMassBalanceResidualKgPerSecond',
    final_energy_residual: 'finalEnergyResidualW',
    final_chamber_pressure: 'finalChamberPressurePa',
    final_thrust_proxy: 'finalThrustProxyN',
    final_xenon_inventory: 'finalXenonInventory',
    final_ledinegg_status: 'finalLedineggStatus',
    run_status: 'runStatus',
}

export class RocetsOutputParser {
    // === REQUIRES NODE ===
    // static async parseFromFilename(fname: string): Promise<ParsedRocetsOutput> {
    //     const text = await readFile(fname, { encoding: 'utf8' })
    //     return RocetsOutputParser.parseText(text)
    // }

    static async parseFile(file: File): Promise<ParsedRocetsOutput> {
        const text = await file.text()
        return RocetsOutputParser.parseText(text)
    }

    static parseText(text: string): ParsedRocetsOutput {
        const parser = new RocetsOutputParser(text)
        return parser.parse()
    }

    private readonly diagnostics: RocetsOutputDiagnostic[] = []
    private readonly lines: SourceLine[]

    private constructor(text: string) {
        this.lines = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n')
            .map((line, index) => ({text: line.replace(/\s+$/u, ''), number: index + 1}))
    }

    private parse(): ParsedRocetsOutput {
        const parsed: ParsedRocetsOutput = {
            header: this.parseHeader(),
            inputDeckEcho: {entries: {}},
            parserSummary: {entries: {}},
            fluids: [],
            componentInventory: [],
            connectivityCheck: {entries: {}, notes: []},
            initialConditions: [],
            steadyInitialization: {entries: {}, iterations: []},
            transientLog: [],
            missionPhases: [],
            solverResiduals: [],
            advisoryDiagnostics: [],
            warningsAndNotes: [],
            overviewSnapshots: [],
            feedTurbomachineryHistory: [],
            neutronicsThermalHistory: [],
            nozzlePerformanceHistory: [],
            outputRequests: [],
            finalSummary: {entries: {}},
            diagnostics: this.diagnostics,
        }

        for (const section of this.collectSections()) {
            this.applySection(parsed, section)
        }

        this.validate(parsed)
        return parsed
    }

    private collectSections(): OutputSection[] {
        const sections: OutputSection[] = []

        for (let index = 0; index < this.lines.length; index += 1) {
            const line = this.lines[index]
            const next = this.lines[index + 1]

            if (!next || !SECTION_SEPARATOR.test(next.text.trim())) {
                continue
            }

            const title = line.text.trim()
            if (title.length === 0 || BANNER_SEPARATOR.test(title)) {
                continue
            }

            const body: SourceLine[] = []
            index += 2

            while (index < this.lines.length) {
                const current = this.lines[index]
                const maybeSeparator = this.lines[index + 1]
                const startsNextSection = maybeSeparator && !BANNER_SEPARATOR.test(current.text.trim()) && SECTION_SEPARATOR.test(maybeSeparator.text.trim())

                if (startsNextSection || /^\s*END ROCETS-LIKE SYSTEM SOLVER OUTPUT\s*$/u.test(current.text)) {
                    index -= 1
                    break
                }

                body.push(current)
                index += 1
            }

            sections.push({title, body: this.trimBlankLines(body), line: line.number})
        }

        return sections
    }

    private parseHeader(): RocetsHeader {
        const header: RocetsHeader = {caseId: '', title: '', program: '', units: '', runPosture: ''}

        for (const line of this.lines.slice(0, 12)) {
            const scalar = this.parseScalarLine(line)
            if (!scalar) {
                continue
            }

            const value = String(scalar.value)
            switch (this.normalizeKey(scalar.name)) {
                case 'case':
                    header.caseId = value
                    break
                case 'title':
                    header.title = value
                    break
                case 'program':
                    header.program = value
                    break
                case 'units':
                    header.units = value
                    break
                case 'run_posture':
                    header.runPosture = value
                    break
                default:
                    break
            }
        }

        return header
    }

    private applySection(parsed: ParsedRocetsOutput, section: OutputSection): void {
        switch (this.normalizeSectionTitle(section.title)) {
            case 'input_deck_echo':
                this.applyScalarEntries(parsed.inputDeckEcho, section.body)
                return
            case 'parser_summary':
                this.applyScalarEntries(parsed.parserSummary, section.body)
                return
            case 'fluids':
                parsed.fluids = this.parseFluids(section)
                return
            case 'component_inventory':
                parsed.componentInventory = this.parseComponentInventory(section)
                return
            case 'connectivity_check':
                parsed.connectivityCheck = this.parseConnectivityCheck(section)
                return
            case 'initial_condition_report':
                parsed.initialConditions = this.parseInitialConditions(section)
                return
            case 'steady_initialization':
                parsed.steadyInitialization = this.parseSteadyInitialization(section)
                return
            case 'transient_integration_log':
                parsed.transientLog = this.parseTransientLog(section)
                return
            case 'mission_phase_summary':
                parsed.missionPhases = this.parseMissionPhases(section)
                return
            case 'solver_residual_summary':
                parsed.solverResiduals = this.parseSolverResiduals(section)
                return
            case 'advisory_diagnostics':
                parsed.advisoryDiagnostics = this.parseAdvisoryDiagnostics(section)
                return
            case 'warning_and_note_list':
                parsed.warningsAndNotes = this.parseWarningsAndNotes(section)
                return
            case 'time_history_overview_snapshot_output':
                parsed.overviewSnapshots = this.parseOverviewSnapshots(section)
                return
            case 'time_history_feed_and_turbomachinery_channels':
                parsed.feedTurbomachineryHistory = this.parseFeedTurbomachinery(section)
                return
            case 'time_history_neutronics_and_thermal_channels':
                parsed.neutronicsThermalHistory = this.parseNeutronicsThermal(section)
                return
            case 'time_history_nozzle_and_performance_channels':
                parsed.nozzlePerformanceHistory = this.parseNozzlePerformance(section)
                return
            case 'output_requests_satisfied':
                parsed.outputRequests = this.parseOutputRequests(section)
                return
            case 'final_run_summary':
                this.applyScalarEntries(parsed.finalSummary, section.body)
                return
            default:
                this.addDiagnostic('info', `Skipped unsupported ROCETS output section: ${section.title}`, section.line)
        }
    }

    private parseFluids(section: OutputSection): RocetsFluidReport[] {
        const fluids: RocetsFluidReport[] = []
        let current: RocetsFluidReport | undefined

        for (const line of section.body) {
            const fluidMatch = /^\s*fluid\s+(\S+)\s*$/iu.exec(line.text)
            if (fluidMatch) {
                current = {name: fluidMatch[1], entries: {}, line: line.number}
                fluids.push(current)
                continue
            }

            const scalar = this.parseScalarLine(line)
            if (scalar && current) {
                this.assignNamedProperty(current, scalar.name, scalar.value)
                current.entries[this.normalizeKey(scalar.name)] = scalar.value
            }
        }

        return fluids
    }

    private parseComponentInventory(section: OutputSection): RocetsComponentGroup[] {
        const groups: RocetsComponentGroup[] = []
        let current: RocetsComponentGroup | undefined

        for (const line of section.body) {
            const trimmed = line.text.trim()
            if (trimmed.length === 0) {
                continue
            }

            const scalar = this.parseScalarLine(line)
            if (scalar && current) {
                current.components[this.normalizeKey(scalar.name)] = String(scalar.value)
                continue
            }

            if (!scalar) {
                current = {name: trimmed, components: {}, line: line.number}
                groups.push(current)
            }
        }

        return groups
    }

    private parseConnectivityCheck(section: OutputSection): RocetsScalarSection & { notes: string[] } {
        const parsed: RocetsScalarSection & { notes: string[] } = {entries: {}, notes: []}

        for (const line of section.body) {
            const trimmed = line.text.trim()
            if (/^NOTE\s+\d+:/u.test(trimmed)) {
                parsed.notes.push(trimmed)
                continue
            }

            const scalar = this.parseScalarLine(line)
            if (scalar) {
                this.assignNamedProperty(parsed, scalar.name, scalar.value)
                parsed.entries[this.normalizeKey(scalar.name)] = scalar.value
            }
        }

        return parsed
    }

    private parseInitialConditions(section: OutputSection): RocetsInitialNodeState[] {
        return section.body.flatMap((line) => {
            const cells = this.splitColumns(line.text)
            if (cells.length !== 3 || cells[0] === 'node') {
                return []
            }

            return [{node: cells[0], pressurePa: this.toNumber(cells[1], line.number), temperatureK: this.toNumber(cells[2], line.number), line: line.number}]
        })
    }

    private parseSteadyInitialization(section: OutputSection): RocetsSteadyInitialization {
        const parsed: RocetsSteadyInitialization = {entries: {}, iterations: []}
        let inIterationTable = false

        for (const line of section.body) {
            const trimmed = line.text.trim()
            if (trimmed.length === 0) {
                continue
            }

            if (/^init\s+iter\s+/iu.test(trimmed)) {
                inIterationTable = true
                continue
            }

            if (inIterationTable) {
                const cells = this.splitColumns(line.text)
                if (cells.length === 5 && /^\d+$/u.test(cells[0])) {
                    parsed.iterations.push({
                        iteration: this.toNumber(cells[0], line.number),
                        massResidual: this.toNumber(cells[1], line.number),
                        energyResidual: this.toNumber(cells[2], line.number),
                        shaftResidual: this.toNumber(cells[3], line.number),
                        status: cells[4],
                        line: line.number,
                    })
                    continue
                }
                inIterationTable = false
            }

            const scalar = this.parseScalarLine(line)
            if (scalar) {
                this.assignNamedProperty(parsed, scalar.name, scalar.value)
                parsed.entries[this.normalizeKey(scalar.name)] = scalar.value
            }
        }

        return parsed
    }

    private parseTransientLog(section: OutputSection): RocetsTransientLogEntry[] {
        return section.body.flatMap((line) => {
            const cells = this.splitColumns(line.text)
            if (cells.length < 7 || cells[0] === 'time(s)' || !NUMBER_PATTERN.test(cells[0])) {
                return []
            }

            return [{
                timeSeconds: this.toNumber(cells[0], line.number),
                dtSeconds: this.toNumber(cells[1], line.number),
                phase: cells[2],
                nonlinearIterations: this.toNumber(cells[3], line.number),
                cuts: this.toNumber(cells[4], line.number),
                maxResidual: this.toNumber(cells[5], line.number),
                event: cells.slice(6).join(' '),
                line: line.number,
            }]
        })
    }

    private parseMissionPhases(section: OutputSection): RocetsMissionPhase[] {
        return section.body.flatMap((line) => {
            const cells = this.splitColumns(line.text)
            if (cells.length !== 5 || cells[0] === 'phase') {
                return []
            }

            return [{phase: cells[0], startSeconds: this.toNumber(cells[1], line.number), stopSeconds: this.toNumber(cells[2], line.number), samples: this.toNumber(cells[3], line.number), status: cells[4], line: line.number}]
        })
    }

    private parseSolverResiduals(section: OutputSection): RocetsSolverResidual[] {
        return section.body.flatMap((line) => {
            const cells = this.splitColumns(line.text)
            if (cells.length !== 6 || cells[0] === 'residual') {
                return []
            }

            return [{name: cells[0], maxAbs: this.toNumber(cells[1], line.number), rms: this.toNumber(cells[2], line.number), final: this.toNumber(cells[3], line.number), tolerance: this.toNumber(cells[4], line.number), status: cells[5], line: line.number}]
        })
    }

    private parseAdvisoryDiagnostics(section: OutputSection): RocetsAdvisoryDiagnostic[] {
        return section.body.flatMap((line) => {
            const scalar = this.parseScalarLine(line)
            return scalar ? [{name: scalar.name.trim(), detail: String(scalar.value), line: line.number}] : []
        })
    }

    private parseWarningsAndNotes(section: OutputSection): RocetsWarningNote[] {
        return section.body.flatMap((line) => {
            const match = WARNING_NOTE_LINE.exec(line.text)
            if (!match) {
                return []
            }

            return [{kind: match[1].toUpperCase() as 'WARN' | 'NOTE', code: match[2], timeSeconds: match[3] === undefined ? undefined : this.toNumber(match[3], line.number), message: match[4].trim(), line: line.number}]
        })
    }

    private parseOverviewSnapshots(section: OutputSection): RocetsOverviewSnapshot[] {
        return section.body.flatMap((line) => {
            const cells = this.splitColumns(line.text)
            if (cells.length !== 12 || cells[0] === 'time(s)') {
                return []
            }

            return [{timeSeconds: this.toNumber(cells[0], line.number), phase: cells[1], tankPressurePa: this.toNumber(cells[2], line.number), corePowerW: this.toNumber(cells[3], line.number), decayHeatW: this.toNumber(cells[4], line.number), massFlowKgPerSecond: this.toNumber(cells[5], line.number), shaftRpm: this.toNumber(cells[6], line.number), chamberPressurePa: this.toNumber(cells[7], line.number), thrustN: this.toNumber(cells[8], line.number), xenon: this.toNumber(cells[9], line.number), margin: this.toNumber(cells[10], line.number), ledinegg: cells[11], line: line.number}]
        })
    }

    private parseFeedTurbomachinery(section: OutputSection): RocetsFeedTurbomachinerySample[] {
        return section.body.flatMap((line) => {
            const cells = this.splitColumns(line.text)
            if (cells.length !== 10 || cells[0] === 'time(s)') {
                return []
            }

            return [{timeSeconds: this.toNumber(cells[0], line.number), tankPressurePa: this.toNumber(cells[1], line.number), tankTemperatureK: this.toNumber(cells[2], line.number), paraEquilibriumFraction: this.toNumber(cells[3], line.number), boostRpm: this.toNumber(cells[4], line.number), mainRpm: this.toNumber(cells[5], line.number), pumpMassFlowKgPerSecond: this.toNumber(cells[6], line.number), pumpDeltaPressurePa: this.toNumber(cells[7], line.number), turbineSplit: this.toNumber(cells[8], line.number), turbinePowerW: this.toNumber(cells[9], line.number), line: line.number}]
        })
    }

    private parseNeutronicsThermal(section: OutputSection): RocetsNeutronicsThermalSample[] {
        return section.body.flatMap((line) => {
            const cells = this.splitColumns(line.text)
            if (cells.length !== 11 || cells[0] === 'time(s)') {
                return []
            }

            return [{timeSeconds: this.toNumber(cells[0], line.number), drumDegrees: this.toNumber(cells[1], line.number), drumWorth: this.toNumber(cells[2], line.number), auxiliaryWorth: this.toNumber(cells[3], line.number), xenonWorth: this.toNumber(cells[4], line.number), iodine: this.toNumber(cells[5], line.number), xenon: this.toNumber(cells[6], line.number), corePowerW: this.toNumber(cells[7], line.number), reflectorHeatW: this.toNumber(cells[8], line.number), shieldHeatW: this.toNumber(cells[9], line.number), coreExitTemperatureK: this.toNumber(cells[10], line.number), line: line.number}]
        })
    }

    private parseNozzlePerformance(section: OutputSection): RocetsNozzlePerformanceSample[] {
        return section.body.flatMap((line) => {
            const cells = this.splitColumns(line.text)
            if (cells.length !== 10 || cells[0] === 'time(s)') {
                return []
            }

            return [{timeSeconds: this.toNumber(cells[0], line.number), chamberPressurePa: this.toNumber(cells[1], line.number), chamberTemperatureK: this.toNumber(cells[2], line.number), nozzleMassFlowKgPerSecond: this.toNumber(cells[3], line.number), throatPressurePa: this.toNumber(cells[4], line.number), areaRatio: this.toNumber(cells[5], line.number), dischargeCoefficient: this.toNumber(cells[6], line.number), divergenceEfficiency: this.toNumber(cells[7], line.number), ispProxySeconds: this.toNumber(cells[8], line.number), thrustProxyN: this.toNumber(cells[9], line.number), line: line.number}]
        })
    }

    private parseOutputRequests(section: OutputSection): RocetsOutputRequestStatus[] {
        const requests: RocetsOutputRequestStatus[] = []
        let panel = ''

        for (const line of section.body) {
            const trimmed = line.text.trim()
            const panelMatch = /^panel\s+(\S+)$/iu.exec(trimmed)
            if (panelMatch) {
                panel = panelMatch[1]
                continue
            }

            const cells = this.splitColumns(trimmed)
            if (cells.length < 2) {
                continue
            }

            const properties = this.parseInlineAssignments(cells.slice(1))
            requests.push({panel, name: cells[0], interval: this.optionalNumber(properties.interval), snapshots: this.optionalNumber(properties.snapshots), status: this.optionalString(properties.status), properties, line: line.number})
        }

        return requests
    }

    private applyScalarEntries(target: RocetsScalarSection, lines: SourceLine[]): void {
        for (const line of lines) {
            const scalar = this.parseScalarLine(line)
            if (!scalar) {
                continue
            }

            this.assignNamedProperty(target, scalar.name, scalar.value)
            target.entries[this.normalizeKey(scalar.name)] = scalar.value
        }
    }

    private parseScalarLine(line: SourceLine): { name: string; value: string | number } | undefined {
        const match = SCALAR_LINE.exec(line.text)
        if (!match) {
            return undefined
        }

        return {name: match[1].trim(), value: this.parseScalarValue(match[2].trim())}
    }

    private parseScalarValue(raw: string): string | number {
        const cells = raw.split(/\s+/u).filter(Boolean)
        return cells.length > 0 && NUMBER_PATTERN.test(cells[0]) ? Number(cells[0]) : raw
    }

    private parseInlineAssignments(tokens: string[]): Record<string, string | number> {
        return tokens.reduce<Record<string, string | number>>((properties, token) => {
            const equalsIndex = token.indexOf('=')
            if (equalsIndex < 0) {
                return properties
            }

            const key = token.slice(0, equalsIndex).trim()
            const value = token.slice(equalsIndex + 1).trim()
            properties[key] = NUMBER_PATTERN.test(value) ? Number(value) : value
            return properties
        }, {})
    }

    private assignNamedProperty(target: object, name: string, value: string | number): void {
        const normalized = this.normalizeKey(name)
        const propertyName = KEY_ALIASES[normalized] ?? this.camelize(normalized)
        ;(target as Record<string, string | number | undefined>)[propertyName] = value
    }

    private splitColumns(text: string): string[] {
        return text.trim().split(/\s+/u).filter(Boolean)
    }

    private trimBlankLines(lines: SourceLine[]): SourceLine[] {
        let start = 0
        let end = lines.length

        while (start < end && lines[start].text.trim().length === 0) {
            start += 1
        }

        while (end > start && lines[end - 1].text.trim().length === 0) {
            end -= 1
        }

        return lines.slice(start, end)
    }

    private normalizeSectionTitle(title: string): string {
        return this.normalizeKey(title).replaceAll(':', '')
    }

    private normalizeKey(key: string): string {
        return key
            .trim()
            .toLowerCase()
            .replaceAll('/', '_')
            .replaceAll('-', '_')
            .replaceAll('(', '_')
            .replaceAll(')', '_')
            .replaceAll('.', '_')
            .replace(/\s+/gu, '_')
            .replace(/_+/gu, '_')
            .replace(/^_|_$/gu, '')
    }

    private camelize(key: string): string {
        return key.replace(/_([a-z0-9])/gu, (_match, letter: string) => letter.toUpperCase())
    }

    private toNumber(value: string, line: number): number {
        const parsed = Number(value)
        if (Number.isNaN(parsed)) {
            this.addDiagnostic('warning', `Expected numeric value but found "${value}"`, line)
        }

        return parsed
    }

    private optionalNumber(value: string | number | undefined): number | undefined {
        if (typeof value === 'number') {
            return value
        }

        return typeof value === 'string' && NUMBER_PATTERN.test(value) ? Number(value) : undefined
    }

    private optionalString(value: string | number | undefined): string | undefined {
        return value === undefined ? undefined : String(value)
    }

    private validate(parsed: ParsedRocetsOutput): void {
        if (parsed.header.caseId.length === 0) {
            this.addDiagnostic('warning', 'Missing ROCETS output case identifier')
        }

        if (parsed.finalSummary.runStatus === undefined) {
            this.addDiagnostic('warning', 'Missing final run status')
        }

        if (parsed.overviewSnapshots.length === 0) {
            this.addDiagnostic('warning', 'No overview snapshot time-history rows were parsed')
        }
    }

    private addDiagnostic(severity: RocetsOutputDiagnosticSeverity, message: string, line?: number): void {
        this.diagnostics.push({severity, message, line})
    }
}
