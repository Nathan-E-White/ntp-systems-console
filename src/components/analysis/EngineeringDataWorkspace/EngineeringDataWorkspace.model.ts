import type {AnalysisBoundary} from '../analysisTypes';
import type {AnalysisLinkRegistryModel} from '../AnalysisLinkRegistry/AnalysisLinkRegistry.model';
import type {ChartWorkspaceModel} from '../ChartWorkspace/ChartWorkspace.model';
import type {FixtureEvidenceWorkspaceModel} from '../FixtureEvidenceWorkspace/FixtureEvidenceWorkspace.model';
import type {OutputWorkspaceModel} from '../OutputWorkspace/OutputWorkspace.model';
import type {ParameterWorkspaceModel} from '../ParameterWorkspace/ParameterWorkspace.model';
import type {EvidenceWorkspace} from '../../../demo/evidenceModel';

export interface EngineeringDataWorkspaceModel {
    readonly caseId: string;
    readonly caseLabel: string;
    readonly fixtures: FixtureEvidenceWorkspaceModel;
    readonly parameters: ParameterWorkspaceModel;
    readonly outputs: OutputWorkspaceModel;
    readonly charts: ChartWorkspaceModel;
    readonly links: AnalysisLinkRegistryModel;
    readonly investigationEvidence: EvidenceWorkspace;
    readonly boundary: AnalysisBoundary;
}

export function buildEngineeringDataWorkspaceModel(
    input: Omit<EngineeringDataWorkspaceModel, 'boundary'>,
): EngineeringDataWorkspaceModel {
    return {
        ...input,
        boundary: {
            scope: 'Composes evidence, parameters, outputs, charts, and link metadata for one active case.',
            owns: ['active-case data contract', 'workspace readiness', 'cross-provider composition'],
            excludes: ['global navigation', 'solver execution', '3D or chart rendering libraries'],
        },
    };
}
