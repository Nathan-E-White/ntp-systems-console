

import {ReactNode, createContext, useContext, useMemo} from 'react';
import type {ParsedFileViewModel, ParsedRecordValue, ParsedSummaryCard} from '../../parser/parserTypes';

export interface ParsedFileSummaryPanelProps {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly cards?: readonly ParsedSummaryCard[];
    readonly emptyMessage?: string;
    readonly children?: ReactNode;
}

export interface ParsedFileSummaryPanelContextValue {
    readonly parsed: ParsedFileViewModel;
    readonly title: string;
    readonly eyebrow: string;
    readonly description?: string;
    readonly cards: readonly ParsedSummaryCard[];
    readonly emptyMessage: string;
}

export const ParsedFileSummaryPanelState = Object.freeze({
    defaultEyebrow: 'Parsed file summary',
    defaultEmptyMessage: 'No summary values were extracted for this file.',
});

const ParsedFileSummaryPanelReactContext = createContext<ParsedFileSummaryPanelContextValue | undefined>(undefined);

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

export function useParsedFileSummaryPanelContext(): ParsedFileSummaryPanelContextValue {
    const context = useContext(ParsedFileSummaryPanelReactContext);

    if (!context) {
        throw new Error('useParsedFileSummaryPanelContext must be used inside ParsedFileSummaryPanelProvider.');
    }

    return context;
}

export function ParsedFileSummaryPanelProvider({
    cards,
    children,
    description,
    emptyMessage = ParsedFileSummaryPanelState.defaultEmptyMessage,
    eyebrow = ParsedFileSummaryPanelState.defaultEyebrow,
    parsed,
    title,
}: ParsedFileSummaryPanelProps) {
    const value = useMemo<ParsedFileSummaryPanelContextValue>(
        () => ({
            parsed,
            title: title ?? parsed.title ?? parsed.filename,
            eyebrow,
            description,
            cards: cards ?? parsed.summaryCards,
            emptyMessage,
        }),
        [cards, description, emptyMessage, eyebrow, parsed, title],
    );

    return (
        <ParsedFileSummaryPanelReactContext.Provider value={value}>
            {children}
        </ParsedFileSummaryPanelReactContext.Provider>
    );
}

export function ParsedFileSummaryPanelBoundary({children}: {readonly children: ReactNode}) {
    return <>{children}</>;
}

export function ParsedFileSummaryPanelScope({children}: {readonly children: ReactNode}) {
    const {parsed} = useParsedFileSummaryPanelContext();

    return (
        <section
            className="section-panel section-panel--wide"
            aria-labelledby={`${parsed.id}-parsed-summary-title`}
            data-file-family={parsed.family}
            data-file-direction={parsed.direction}
        >
            {children}
        </section>
    );
}

export function ParsedFileSummaryPanelHeader() {
    const {description, eyebrow, parsed, title} = useParsedFileSummaryPanelContext();

    return (
        <div className="section-panel__header">
            <div>
                <p className="section-panel__eyebrow">
                    {eyebrow} · {parsed.family.toUpperCase()} · {parsed.direction}
                </p>
                <h3 id={`${parsed.id}-parsed-summary-title`}>{title}</h3>
                {description ? <p>{description}</p> : null}
            </div>
            <span className="posture-badge posture-badge--nominal">{parsed.displayName}</span>
        </div>
    );
}

export function ParsedFileSummaryPanelCards() {
    const {cards, emptyMessage} = useParsedFileSummaryPanelContext();

    if (cards.length === 0) {
        return <p>{emptyMessage}</p>;
    }

    return (
        <div className="summary-card-grid">
            {cards.map((card) => (
                <article className="summary-card" key={card.id}>
                    <span>{card.label}</span>
                    <strong>{formatParsedValue(card.value)}</strong>
                    {card.unit ? <small>{card.unit}</small> : null}
                    {card.description ? <p>{card.description}</p> : null}
                </article>
            ))}
        </div>
    );
}

export function ParsedFileSummaryPanel(props: ParsedFileSummaryPanelProps) {
    return (
        <ParsedFileSummaryPanelBoundary>
            <ParsedFileSummaryPanelProvider {...props}>
                <ParsedFileSummaryPanelScope>
                    <ParsedFileSummaryPanelHeader/>
                    {props.children ?? <ParsedFileSummaryPanelCards/>}
                </ParsedFileSummaryPanelScope>
            </ParsedFileSummaryPanelProvider>
        </ParsedFileSummaryPanelBoundary>
    );
}