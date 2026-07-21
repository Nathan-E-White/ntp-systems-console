import {getCaseLabel} from '../demo/demoModel';
import {
    type EvidenceClaim,
    type EvidenceReviewProjection,
    projectEvidenceClaims,
} from '../parser/evidenceProjection';
import type {ParsedFileViewModel} from '../parser/parserTypes';
import {evaluateEngineCase} from '../physics/evaluateEngineCase';
import type {CalculationNode} from '../physics/calculationTrace';
import type {EngineCaseSelection, EnginePresetId} from '../state/EngineStore';
import type {EngineInputs, EngineOutputs} from '../types/EngineState';

export interface ChannelWallEvidenceInterpretation {
    readonly question: 'What constrains channel-wall margin?';
    readonly claim: EvidenceClaim;
    readonly supportingRecord: string;
    readonly conflictingSignal: string;
    readonly limitation: string;
    readonly nextAction: string;
    readonly diagnostics: EvidenceReviewProjection['diagnostics'];
}

export interface OperatingCaseDelta {
    readonly key: keyof EngineOutputs;
    readonly baseline: number;
    readonly current: number;
    readonly delta: number;
    readonly unit: string;
}

export interface OperatingCaseDecisionRecord {
    readonly caseId: EngineCaseSelection;
    readonly caseLabel: string;
    readonly baselineCaseId: EnginePresetId;
    readonly posture: EngineOutputs['reviewPosture'];
    readonly result: EngineOutputs;
    readonly baselineDelta: readonly OperatingCaseDelta[];
    readonly trace: readonly Pick<CalculationNode, 'id' | 'equationId' | 'label' | 'limitation'>[];
    readonly provenanceDelta: string;
    readonly evidenceApplicability: string;
}

export interface InvestigationNarrative {
    readonly stepId: 'channel-wall-margin';
    readonly visualCue: 'thermal-channel';
    readonly title: string;
    readonly summary: string;
}

export interface ReviewWorkspace {
    readonly interpretation: ChannelWallEvidenceInterpretation;
    readonly decisionRecord: OperatingCaseDecisionRecord;
    readonly narrative: InvestigationNarrative;
    readonly artifacts: readonly ParsedFileViewModel[];
}

export interface ReviewPacket {
    readonly schemaVersion: 1;
    readonly createdAt: string;
    readonly storageBoundary: string;
    readonly artifacts: readonly {id: string; filename: string; family: string; direction: string}[];
    readonly interpretation: Pick<ChannelWallEvidenceInterpretation, 'question' | 'claim' | 'conflictingSignal' | 'limitation' | 'nextAction'>;
    readonly decisionRecord: OperatingCaseDecisionRecord;
    readonly narrative: InvestigationNarrative;
}

const OUTPUT_UNITS: Record<keyof EngineOutputs, string> = {
    outletTemperatureK: 'K',
    exhaustVelocityMPerSec: 'm/s',
    specificImpulseSec: 's',
    thrustKn: 'kN',
    peakChannelWallTemperatureK: 'K',
    channelWallCriterionMarginK: 'K',
    pressureDropMpa: 'MPa',
    basisCompletenessPercent: '%',
    reviewPosture: '',
};

const numericOutputKeys: readonly (keyof EngineOutputs)[] = [
    'outletTemperatureK',
    'exhaustVelocityMPerSec',
    'specificImpulseSec',
    'thrustKn',
    'peakChannelWallTemperatureK',
    'channelWallCriterionMarginK',
    'pressureDropMpa',
    'basisCompletenessPercent',
];

export function buildChannelWallEvidenceInterpretation(input: {
    readonly inputs: EngineInputs;
    readonly artifacts: readonly ParsedFileViewModel[];
}): ChannelWallEvidenceInterpretation {
    const evaluation = evaluateEngineCase(input.inputs);
    const projection = projectEvidenceClaims({
        artifacts: input.artifacts,
        definitions: [{
            id: 'channel-wall-margin-constraint',
            statement: 'The MOOSE-like thermal and BISON-like fuel fixture records identify the thermal and fuel evidence that should be reviewed when the reduced-order channel-wall margin is controlling.',
            limitation: 'The result is a screening margin against a user-selected wall criterion, not a qualified fuel-performance margin.',
            nextAction: 'Compare the controlling channel condition with higher-fidelity thermal-structures and fuel-performance work before making a material or operating-limit decision.',
            sources: [
                {artifactId: 'moose-output', recordId: 'final-postprocessor-values'},
                {artifactId: 'bison-output', recordId: 'final-review-summary'},
            ],
        }],
    });
    const claim = projection.claims[0];

    if (!claim) {
        throw new Error('Channel-wall evidence interpretation requires the MOOSE and BISON fixture artifacts.');
    }

    return {
        question: 'What constrains channel-wall margin?',
        claim,
        supportingRecord: `The calculated representative-channel screening margin is ${Math.round(evaluation.outputs.channelWallCriterionMarginK)} K; the MOOSE-like fixture provides a thermal-structures record for review context.`,
        conflictingSignal: 'The supporting thermal and fuel records are static synthetic fixtures, so they do not update when the browser-side operating case changes.',
        limitation: claim.limitation,
        nextAction: claim.nextAction,
        diagnostics: projection.diagnostics,
    };
}

