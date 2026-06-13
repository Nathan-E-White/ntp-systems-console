import {
    buildAnalysisLinkRegistryModel,
    buildChartWorkspaceModel,
    buildEngineeringDataWorkspaceModel,
    buildFixtureEvidenceWorkspaceModel,
    buildOutputWorkspaceModel,
    buildParameterWorkspaceModel,
    chartSeriesFromFixture,
    chartSeriesFromTransientPoints,
    type EngineeringDataWorkspaceModel,
} from '../components/analysis';
import {DEFAULT_ANALYSIS_EVIDENCE, getCaseLabel} from './demoModel';
import type {EngineCaseSelection} from '../state/EngineStore';
import type {EngineInputs, EngineOutputs} from '../types/EngineState';
import type {TransientPoint} from '../types/TransientPoint';
import {buildEvidenceWorkspace} from './evidenceModel';

export interface ActiveCaseWorkspaceInput {
    readonly selection: EngineCaseSelection;
    readonly inputs: EngineInputs;
    readonly outputs: EngineOutputs;
    readonly transient: readonly TransientPoint[];
}

export function buildActiveCaseWorkspace({
    selection,
    inputs,
    outputs,
    transient,
}: ActiveCaseWorkspaceInput): EngineeringDataWorkspaceModel {
    const fixtureSeries = DEFAULT_ANALYSIS_EVIDENCE.flatMap((evidence) =>
        (evidence.artifact.parsed?.timeSeries ?? []).map((series) =>
            chartSeriesFromFixture(series, evidence.id),
        ),
    );

    return buildEngineeringDataWorkspaceModel({
        caseId: selection,
        caseLabel: getCaseLabel(selection),
        fixtures: buildFixtureEvidenceWorkspaceModel({
            fixtures: DEFAULT_ANALYSIS_EVIDENCE.map((evidence) => ({
                id: evidence.id,
                family: evidence.family,
                direction: evidence.artifact.parsed?.direction ?? 'output',
                filename: evidence.sourceFile,
                parserStatus: evidence.parserStatus,
                provenance: evidence.provenance,
                validationLabel: evidence.validationLabel,
            })),
        }),
        parameters: buildParameterWorkspaceModel(inputs),
        outputs: buildOutputWorkspaceModel(outputs),
        charts: buildChartWorkspaceModel([
            chartSeriesFromTransientPoints(transient),
            ...fixtureSeries,
        ]),
        links: buildAnalysisLinkRegistryModel(),
        investigationEvidence: buildEvidenceWorkspace(DEFAULT_ANALYSIS_EVIDENCE),
    });
}
