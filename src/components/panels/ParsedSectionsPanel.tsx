

import {ReactNode, createContext, useContext, useMemo} from 'react';
import type {ParsedFileViewModel, ParsedRecordValue, ParsedSection} from '../../parser/parserTypes';

export interface ParsedSectionsPanelProps {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly sections?: readonly ParsedSection[];
    readonly emptyMessage?: string;
    readonly maxSections?: number;
    readonly maxRecordsPerSection?: number;
    readonly maxFieldsPerRecord?: number;
    readonly children?: ReactNode;
}

export interface ParsedSectionsPanelContextValue {
    readonly parsed: ParsedFileViewModel;
    readonly title: string;
    readonly eyebrow: string;
    readonly description?: string;
    readonly sections: readonly ParsedSection[];
    readonly emptyMessage: string;
    readonly maxSections: number;
    readonly maxRecordsPerSection: number;
    readonly maxFieldsPerRecord: number;
}

export const ParsedSectionsPanelState = Object.freeze({
    defaultTitle: 'Sections',
    defaultEyebrow: 'Parsed structure',
    defaultEmptyMessage: 'No parsed sections were extracted for this file.',
    defaultMaxSections: 6,
    defaultMaxRecordsPerSection: 3,
    defaultMaxFieldsPerRecord: 8,
});

const ParsedSectionsPanelReactContext = createContext<ParsedSectionsPanelContextValue | undefined>(undefined);

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

export function useParsedSectionsPanelContext(): ParsedSectionsPanelContextValue {
    const context = useContext(ParsedSectionsPanelReactContext);

    if (!context) {
        throw new Error('useParsedSectionsPanelContext must be used inside ParsedSectionsPanelProvider.');
    }

    return context;
}

export function ParsedSectionsPanelProvider({
    children,
    description,
    emptyMessage = ParsedSectionsPanelState.defaultEmptyMessage,
    eyebrow = ParsedSectionsPanelState.defaultEyebrow,
    maxFieldsPerRecord = ParsedSectionsPanelState.defaultMaxFieldsPerRecord,
    maxRecordsPerSection = ParsedSectionsPanelState.defaultMaxRecordsPerSection,
    maxSections = ParsedSectionsPanelState.defaultMaxSections,
    parsed,
    sections,
    title = ParsedSectionsPanelState.defaultTitle,
}: ParsedSectionsPanelProps) {
    const resolvedSections = sections ?? parsed.sections;
    const value = useMemo<ParsedSectionsPanelContextValue>(
        () => ({
            parsed,
            title,
            eyebrow,
            description,
            sections: resolvedSections,
            emptyMessage,
            maxSections,
            maxRecordsPerSection,
            maxFieldsPerRecord,
        }),
        [
            description,
            emptyMessage,
            eyebrow,
            maxFieldsPerRecord,
            maxRecordsPerSection,
            maxSections,
            parsed,
            resolvedSections,
            title,
        ],
    );

    return (
        <ParsedSectionsPanelReactContext.Provider value={value}>
            {children}
        </ParsedSectionsPanelReactContext.Provider>
    );
}

export function ParsedSectionsPanelBoundary({children}: {readonly children: ReactNode}) {
    return <>{children}</>;
}

export function ParsedSectionsPanelScope({children}: {readonly children: ReactNode}) {
    const {parsed} = useParsedSectionsPanelContext();

    return (
        <section
            className="section-panel"
            aria-labelledby={`${parsed.id}-sections-title`}
            data-file-family={parsed.family}
            data-file-direction={parsed.direction}
        >
            {children}
        </section>
    );
}

export function ParsedSectionsPanelHeader() {
    const {description, eyebrow, parsed, sections, title} = useParsedSectionsPanelContext();

    return (
        <div className="section-panel__header">
            <div>
                <p className="section-panel__eyebrow">
                    {eyebrow} · {parsed.family.toUpperCase()} · {parsed.direction}
                </p>
                <h3 id={`${parsed.id}-sections-title`}>{title}</h3>
                {description ? <p>{description}</p> : null}
            </div>
            <span className="posture-badge posture-badge--nominal">
                {sections.length} {sections.length === 1 ? 'section' : 'sections'}
            </span>
        </div>
    );
}

export function ParsedSectionsPanelList() {
    const {
        emptyMessage,
        maxFieldsPerRecord,
        maxRecordsPerSection,
        maxSections,
        sections,
    } = useParsedSectionsPanelContext();

    if (sections.length === 0) {
        return <p>{emptyMessage}</p>;
    }

    return (
        <div className="parsed-section-list">
            {sections.slice(0, maxSections).map((section) => (
                <article key={section.id}>
                    <h4>{section.title}</h4>
                    {section.description ? <p>{section.description}</p> : null}
                    {section.records.slice(0, maxRecordsPerSection).map((record, recordIndex) => (
                        <dl key={`${section.id}-${recordIndex}`}>
                            {Object.entries(record).slice(0, maxFieldsPerRecord).map(([key, value]) => (
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
    );
}

export function ParsedSectionsPanel(props: ParsedSectionsPanelProps) {
    return (
        <ParsedSectionsPanelBoundary>
            <ParsedSectionsPanelProvider {...props}>
                <ParsedSectionsPanelScope>
                    <ParsedSectionsPanelHeader/>
                    {props.children ?? <ParsedSectionsPanelList/>}
                </ParsedSectionsPanelScope>
            </ParsedSectionsPanelProvider>
        </ParsedSectionsPanelBoundary>
    );
}