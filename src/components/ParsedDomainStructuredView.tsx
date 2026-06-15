import {type ReactNode, useState} from 'react';

import type {
    ParsedFileViewModel,
    ParsedRecordValue,
    ParsedSection,
    ParsedSummaryCard,
    ParsedTable,
    ParsedTableColumn,
    ParserDirection,
    ParserFamily,
} from '../parser/parserTypes';
import {ParsedJsonBubbleView} from './ParsedJsonBubbleView';

export interface ParsedDomainStructuredViewProps {
    readonly data: unknown;
    readonly heading?: string;
    readonly family: ParserFamily;
    readonly direction: ParserDirection;
    readonly className?: string;
}

type ParsedRecord = Record<string, ParsedRecordValue>;
type CompactCellKind = 'raw' | 'nested' | 'long-text' | 'plain';
type DisplayColumn = ParsedTableColumn & {readonly className?: string};

const MCNP_KIND_REDUNDANT_TABLES = new Set(['cells', 'surfaces', 'materials', 'tallies', 'sources', 'distributions']);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSummaryCard(value: unknown): value is ParsedSummaryCard {
    return isRecord(value) && typeof value.id === 'string' && typeof value.label === 'string' && 'value' in value;
}

function isParsedSection(value: unknown): value is ParsedSection {
    return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' && Array.isArray(value.records);
}

function isParsedTable(value: unknown): value is ParsedTable {
    return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' && Array.isArray(value.rows);
}

function isParsedFileViewModel(value: unknown): value is ParsedFileViewModel {
    return isRecord(value) &&
        typeof value.filename === 'string' &&
        Array.isArray(value.summaryCards) &&
        Array.isArray(value.sections) &&
        Array.isArray(value.tables);
}

function isRecordArray(value: unknown): value is ParsedRecord[] {
    return Array.isArray(value) && value.every(isRecord);
}

function labelForDirection(direction: ParserDirection): string {
    return direction === 'input' ? 'Fixture input deck' : 'Fixture output report';
}

function formatValue(value: ParsedRecordValue | undefined): string {
    if (value === undefined || value === null) return 'none';
    if (Array.isArray(value)) {
        if (value.length === 0) return 'none';
        if (value.length > 3) return `${value.length} values`;
        return value.join(', ');
    }
    if (typeof value === 'object') {
        const entries = Object.entries(value);
        if (entries.length === 0) return 'none';
        if (entries.length > 3) return `${entries.length} fields`;
        return entries.map(([key, entry]) => `${key}: ${formatValue(entry)}`).join(' · ');
    }
    return String(value);
}

function scalarDetailValue(value: ParsedRecordValue | undefined): string | undefined {
    if (value === undefined || value === null || Array.isArray(value) || typeof value === 'object') {
        return undefined;
    }

    return String(value);
}

function humanizeKey(key: string): string {
    return key
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
        .replaceAll(/\s+/g, ' ')
        .trim()
        .replace(/^./, (character) => character.toUpperCase());
}

function humanizeDataLabel(value: string): string {
    return value
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replaceAll(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word) => {
            const lower = word.toLowerCase();
            if (['h2', 'lh2'].includes(lower)) return lower.toUpperCase();
            if (['mcnp', 'moose', 'rocets', 'ntp', 'kcode'].includes(lower)) return lower.toUpperCase();
            if (lower === 'id') return 'ID';
            return lower;
        })
        .join(' ');
}

function shouldHumanizeValue(value: string, columnId: string): boolean {
    if (!/[_-]/.test(value) || value.includes('.') || value.length > 72) {
        return false;
    }

    return ['label', 'name', 'status', 'target', 'phase', 'tag', 'componentType', 'distributionType'].includes(columnId);
}

function compactLongText(value: string): string {
    const normalized = value.replaceAll(/\s+/g, ' ').trim();
    if (normalized.length <= 54) {
        return normalized;
    }

    return `${normalized.slice(0, 24)} ... <<${normalized.length - 42} chars>> ... ${normalized.slice(-18)}`;
}

