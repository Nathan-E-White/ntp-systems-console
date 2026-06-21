import {
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {ChevronLeft, ChevronRight, Play, Square} from 'lucide-react';

import {DEFAULT_ANALYSIS_EVIDENCE, EVIDENCE_PAIRING_INVENTORY, type AnalysisEvidence} from '../../demo/demoModel';
import type {ParsedScalarValue, ParsedTable, ParserDirection, ParserFamily} from '../../parser/parserTypes';
import {StructuredCodeViewer} from '../StructuredCodeViewer';
import {ParsedArtifactViewer} from '../ParsedArtifactViewer';
import {
    type EvidenceWalkthroughStepId,
    useAnalysisLinkRegistry,
    useEngineeringDataWorkspace,
    useEvidenceWalkthrough,
} from '../analysis';
import {SectionShell} from '../layout/SectionShell';
import {
    EvidenceDatasetPanels,
    InvestigationThread,
    useGuidedInvestigation,
} from '../visualization';
import {ParsedDomainStructuredView} from '../ParsedDomainStructuredView';

type DirectionFilter = 'all' | ParserDirection;
type FamilyFilter = 'all' | ParserFamily;
type DiagnosticSummary = {
    readonly severity: AnalysisEvidence['diagnostics'][number]['severity'];
    readonly label: string;
    readonly detail: string;
};

const DIRECTION_FILTERS: ReadonlyArray<DirectionFilter> = ['all', 'input', 'output'];
const FAMILY_FILTERS: ReadonlyArray<FamilyFilter> = ['all', 'mcnp', 'moose', 'rocets'];
const DEFAULT_EVIDENCE_SPLIT_PERCENT = 68;
const MIN_EVIDENCE_SPLIT_PERCENT = 44;
const MAX_EVIDENCE_SPLIT_PERCENT = 84;
type RocetsEvidenceTabId = 'feed' | 'nozzle' | 'stability';

const ROCETS_TAB_BY_STEP: Partial<Record<EvidenceWalkthroughStepId, RocetsEvidenceTabId>> = {
    'rocets-feed-turbomachinery': 'feed',
    'rocets-nozzle-performance': 'nozzle',
    'rocets-stability': 'stability',
};

const ROCETS_TABS: ReadonlyArray<{
    readonly id: RocetsEvidenceTabId;
    readonly label: string;
    readonly datasetId: string;
    readonly tableIds: readonly string[];
}> = [
    {
        id: 'feed',
        label: 'Feed / turbomachinery',
        datasetId: 'rocets-feed-history',
        tableIds: ['feed-turbomachinery-history', 'mission-phases', 'solver-residuals', 'advisory-diagnostics', 'warnings'],
    },
    {
        id: 'nozzle',
        label: 'Nozzle',
        datasetId: 'rocets-nozzle-history',
        tableIds: ['nozzle-performance-history', 'mission-phases', 'output-requests', 'warnings'],
    },
    {
        id: 'stability',
        label: 'Stability',
        datasetId: 'rocets-stability-history',
        tableIds: ['transient-log', 'overview-snapshots', 'advisory-diagnostics', 'warnings'],
    },
];

const MOOSE_TABLE_IDS = [
    'postprocessor-history',
    'final-postprocessor-values',
    'coupling-history',
    'residual-history',
    'materials-history',
    'warnings',
] as const;

const STATUS_LABELS: Record<AnalysisEvidence['parserStatus'], string> = {
    error: 'Parser error',
    parsed: 'Parsed',
    unparsed: 'Unparsed',
    unsupported: 'Unsupported',
};

function directionCounts(): Record<DirectionFilter, number> {
    const output = DEFAULT_ANALYSIS_EVIDENCE.filter((evidence) => evidence.direction === 'output').length;
    const input = DEFAULT_ANALYSIS_EVIDENCE.filter((evidence) => evidence.direction === 'input').length;
    return {all: DEFAULT_ANALYSIS_EVIDENCE.length, input, output};
}

function familyCounts(): Record<FamilyFilter, number> {
    return {
        all: DEFAULT_ANALYSIS_EVIDENCE.length,
        mcnp: DEFAULT_ANALYSIS_EVIDENCE.filter((evidence) => evidence.family === 'mcnp').length,
        moose: DEFAULT_ANALYSIS_EVIDENCE.filter((evidence) => evidence.family === 'moose').length,
        rocets: DEFAULT_ANALYSIS_EVIDENCE.filter((evidence) => evidence.family === 'rocets').length,
    };
}

export function ModelEvidenceSection({
    onReturnToOperatingCase,
}: Readonly<{onReturnToOperatingCase: () => void}>) {
    const [selectedDirection, setSelectedDirection] = useState<DirectionFilter>('all');
    const [selectedFamily, setSelectedFamily] = useState<FamilyFilter>('all');
    const [focusedEvidenceId, setFocusedEvidenceId] = useState<string>();
    const walkthrough = useEvidenceWalkthrough();
    const investigation = useGuidedInvestigation();
    const component = investigation.model.components.find(
        (candidate) => candidate.id === investigation.state.selectedComponentId,
    ) ?? investigation.model.components[0];

    const evidence = useMemo(
        () => DEFAULT_ANALYSIS_EVIDENCE.filter((item) => (
            (selectedDirection === 'all' || item.direction === selectedDirection) &&
            (selectedFamily === 'all' || item.family === selectedFamily)
        )),
        [selectedDirection, selectedFamily],
    );
    const focusedEvidence = DEFAULT_ANALYSIS_EVIDENCE.find((item) => item.id === focusedEvidenceId);

    const counts = directionCounts();
    const familyFilterCounts = familyCounts();
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (!walkthrough.activeStep || walkthrough.state.status !== 'active') return;
        setSelectedDirection('all');
        setSelectedFamily('all');
        setFocusedEvidenceId(walkthrough.activeStep.evidenceId);
    }, [walkthrough.activeStep, walkthrough.state.status]);

    return (
        <SectionShell
            eyebrow="solver handoff"
            title="Model Evidence"
            titleId="model-evidence-title"
            description="Read-only synthetic fixture explorer."
        >
            <div className="evidence-set-provenance">
                <div><dt>Source set</dt><dd>Repository-bundled public fixtures</dd></div>
                <div><dt>Boundary</dt><dd>Read-only parser evidence</dd></div>
                <div><dt>Excludes</dt><dd>Solver execution and validation claims</dd></div>
            </div>

            <EvidenceWalkthroughControls reducedMotion={reducedMotion}/>

            <div className="evidence-filter-stack">
                <div className="raw-output-tabs" role="tablist" aria-label="Evidence direction filter">
                    {DIRECTION_FILTERS.map((direction) => {
                        const active = selectedDirection === direction;
                        return (
                            <button
                                aria-pressed={active}
                                className={active ? 'raw-output-tab active' : 'raw-output-tab'}
                                key={direction}
                                onClick={() => {
                                    setSelectedDirection(direction);
                                    setFocusedEvidenceId(undefined);
                                }}
                                type="button"
                            >
                                {direction.toUpperCase()} ({counts[direction]})
                            </button>
                        );
                    })}
                </div>
                <div className="raw-output-tabs" role="tablist" aria-label="Evidence family filter">
                    {FAMILY_FILTERS.map((family) => {
                        const active = selectedFamily === family;
                        return (
                            <button
                                aria-pressed={active}
                                className={active ? 'raw-output-tab active' : 'raw-output-tab'}
                                key={family}
                                onClick={() => {
                                    setSelectedFamily(family);
                                    setFocusedEvidenceId(undefined);
                                }}
                                type="button"
                            >
                                {family.toUpperCase()} ({familyFilterCounts[family]})
                            </button>
                        );
                    })}
                </div>
            </div>

            <InvestigationThread onReturnToOperatingCase={onReturnToOperatingCase}/>
            <EvidencePairingInventory/>
            <div className={focusedEvidence ? 'evidence-inspection-workspace' : undefined}>
                {focusedEvidence ? (
                    <div className="evidence-focus-toolbar">
                        <button onClick={() => setFocusedEvidenceId(undefined)} type="button">Show all cards</button>
                        <span>{focusedEvidence.label} in inspection view</span>
                    </div>
                ) : null}
                {focusedEvidence ? (
                    <div className="evidence-grid evidence-grid--focused">
                        <EvidenceCard
                            evidence={focusedEvidence}
                            expanded
                            focused={component.fixtureIds.includes(focusedEvidence.id)}
                            onSelect={() => setFocusedEvidenceId(focusedEvidence.id)}
                        />
                    </div>
                ) : (
                    <EvidencePairingSections
                        componentFixtureIds={component.fixtureIds}
                        evidence={evidence}
                        onSelectEvidence={setFocusedEvidenceId}
                    />
                )}
            </div>
        </SectionShell>
    );
}

