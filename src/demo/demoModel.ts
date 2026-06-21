import type {EngineInputs, EngineOutputs, MissionMode} from '../types/EngineState';
import type {FileArtifact, ParsedSummaryCard, ParserDiagnostic, ParserDirection, ParserFamily} from '../parser/parserTypes';
import {createFileArtifactFromText} from '../parser/createFileArtifactFromText';
import fixedSourceInput from '../fixtures/mcnp/ntp_mcnp.inp?raw';
import fixedSourceOutput from '../fixtures/mcnp/ntp_mcnp.out?raw';
import criticalityOutput from '../fixtures/mcnp/ntp_crit.out?raw';
import criticalityInput from '../fixtures/mcnp/ntp_crit.inp?raw';
import mooseInput from '../fixtures/moose/ntp_moose.inp?raw';
import mooseOutput from '../fixtures/moose/ntp_moose.out?raw';
import rocetsInput from '../fixtures/rocets/ntp_rocet.inp?raw';
import rocetsOutput from '../fixtures/rocets/ntp_rocet.out?raw';
import type {EngineeringDataWorkspaceModel} from '../components/analysis';
import type {SceneComponentDescriptor} from '../components/visualization';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {buildChannelAnalysisResult} from '../physics/channelAnalysisModel';

export type DemoCaseId = 'baselineStartup' | 'thermalMarginInvestigation';
export type ReviewPosture = 'nominal' | 'watch' | 'limit';

export interface DemoCase {
    id: DemoCaseId;
    label: string;
    objective: string;
    operatingPhase: MissionMode;
    evidenceFixtureIds: string[];
    expectedPosture: ReviewPosture;
}

export interface AnalysisEvidence {
    id: string;
    family: ParserFamily;
    label: string;
    direction: ParserDirection;
    sourceFile: string;
    provenance: string;
    validationLabel: string;
    parserStatus: FileArtifact['parserStatus'];
    metrics: Array<{label: string; value: string}>;
    summaryCards: ParsedSummaryCard[];
    diagnostics: ParserDiagnostic[];
    artifact: FileArtifact;
    pairGroupId: string;
    pairedWith: string[];
    artifactRole: string;
    inventoryRecommendation: string;
    tableCandidates: string[];
    plotCandidates: string[];
}

export interface EvidencePairingInventory {
    id: string;
    label: string;
    inputIds: string[];
    outputIds: string[];
    summary: string;
    tableCandidates: string[];
    plotCandidates: string[];
}

export interface IntegratedReview {
    customerObjective: string;
    posture: ReviewPosture;
    controllingConcern: string;
    supportingEvidence: string[];
    assumptions: string[];
    recommendedActions: string[];
    selectedFocus: {
        componentId: string;
        label: string;
        discipline: string;
        evidenceViewId: string;
        fixtureIds: readonly string[];
    };
}

export const DEMO_CASES: Record<DemoCaseId, DemoCase> = {
    baselineStartup: {
        id: 'baselineStartup',
        label: 'Pewee-Inspired Benchmark',
        objective: 'Assess a reference-controlled Pewee-scale rated point and identify the evidence required for a defensible engine systems posture.',
        operatingPhase: 'steadyBurn',
        evidenceFixtureIds: ['mcnp-output', 'moose-output', 'rocets-output'],
        expectedPosture: 'watch',
    },
    thermalMarginInvestigation: {
        id: 'thermalMarginInvestigation',
        label: 'Thermal Margin Investigation',
        objective: 'Investigate a high-power, reduced-flow condition and identify the controlling cross-discipline concern.',
        operatingPhase: 'steadyBurn',
        evidenceFixtureIds: ['mcnp-output', 'moose-output', 'rocets-output'],
        expectedPosture: 'limit',
    },
};

