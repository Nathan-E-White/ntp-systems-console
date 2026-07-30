import {describe, expect, it} from 'vitest';
import {createFileArtifactFromText} from '../parser/createFileArtifactFromText';
import {addCampaignArtifact, compareCampaignArtifacts, createCampaignWorkspace, exportCampaignWorkspace, importCampaignWorkspace, renameCampaignWorkspace} from './CampaignArtifact';

describe('CampaignArtifact', () => {
    it('keeps imported evidence versioned and explicitly browser-session-only', () => {
        const artifact = createFileArtifactFromText({filename: 'empty.out', text: ''});
        const workspace = addCampaignArtifact(createCampaignWorkspace('Review A'), artifact);
        expect(workspace.artifacts[0]).toMatchObject({version: 1, filename: 'empty.out', caseIdentity: 'case-unresolved'});
        expect(workspace.artifacts[0]?.contentHash).toMatch(/^[a-f0-9]+$/);
        expect(exportCampaignWorkspace(workspace)).toContain('No durable storage');
    });
});

it('compares immutable artifact snapshots by version and content identity', () => {
    const first = createFileArtifactFromText({filename: 'a.out', text: 'first'});
    const second = createFileArtifactFromText({filename: 'a.out', text: 'second'});
    const artifacts = addCampaignArtifact(addCampaignArtifact(createCampaignWorkspace(), first), second).artifacts;
    expect(compareCampaignArtifacts(artifacts)[0]).toContain('v1');
    expect(compareCampaignArtifacts(artifacts)[0]).toContain('v2');
});

it('renames and imports only browser-session campaign data', () => {
    const named = renameCampaignWorkspace(createCampaignWorkspace(), 'Thermal review');
    const imported = importCampaignWorkspace(exportCampaignWorkspace(named));
    expect(imported).toMatchObject({name: 'Thermal review', storageBoundary: 'browser-session-only'});
});
