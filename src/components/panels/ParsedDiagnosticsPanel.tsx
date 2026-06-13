import {ReactNode, createContext, useContext, useMemo} from 'react';
import type {ParsedFileViewModel, ParserDiagnostic, ParserSeverity} from '../../parser/parserTypes';

export interface ParsedDiagnosticsPanelProps {
    readonly parsed?: ParsedFileViewModel;
    readonly diagnostics?: readonly ParserDiagnostic[];
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly emptyMessage?: string;
    readonly children?: ReactNode;
}

export interface ParsedDiagnosticsPanelContextValue {
    readonly parsed?: ParsedFileViewModel;
    readonly diagnostics: readonly ParserDiagnostic[];
    readonly title: string;
    readonly eyebrow: string;
    readonly description?: string;
    readonly emptyMessage: string;
    readonly severityCounts: Readonly<Record<ParserSeverity, number>>;
}

export const ParsedDiagnosticsPanelState = Object.freeze({
    defaultTitle: 'Diagnostics',
    defaultEyebrow: 'Parser diagnostics',
    defaultEmptyMessage: 'No parser diagnostics were reported for this file.',
});

const ParsedDiagnosticsPanelReactContext = createContext<ParsedDiagnosticsPanelContextValue | undefined>(undefined);

const countDiagnosticsBySeverity = (
    diagnostics: readonly ParserDiagnostic[],
): Readonly<Record<ParserSeverity, number>> =>
    diagnostics.reduce<Record<ParserSeverity, number>>(
        (counts, diagnostic) => ({
            ...counts,
            [diagnostic.severity]: counts[diagnostic.severity] + 1,
        }),
        {
            info: 0,
            warning: 0,
            error: 0,
        },
    );

const createDiagnosticKey = (diagnostic: ParserDiagnostic, index: number): string =>
    `${diagnostic.id ?? diagnostic.source ?? diagnostic.message}-${index}`;

export function useParsedDiagnosticsPanelContext(): ParsedDiagnosticsPanelContextValue {
    const context = useContext(ParsedDiagnosticsPanelReactContext);

    if (!context) {
        throw new Error('useParsedDiagnosticsPanelContext must be used inside ParsedDiagnosticsPanelProvider.');
    }

    return context;
}

export function ParsedDiagnosticsPanelProvider({
    children,
    description,
    diagnostics,
    emptyMessage = ParsedDiagnosticsPanelState.defaultEmptyMessage,
    eyebrow = ParsedDiagnosticsPanelState.defaultEyebrow,
    parsed,
    title = ParsedDiagnosticsPanelState.defaultTitle,
}: ParsedDiagnosticsPanelProps) {
    const resolvedDiagnostics = diagnostics ?? parsed?.diagnostics ?? [];
    const severityCounts = useMemo(
        () => countDiagnosticsBySeverity(resolvedDiagnostics),
        [resolvedDiagnostics],
    );

    const value = useMemo<ParsedDiagnosticsPanelContextValue>(
        () => ({
            parsed,
            diagnostics: resolvedDiagnostics,
            title,
            eyebrow,
            description,
            emptyMessage,
            severityCounts,
        }),
        [description, emptyMessage, eyebrow, parsed, resolvedDiagnostics, severityCounts, title],
    );

    return (
        <ParsedDiagnosticsPanelReactContext.Provider value={value}>
            {children}
        </ParsedDiagnosticsPanelReactContext.Provider>
    );
}

export function ParsedDiagnosticsPanelBoundary({children}: {readonly children: ReactNode}) {
    return <>{children}</>;
}

export function ParsedDiagnosticsPanelScope({children}: {readonly children: ReactNode}) {
    const {parsed} = useParsedDiagnosticsPanelContext();

    return (
        <section
            className="section-panel"
            aria-labelledby="parsed-diagnostics-panel-title"
            data-file-family={parsed?.family}
            data-file-direction={parsed?.direction}
        >
            {children}
        </section>
    );
}

export function ParsedDiagnosticsPanelHeader() {
    const {description, eyebrow, severityCounts, title} = useParsedDiagnosticsPanelContext();
    const totalCount = severityCounts.info + severityCounts.warning + severityCounts.error;

    return (
        <div className="section-panel__header">
            <div>
                <p className="section-panel__eyebrow">{eyebrow}</p>
                <h3 id="parsed-diagnostics-panel-title">{title}</h3>
                {description ? <p>{description}</p> : null}
            </div>
            <span className="posture-badge posture-badge--nominal">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
            </span>
        </div>
    );
}

export function ParsedDiagnosticsPanelSummary() {
    const {severityCounts} = useParsedDiagnosticsPanelContext();

    return (
        <div className="summary-card-grid">
            <article className="summary-card">
                <span>Info</span>
                <strong>{severityCounts.info}</strong>
            </article>
            <article className="summary-card">
                <span>Warnings</span>
                <strong>{severityCounts.warning}</strong>
            </article>
            <article className="summary-card">
                <span>Errors</span>
                <strong>{severityCounts.error}</strong>
            </article>
        </div>
    );
}

export function ParsedDiagnosticsPanelList() {
    const {diagnostics, emptyMessage} = useParsedDiagnosticsPanelContext();

    if (diagnostics.length === 0) {
        return <p>{emptyMessage}</p>;
    }

    return (
        <ul className="diagnostic-list">
            {diagnostics.map((diagnostic, index) => (
                <li key={createDiagnosticKey(diagnostic, index)}>
                    <strong>{diagnostic.severity}</strong>
                    <span>{diagnostic.message}</span>
                    {diagnostic.source ? <small>{diagnostic.source}</small> : null}
                    {diagnostic.hint ? <small>{diagnostic.hint}</small> : null}
                </li>
            ))}
        </ul>
    );
}

export function ParsedDiagnosticsPanel(props: ParsedDiagnosticsPanelProps) {
    return (
        <ParsedDiagnosticsPanelBoundary>
            <ParsedDiagnosticsPanelProvider {...props}>
                <ParsedDiagnosticsPanelScope>
                    <ParsedDiagnosticsPanelHeader/>
                    <ParsedDiagnosticsPanelSummary/>
                    {props.children ?? <ParsedDiagnosticsPanelList/>}
                </ParsedDiagnosticsPanelScope>
            </ParsedDiagnosticsPanelProvider>
        </ParsedDiagnosticsPanelBoundary>
    );
}