function compactRawText(value: string): string {
    const tokens = value.replaceAll(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    if (tokens.length <= 3) {
        return tokens.join(' ');
    }

    return `${tokens[0]} ${tokens[1]} ...`;
}

function compactNestedValue(value: ParsedRecordValue): string {
    if (Array.isArray(value)) {
        if (value.length === 0) return 'none';
        if (value.length <= 3) return value.map((entry) => formatValue(entry)).join(', ');
        return `${formatValue(value[0])}, ${formatValue(value[1])}, ... <<${value.length - 3} items>>, ${formatValue(value.at(-1))}`;
    }

    if (typeof value === 'object' && value !== null) {
        const entries = Object.entries(value);
        if (entries.length === 0) return 'none';
        if (entries.length <= 2) {
            return entries.map(([key, entry]) => `${humanizeKey(key)}: ${formatValue(entry)}`).join(' · ');
        }
        return `${humanizeKey(entries[0][0])}: ${formatValue(entries[0][1])}, ... <<${entries.length - 2} fields>>, ${humanizeKey(entries.at(-1)?.[0] ?? '')}`;
    }

    return formatValue(value);
}

function isImportanceRecord(value: ParsedRecordValue | undefined): value is Record<string, number | string> {
    return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'number' || typeof entry === 'string');
}

function particleLabel(particle: string): string {
    const labels: Record<string, string> = {
        e: 'Electron',
        h: 'Proton',
        n: 'Neutron',
        p: 'Photon',
    };

    return labels[particle.toLowerCase()] ?? particle.toUpperCase();
}

function renderImportanceCell(value: ParsedRecordValue | undefined): ReactNode {
    if (!isImportanceRecord(value)) {
        return <span className="domain-table-empty">none</span>;
    }

    const entries = Object.entries(value);
    if (entries.length === 0) {
        return <span className="domain-table-empty">none</span>;
    }

    return (
        <dl className={`domain-importance-mini domain-importance-mini--rows-${Math.min(entries.length, 4)}`} title={JSON.stringify(value)}>
            {entries.map(([particle, importance]) => (
                <div key={particle}>
                    <dt>{particleLabel(particle)}</dt>
                    <dd>{importance}</dd>
                </div>
            ))}
        </dl>
    );
}

function renderGeometryCell(value: ParsedRecordValue | undefined): ReactNode {
    if (typeof value !== 'string') {
        return renderCompactCell(value, 'geometry');
    }

    return <code className="domain-geometry-expression" title={value}>{value}</code>;
}

function compactCellKind(value: ParsedRecordValue | undefined, columnId: string): CompactCellKind {
    if (columnId === 'raw') return 'raw';
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return 'nested';
    if (typeof value === 'string' && value.length > 72) return 'long-text';
    return 'plain';
}