const evidenceInputs = [
    {
        id: 'mcnp-fixed-source-input',
        direction: 'input' as const,
        family: 'mcnp' as const,
        label: 'Fixed-source input deck',
        sourceFile: 'ntp_mcnp.inp',
        text: fixedSourceInput,
        pairGroupId: 'mcnp-fixed-source',
        pairedWith: ['mcnp-output'],
        artifactRole: 'Fixed-source transport deck',
        inventoryRecommendation: 'Promote cell, surface, material, tally, source, and distribution tables for deck inspection.',
        tableCandidates: ['cells', 'surfaces', 'materials', 'tallies', 'sources', 'distributions'],
        plotCandidates: [],
        metrics: [
            {label: 'Deck role', value: 'Fixed-source transport input'},
            {label: 'Geometry tables', value: '55 cells / 61 surfaces'},
            {label: 'Tallies', value: '10 declared tallies'},
            {label: 'Companion', value: 'ntp_rocet.inp'},
        ],
    },
    {
        id: 'mcnp-criticality-input',
        direction: 'input' as const,
        family: 'mcnp' as const,
        label: 'Criticality input deck',
        sourceFile: 'ntp_crit.inp',
        text: criticalityInput,
        pairGroupId: 'mcnp-criticality',
        pairedWith: ['mcnp-criticality-output'],
        artifactRole: 'Criticality and burnup deck',
        inventoryRecommendation: 'Use as the structural comparison point for the criticality output fixture.',
        tableCandidates: ['cells', 'surfaces', 'materials', 'tallies'],
        plotCandidates: [],
        metrics: [
            {label: 'Run mode', value: 'Criticality / burnup input deck'},
            {label: 'Geometry family', value: 'MCNP-like synthetic fixture'},
            {label: 'Deck status', value: 'Input-only parser fixture'},
            {label: 'Criticality claim', value: 'No validated criticality result'},
        ],
    },
    {
        id: 'mcnp-output',
        family: 'mcnp' as const,
        direction: 'output' as const,
        label: 'Neutronics / transport evidence',
        sourceFile: 'ntp_mcnp.out',
        text: fixedSourceOutput,
        pairGroupId: 'mcnp-fixed-source',
        pairedWith: ['mcnp-fixed-source-input'],
        artifactRole: 'Fixed-source transport output',
        inventoryRecommendation: 'Promote tally results now; derived quantities, heating, and component maps are strong next table candidates.',
        tableCandidates: ['tallies', 'warnings', 'derived quantities', 'reflector gamma heating', 'component map'],
        plotCandidates: ['tally fluctuations', 'reflector gamma heating'],
        metrics: [
            {label: 'Transport mode', value: 'Fixed-source neutron'},
            {label: 'Histories', value: '50,000 completed'},
            {label: 'Criticality', value: 'Not evaluated; no KCODE'},
            {label: 'Power-shape proxy', value: '3 axial segments'},
        ],
    },
    {
        id: 'mcnp-criticality-output',
        family: 'mcnp' as const,
        direction: 'output' as const,
        label: 'Criticality / burnup evidence',
        sourceFile: 'ntp_crit.out',
        text: criticalityOutput,
        pairGroupId: 'mcnp-criticality',
        pairedWith: ['mcnp-criticality-input'],
        artifactRole: 'Criticality and burnup output',
        inventoryRecommendation: 'Compare output tallies, derived quantities, and material inventory against the criticality deck.',
        tableCandidates: ['tallies', 'warnings', 'derived quantities', 'materials', 'reflector gamma heating'],
        plotCandidates: ['tally fluctuations', 'reflector gamma heating'],
        metrics: [
            {label: 'Initial k-effective', value: '1.01039 ± 0.00072 proxy'},
            {label: 'Burnup endpoint', value: '0.99284 k-effective proxy'},
            {label: 'Peak xenon worth', value: '-742 pcm proxy'},
        ],
    },
    {
        id: 'rocets-input',
        family: 'rocets' as const,
        direction: 'input' as const,
        label: 'Engine system input deck',
        sourceFile: 'ntp_rocet.inp',
        text: rocetsInput,
        pairGroupId: 'rocets-system',
        pairedWith: ['rocets-output'],
        artifactRole: 'System network input',
        inventoryRecommendation: 'Promote component, fluid, and initial-condition tables for network traceability.',
        tableCandidates: ['fluids', 'components', 'initial conditions', 'connectivity', 'schedules'],
        plotCandidates: [],
        metrics: [
            {label: 'Deck role', value: 'ROCETS-like network input'},
            {label: 'Components', value: '37 parsed components'},
            {label: 'Initial conditions', value: '8 records'},
            {label: 'Companion', value: 'ntp_mcnp.inp / ntp_moose.inp'},
        ],
    },
    {
        id: 'moose-input',
        family: 'moose' as const,
        direction: 'input' as const,
        label: 'Thermomechanics input deck',
        sourceFile: 'ntp_moose.inp',
        text: mooseInput,
        pairGroupId: 'moose-thermal',
        pairedWith: ['moose-output'],
        artifactRole: 'Thermal-structures input',
        inventoryRecommendation: 'Use as companion traceability for cross-links and imported proxy records.',
        tableCandidates: ['cross-links', 'root blocks'],
        plotCandidates: [],
        metrics: [
            {label: 'Deck role', value: 'MOOSE-like thermal input'},
            {label: 'Parser exposure', value: 'Cross-links only'},
            {label: 'Buried data', value: 'Root block and warnings'},
            {label: 'Companion', value: 'ntp_rocet.inp / ntp_mcnp.inp'},
        ],
    },
    {
        id: 'moose-output',
        family: 'moose' as const,
        direction: 'output' as const,
        label: 'Thermomechanics evidence',
        sourceFile: 'ntp_moose.out',
        text: mooseOutput,
        pairGroupId: 'moose-thermal',
        pairedWith: ['moose-input'],
        artifactRole: 'Thermal-structures output',
        inventoryRecommendation: 'Promote transient solve log, postprocessors, coupling history, and performance summaries.',
        tableCandidates: ['warnings', 'transient solve log', 'final postprocessor values', 'coupling history', 'performance'],
        plotCandidates: ['transient solve log', 'postprocessor history', 'coupling history'],
        metrics: [
            {label: 'Solve status', value: 'Converged synthetic fixture'},
            {label: 'Mesh', value: '11,520 QUAD4 elements'},
            {label: 'Peak fuel temperature', value: '4,129 K proxy'},
            {label: 'Diagnostics', value: 'Fixture warnings present'},
        ],
    },
    {
        id: 'rocets-output',
        family: 'rocets' as const,
        direction: 'output' as const,
        label: 'Engine system / stability evidence',
        sourceFile: 'ntp_rocet.out',
        text: rocetsOutput,
        pairGroupId: 'rocets-system',
        pairedWith: ['rocets-input'],
        artifactRole: 'System transient output',
        inventoryRecommendation: 'Promote transient log and mission phases now; histories are strong next plot candidates.',
        tableCandidates: ['transient log', 'mission phases', 'component inventory', 'connectivity check', 'history tables'],
        plotCandidates: ['transient log', 'mission phases', 'feed turbomachinery history', 'neutronics thermal history', 'nozzle performance history'],
        metrics: [
            {label: 'Run status', value: 'Normal termination'},
            {label: 'Mission phases', value: '5 phases / 900 s'},
            {label: 'Stability channel', value: 'Advisory WATCH interval'},
            {label: 'Mass balance', value: 'Strict closure passed'},
        ],
    },
];

