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

export function renameCampaignWorkspace(workspace: CampaignWorkspace, name: string): CampaignWorkspace {
    const nextName = name.trim();
    return {...workspace, name: nextName || workspace.name};
}

export function importCampaignWorkspace(serialized: string): CampaignWorkspace {
    const candidate = JSON.parse(serialized) as Partial<CampaignWorkspace>;
    if (!candidate || typeof candidate.name !== 'string' || !Array.isArray(candidate.artifacts)) {
        throw new Error('Campaign import must contain a name and artifact list.');
    }
    return {
        name: candidate.name,
        artifacts: candidate.artifacts.filter((artifact): artifact is CampaignArtifact => (
            Boolean(artifact) && typeof artifact.id === 'string' && typeof artifact.filename === 'string' &&
            typeof artifact.version === 'number' && typeof artifact.parserIdentity === 'string' &&
            typeof artifact.provenance === 'string' && typeof artifact.reviewRelevance === 'string' &&
            typeof artifact.parserStatus === 'string'
        )),
        storageBoundary: 'browser-session-only',
    };
}

export function exportCampaignWorkspace(workspace: CampaignWorkspace): string {
    return JSON.stringify({
        name: workspace.name,
        storageBoundary: 'No durable storage, sharing, or access control is created by this export.',
        artifacts: workspace.artifacts,
    }, null, 2);
}
