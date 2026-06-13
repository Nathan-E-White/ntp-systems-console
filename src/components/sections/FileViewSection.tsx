import {ChangeEvent, useMemo, useState} from 'react';
import {RawOutputViewer} from '../RawOutputViewer';
import {SectionGrid} from '../layout/SectionGrid';
import {SectionShell} from '../layout/SectionShell';
import {createFileArtifactFromText} from '../../parser/createFileArtifactFromText';
import type {
    FileArtifact,
    ParsedFileViewModel,
    ParsedRecordValue,
    ParserDirection,
    ParserFamily,
} from '../../parser/parserTypes';

const sampleText = `TITLE NTP system file parser scratchpad

Paste or upload an MCNP, MOOSE, or ROCETS input/output file here.
The parser registry will detect the file family and direction, then adapt it into app-facing summary data.`;

export interface FileViewSectionProps {
    readonly description?: string;
    readonly eyebrow?: string;
    readonly expectedDirection?: ParserDirection;
    readonly expectedFamily?: ParserFamily;
    readonly initialFilename?: string;
    readonly initialText?: string;
    readonly parserTitle?: string;
    readonly showRawOutputViewer?: boolean;
    readonly title?: string;
    readonly titleId?: string;
}

const defaultFilename = 'parser-scratchpad.txt';

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

const createArtifact = (filename: string, text: string): FileArtifact<unknown> =>
    createFileArtifactFromText({
        filename,
        text,
    });

const parsedFileMatchesExpectation = (
    parsed: ParsedFileViewModel | undefined,
    expectedFamily?: ParserFamily,
    expectedDirection?: ParserDirection,
): boolean => {
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
    if (!parsed || parsedFileMatchesExpectation(parsed, expectedFamily, expectedDirection)) {
        return undefined;
    }

    const expected = [expectedFamily?.toUpperCase(), expectedDirection].filter(Boolean).join(' · ');
    const actual = [parsed.family.toUpperCase(), parsed.direction].filter(Boolean).join(' · ');

    return `This viewer expects ${expected}, but the supplied file parsed as ${actual}.`;
};

export function FileViewSection({
    description = 'Inspect raw and parsed MCNP, MOOSE, and ROCETS inputs/outputs without crowding the overview workspace.',
    eyebrow = 'Diagnostics',
    expectedDirection,
    expectedFamily,
    initialFilename = defaultFilename,
    initialText = sampleText,
    parserTitle = 'Engineering file parser',
    showRawOutputViewer = true,
    title = 'File View',
    titleId = 'file-view-section-title',
}: FileViewSectionProps) {
    const [filename, setFilename] = useState(initialFilename);
    const [fileText, setFileText] = useState(initialText);
    const [artifact, setArtifact] = useState<FileArtifact<unknown>>(() => createArtifact(initialFilename, initialText));

    const parsed = artifact.parsed;
    const expectationMessage = createExpectationMessage(parsed, expectedFamily, expectedDirection);
    const shouldRenderParsedDetails = parsedFileMatchesExpectation(parsed, expectedFamily, expectedDirection);
    const visibleTables = useMemo(
        () => (shouldRenderParsedDetails ? parsed?.tables.slice(0, 4) ?? [] : []),
        [parsed, shouldRenderParsedDetails],
    );

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
            setArtifact(createArtifact(file.name, text));
        });

        reader.readAsText(file);
    };

    const handleParse = () => {
        setArtifact(createArtifact(filename, fileText));
    };

    return (
        <SectionShell
            description={description}
            eyebrow={eyebrow}
            title={title}
            titleId={titleId}
        >
            <SectionGrid>
                <section className="section-panel section-panel--wide"
                         aria-labelledby="file-parser-workbench-title">
                    <div className="section-panel__header">
                        <div>
                            <p className="section-panel__eyebrow">Parser workbench</p>
                            <h3 id="file-parser-workbench-title">{parserTitle}</h3>
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

                        <label className="file-parser-field">
                            <span>Upload file</span>
                            <input type="file" onChange={handleFileChange}/>
                        </label>
                    </div>

                    <label className="file-parser-field file-parser-field--full">
                        <span>Raw file text</span>
                        <textarea
                            rows={12}
                            value={fileText}
                            onChange={(event) => setFileText(event.target.value)}
                        />
                    </label>

                    <div className="file-parser-actions">
                        <button type="button" onClick={handleParse}>
                            Parse file
                        </button>
                        <span>{artifact.filename}</span>
                    </div>

                    {artifact.error ? <p className="file-parser-error">{artifact.error}</p> : null}
                    {expectationMessage ? <p className="file-parser-error">{expectationMessage}</p> : null}
                </section>

                {parsed && shouldRenderParsedDetails ? (
                    <section className="section-panel section-panel--wide"
                             aria-labelledby="parsed-file-summary-title">
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
                ) : null}

                {artifact.diagnostics.length > 0 ? (
                    <section className="section-panel" aria-labelledby="parsed-file-diagnostics-title">
                        <div className="section-panel__header">
                            <div>
                                <p className="section-panel__eyebrow">Parser diagnostics</p>
                                <h3 id="parsed-file-diagnostics-title">Diagnostics</h3>
                            </div>
                        </div>

                        <ul className="diagnostic-list">
                            {artifact.diagnostics.map((diagnostic, index) => (
                                <li key={`${diagnostic.id ?? diagnostic.message}-${index}`}>
                                    <strong>{diagnostic.severity}</strong>
                                    <span>{diagnostic.message}</span>
                                    {diagnostic.hint ? <small>{diagnostic.hint}</small> : null}
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {parsed && shouldRenderParsedDetails && parsed.sections.length > 0 ? (
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
                ) : null}

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

                {showRawOutputViewer ? <RawOutputViewer/> : null}
            </SectionGrid>
        </SectionShell>
    );
}