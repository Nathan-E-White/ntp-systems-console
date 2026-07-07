

import {ReactNode, useMemo} from 'react';
import type {ParsedFileViewModel, ParsedSummaryCard, ParserDirection} from '../../../parser/parserTypes';
import {
    ParsedFileSummaryPanel,
    type ParsedFileSummaryPanelProps,
} from '../ParsedFileSummaryPanel';

export interface ParsedMCNPFileSummaryPanelProps
    extends Omit<ParsedFileSummaryPanelProps, 'parsed' | 'cards' | 'title' | 'eyebrow' | 'description'> {
    readonly parsed: ParsedFileViewModel;
    readonly direction?: ParserDirection;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly cards?: readonly ParsedSummaryCard[];
    readonly preferredCardIds?: readonly string[];
    readonly children?: ReactNode;
}

export const ParsedMCNPFileSummaryPanelState = Object.freeze({
    expectedFamily: 'mcnp' as const,
    defaultTitle: 'MCNP File Summary',
    defaultEyebrow: 'MCNP parsed summary',
    defaultDescription:
        'Review the high-level parsed MCNP file summary produced by the parser and adapter pipeline.',
    inputPreferredCardIds: [
        'cells',
        'surfaces',
        'materials',
        'tallies',
        'sources',
        'distributions',
        'transforms',
        'importance-cards',
        'mode',
    ] as const,
    outputPreferredCardIds: [
        'run-status',
        'tallies',
        'keff',
        'keff-sigma',
        'histories',
        'cpu-time',
        'lost-particles',
        'warnings',
    ] as const,
});

const isExpectedMCNPFile = (parsed: ParsedFileViewModel, direction?: ParserDirection): boolean => {
    if (parsed.family !== ParsedMCNPFileSummaryPanelState.expectedFamily) {
        return false;
    }

    return !direction || parsed.direction === direction;
};

const defaultPreferredCardIdsForDirection = (direction?: ParserDirection): readonly string[] => {
    if (direction === 'input') {
        return ParsedMCNPFileSummaryPanelState.inputPreferredCardIds;
    }

    if (direction === 'output') {
        return ParsedMCNPFileSummaryPanelState.outputPreferredCardIds;
    }

    return [
        ...ParsedMCNPFileSummaryPanelState.inputPreferredCardIds,
        ...ParsedMCNPFileSummaryPanelState.outputPreferredCardIds,
    ];
};

const selectMcnpSummaryCards = (
    parsed: ParsedFileViewModel,
    direction?: ParserDirection,
    cards?: readonly ParsedSummaryCard[],
    preferredCardIds?: readonly string[],
): readonly ParsedSummaryCard[] => {
    if (cards) {
        return cards;
    }

    const preferredIds = new Set<string>(preferredCardIds ?? defaultPreferredCardIdsForDirection(direction));
    const selectedCards = parsed.summaryCards.filter((card) => preferredIds.has(card.id));

    return selectedCards.length > 0 ? selectedCards : parsed.summaryCards;
};

export function ParsedMCNPFileSummaryPanelGuard({
    direction,
    parsed,
}: {
    readonly direction?: ParserDirection;
    readonly parsed: ParsedFileViewModel;
}) {
    if (isExpectedMCNPFile(parsed, direction)) {
        return null;
    }

    const expected = direction ? `MCNP · ${direction}` : 'MCNP';

    return (
        <section className="section-panel" role="alert" aria-live="polite">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">MCNP summary panel</p>
                    <h3>Unexpected parsed file type</h3>
                </div>
            </div>
            <p>
                This panel expects <strong>{expected}</strong> data, but the supplied parsed file is{' '}
                <strong>{parsed.family.toUpperCase()} · {parsed.direction}</strong>.
            </p>
        </section>
    );
}

export function MCNPFileSummaryPanel({
    cards,
    description = ParsedMCNPFileSummaryPanelState.defaultDescription,
    direction,
    eyebrow = ParsedMCNPFileSummaryPanelState.defaultEyebrow,
    parsed,
    preferredCardIds,
    title = ParsedMCNPFileSummaryPanelState.defaultTitle,
    ...summaryPanelProps
}: ParsedMCNPFileSummaryPanelProps) {
    const selectedCards = useMemo(
        () => selectMcnpSummaryCards(parsed, direction, cards, preferredCardIds),
        [cards, direction, parsed, preferredCardIds],
    );

    if (!isExpectedMCNPFile(parsed, direction)) {
        return <ParsedMCNPFileSummaryPanelGuard direction={direction} parsed={parsed}/>;
    }

    return (
        <ParsedFileSummaryPanel
            {...summaryPanelProps}
            cards={selectedCards}
            description={description}
            eyebrow={eyebrow}
            parsed={parsed}
            title={title}
        />
    );
}