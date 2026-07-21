import {useMemo} from 'react';

import {DEFAULT_ANALYSIS_EVIDENCE} from '../demo/demoModel';
import {
    buildChannelWallEvidenceInterpretation,
    buildOperatingCaseDecisionRecord,
    buildReviewPacket,
    buildReviewWorkspace,
} from '../review/reviewCapabilities';
import {ENGINE_INPUT_PRESETS, useEngineStore} from '../state/EngineStore';
import type {EngineInputs} from '../types/EngineState';

const artifacts = DEFAULT_ANALYSIS_EVIDENCE.map((evidence) => evidence.artifact.parsed!).filter(Boolean);

export function ChannelWallEvidenceInterpretationPanel({inputs}: Readonly<{inputs: EngineInputs}>) {
    const interpretation = useMemo(
        () => buildChannelWallEvidenceInterpretation({inputs, artifacts}),
        [inputs],
    );

    return (
        <section className="panel" aria-labelledby="channel-wall-evidence-title">
            <p className="eyebrow">evidence interpretation</p>
            <h2 id="channel-wall-evidence-title">{interpretation.question}</h2>
            <p>{interpretation.claim.statement}</p>
            <dl>
                <dt>Supporting record</dt><dd>{interpretation.supportingRecord}</dd>
                <dt>Conflicting signal</dt><dd>{interpretation.conflictingSignal}</dd>
                <dt>Limitation</dt><dd>{interpretation.limitation}</dd>
                <dt>Next action</dt><dd>{interpretation.nextAction}</dd>
            </dl>
        </section>
    );
}

export function OperatingCaseDecisionRecordPanel({inputs}: Readonly<{inputs: EngineInputs}>) {
    const caseId = useEngineStore((state) => state.selectedPresetId);
    const baselineCaseId = useEngineStore((state) => state.basePresetId);
    const record = useMemo(() => buildOperatingCaseDecisionRecord({
        caseId,
        baselineCaseId,
        inputs,
        baselineInputs: ENGINE_INPUT_PRESETS[baselineCaseId],
        artifacts,
    }), [baselineCaseId, caseId, inputs]);
    const wallDelta = record.baselineDelta.find((delta) => delta.key === 'channelWallCriterionMarginK');

    return (
        <section className="panel" aria-labelledby="operating-decision-record-title">
            <p className="eyebrow">operating-case decision record</p>
            <h2 id="operating-decision-record-title">{record.caseLabel}: {record.posture}</h2>
            <p>{wallDelta ? `Channel-wall margin delta: ${Math.round(wallDelta.delta)} ${wallDelta.unit} against the selected baseline.` : 'No wall-margin delta is available.'}</p>
            <p>{record.provenanceDelta}</p>
            <p>{record.evidenceApplicability}</p>
        </section>
    );
}

export function ReviewPacketExportPanel() {
    const inputs = useEngineStore((state) => state.inputs);
    const caseId = useEngineStore((state) => state.selectedPresetId);
    const baselineCaseId = useEngineStore((state) => state.basePresetId);
    const workspace = useMemo(() => buildReviewWorkspace({
        caseId,
        baselineCaseId,
        inputs,
        baselineInputs: ENGINE_INPUT_PRESETS[baselineCaseId],
        artifacts,
    }), [baselineCaseId, caseId, inputs]);
    const href = useMemo(() => `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(
        buildReviewPacket(workspace),
        null,
        2,
    ))}`, [workspace]);

    return (
        <section className="panel" aria-labelledby="review-packet-title">
            <p className="eyebrow">campaign and review packet</p>
            <h2 id="review-packet-title">Portable review packet</h2>
            <p>{workspace.decisionRecord.evidenceApplicability}</p>
            <p>Version 1 export. Browser-session only; it does not create a durable campaign record.</p>
            <a download="ntp-review-packet.json" href={href}>Download review packet JSON</a>
        </section>
    );
}