function EvidenceWalkthroughControls({reducedMotion}: Readonly<{reducedMotion: boolean}>) {
    const walkthrough = useEvidenceWalkthrough();
    const activeStep = walkthrough.activeStep;

    return (
        <section className="evidence-walkthrough" aria-label="Evidence walkthrough">
            <div className="evidence-walkthrough__heading">
                <div>
                    <p className="eyebrow">guided evidence tour</p>
                    <h3>{activeStep?.label ?? 'MOOSE and RoCETS walkthrough'}</h3>
                    <p>{activeStep?.interpretation ?? 'Step through thermal response, feed/turbomachinery, nozzle performance, and stability evidence.'}</p>
                </div>
                <span>{walkthrough.state.status === 'active' ? `Step ${(walkthrough.state.activeStepIndex ?? 0) + 1} of ${walkthrough.model.steps.length}` : `${walkthrough.model.steps.length} steps`}</span>
            </div>
            <div className="evidence-walkthrough__steps" role="tablist" aria-label="Evidence walkthrough steps">
                {walkthrough.model.steps.map((step, index) => (
                    <button
                        aria-pressed={activeStep?.id === step.id}
                        className={activeStep?.id === step.id ? 'active' : undefined}
                        key={step.id}
                        onClick={() => walkthrough.selectStep(step.id, {reducedMotion})}
                        type="button"
                    >
                        <span>{index + 1}</span>
                        {step.label}
                    </button>
                ))}
            </div>
            <div className="evidence-walkthrough__actions">
                <button onClick={() => walkthrough.start({reducedMotion})} type="button">
                    <Play aria-hidden="true" size={15}/>
                    {walkthrough.state.status === 'complete' ? 'Replay tour' : 'Start tour'}
                </button>
                <button disabled={walkthrough.state.status !== 'active' || walkthrough.state.activeStepIndex === 0} onClick={walkthrough.previous} type="button">
                    <ChevronLeft aria-hidden="true" size={15}/>
                    Previous
                </button>
                <button disabled={walkthrough.state.status !== 'active'} onClick={walkthrough.next} type="button">
                    <ChevronRight aria-hidden="true" size={15}/>
                    Next
                </button>
                <button disabled={walkthrough.state.status === 'idle'} onClick={walkthrough.stop} type="button">
                    <Square aria-hidden="true" size={13}/>
                    Stop
                </button>
            </div>
        </section>
    );
}

