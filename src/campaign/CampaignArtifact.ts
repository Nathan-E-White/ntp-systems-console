import type {FileArtifact} from '../parser/parserTypes';

export interface CampaignArtifact {
    readonly id: string;
    readonly version: number;
    readonly filename: string;
    readonly parserIdentity: string;
    readonly provenance: string;
    readonly reviewRelevance: string;
    readonly parserStatus: FileArtifact<unknown>['parserStatus'];
}

export interface CampaignWorkspace {
    readonly name: string;
    readonly artifacts: readonly CampaignArtifact[];
    readonly storageBoundary: 'browser-session-only';
}

export function createCampaignArtifact(artifact: FileArtifact<unknown>, version: number): CampaignArtifact {
    return {
        id: artifact.id,
        version,
        filename: artifact.filename,
        parserIdentity: artifact.parsed ? `${artifact.parsed.family}-${artifact.parsed.direction}` : 'unresolved-parser',
        provenance: `Local import; parser status ${artifact.parserStatus}.`,
        reviewRelevance: artifact.parsed?.diagnostics.length
            ? 'Review diagnostics and source locations before using this artifact as support.'
            : 'Available for source-located review support.',
        parserStatus: artifact.parserStatus,
    };
}

export function addCampaignArtifact(workspace: CampaignWorkspace, artifact: FileArtifact<unknown>): CampaignWorkspace {
    return {...workspace, artifacts: [...workspace.artifacts, createCampaignArtifact(artifact, workspace.artifacts.length + 1)]};
}

export function createCampaignWorkspace(name = 'Untitled browser-session campaign'): CampaignWorkspace {
    return {name, artifacts: [], storageBoundary: 'browser-session-only'};
}

export function exportCampaignWorkspace(workspace: CampaignWorkspace): string {
    return JSON.stringify({
        name: workspace.name,
        storageBoundary: 'No durable storage, sharing, or access control is created by this export.',
        artifacts: workspace.artifacts,
    }, null, 2);
}
