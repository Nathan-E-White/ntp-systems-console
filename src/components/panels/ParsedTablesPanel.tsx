

import {ReactNode, createContext, useContext, useMemo} from 'react';
import type {ParsedFileViewModel, ParsedRecordValue, ParsedTable} from '../../parser/parserTypes';

export interface ParsedTablesPanelProps {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly tables?: readonly ParsedTable[];
    readonly emptyMessage?: string;
    readonly maxTables?: number;
    readonly maxRowsPerTable?: number;
    readonly maxColumnsPerTable?: number;
    readonly children?: ReactNode;
}

export interface ParsedTablesPanelContextValue {
    readonly parsed: ParsedFileViewModel;
    readonly title: string;
    readonly eyebrow: string;
    readonly description?: string;
    readonly tables: readonly ParsedTable[];
    readonly emptyMessage: string;
    readonly maxTables: number;
    readonly maxRowsPerTable: number;
    readonly maxColumnsPerTable: number;
}

export const ParsedTablesPanelState = Object.freeze({
    defaultTitle: 'Tables',
    defaultEyebrow: 'Parsed tabular data',
    defaultEmptyMessage: 'No parsed tables were extracted for this file.',
    defaultMaxTables: 4,
    defaultMaxRowsPerTable: 8,
    defaultMaxColumnsPerTable: 8,
});

const ParsedTablesPanelReactContext = createContext<ParsedTablesPanelContextValue | undefined>(undefined);

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

export function useParsedTablesPanelContext(): ParsedTablesPanelContextValue {
    const context = useContext(ParsedTablesPanelReactContext);

    if (!context) {
        throw new Error('useParsedTablesPanelContext must be used inside ParsedTablesPanelProvider.');
    }

    return context;
}

export function ParsedTablesPanelProvider({
    children,
    description,
    emptyMessage = ParsedTablesPanelState.defaultEmptyMessage,
    eyebrow = ParsedTablesPanelState.defaultEyebrow,
    maxColumnsPerTable = ParsedTablesPanelState.defaultMaxColumnsPerTable,
    maxRowsPerTable = ParsedTablesPanelState.defaultMaxRowsPerTable,
    maxTables = ParsedTablesPanelState.defaultMaxTables,
    parsed,
    tables,
    title = ParsedTablesPanelState.defaultTitle,
}: ParsedTablesPanelProps) {
    const resolvedTables = tables ?? parsed.tables;
    const value = useMemo<ParsedTablesPanelContextValue>(
        () => ({
            parsed,
            title,
            eyebrow,
            description,
            tables: resolvedTables,
            emptyMessage,
            maxTables,
            maxRowsPerTable,
            maxColumnsPerTable,
        }),
        [
            description,
            emptyMessage,
            eyebrow,
            maxColumnsPerTable,
            maxRowsPerTable,
            maxTables,
            parsed,
            resolvedTables,
            title,
        ],
    );

    return (
        <ParsedTablesPanelReactContext.Provider value={value}>
            {children}
        </ParsedTablesPanelReactContext.Provider>
    );
}

export function ParsedTablesPanelBoundary({children}: {readonly children: ReactNode}) {
    return <>{children}</>;
}

export function ParsedTablesPanelScope({children}: {readonly children: ReactNode}) {
    const {parsed} = useParsedTablesPanelContext();

    return (
        <section
            className="section-panel section-panel--wide"
            aria-labelledby={`${parsed.id}-tables-title`}
            data-file-family={parsed.family}
            data-file-direction={parsed.direction}
        >
            {children}
        </section>
    );
}

export function ParsedTablesPanelHeader() {
    const {description, eyebrow, parsed, tables, title} = useParsedTablesPanelContext();

    return (
        <div className="section-panel__header">
            <div>
                <p className="section-panel__eyebrow">
                    {eyebrow} · {parsed.family.toUpperCase()} · {parsed.direction}
                </p>
                <h3 id={`${parsed.id}-tables-title`}>{title}</h3>
                {description ? <p>{description}</p> : null}
            </div>
            <span className="posture-badge posture-badge--nominal">
                {tables.length} {tables.length === 1 ? 'table' : 'tables'}
            </span>
        </div>
    );
}

export function ParsedTablesPanelList() {
    const {
        emptyMessage,
        maxColumnsPerTable,
        maxRowsPerTable,
        maxTables,
        tables,
    } = useParsedTablesPanelContext();

    if (tables.length === 0) {
        return <p>{emptyMessage}</p>;
    }

    return (
        <div className="parsed-table-list">
            {tables.slice(0, maxTables).map((table) => {
                const visibleColumns = table.columns.slice(0, maxColumnsPerTable);
                const visibleRows = table.rows.slice(0, maxRowsPerTable);

                return (
                    <article key={table.id} className="parsed-table-card">
                        <div className="section-panel__header">
                            <div>
                                <p className="section-panel__eyebrow">Parsed table</p>
                                <h4>{table.title}</h4>
                                {table.description ? <p>{table.description}</p> : null}
                            </div>
                            <span className="posture-badge posture-badge--nominal">
                                {table.rows.length} {table.rows.length === 1 ? 'row' : 'rows'}
                            </span>
                        </div>

                        <div className="parsed-table-wrap">
                            <table>
                                <thead>
                                <tr>
                                    {visibleColumns.map((column) => (
                                        <th key={column.id}>{column.label}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {visibleRows.map((row, rowIndex) => (
                                    <tr key={`${table.id}-${rowIndex}`}>
                                        {visibleColumns.map((column) => (
                                            <td key={column.id}>{formatParsedValue(row[column.id])}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

export function ParsedTablesPanel(props: ParsedTablesPanelProps) {
    return (
        <ParsedTablesPanelBoundary>
            <ParsedTablesPanelProvider {...props}>
                <ParsedTablesPanelScope>
                    <ParsedTablesPanelHeader/>
                    {props.children ?? <ParsedTablesPanelList/>}
                </ParsedTablesPanelScope>
            </ParsedTablesPanelProvider>
        </ParsedTablesPanelBoundary>
    );
}