function EvidencePairingSections({
    componentFixtureIds,
    evidence,
    onSelectEvidence,
}: Readonly<{
    componentFixtureIds: readonly string[];
    evidence: readonly AnalysisEvidence[];
    onSelectEvidence: (evidenceId: string) => void;
}>) {
    const evidenceById = new Map(evidence.map((entry) => [entry.id, entry]));

    return (
        <div className="evidence-pairing-sections">
            {EVIDENCE_PAIRING_INVENTORY.map((pairing) => {
                const outputCards = pairing.outputIds.map((id) => evidenceById.get(id)).filter((entry): entry is AnalysisEvidence => Boolean(entry));
                const inputCards = pairing.inputIds.map((id) => evidenceById.get(id)).filter((entry): entry is AnalysisEvidence => Boolean(entry));
                if (!outputCards.length && !inputCards.length) return null;

                return (
                    <section className="evidence-pair-section" key={pairing.id}>
                        <header className="evidence-pair-section__header">
                            <div>
                                <p className="eyebrow">fixture pair</p>
                                <h3>{pairing.label}</h3>
                                <p>{pairing.summary}</p>
                            </div>
                            <span>{outputCards.length} output / {inputCards.length} input</span>
                        </header>
                        {outputCards.length ? (
                            <div className="evidence-output-grid">
                                {outputCards.map((entry) => (
                                    <EvidenceCard
                                        evidence={entry}
                                        expanded={false}
                                        focused={componentFixtureIds.includes(entry.id)}
                                        key={entry.id}
                                        onSelect={() => onSelectEvidence(entry.id)}
                                    />
                                ))}
                            </div>
                        ) : null}
                        {inputCards.length ? (
                            <div className="evidence-companion-grid" aria-label={`${pairing.label} companion inputs`}>
                                {inputCards.map((entry) => (
                                    <EvidenceCard
                                        evidence={entry}
                                        expanded={false}
                                        focused={componentFixtureIds.includes(entry.id)}
                                        key={entry.id}
                                        onSelect={() => onSelectEvidence(entry.id)}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </section>
                );
            })}
        </div>
    );
}

function EvidenceCard({
    evidence,
    expanded,
    focused,
    onSelect,
}: Readonly<{evidence: AnalysisEvidence; expanded: boolean; focused: boolean; onSelect: () => void}>) {
    const links = useAnalysisLinkRegistry();
    const [rawTextOpen, setRawTextOpen] = useState(false);
    const [rawPaneCollapsed, setRawPaneCollapsed] = useState(false);
    const [splitPercent, setSplitPercent] = useState(DEFAULT_EVIDENCE_SPLIT_PERCENT);
    const splitRef = useRef<HTMLDivElement>(null);
    const parsed = evidence.artifact.parsed;
    const parsedText = parsed ? serializeForViewer(parsed.rawParsed) : null;

    const linked =
        (links.state.activeLinkId === 'thermal-margin' && (evidence.family === 'mcnp' || evidence.family === 'moose')) ||
        (links.state.activeLinkId === 'propulsion-stability' && evidence.family === 'rocets');
    const linkId = evidence.family === 'rocets' ? 'propulsion-stability' : 'thermal-margin';

    const handleCardClick = (event: MouseEvent<HTMLElement>) => {
        const target = event.target as HTMLElement;
        if (!expanded && target.closest('details, summary')) {
            event.preventDefault();
            onSelect();
            return;
        }
        if (target.closest('button, a, details, summary, input, textarea, select')) {
            return;
        }
        onSelect();
    };

    const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.currentTarget !== event.target || expanded || !['Enter', ' '].includes(event.key)) {
            return;
        }
        event.preventDefault();
        onSelect();
    };

    const updateSplitFromClientX = (clientX: number) => {
        const rect = splitRef.current?.getBoundingClientRect();
        if (!rect?.width) {
            return;
        }

        const nextPercent = ((clientX - rect.left) / rect.width) * 100;
        setSplitPercent(Math.min(MAX_EVIDENCE_SPLIT_PERCENT, Math.max(MIN_EVIDENCE_SPLIT_PERCENT, nextPercent)));
    };

    const handleSplitterPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
        if (rawPaneCollapsed) {
            return;
        }
        event.preventDefault();
        updateSplitFromClientX(event.clientX);

        const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
            moveEvent.preventDefault();
            updateSplitFromClientX(moveEvent.clientX);
        };
        const handlePointerUp = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp, {once: true});
    };

    const handleSplitterKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (rawPaneCollapsed) {
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setSplitPercent((current) => Math.max(MIN_EVIDENCE_SPLIT_PERCENT, current - 4));
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            setSplitPercent((current) => Math.min(MAX_EVIDENCE_SPLIT_PERCENT, current + 4));
        } else if (event.key === 'Home') {
            event.preventDefault();
            setSplitPercent(MIN_EVIDENCE_SPLIT_PERCENT);
        } else if (event.key === 'End') {
            event.preventDefault();
            setSplitPercent(MAX_EVIDENCE_SPLIT_PERCENT);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            setSplitPercent(DEFAULT_EVIDENCE_SPLIT_PERCENT);
        }
    };

    return (
        <article
            aria-label={`Inspect ${evidence.label}`}
            className={`panel evidence-card ${linked ? 'linked-evidence' : ''} ${focused ? 'focused-evidence' : ''} ${expanded ? 'evidence-card--expanded' : ''}`}
            data-evidence-direction={evidence.direction}
            data-evidence-id={evidence.id}
            onClick={handleCardClick}
            onKeyDown={handleCardKeyDown}
            tabIndex={expanded ? -1 : 0}
        >
            <div className="evidence-card__heading">
                <div>
                    <p className="eyebrow">{evidence.family}-like evidence</p>
                    <h2>{evidence.label}</h2>
                </div>
                <div className="evidence-card__heading-badges">
                    <span className="posture-chip watch">{evidence.direction}</span>
                    <span className={`posture-chip ${focused ? 'nominal' : evidence.parserStatus === 'error' ? 'limit' : 'watch'}`}>
                        {focused ? `selected component · ${STATUS_LABELS[evidence.parserStatus]}` : STATUS_LABELS[evidence.parserStatus]}
                    </span>
                </div>
            </div>
            <details className="evidence-metadata">
                <summary>Fixture metadata</summary>
                <dl className="evidence-provenance">
                    <div><dt>Source</dt><dd>{evidence.sourceFile}</dd></div>
                    <div><dt>Case ID</dt><dd>{parsed?.caseId ?? 'fixture-defined'}</dd></div>
                    <div><dt>Direction</dt><dd>{evidence.direction}</dd></div>
                    <div><dt>Parser</dt><dd>{parsed?.displayName ?? evidence.family.toUpperCase()}</dd></div>
                    <div><dt>Records</dt><dd>{buildRecordCountLabel(parsed)}</dd></div>
                </dl>
            </details>
            <div className="evidence-metrics">
                {evidence.metrics.map((metric) => (
                    <button
                        aria-label={`Open evidence link for ${metric.label}`}
                        key={metric.label}
                        onClick={() => links.activateLink(linkId)}
                        type="button"
                    >
                        <span>{metric.label}</span><strong>{metric.value}</strong>
                    </button>
                ))}
            </div>
            {parsed?.summaryCards.length ? (
                <div className="evidence-summary-strip" aria-label={`${evidence.label} parser summary`}>
                    {parsed.summaryCards.slice(0, 4).map((card) => (
                        <div className={`evidence-summary-card ${card.severity ? `evidence-summary-card--${card.severity}` : ''}`} key={card.id}>
                            <span>{card.label}</span>
                            <strong>{formatParsedValue(card.value, card.unit)}</strong>
                        </div>
                    ))}
                </div>
            ) : null}
            <EvidenceParsedInventory evidence={evidence}/>
            <RichEvidencePanel evidence={evidence}/>
            <details open={expanded}>
                <summary>Parsed source records and diagnostics</summary>
                {expanded ? (
                    <>
                        <p className="artifact-read-only-note">Read-only parser output; fixture editing and solver reruns stay outside this page.</p>
                        <div
                            className={rawPaneCollapsed ? 'evidence-artifact-split evidence-artifact-split--raw-collapsed' : 'evidence-artifact-split'}
                            ref={splitRef}
                            style={{'--evidence-split': `${splitPercent}%`} as CSSProperties}
                        >
                            {parsedText ? (
                                <section className="evidence-artifact-pane">
                                    <h3>Parsed tables and records</h3>
                                    <ParsedArtifactViewer
                                        artifactTitle={`${evidence.label} parsed data`}
                                        data={parsed}
                                        direction={evidence.direction}
                                        family={evidence.family}
                                        rawText={parsedText}
                                    />
                                </section>
                            ) : null}
                            {parsedText && !rawPaneCollapsed ? (
                                <button
                                    aria-label="Resize parsed and raw fixture panes"
                                    aria-orientation="vertical"
                                    aria-valuemax={MAX_EVIDENCE_SPLIT_PERCENT}
                                    aria-valuemin={MIN_EVIDENCE_SPLIT_PERCENT}
                                    aria-valuenow={Math.round(splitPercent)}
                                    className="evidence-pane-splitter"
                                    onDoubleClick={() => setSplitPercent(DEFAULT_EVIDENCE_SPLIT_PERCENT)}
                                    onKeyDown={handleSplitterKeyDown}
                                    onPointerDown={handleSplitterPointerDown}
                                    role="separator"
                                    type="button"
                                />
                            ) : null}
                            <section className="evidence-artifact-pane evidence-artifact-pane--raw">
                                <div className="evidence-raw-pane-toolbar">
                                    <h3>Raw fixture text</h3>
                                    <button
                                        onClick={() => setRawPaneCollapsed((current) => !current)}
                                        type="button"
                                    >
                                        {rawPaneCollapsed ? 'Show raw' : 'Hide raw'}
                                    </button>
                                </div>
                                {rawPaneCollapsed ? (
                                    <p className="artifact-read-only-note">Raw fixture text hidden; parsed tables keep the inspection width.</p>
                                ) : (
                                    <details
                                        className="evidence-raw-text-drawer"
                                        onToggle={(event) => setRawTextOpen(event.currentTarget.open)}
                                    >
                                        <summary>Open raw fixture text</summary>
                                        {rawTextOpen ? (
                                            <StructuredCodeViewer
                                                ariaLabel={`${evidence.label} raw fixture text`}
                                                className="parsed-json-panel"
                                                content={evidence.artifact.text}
                                                direction={evidence.direction}
                                                family={evidence.family}
                                                language="text"
                                            />
                                        ) : null}
                                    </details>
                                )}
                            </section>
                        </div>
                        <EvidenceDiagnostics evidence={evidence}/>
                    </>
                ) : null}
            </details>
        </article>
    );
}