export const DEFAULT_ANALYSIS_EVIDENCE: AnalysisEvidence[] = evidenceInputs.map((input) => {
    const artifact = createFileArtifactFromText({filename: input.sourceFile, text: input.text, id: input.id});
    return {
        id: input.id,
        family: input.family,
        direction: input.direction,
        label: input.label,
        sourceFile: input.sourceFile,
        provenance: 'Repository-bundled synthetic public fixture',
        validationLabel: 'Workflow-only; not validated solver output',
        parserStatus: artifact.parserStatus,
        metrics: input.metrics,
        summaryCards: artifact.parsed?.summaryCards ?? [],
        diagnostics: artifact.diagnostics,
        artifact,
        pairGroupId: input.pairGroupId,
        pairedWith: input.pairedWith,
        artifactRole: input.artifactRole,
        inventoryRecommendation: input.inventoryRecommendation,
        tableCandidates: input.tableCandidates,
        plotCandidates: input.plotCandidates,
    };
});

export const EVIDENCE_PAIRING_INVENTORY: EvidencePairingInventory[] = [
    {
        id: 'mcnp-fixed-source',
        label: 'MCNP fixed-source transport',
        inputIds: ['mcnp-fixed-source-input'],
        outputIds: ['mcnp-output'],
        summary: 'Connect declared geometry, materials, source, and tallies to fixed-source tally results.',
        tableCandidates: ['cells', 'surfaces', 'materials', 'tallies', 'sources', 'distributions', 'tally results'],
        plotCandidates: ['tally fluctuations', 'reflector gamma heating'],
    },
    {
        id: 'mcnp-criticality',
        label: 'MCNP criticality and burnup',
        inputIds: ['mcnp-criticality-input'],
        outputIds: ['mcnp-criticality-output'],
        summary: 'Compare criticality deck structure with burnup and criticality output records.',
        tableCandidates: ['cells', 'surfaces', 'materials', 'tallies', 'derived quantities'],
        plotCandidates: ['tally fluctuations', 'reflector gamma heating'],
    },
    {
        id: 'rocets-system',
        label: 'ROCETS system network',
        inputIds: ['rocets-input'],
        outputIds: ['rocets-output'],
        summary: 'Trace system network configuration into transient log and mission phase output.',
        tableCandidates: ['components', 'fluids', 'initial conditions', 'transient log', 'mission phases'],
        plotCandidates: ['transient log', 'mission phases', 'feed turbomachinery history', 'nozzle performance history'],
    },
    {
        id: 'moose-thermal',
        label: 'MOOSE thermomechanics',
        inputIds: ['moose-input'],
        outputIds: ['moose-output'],
        summary: 'Track thermal input links into promoted MOOSE output histories, postprocessor values, coupling records, and warnings.',
        tableCandidates: ['cross-links', 'warnings', 'transient solve log', 'postprocessor history', 'final postprocessor values', 'coupling history', 'performance'],
        plotCandidates: ['postprocessor history', 'coupling history', 'residual history', 'materials history'],
    },
];

