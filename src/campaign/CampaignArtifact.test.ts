import {describe, expect, it} from 'vitest';
import {createFileArtifactFromText} from '../parser/createFileArtifactFromText';
import {addCampaignArtifact, createCampaignWorkspace, exportCampaignWorkspace} from './CampaignArtifact';

describe('CampaignArtifact', () => {
    it('keeps imported evidence versioned and explicitly browser-session-only', () => {
        const artifact = createFileArtifactFromText({filename: 'empty.out', text: ''});
        const workspace = addCampaignArtifact(createCampaignWorkspace('Review A'), artifact);
        expect(workspace.artifacts[0]).toMatchObject({version: 1, filename: 'empty.out'});
        expect(exportCampaignWorkspace(workspace)).toContain('No durable storage');
    });
});