function RichEvidencePanel({evidence}: Readonly<{evidence: AnalysisEvidence}>) {
    if (evidence.direction !== 'output') return null;
    if (evidence.family === 'moose') {
        return <MooseEvidencePanel evidence={evidence}/>;
    }
    if (evidence.family === 'rocets') {
        return <RocetsEvidencePanel evidence={evidence}/>;
    }
    return null;
}

function MooseEvidencePanel({evidence}: Readonly<{evidence: AnalysisEvidence}>) {
    const workspace = useEngineeringDataWorkspace();
    const dataset = workspace.model.investigationEvidence.datasets.find((candidate) => candidate.id === 'moose-thermal-history');
    const tables = findParsedTables(evidence, MOOSE_TABLE_IDS);

    return (
        <section className="rich-evidence-panel rich-evidence-panel--moose" aria-label="MOOSE thermal evidence card">
            <div className="rich-evidence-panel__heading">
                <div>
                    <p className="eyebrow">thermal response</p>
                    <h3>MOOSE Thermal Evidence</h3>
                </div>
                <span>{tables.length} structured tables</span>
            </div>
            {dataset ? <EvidenceDatasetPanels dataset={dataset}/> : null}
            <EvidenceStructuredTables
                direction={evidence.direction}
                family={evidence.family}
                tables={tables}
            />
        </section>
    );
}