export function buildOperatingCaseDecisionRecord(input: {
    readonly caseId: EngineCaseSelection;
    readonly baselineCaseId: EnginePresetId;
    readonly inputs: EngineInputs;
    readonly baselineInputs: EngineInputs;
    readonly artifacts: readonly ParsedFileViewModel[];
}): OperatingCaseDecisionRecord {
    const evaluation = evaluateEngineCase(input.inputs);
    const baseline = evaluateEngineCase(input.baselineInputs);

    return {
        caseId: input.caseId,
        caseLabel: getCaseLabel(input.caseId),
        baselineCaseId: input.baselineCaseId,
        posture: evaluation.outputs.reviewPosture,
        result: evaluation.outputs,
        baselineDelta: numericOutputKeys.map((key) => ({
            key,
            baseline: baseline.outputs[key] as number,
            current: evaluation.outputs[key] as number,
            delta: (evaluation.outputs[key] as number) - (baseline.outputs[key] as number),
            unit: OUTPUT_UNITS[key],
        })),
        trace: evaluation.trace.nodes.map(({id, equationId, label, limitation}) => ({id, equationId, label, limitation})),
        provenanceDelta: input.caseId === 'customWhatIf'
            ? 'Inputs changed in the browser-side reduced-order model; no fixture was rerun, changed, or promoted to a calculated result.'
            : 'Prepared operating-case inputs select a repository-defined reduced-order evaluation; no fixture was rerun.',
        evidenceApplicability: `The ${input.artifacts.length} parsed Evidence Artifacts remain unchanged and provide read-only review context only.`,
    };
}

export function buildInvestigationNarrative(record: OperatingCaseDecisionRecord): InvestigationNarrative {
    return {
        stepId: 'channel-wall-margin',
        visualCue: 'thermal-channel',
        title: 'Channel-wall margin controls the review',
        summary: record.posture === 'limit'
            ? 'The screening margin is below the selected criterion; hold performance conclusions until the thermal and fuel handoff is reviewed.'
            : 'The screening margin remains the leading thermal review question; retain the model limitation alongside the result.',
    };
}

export function buildReviewWorkspace(input: {
    readonly caseId: EngineCaseSelection;
    readonly baselineCaseId: EnginePresetId;
    readonly inputs: EngineInputs;
    readonly baselineInputs: EngineInputs;
    readonly artifacts: readonly ParsedFileViewModel[];
}): ReviewWorkspace {
    const interpretation = buildChannelWallEvidenceInterpretation(input);
    const decisionRecord = buildOperatingCaseDecisionRecord(input);

    return {
        interpretation,
        decisionRecord,
        narrative: buildInvestigationNarrative(decisionRecord),
        artifacts: input.artifacts,
    };
}

export function buildReviewPacket(workspace: ReviewWorkspace, createdAt = new Date().toISOString()): ReviewPacket {
    return {
        schemaVersion: 1,
        createdAt,
        storageBoundary: 'This Review Packet is an in-memory export for the portfolio workflow. It is not persisted, shared, access-controlled, or stored in MongoDB.',
        artifacts: workspace.artifacts.map(({id, filename, family, direction}) => ({id, filename, family, direction})),
        interpretation: {
            question: workspace.interpretation.question,
            claim: workspace.interpretation.claim,
            conflictingSignal: workspace.interpretation.conflictingSignal,
            limitation: workspace.interpretation.limitation,
            nextAction: workspace.interpretation.nextAction,
        },
        decisionRecord: workspace.decisionRecord,
        narrative: workspace.narrative,
    };
}
