import {ChangeEvent, ReactNode, createContext, useContext, useMemo, useState, Fragment} from 'react';
import {createFileArtifactFromText} from '../../parser/createFileArtifactFromText';
import {addCampaignArtifact, createCampaignWorkspace, exportCampaignWorkspace, type CampaignWorkspace} from '../../campaign/CampaignArtifact';
import type {
    FileArtifact,
    ParsedFileViewModel,
    ParsedRecordValue,
    ParserDirection,
    ParserFamily,
} from '../../parser/parserTypes';

export interface FileParserWorkbenchProps {
    readonly title: string;
    readonly campaign: CampaignWorkspace;
    readonly addCurrentArtifactToCampaign: () => void;
    readonly campaignExport: () => string;
    readonly description: string;
    readonly initialFilename: string;
    readonly initialText: string;
    readonly allowedFamily?: ParserFamily;
    readonly allowedDirection?: ParserDirection;
    readonly showRawText?: boolean;
    readonly showUpload?: boolean;
    readonly showRawOutputFixture?: boolean;
    readonly children?: ReactNode;
}

export interface FileParserWorkbenchContextValue {
    readonly artifact: FileArtifact<unknown>;
    readonly description: string;
    readonly expectedDirection?: ParserDirection;
    readonly expectedFamily?: ParserFamily;
    readonly filename: string;
    readonly fileText: string;
    readonly parseCurrentText: () => void;
    readonly setFilename: (filename: string) => void;
    readonly setFileText: (text: string) => void;
    readonly title: string;
}

export const FileParserWorkbenchState = Object.freeze({
    defaultShowRawText: true,
    defaultShowUpload: true,
    defaultShowRawOutputFixture: false,
});

const FileParserWorkbenchReactContext = createContext<FileParserWorkbenchContextValue | undefined>(undefined);

const createArtifact = (filename: string, text: string): FileArtifact<unknown> =>
    createFileArtifactFromText({
        filename,
        text,
    });

const formatParsedValue = (value: ParsedRecordValue | undefined): string => {
    if (value === undefined || value === null) {
        return '—';
    }

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
};

const parsedFileMatchesExpectation = (
    parsed: ParsedFileViewModel | undefined,
    expectedFamily?: ParserFamily,
    expectedDirection?: ParserDirection,
): parsed is ParsedFileViewModel => {
    if (!parsed) {
        return false;
    }

    if (expectedFamily && parsed.family !== expectedFamily) {
        return false;
    }

    return !(expectedDirection && parsed.direction !== expectedDirection);
};

const createExpectationMessage = (
    parsed: ParsedFileViewModel | undefined,
    expectedFamily?: ParserFamily,
    expectedDirection?: ParserDirection,
): string | undefined => {
    if (!parsed) {
        return undefined;
    }

    const familyMatches = !expectedFamily || parsed.family === expectedFamily;
    const directionMatches = !expectedDirection || parsed.direction === expectedDirection;

    if (familyMatches && directionMatches) {
        return undefined;
    }

    const expected = [expectedFamily?.toUpperCase(), expectedDirection].filter(Boolean).join(' · ');
    const actual = [parsed.family.toUpperCase(), parsed.direction].filter(Boolean).join(' · ');

    return `This workbench expects ${expected}, but the supplied file parsed as ${actual}.`;
};

export function useFileParserWorkbenchContext(): FileParserWorkbenchContextValue {
    const context = useContext(FileParserWorkbenchReactContext);

    if (!context) {
        throw new Error('useFileParserWorkbenchContext must be used inside FileParserWorkbenchProvider.');
    }

    return context;
}

export function FileParserWorkbenchScope({children}: { readonly children: ReactNode }) {
    return (
        <section className="file-parser-workbench" aria-label="File parser workbench">
            {children}
        </section>
    );
}

export function FileParserWorkbenchBoundary({children}: { readonly children: ReactNode }) {
    return <>{children}</>;
}

export function FileParserWorkbenchProvider({
                                                allowedDirection,
                                                allowedFamily,
                                                children,
                                                description,
                                                initialFilename,
                                                initialText,
                                                title,
                                            }: FileParserWorkbenchProps) {
    const [filename, setFilename] = useState(initialFilename);
    const [fileText, setFileText] = useState(initialText);
    const [artifact, setArtifact] = useState<FileArtifact<unknown>>(() => createArtifact(initialFilename, initialText));
    const [campaign, setCampaign] = useState<CampaignWorkspace>(() => createCampaignWorkspace());

    const parseCurrentText = () => {
        setArtifact(createArtifact(filename, fileText));
    };
    const addCurrentArtifactToCampaign = () => setCampaign((current) => addCampaignArtifact(current, artifact));

    const value = useMemo<FileParserWorkbenchContextValue>(
        () => ({
            artifact,
            description,
            expectedDirection: allowedDirection,
            expectedFamily: allowedFamily,
            filename,
            fileText,
            parseCurrentText,
            setFilename,
            setFileText,
            title,
            campaign,
            addCurrentArtifactToCampaign,
            campaignExport: () => exportCampaignWorkspace(campaign),
        }),
        [allowedDirection, allowedFamily, artifact, campaign, description, filename, fileText, title],
    );

    return (
        <FileParserWorkbenchReactContext.Provider value={value}>
            {children}
        </FileParserWorkbenchReactContext.Provider>
    );
}