function RocetsEvidencePanel({evidence}: Readonly<{evidence: AnalysisEvidence}>) {
    const workspace = useEngineeringDataWorkspace();
    const walkthrough = useEvidenceWalkthrough();
    const activeTabFromStep = walkthrough.activeStep
        ? ROCETS_TAB_BY_STEP[walkthrough.activeStep.id]
        : undefined;
    const [selectedTabId, setSelectedTabId] = useState<RocetsEvidenceTabId>(activeTabFromStep ?? 'feed');

    useEffect(() => {
        if (activeTabFromStep) setSelectedTabId(activeTabFromStep);
    }, [activeTabFromStep]);

    const selectedTab = ROCETS_TABS.find((tab) => tab.id === selectedTabId) ?? ROCETS_TABS[0];
    const dataset = workspace.model.investigationEvidence.datasets.find((candidate) => candidate.id === selectedTab.datasetId);
    const tables = findParsedTables(evidence, selectedTab.tableIds);

    return (
        <section className="rich-evidence-panel rich-evidence-panel--rocets" aria-label="RoCETS evidence card">
            <div className="rich-evidence-panel__heading">
                <div>
                    <p className="eyebrow">engine system histories</p>
                    <h3>RoCETS System Evidence</h3>
                </div>
                <span>{tables.length} tables in view</span>
            </div>
            <div className="rich-evidence-tabs" role="tablist" aria-label="RoCETS evidence views">
                {ROCETS_TABS.map((tab) => (
                    <button
                        aria-pressed={selectedTab.id === tab.id}
                        className={selectedTab.id === tab.id ? 'active' : undefined}
                        key={tab.id}
                        onClick={() => setSelectedTabId(tab.id)}
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {dataset ? <EvidenceDatasetPanels dataset={dataset}/> : null}
            <EvidenceStructuredTables
                direction={evidence.direction}
                family={evidence.family}
                tables={tables}
            />
        </section>
    );
}

function EvidenceStructuredTables({
    direction,
    family,
    tables,
}: Readonly<{
    direction: ParserDirection;
    family: ParserFamily;
    tables: readonly ParsedTable[];
}>) {
    if (!tables.length) {
        return (
            <p className="artifact-read-only-note">
                No promoted structured tables are available for this evidence slice.
            </p>
        );
    }

    return (
        <div className="evidence-structured-table-grid">
            {tables.map((table) => (
                <ParsedDomainStructuredView
                    data={table}
                    direction={direction}
                    family={family}
                    heading={table.title}
                    key={table.id}
                />
            ))}
        </div>
    );
}

function findParsedTables(
    evidence: AnalysisEvidence,
    tableIds: readonly string[],
): ParsedTable[] {
    const tables = evidence.artifact.parsed?.tables ?? [];
    return tableIds
        .map((tableId) => tables.find((table) => table.id === tableId))
        .filter((table): table is ParsedTable => Boolean(table));
}

function EvidencePairingInventory() {
    const evidenceById = new Map(DEFAULT_ANALYSIS_EVIDENCE.map((evidence) => [evidence.id, evidence]));

    return (
        <section className="evidence-pairing-inventory" aria-label="Fixture pairing inventory">
            <div className="evidence-pairing-inventory__heading">
                <div>
                    <p className="eyebrow">fixture corpus</p>
                    <h3>Paired Fixture Inventory</h3>
                </div>
                <span>{EVIDENCE_PAIRING_INVENTORY.length} pairings</span>
            </div>
            <div className="evidence-pairing-grid">
                {EVIDENCE_PAIRING_INVENTORY.map((pairing) => {
                    const inputs = pairing.inputIds.map((id) => evidenceById.get(id)?.sourceFile).filter((filename): filename is string => Boolean(filename));
                    const outputs = pairing.outputIds.map((id) => evidenceById.get(id)?.sourceFile).filter((filename): filename is string => Boolean(filename));

                    return (
                        <article className="evidence-pairing-card" key={pairing.id}>
                            <div>
                                <h4>{pairing.label}</h4>
                                <p>{pairing.summary}</p>
                            </div>
                            <dl>
                                <div><dt>Input</dt><dd>{inputs.join(', ')}</dd></div>
                                <div><dt>Output</dt><dd>{outputs.join(', ')}</dd></div>
                                <div><dt>Tables</dt><dd>{pairing.tableCandidates.join(', ')}</dd></div>
                                <div><dt>Plot candidates</dt><dd>{pairing.plotCandidates.length ? pairing.plotCandidates.join(', ') : 'none in this pass'}</dd></div>
                            </dl>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

function EvidenceParsedInventory({evidence}: Readonly<{evidence: AnalysisEvidence}>) {
    const parsed = evidence.artifact.parsed;
    const inventory = [
        {label: 'Sections', value: parsed?.sections.length ?? 0},
        {label: 'Tables', value: parsed?.tables.length ?? 0},
        {label: 'Time series', value: parsed?.timeSeries.length ?? 0},
        {label: 'Diagnostics', value: evidence.diagnostics.length},
        {label: 'Cross-links', value: parsed?.crossLinks.length ?? 0},
    ];

    return (
        <div className="evidence-parsed-inventory" aria-label={`${evidence.label} parsed inventory`}>
            {inventory.map((item) => (
                <span key={item.label}>
                    <strong>{item.value}</strong>
                    {item.label}
                </span>
            ))}
        </div>
    );
}

function EvidenceDiagnostics({evidence}: Readonly<{evidence: AnalysisEvidence}>) {
    const summaries = buildDiagnosticSummaries(evidence);

    if (!summaries.length) {
        return null;
    }

    return (
        <ul className="diagnostic-list compact evidence-diagnostic-summary">
            {summaries.map((diagnostic, index) => (
                <li key={`${diagnostic.severity}-${diagnostic.label}-${index}`}>
                    <strong>{diagnostic.label}</strong>
                    <span>{diagnostic.detail}</span>
                </li>
            ))}
        </ul>
    );
}

function buildDiagnosticSummaries(evidence: AnalysisEvidence): DiagnosticSummary[] {
    const blockClosureWarnings = evidence.diagnostics.filter((diagnostic) => (
        evidence.family === 'moose' &&
        diagnostic.severity === 'warning' &&
        diagnostic.message.includes('was not explicitly closed')
    ));
    const summaries: DiagnosticSummary[] = [];

    if (blockClosureWarnings.length) {
        summaries.push({
            severity: 'warning',
            label: 'Fixture parser warnings',
            detail: `${blockClosureWarnings.length} synthetic MOOSE warning block${blockClosureWarnings.length === 1 ? '' : 's'} folded into the parsed fixture record.`,
        });
    }

    const remainingDiagnostics = evidence.diagnostics.filter((diagnostic) => !blockClosureWarnings.includes(diagnostic));
    summaries.push(...remainingDiagnostics.slice(0, 3).map((diagnostic) => ({
        severity: diagnostic.severity,
        label: `${diagnostic.severity[0].toUpperCase()}${diagnostic.severity.slice(1)} diagnostic`,
        detail: diagnostic.message,
    })));

    return summaries;
}

function serializeForViewer(value: unknown): string {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return 'null';
    }
}

function buildRecordCountLabel(parsed: AnalysisEvidence['artifact']['parsed']): string {
    if (!parsed) {
        return 'No parsed records';
    }

    const counts = [
        parsed.sections.length ? `${parsed.sections.length} sections` : null,
        parsed.tables.length ? `${parsed.tables.length} tables` : null,
        parsed.timeSeries.length ? `${parsed.timeSeries.length} time series` : null,
        parsed.crossLinks.length ? `${parsed.crossLinks.length} links` : null,
    ].filter((count): count is string => Boolean(count));

    return counts.length ? counts.join(' / ') : 'Summary only';
}

function formatParsedValue(value: ParsedScalarValue, unit?: string): string {
    const formatted = value === null ? 'n/a' : String(value);
    return unit ? `${formatted} ${unit}` : formatted;
}

function useReducedMotion(): boolean {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(media.matches);
        update();
        media.addEventListener?.('change', update);
        return () => media.removeEventListener?.('change', update);
    }, []);

    return reducedMotion;
}