export function getCaseLabel(selection: DemoCaseId | 'customWhatIf'): string {
    return selection === 'customWhatIf' ? 'Custom What-If' : DEMO_CASES[selection].label;
}

export function buildIntegratedReview(
    selection: DemoCaseId | 'customWhatIf',
    inputs: EngineInputs,
    outputs: EngineOutputs,
    workspace: EngineeringDataWorkspaceModel,
    focus: SceneComponentDescriptor,
): IntegratedReview {
    const posture: ReviewPosture = outputs.reviewPosture;
    const objective = selection === 'customWhatIf'
        ? 'Analyst-defined operating points do not imply external model reruns.'
        : DEMO_CASES[selection].objective;
    const evaluation = evaluateEngineCase(inputs);
    const channelAnalysis = buildChannelAnalysisResult(inputs, outputs, evaluation.channel, null);
    const controllingConcern = outputs.channelWallCriterionMarginK < 0
        ? 'Calculated channel-wall temperature exceeds the selected screening criterion.'
        : outputs.basisCompletenessPercent < 100
            ? 'Model-basis completeness controls the review; screening closures or missing component data remain.'
            : outputs.reviewPosture !== 'nominal'
                ? 'A conservative review flag controls the conclusion.'
                : 'No reduced-order limit is exceeded; higher-fidelity handoff remains required.';

    const selectedFixtures = workspace.fixtures.fixtures.filter(
        (fixture) => focus.fixtureIds.includes(fixture.id),
    );
    return {
        customerObjective: objective,
        posture,
        controllingConcern,
        supportingEvidence: selectedFixtures.map((item) =>
            `${item.family.toUpperCase()}-like ${item.filename}: ${item.parserStatus} synthetic fixture`,
        ),
        assumptions: [
            'Dashboard outputs are screening estimates only; not transport, CFD, fuel-performance, or safety outputs.',
            'Imported evidence is static synthetic fixture data and is not rerun when operating inputs change.',
            `Current phase is ${inputs.missionMode}; shielding remains a deferred mass and dose trade.`,
            ...channelAnalysis.reviewFlags.slice(0, 3).map((flag) => `${flag.title}: ${flag.clearingCondition}`),
        ],
        recommendedActions: buildRecommendedActions(outputs, focus),
        selectedFocus: {
            componentId: focus.id,
            label: focus.label,
            discipline: focus.discipline,
            evidenceViewId: focus.evidenceViewId,
            fixtureIds: focus.fixtureIds,
        },
    };
}

function buildRecommendedActions(
    outputs: EngineOutputs,
    focus: SceneComponentDescriptor,
): string[] {
    const actions = focus.analysisLinkId === 'propulsion-stability'
        ? [
            'Review the ROCETS-like flow, pressure-rise, shaft-speed, and stability channels associated with the selected component.',
            'Evaluate pump, turbine, and channel pressure-drop sensitivities before changing the performance target.',
        ]
        : [
            'Correlate the selected location with MCNP-like spatial evidence and MOOSE-like peak-temperature constraints.',
            'Review control position, power peaking, hydrogen flow, and material-limit sensitivity at the selected condition.',
        ];
    if (outputs.channelWallCriterionMarginK < 0) {
        actions.push('Run startup-ramp, drum-angle, and hydrogen-flow sensitivities before emphasizing performance.');
    }
    actions.push('Define validation evidence and acceptance criteria before promoting beyond portfolio scope.');
    return actions;
}