function FileParserWorkbenchControls({
                                         showRawText,
                                         showUpload,
                                     }: {
    readonly showRawText: boolean;
    readonly showUpload: boolean;
}) {
    const {artifact, addCurrentArtifactToCampaign, campaign, campaignExport, fileText, filename, parseCurrentText, setFilename, setFileText} = useFileParserWorkbenchContext();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.addEventListener('load', () => {
            const text = typeof reader.result === 'string' ? reader.result : '';

            setFilename(file.name);
            setFileText(text);
        });

        reader.readAsText(file);
    };

    return (
        <section className="section-panel section-panel--wide" aria-labelledby="file-parser-workbench-title">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">Parser workbench</p>
                    <h3 id="file-parser-workbench-title">Engineering file parser</h3>
                </div>
                <span className={`posture-badge posture-badge--${artifact.parserStatus}`}>
                    {artifact.parserStatus}
                </span>
            </div>

            <div className="file-parser-controls">
                <label className="file-parser-field">
                    <span>Filename</span>
                    <input
                        type="text"
                        value={filename}
                        onChange={(event) => setFilename(event.target.value)}
                    />
                </label>

                {showUpload ? (
                    <label className="file-parser-field">
                        <span>Upload file</span>
                        <input type="file" onChange={handleFileChange}/>
                    </label>
                ) : null}
            </div>

            {showRawText ? (
                <label className="file-parser-field file-parser-field--full">
                    <span>Raw file text</span>
                    <textarea
                        rows={12}
                        value={fileText}
                        onChange={(event) => setFileText(event.target.value)}
                    />
                </label>
            ) : null}

            <div className="file-parser-actions">
                <button type="button" onClick={parseCurrentText}>
                    Parse file
                </button>
                <button type="button" onClick={addCurrentArtifactToCampaign}>Add to session campaign</button>
                <span>{artifact.filename}</span>
            </div>

            <aside className="campaign-artifact-workspace" aria-label="Browser-session campaign artifacts">
                <strong>{campaign.name}</strong>
                <span>{campaign.artifacts.length} artifact(s) · browser-session only</span>
                {campaign.artifacts.length > 1 ? <small>Comparison set: {campaign.artifacts.map((item) => `${item.filename} v${item.version}`).join(' ↔ ')}</small> : null}
                {campaign.artifacts.length ? <details><summary>Review Packet export</summary><pre>{campaignExport()}</pre></details> : null}
            </aside>

            {artifact.error ? <p className="file-parser-error">{artifact.error}</p> : null}
        </section>
    );
}

function FileParserWorkbenchDiagnostics() {
    const {artifact, expectedDirection, expectedFamily} = useFileParserWorkbenchContext();
    const expectationMessage = createExpectationMessage(artifact.parsed, expectedFamily, expectedDirection);

    if (artifact.diagnostics.length === 0 && !expectationMessage) {
        return null;
    }

    return (
        <section className="section-panel" aria-labelledby="file-parser-diagnostics-title">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">Parser diagnostics</p>
                    <h3 id="file-parser-diagnostics-title">Diagnostics</h3>
                </div>
            </div>

            {expectationMessage ? <p className="file-parser-error">{expectationMessage}</p> : null}

            {artifact.diagnostics.length > 0 ? (
                <ul className="diagnostic-list">
                    {artifact.diagnostics.map((diagnostic, index) => (
                        <li key={`${diagnostic.id ?? diagnostic.message}-${index}`}>
                            <strong>{diagnostic.severity}</strong>
                            <span>{diagnostic.message}</span>
                            {diagnostic.hint ? <small>{diagnostic.hint}</small> : null}
                        </li>
                    ))}
                </ul>
            ) : null}
        </section>
    );
}

function FileParserWorkbenchSummary() {

    const {artifact, expectedDirection, expectedFamily} = useFileParserWorkbenchContext();
    const parsed = artifact.parsed;

    if (!parsedFileMatchesExpectation(parsed, expectedFamily, expectedDirection)) {
        return null;
    }

    return (
        <section className="section-panel section-panel--wide" aria-labelledby="parsed-file-summary-title">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">
                        {parsed.family.toUpperCase()} · {parsed.direction}
                    </p>
                    <h3 id="parsed-file-summary-title">{parsed.title ?? parsed.filename}</h3>
                </div>
                <span className="posture-badge posture-badge--nominal">{parsed.displayName}</span>
            </div>

            <div className="summary-card-grid">
                {parsed.summaryCards.map((card) => (
                    <article className="summary-card" key={card.id}>
                        <span>{card.label}</span>
                        <strong>{formatParsedValue(card.value)}</strong>
                        {card.unit ? <small>{card.unit}</small> : null}
                        {card.description ? <p>{card.description}</p> : null}
                    </article>
                ))}
            </div>
        </section>
    );
}

