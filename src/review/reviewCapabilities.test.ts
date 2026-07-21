import {describe, expect, it} from 'vitest';

import {DEFAULT_ANALYSIS_EVIDENCE} from '../demo/demoModel';
import {ENGINE_INPUT_PRESETS} from '../state/EngineStore';
import {
    buildChannelWallEvidenceInterpretation,
    buildOperatingCaseDecisionRecord,
    buildReviewPacket,
    buildReviewWorkspace,
} from './reviewCapabilities';

describe('review capabilities', () => {
    const baseline = ENGINE_INPUT_PRESETS.baselineStartup;
    const investigation = ENGINE_INPUT_PRESETS.thermalMarginInvestigation;

    it('answers the channel-wall-margin question with a claim, conflict, limitation, and next action', () => {
        const interpretation = buildChannelWallEvidenceInterpretation({
            inputs: investigation,
            artifacts: DEFAULT_ANALYSIS_EVIDENCE.map((evidence) => evidence.artifact.parsed!).filter(Boolean),
        });

        expect(interpretation.question).toBe('What constrains channel-wall margin?');
        expect(interpretation.claim.sourceLocators).toHaveLength(2);
        expect(interpretation.supportingRecord).toContain('screening margin');
        expect(interpretation.conflictingSignal).toContain('static synthetic fixture');
        expect(interpretation.limitation).toContain('qualified fuel-performance');
        expect(interpretation.nextAction).toContain('higher-fidelity');
    });

    it('records the case delta, trace, posture, and unchanged fixture applicability', () => {
        const record = buildOperatingCaseDecisionRecord({
            caseId: 'customWhatIf',
            baselineCaseId: 'baselineStartup',
            inputs: investigation,
            baselineInputs: baseline,
            artifacts: DEFAULT_ANALYSIS_EVIDENCE.map((evidence) => evidence.artifact.parsed!).filter(Boolean),
        });

        expect(record.caseLabel).toBe('Custom What-If');
        expect(record.baselineDelta.some((delta) => delta.key === 'channelWallCriterionMarginK')).toBe(true);
        expect(record.trace.length).toBeGreaterThan(0);
        expect(record.evidenceApplicability).toContain('unchanged');
        expect(record.provenanceDelta).toContain('browser-side');
    });

    it('creates a versioned export packet without asserting persistent storage', () => {
        const workspace = buildReviewWorkspace({
            caseId: 'customWhatIf',
            baselineCaseId: 'baselineStartup',
            inputs: investigation,
            baselineInputs: baseline,
            artifacts: DEFAULT_ANALYSIS_EVIDENCE.map((evidence) => evidence.artifact.parsed!).filter(Boolean),
        });
        const packet = buildReviewPacket(workspace, '2026-07-21T12:00:00.000Z');

        expect(packet.schemaVersion).toBe(1);
        expect(packet.storageBoundary).toContain('not persisted');
        expect(packet.artifacts).toHaveLength(DEFAULT_ANALYSIS_EVIDENCE.length);
        expect(packet.decisionRecord.caseLabel).toBe('Custom What-If');
    });
});
