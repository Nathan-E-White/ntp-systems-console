import {ReactNode, useMemo} from 'react';
import type {ParsedFileViewModel, ParsedTable, ParserDirection} from '../../../parser/parserTypes';
import {
    ParsedTablesPanel,
    ParsedTablesPanelHeader,
    ParsedTablesPanelList,
    ParsedTablesPanelProvider,
    ParsedTablesPanelScope,
    type ParsedTablesPanelProps,
} from '../ParsedTablesPanel';

export interface ParsedMCNPTablePanelProps
    extends Omit<ParsedTablesPanelProps, 'parsed' | 'tables' | 'title' | 'eyebrow' | 'description'> {
    readonly parsed: ParsedFileViewModel;
    readonly direction: ParserDirection;
    readonly preferredTableIds: readonly string[];
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly tables?: readonly ParsedTable[];
    readonly children?: ReactNode;
}

export const ParsedMCNPTablePanelState = Object.freeze({
    expectedFamily: 'mcnp' as const,
    defaultTitle: 'MCNP Tables',
    defaultEyebrow: 'MCNP parsed tables',
    defaultDescription: 'Review parsed MCNP tabular data selected for this viewer.',
});

const isExpectedMCNPFile = (parsed: ParsedFileViewModel, direction: ParserDirection): boolean =>
    parsed.family === ParsedMCNPTablePanelState.expectedFamily && parsed.direction === direction;

const selectMcnpTables = (
    parsed: ParsedFileViewModel,
    preferredTableIds: readonly string[],
    tables?: readonly ParsedTable[],
): readonly ParsedTable[] => {
    if (tables) {
        return tables;
    }

    const preferredIds = new Set<string>(preferredTableIds);
    const selectedTables = parsed.tables.filter((table) => preferredIds.has(table.id));

    return selectedTables.length > 0 ? selectedTables : parsed.tables;
};

export function ParsedMCNPTablePanelGuard({
    direction,
    parsed,
}: {
    readonly direction: ParserDirection;
    readonly parsed: ParsedFileViewModel;
}) {
    if (isExpectedMCNPFile(parsed, direction)) {
        return null;
    }

    return (
        <section className="section-panel" role="alert" aria-live="polite">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">MCNP table panel</p>
                    <h3>Unexpected parsed file type</h3>
                </div>
            </div>
            <p>
                This panel expects <strong>MCNP · {direction}</strong> data, but the supplied parsed file is{' '}
                <strong>{parsed.family.toUpperCase()} · {parsed.direction}</strong>.
            </p>
        </section>
    );
}

export function ParsedMCNPTablePanel({
    children,
    description = ParsedMCNPTablePanelState.defaultDescription,
    direction,
    eyebrow = ParsedMCNPTablePanelState.defaultEyebrow,
    parsed,
    preferredTableIds,
    tables,
    title = ParsedMCNPTablePanelState.defaultTitle,
    ...tablePanelProps
}: ParsedMCNPTablePanelProps) {
    const selectedTables = useMemo(
        () => selectMcnpTables(parsed, preferredTableIds, tables),
        [parsed, preferredTableIds, tables],
    );

    if (!isExpectedMCNPFile(parsed, direction)) {
        return <ParsedMCNPTablePanelGuard direction={direction} parsed={parsed}/>;
    }

    if (children) {
        return (
            <ParsedTablesPanelProvider
                {...tablePanelProps}
                description={description}
                eyebrow={eyebrow}
                parsed={parsed}
                tables={selectedTables}
                title={title}
            >
                <ParsedTablesPanelScope>
                    <ParsedTablesPanelHeader/>
                    {children}
                </ParsedTablesPanelScope>
            </ParsedTablesPanelProvider>
        );
    }

    return (
        <ParsedTablesPanel
            {...tablePanelProps}
            description={description}
            eyebrow={eyebrow}
            parsed={parsed}
            tables={selectedTables}
            title={title}
        >
            <ParsedTablesPanelList/>
        </ParsedTablesPanel>
    );
}