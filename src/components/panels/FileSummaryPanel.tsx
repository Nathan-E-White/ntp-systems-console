import {ReactNode, createContext, useContext, useMemo} from 'react';
import type {ParsedFileViewModel, ParsedRecordValue, ParsedSummaryCard} from '../../parser/parserTypes';

/// A panel that will be inherited by our parsed file panel components.

export interface FileSummaryPanelProps {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly cards?: readonly ParsedSummaryCard[];
    readonly emptyMessage?: string;
    readonly children?: ReactNode;
}

export interface FileSummaryPanelContextValue {
    readonly parsed: ParsedFileViewModel;
    readonly title: string;
    readonly eyebrow: string;
    readonly description?: string;
    readonly cards: readonly ParsedSummaryCard[];
    readonly emptyMessage: string;
}

export const FileSummaryPanelState = Object.freeze({
    defaultEyebrow: 'Parsed file summary',
    defaultEmptyMessage: 'No summary values were extracted for this file.',
});

const FileSummaryPanelReactContext = createContext<FileSummaryPanelContextValue | undefined>(undefined);

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

export function useFileSummaryPanelContext(): FileSummaryPanelContextValue {
    const context = useContext(FileSummaryPanelReactContext);

    if (!context) {
        throw new Error('useFileSummaryPanelContext must be used inside FileSummaryPanelProvider.');
    }

    return context;
}

export function FileSummaryPanelProvider({
    cards,
    children,
    description,
    emptyMessage = FileSummaryPanelState.defaultEmptyMessage,
    eyebrow = FileSummaryPanelState.defaultEyebrow,
    parsed,
    title,
}: FileSummaryPanelProps) {
    const value = useMemo<FileSummaryPanelContextValue>(
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
        <FileSummaryPanelReactContext.Provider value={value}>
            {children}
        </FileSummaryPanelReactContext.Provider>
    );
}

export function FileSummaryPanelBoundary({children}: {readonly children: ReactNode}) {
    return <>{children}</>;
}

export function FileSummaryPanelScope({children}: {readonly children: ReactNode}) {
    const {parsed} = useFileSummaryPanelContext();

    return (
        <section
            className="section-panel section-panel--wide"
            aria-labelledby={`${parsed.id}-summary-title`}
            data-file-family={parsed.family}
            data-file-direction={parsed.direction}
        >
            {children}
        </section>
    );
}

export function FileSummaryPanelHeader() {
    const {description, eyebrow, parsed, title} = useFileSummaryPanelContext();

    return (
        <div className="section-panel__header">
            <div>
                <p className="section-panel__eyebrow">
                    {eyebrow} · {parsed.family.toUpperCase()} · {parsed.direction}
                </p>
                <h3 id={`${parsed.id}-summary-title`}>{title}</h3>
                {description ? <p>{description}</p> : null}
            </div>
            <span className="posture-badge posture-badge--nominal">{parsed.displayName}</span>
        </div>
    );
}

export function FileSummaryPanelCards() {
    const {cards, emptyMessage} = useFileSummaryPanelContext();

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

export function FileSummaryPanel(props: FileSummaryPanelProps) {
    return (
        <FileSummaryPanelBoundary>
            <FileSummaryPanelProvider {...props}>
                <FileSummaryPanelScope>
                    <FileSummaryPanelHeader/>
                    {props.children ?? <FileSummaryPanelCards/>}
                </FileSummaryPanelScope>
            </FileSummaryPanelProvider>
        </FileSummaryPanelBoundary>
    );
}