import {useState} from 'react';

import {DEFAULT_ANALYSIS_EVIDENCE, type AnalysisEvidence} from '../../demo/demoModel';
import {createFileArtifactFromText} from '../../parser/createFileArtifactFromText';
import type {ParsedRecordValue} from '../../parser/parserTypes';
import {useAnalysisLinkRegistry} from '../analysis';
import {SectionShell} from '../layout/SectionShell';
import {InvestigationThread, useGuidedInvestigation} from '../visualization';

export function ModelEvidenceSection({
    onReturnToOperatingCase,
}: Readonly<{onReturnToOperatingCase: () => void}>) {
    const investigation = useGuidedInvestigation();
    const component = investigation.model.components.find(
        (candidate) => candidate.id === investigation.state.selectedComponentId,
    ) ?? investigation.model.components[0];
    return (
        <SectionShell eyebrow="synthetic model handoff" title="Model Evidence"
                      titleId="model-evidence-title"
                      description="Inspect four output artifacts across three synthetic solver families without presenting the fixtures as validated calculations.">
            <InvestigationThread onReturnToOperatingCase={onReturnToOperatingCase}/>
            <div className="evidence-grid">
                {DEFAULT_ANALYSIS_EVIDENCE.map((evidence) => (
                    <EvidenceCard
                        evidence={evidence}
                        focused={component.fixtureIds.includes(evidence.id)}
                        key={evidence.id}
                    />
                ))}
            </div>
            <AdvancedParser/>
        </SectionShell>
    );
}

function EvidenceCard({evidence, focused}: Readonly<{evidence: AnalysisEvidence; focused: boolean}>) {
    const links = useAnalysisLinkRegistry();
    const parsed = evidence.artifact.parsed;
    const firstTable = parsed?.tables[0];
    const firstSection = parsed?.sections[0];

    const linked =
        (links.state.activeLinkId === 'thermal-margin' && (evidence.family === 'mcnp' || evidence.family === 'moose')) ||
        (links.state.activeLinkId === 'propulsion-stability' && evidence.family === 'rocets');
    const linkId = evidence.family === 'rocets' ? 'propulsion-stability' : 'thermal-margin';

    return (
        <article
            className={`panel evidence-card ${linked ? 'linked-evidence' : ''} ${focused ? 'focused-evidence' : ''}`}
            data-evidence-id={evidence.id}
        >
            <div className="evidence-card__heading">
                <div>
                    <p className="eyebrow">{evidence.family}-like workflow evidence</p>
                    <h2>{evidence.label}</h2>
                </div>
                <span className={`posture-chip ${evidence.parserStatus === 'parsed' ? 'nominal' : 'limit'}`}>
                    {focused ? `focused · ${evidence.parserStatus}` : evidence.parserStatus}
                </span>
            </div>
            <dl className="evidence-provenance">
                <div><dt>Source</dt><dd>{evidence.sourceFile}</dd></div>
                <div><dt>Provenance</dt><dd>{evidence.provenance}</dd></div>
                <div><dt>Case ID</dt><dd>{parsed?.caseId ?? 'fixture-defined'}</dd></div>
                <div><dt>Validation</dt><dd>{evidence.validationLabel}</dd></div>
            </dl>
            <div className="evidence-metrics">
                {evidence.metrics.map((metric) => (
                    <button key={metric.label} onClick={() => links.activateLink(linkId)} type="button">
                        <span>{metric.label}</span><strong>{metric.value}</strong>
                    </button>
                ))}
            </div>
            <details>
                <summary>Parsed source records and diagnostics</summary>
                {firstSection ? (
                    <div className="parsed-record-preview">
                        <h3>{firstSection.title}</h3>
                        <pre>{JSON.stringify(firstSection.records.slice(0, 2), null, 2)}</pre>
                    </div>
                ) : null}
                {firstTable ? (
                    <div className="parsed-table-wrap">
                        <h3>{firstTable.title}</h3>
                        <table>
                            <thead><tr>{firstTable.columns.slice(0, 4).map((column) => <th key={column.id}>{column.label}</th>)}</tr></thead>
                            <tbody>{firstTable.rows.slice(0, 3).map((row, index) => (
                                <tr key={index}>{firstTable.columns.slice(0, 4).map((column) => <td key={column.id}>{formatValue(row[column.id])}</td>)}</tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : null}
                <ul className="diagnostic-list compact">
                    {(evidence.diagnostics.length ? evidence.diagnostics : [{severity: 'info' as const, message: 'No parser diagnostics.'}])
                        .slice(0, 4).map((diagnostic, index) => (
                            <li key={`${diagnostic.message}-${index}`}><strong>{diagnostic.severity}</strong><span>{diagnostic.message}</span></li>
                        ))}
                </ul>
            </details>
        </article>
    );
}

function AdvancedParser() {
    const [filename, setFilename] = useState('analysis-output.txt');
    const [text, setText] = useState('');
    const [result, setResult] = useState<ReturnType<typeof createFileArtifactFromText>>();

    return (
        <details className="panel advanced-parser">
            <summary>Advanced: parse another engineering fixture</summary>
            <p>Paste synthetic MCNP, MOOSE, or ROCETS input/output text. This does not alter the active operating case.</p>
            <label><span>Filename</span><input value={filename} onChange={(event) => setFilename(event.target.value)}/></label>
            <label><span>File text</span><textarea rows={8} value={text} onChange={(event) => setText(event.target.value)}/></label>
            <div className="file-parser-actions">
                <button type="button" onClick={() => setResult(createFileArtifactFromText({filename, text}))}>Parse fixture</button>
                <button type="button" onClick={() => { setText(''); setResult(undefined); }}>Reset</button>
            </div>
            {result ? (
                <p className={result.parserStatus === 'parsed' ? 'parser-result success' : 'parser-result error'}>
                    {result.parserStatus}: {result.parsed?.displayName ?? result.error}
                </p>
            ) : null}
        </details>
    );
}

function formatValue(value: ParsedRecordValue | undefined): string {
    if (value === undefined || value === null) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}
