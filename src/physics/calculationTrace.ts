import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import type {BasisDiagnostic, ModelBasisSummary} from './referenceBasis';
import type {RepresentativeChannelResult} from './representativeChannelModel';

export type EquationClassification =
    | 'physical-relation'
    | 'derived-quantity'
    | 'empirical-screening-correlation'
    | 'presentation-constraint';

export type CalculationNodeId =
    | 'outlet-temperature'
    | 'exhaust-velocity'
    | 'specific-impulse'
    | 'thrust'
    | 'fuel-temperature'
    | 'thermal-margin'
    | 'pressure-drop'
    | 'stability-score'
    | 'stability-posture';

export interface CalculationTerm {
    readonly symbol: string;
    readonly label: string;
    readonly value: number | string;
    readonly unit: string;
    readonly inputKey?: keyof EngineInputs;
    readonly sourceNodeId?: CalculationNodeId;
}
export interface ModelAssumption {
    readonly label: string;
    readonly detail: string;
    readonly active: boolean;
}

export interface CalculationNode {
    readonly id: CalculationNodeId;
    readonly outputKey: keyof EngineOutputs;
    readonly label: string;
    readonly equationId: string;
    readonly equationText: string;
    readonly classification: EquationClassification;
    readonly dependencies: readonly CalculationNodeId[];
    readonly terms: readonly CalculationTerm[];
    readonly substitution: string;
    readonly rawValue: number | string;
    readonly finalValue: number | string;
    readonly unit: string;
    readonly assumptions: readonly ModelAssumption[];
    readonly limitation: string;
    readonly basisId?: string;
    readonly referenceId?: string;
    readonly sourceLocator?: string;
    readonly validity?: string;
    readonly diagnostics?: readonly BasisDiagnostic[];
}

export interface CalculationTrace {
    readonly nodes: readonly CalculationNode[];
}

export interface ModelEvaluation {
    readonly outputs: EngineOutputs;
    readonly trace: CalculationTrace;
    readonly basis: ModelBasisSummary;
    readonly channel: RepresentativeChannelResult | null;
}

export interface TransientPointEvaluation {
    readonly timeSec: number;
    readonly rampFraction: number;
    readonly generatedInputs: EngineInputs;
    readonly evaluation: ModelEvaluation;
}

export function findCalculationNode(
    trace: CalculationTrace,
    outputKey: keyof EngineOutputs,
): CalculationNode | undefined {
    return trace.nodes.find((node) => node.outputKey === outputKey);
}

export function collectInputDependencies(
    trace: CalculationTrace,
    rootNodeId: CalculationNodeId,
): readonly (keyof EngineInputs)[] {
    const collected = new Set<keyof EngineInputs>();
    const visited = new Set<CalculationNodeId>();
    const visit = (nodeId: CalculationNodeId) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        const node = trace.nodes.find((candidate) => candidate.id === nodeId);
        node?.terms.forEach((candidate) => {
            if (candidate.inputKey) collected.add(candidate.inputKey);
        });
        node?.dependencies.forEach(visit);
    };
    visit(rootNodeId);
    return [...collected];
}