function FileParserWorkbenchSections() {
    const {artifact, expectedDirection, expectedFamily} = useFileParserWorkbenchContext();
    const parsed = artifact.parsed;

    if (!parsedFileMatchesExpectation(parsed, expectedFamily, expectedDirection) || parsed.sections.length === 0) {
        return null;
    }

    return (
        <section className="section-panel" aria-labelledby="parsed-file-sections-title">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">Parsed structure</p>
                    <h3 id="parsed-file-sections-title">Sections</h3>
                </div>
            </div>

            <div className="parsed-section-list">
                {parsed.sections.slice(0, 6).map((section) => (
                    <article key={section.id}>
                        <h4>{section.title}</h4>
                        {section.description ? <p>{section.description}</p> : null}
                        {section.records.slice(0, 3).map((record, recordIndex) => (
                            <dl key={`${section.id}-${recordIndex}`}>
                                {Object.entries(record).slice(0, 8).map(([key, value]) => (
                                    <div key={key}>
                                        <dt>{key}</dt>
                                        <dd>{formatParsedValue(value)}</dd>
                                    </div>
                                ))}
                            </dl>
                        ))}
                    </article>
                ))}
            </div>
        </section>
    );
}

function FileParserWorkbenchTables() {
    const {artifact, expectedDirection, expectedFamily} = useFileParserWorkbenchContext();
    const parsed = artifact.parsed;
    const visibleTables = parsedFileMatchesExpectation(parsed, expectedFamily, expectedDirection)
        ? parsed.tables.slice(0, 4)
        : [];

    return (
        <Fragment>
            {visibleTables.map((table) => (
                <section className="section-panel section-panel--wide" key={table.id}
                         aria-labelledby={`${table.id}-title`}>
                    <div className="section-panel__header">
                        <div>
                            <p className="section-panel__eyebrow">Parsed table</p>
                            <h3 id={`${table.id}-title`}>{table.title}</h3>
                        </div>
                    </div>

                    {table.description ? <p>{table.description}</p> : null}

                    <div className="parsed-table-wrap">
                        <table>
                            <thead>
                            <tr>
                                {table.columns.slice(0, 8).map((column) => (
                                    <th key={column.id}>{column.label}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {table.rows.slice(0, 8).map((row, rowIndex) => (
                                <tr key={`${table.id}-${rowIndex}`}>
                                    {table.columns.slice(0, 8).map((column) => (
                                        <td key={column.id}>{formatParsedValue(row[column.id])}</td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ))}
        </Fragment>
    );
}

export function FileParserWorkbench({
                                        allowedDirection,
                                        allowedFamily,
                                        children,
                                        description,
                                        initialFilename,
                                        initialText,
                                        showRawOutputFixture = FileParserWorkbenchState.defaultShowRawOutputFixture,
                                        showRawText = FileParserWorkbenchState.defaultShowRawText,
                                        showUpload = FileParserWorkbenchState.defaultShowUpload,
                                        title,
                                    }: FileParserWorkbenchProps) {
    return (
        <FileParserWorkbenchBoundary>
            <FileParserWorkbenchProvider
                allowedDirection={allowedDirection}
                allowedFamily={allowedFamily}
                description={description}
                initialFilename={initialFilename}
                initialText={initialText}
                showRawOutputFixture={showRawOutputFixture}
                showRawText={showRawText}
                showUpload={showUpload}
                title={title}
            >
                <FileParserWorkbenchScope>
                    {children}
                    <FileParserWorkbenchControls showRawText={showRawText} showUpload={showUpload}/>
                    <FileParserWorkbenchDiagnostics/>
                    <FileParserWorkbenchSummary/>
                    <FileParserWorkbenchSections/>
                    <FileParserWorkbenchTables/>
                    {showRawOutputFixture ? (
                        <section className="section-panel" aria-labelledby="raw-output-fixture-title">
                            <div className="section-panel__header">
                                <div>
                                    <p className="section-panel__eyebrow">Fixture viewer</p>
                                    <h3 id="raw-output-fixture-title">Raw output fixture hidden</h3>
                                </div>
                            </div>
                            <p>The raw fixture viewer can be mounted by the parent file-view section when needed.</p>
                        </section>
                    ) : null}
                </FileParserWorkbenchScope>
            </FileParserWorkbenchProvider>
        </FileParserWorkbenchBoundary>
    );
}