function renderCompactCell(value: ParsedRecordValue | undefined, columnId: string): ReactNode {
    if (value === undefined || value === null) {
        return <span className="domain-table-empty">none</span>;
    }

    const kind = compactCellKind(value, columnId);
    if (kind === 'nested' || kind === 'raw' || kind === 'long-text') {
        const summary = kind === 'nested'
            ? compactNestedValue(value)
            : kind === 'raw'
                ? compactRawText(String(value))
                : compactLongText(String(value));
        return (
            <details className={`domain-compact-output domain-compact-output--${kind}`}>
                <summary title={String(value)}>
                    <span>{summary}</span>
                    <b>+</b>
                </summary>
                <code>{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</code>
            </details>
        );
    }

    if (typeof value === 'string' && shouldHumanizeValue(value, columnId)) {
        const label = humanizeDataLabel(value);
        if (label.length > 38) {
            return (
                <details className="domain-compact-output domain-compact-output--label">
                    <summary title={value}>
                        <span>{compactLongText(label)}</span>
                        <b>+</b>
                    </summary>
                    <code>{value}</code>
                </details>
            );
        }

        return <span className="domain-table-label-value" title={value}>{label}</span>;
    }

    return formatValue(value);
}

function compactTableColumnLabel(column: ParsedTableColumn, table: ParsedTable): string {
    if (table.id === 'cells' && column.id === 'cellId') return 'ID';
    if (table.id === 'surfaces' && column.id === 'surfaceId') return 'ID';
    if (table.id === 'materials' && column.id === 'materialId') return 'ID';
    if (table.id === 'tallies' && column.id === 'tallyId') return 'ID';
    if (column.id === 'lineNumber') return 'Line';
    if (column.id === 'materialId') return 'Material';

    return column.label;
}

function columnClassName(column: ParsedTableColumn): string {
    if (column.id === 'raw') return 'domain-table-column--raw';
    if (column.id === 'lineNumber') return 'domain-table-column--line';
    if (column.id === 'importance') return 'domain-table-column--importance';
    if (column.id === 'geometry') return 'domain-table-column--geometry';
    if (column.id === 'label') return 'domain-table-column--label';
    return '';
}

function orderedColumnsForTable(table: ParsedTable): DisplayColumn[] {
    const columnsById = new Map(table.columns.map((column) => [column.id, column]));
    const hiddenColumns = new Set<string>();

    if (MCNP_KIND_REDUNDANT_TABLES.has(table.id)) {
        hiddenColumns.add('kind');
    }

    const baseOrder = table.id === 'cells'
        ? ['cellId', 'materialId', 'density', 'geometry', 'importance', 'label', 'lineNumber', 'raw']
        : table.columns.map((column) => column.id);
    const preferredOrder = [
        ...baseOrder.filter((columnId) => !['lineNumber', 'raw'].includes(columnId)),
        ...(['lineNumber', 'raw'].filter((columnId) => baseOrder.includes(columnId))),
    ];
    const orderedIds = [
        ...preferredOrder,
        ...table.columns.map((column) => column.id).filter((columnId) => !preferredOrder.includes(columnId)),
    ];

    return orderedIds
        .filter((columnId, index, array) => array.indexOf(columnId) === index)
        .filter((columnId) => !hiddenColumns.has(columnId) && columnsById.has(columnId))
        .map((columnId) => {
            const column = columnsById.get(columnId)!;
            return {
                ...column,
                label: compactTableColumnLabel(column, table),
                className: columnClassName(column),
            };
        });
}

function renderTableCell(value: ParsedRecordValue | undefined, columnId: string): ReactNode {
    if (columnId === 'importance') {
        return renderImportanceCell(value);
    }

    if (columnId === 'geometry') {
        return renderGeometryCell(value);
    }

    return renderCompactCell(value, columnId);
}

function compactCardTitle(record: ParsedRecord, index: number, family: ParserFamily): string {
    const kind = typeof record.kind === 'string' ? record.kind : undefined;
    const label = typeof record.label === 'string' ? record.label : undefined;
    const name = typeof record.name === 'string' ? record.name : undefined;

    if (family === 'mcnp') {
        if (typeof record.cellId === 'number') return `Cell card ${record.cellId}`;
        if (typeof record.surfaceId === 'number') return `Surface card ${record.surfaceId}`;
        if (typeof record.materialId === 'number') return `Material card ${record.materialId}`;
        if (typeof record.tallyId === 'number') return `Tally card ${record.tallyId}`;
    }

    if (label) return label;
    if (name) return name;
    if (kind) return humanizeKey(kind);
    return `Record ${index + 1}`;
}

function priorityKeys(record: ParsedRecord, family: ParserFamily): string[] {
    const base = family === 'mcnp'
        ? ['materialId', 'density', 'geometry', 'surfaceType', 'lineNumber']
        : ['name', 'type', 'value', 'status', 'lineNumber'];
    return [...base, ...Object.keys(record).filter((key) => !base.includes(key) && !['kind', 'raw', 'label'].includes(key))];
}

function detailKeys(record: ParsedRecord, family: ParserFamily): string[] {
    return priorityKeys(record, family).filter((key) => scalarDetailValue(record[key]) !== undefined).slice(0, 5);
}

function nestedKeys(record: ParsedRecord): string[] {
    return Object.keys(record).filter((key) => {
        const value = record[key];
        return (Array.isArray(value) || (typeof value === 'object' && value !== null)) && key !== 'importance';
    }).slice(0, 2);
}

function renderSummaryCards(cards: readonly ParsedSummaryCard[]) {
    if (cards.length === 0) {
        return null;
    }

    return (
        <div className="domain-structured-summary" aria-label="Parsed summary">
            {cards.slice(0, 8).map((card) => (
                <div className="domain-structured-summary-card" key={card.id}>
                    <span>{card.label}</span>
                    <strong>{formatValue(card.value)}</strong>
                    {card.unit ? <small>{card.unit}</small> : null}
                </div>
            ))}
        </div>
    );
}

function renderRecord(record: ParsedRecord, index: number, family: ParserFamily) {
    const keys = detailKeys(record, family);
    const nested = nestedKeys(record);
    const raw = typeof record.raw === 'string' ? record.raw : undefined;
    const kind = typeof record.kind === 'string' ? record.kind : undefined;

    return (
        <article className={`domain-card domain-card--${kind ?? 'record'}`} key={`${compactCardTitle(record, index, family)}-${index}`}>
            <div className="domain-card__header">
                <strong>{compactCardTitle(record, index, family)}</strong>
                <span>{kind ? humanizeKey(kind) : 'Parsed record'}</span>
            </div>
            <div className="domain-card__fields">
                {keys.map((key) => (
                    <span className="domain-card__field" key={key}>
                        <em>{humanizeKey(key)}</em>
                        <b>{scalarDetailValue(record[key])}</b>
                    </span>
                ))}
                {nested.map((key) => (
                    <span className="domain-card__field domain-card__field--nested" key={key}>
                        <em>{humanizeKey(key)}</em>
                        <b>{formatValue(record[key])}</b>
                    </span>
                ))}
            </div>
            {raw ? <code className="domain-card__raw">{raw}</code> : null}
        </article>
    );
}

function renderRecords(records: readonly ParsedRecord[], family: ParserFamily, maxRecords = 6) {
    const visibleRecords = records.slice(0, maxRecords);

    return (
        <>
            <div className="domain-card-grid">
                {visibleRecords.map((record, index) => renderRecord(record, index, family))}
            </div>
            {records.length > maxRecords ? <p className="domain-structured-overflow">+{records.length - maxRecords} more parsed records in Raw JSON</p> : null}
        </>
    );
}

function renderSection(section: ParsedSection, family: ParserFamily) {
    return (
        <section className="domain-structured-section" key={section.id}>
            <div className="domain-structured-section__heading">
                <div>
                    <h5>{section.title}</h5>
                    {section.description ? <p>{section.description}</p> : null}
                </div>
                <span>{section.records.length} records</span>
            </div>
            {renderRecords(section.records, family, 4)}
        </section>
    );
}

function renderParsedTable(table: ParsedTable) {
    const visibleRows = table.rows.slice(0, 14);
    const columns = orderedColumnsForTable(table);

    return (
        <section className="domain-table-viewer" aria-label={`${table.title} table`}>
            <div className="domain-table-viewer__heading">
                <div>
                    <h5>{table.title}</h5>
                    {table.description ? <p>{table.description}</p> : null}
                </div>
                <span>{table.rows.length} rows · {columns.length} columns</span>
            </div>
            <div className="domain-table-scroll">
                <table>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th className={[column.align ? `align-${column.align}` : '', column.className].filter(Boolean).join(' ') || undefined} key={column.id}>
                                    {column.label}{column.unit ? <small>{column.unit}</small> : null}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.map((row, rowIndex) => (
                            <tr key={`${table.id}-${rowIndex}`}>
                                {columns.map((column) => (
                                    <td className={[column.align ? `align-${column.align}` : '', column.className].filter(Boolean).join(' ') || undefined} key={column.id}>
                                        {renderTableCell(row[column.id], column.id)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {table.rows.length > visibleRows.length ? (
                <p className="domain-structured-overflow">+{table.rows.length - visibleRows.length} more rows in Raw JSON</p>
            ) : null}
        </section>
    );
}

function renderTablePicker(
    tables: readonly ParsedTable[],
    selectedTable: ParsedTable | undefined,
    onSelectTable: (tableId: string) => void,
) {
    if (!selectedTable) {
        return null;
    }

    return (
        <section className="domain-table-browser">
            <div className="domain-table-tabs" aria-label="Parsed tables" role="tablist">
                {tables.map((table) => (
                    <button
                        aria-pressed={table.id === selectedTable.id}
                        className={table.id === selectedTable.id ? 'domain-table-tab active' : 'domain-table-tab'}
                        key={table.id}
                        onClick={() => onSelectTable(table.id)}
                        type="button"
                    >
                        <span>{table.title}</span>
                        <strong>{table.rows.length}</strong>
                    </button>
                ))}
            </div>
            {renderParsedTable(selectedTable)}
        </section>
    );
}

export function ParsedDomainStructuredView({
    data,
    heading,
    family,
    direction,
    className = '',
}: ParsedDomainStructuredViewProps) {
    const parsedFile = isParsedFileViewModel(data) ? data : undefined;
    const [selectedTableId, setSelectedTableId] = useState('');
    const selectedTable = parsedFile?.tables.find((table) => table.id === selectedTableId) ?? parsedFile?.tables[0];

    if (parsedFile) {
        return (
            <section className={`domain-structured-view ${className}`}>
                <div className="domain-structured-view__heading">
                    <div>
                        {heading ? <h4>{heading}</h4> : null}
                        <p>{parsedFile.filename} · {labelForDirection(direction)} · {family.toUpperCase()}-like</p>
                    </div>
                    {parsedFile.graph ? <span>{parsedFile.graph.nodes.length} nodes · {parsedFile.graph.edges.length} links</span> : null}
                </div>
                {renderSummaryCards(parsedFile.summaryCards)}
                {renderTablePicker(parsedFile.tables, selectedTable, setSelectedTableId)}
                {parsedFile.tables.length === 0 ? <p className="domain-structured-overflow">No parsed tables are currently exposed for this fixture.</p> : null}
                {parsedFile.sections.slice(0, 4).map((section) => renderSection(section, family))}
                {parsedFile.timeSeries.length ? (
                    <section className="domain-structured-section">
                        <div className="domain-structured-section__heading">
                            <div>
                                <h5>Time series</h5>
                                <p>Parsed time-dependent records available for later plotting.</p>
                            </div>
                            <span>{parsedFile.timeSeries.length} series</span>
                        </div>
                        <div className="domain-card-grid">
                            {parsedFile.timeSeries.map((series) => (
                                <article className="domain-card" key={series.id}>
                                    <div className="domain-card__header">
                                        <strong>{series.title}</strong>
                                        <span>{series.points.length} points</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}
            </section>
        );
    }

    if (isRecordArray(data)) {
        return (
            <section className={`domain-structured-view ${className}`}>
                <div className="domain-structured-view__heading">
                    <div>
                        {heading ? <h4>{heading}</h4> : null}
                        <p>{labelForDirection(direction)} record preview · {family.toUpperCase()}-like</p>
                    </div>
                    <span>{data.length} records</span>
                </div>
                {renderRecords(data, family)}
            </section>
        );
    }

    if (isRecord(data) && Array.isArray(data.summaryCards) && data.summaryCards.every(isSummaryCard)) {
        return (
            <section className={`domain-structured-view ${className}`}>
                <div className="domain-structured-view__heading">
                    <div>
                        {heading ? <h4>{heading}</h4> : null}
                        <p>{labelForDirection(direction)} summary · {family.toUpperCase()}-like</p>
                    </div>
                </div>
                {renderSummaryCards(data.summaryCards)}
            </section>
        );
    }

    if (isParsedSection(data)) {
        return <section className={`domain-structured-view ${className}`}>{renderSection(data, family)}</section>;
    }

    if (isParsedTable(data)) {
        return <section className={`domain-structured-view ${className}`}>{renderParsedTable(data)}</section>;
    }

    return <ParsedJsonBubbleView className={className} data={data} heading={heading}/>;
}
