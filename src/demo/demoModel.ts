import type {EngineInputs, EngineOutputs, MissionMode} from '../types/EngineState';
import type {FileArtifact, ParsedSummaryCard, ParserDiagnostic, ParserFamily} from '../parser/parserTypes';
import {createFileArtifactFromText} from '../parser/createFileArtifactFromText';
import {outputFiles} from '../parser/file_inputs';
import criticalityOutput from '../fixtures/mcnp/ntp_crit.out?raw';
import type {EngineeringDataWorkspaceModel} from '../components/analysis';
import type {SceneComponentDescriptor} from '../components/visualization';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import {buildChannelAnalysisResult} from '../physics/channelAnalysisModel';

export type DemoCaseId = 'baselineStartup' | 'thermalMarginInvestigation' | 'legacyDemo';
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
    sourceFile: string;
    provenance: string;
    validationLabel: string;
    parserStatus: FileArtifact['parserStatus'];
    metrics: Array<{label: string; value: string}>;
    summaryCards: ParsedSummaryCard[];
    diagnostics: ParserDiagnostic[];
    artifact: FileArtifact;
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
        currentValues: readonly string[];
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
    legacyDemo: {
        id: 'legacyDemo',
        label: 'Legacy Demo Model',
        objective: 'Retain the former unsupported coefficients for regression comparison without using them in the default engineering narrative.',
        operatingPhase: 'startup',
        evidenceFixtureIds: ['mcnp-output', 'moose-output', 'rocets-output'],
        expectedPosture: 'nominal',
    },
};

const evidenceInputs = [
    {
        id: 'mcnp-output',
        family: 'mcnp' as const,
        label: 'Neutronics / transport evidence',
        sourceFile: 'ntp_mcnp.out',
        text: outputFiles.mcnp,
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
        label: 'Criticality / burnup evidence',
        sourceFile: 'ntp_crit.out',
        text: criticalityOutput,
        metrics: [
            {label: 'Initial k-effective', value: '1.01039 ± 0.00072 proxy'},
            {label: 'Burnup endpoint', value: '0.99284 k-effective proxy'},
            {label: 'Peak xenon worth', value: '-742 pcm proxy'},
            {label: 'Validation', value: 'Synthetic parser fixture only'},
        ],
    },
    {
        id: 'moose-output',
        family: 'moose' as const,
        label: 'Thermomechanics evidence',
        sourceFile: 'ntp_moose.out',
        text: outputFiles.moose,
        metrics: [
            {label: 'Solve status', value: 'Converged synthetic fixture'},
            {label: 'Mesh', value: '11,520 QUAD4 elements'},
            {label: 'Peak fuel temperature', value: '4,129 K proxy'},
            {label: 'Validation', value: 'Fixture warnings present'},
        ],
    },
    {
        id: 'rocets-output',
        family: 'rocets' as const,
        label: 'Engine system / stability evidence',
        sourceFile: 'ntp_rocet.out',
        text: outputFiles.rocets,
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
        label: input.label,
        sourceFile: input.sourceFile,
        provenance: 'Repository-bundled synthetic public fixture',
        validationLabel: 'Workflow demonstration only; not validated solver output',
        parserStatus: artifact.parserStatus,
        metrics: input.metrics,
        summaryCards: artifact.parsed?.summaryCards ?? [],
        diagnostics: artifact.diagnostics,
        artifact,
    };
});

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
        ? 'Explore an analyst-defined operating point without implying that external model evidence was rerun.'
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
    const currentValues = focus.outputKeys.map((key) => {
        const definition = workspace.outputs.definitions.find((candidate) => candidate.key === key);
        const value = workspace.outputs.values[key];
        return `${definition?.label ?? key}: ${value.toFixed(definition?.precision ?? 1)}${definition?.unit ? ` ${definition.unit}` : ''}`;
    });

    return {
        customerObjective: objective,
        posture,
        controllingConcern,
        supportingEvidence: selectedFixtures.map((item) =>
            `${item.family.toUpperCase()}-like ${item.filename}: ${item.parserStatus} synthetic fixture`,
        ),
        assumptions: [
            'Dashboard outputs are reference-controlled screening estimates, not transport, CFD, qualified fuel-performance, or safety calculations.',
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
            currentValues,
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
    actions.push('Define validation evidence and acceptance criteria before promoting the workflow beyond portfolio demonstration.');
    return actions;
}
