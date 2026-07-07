

import {ReactNode} from 'react';
import type {ParsedFileViewModel, ParsedSummaryCard} from '../../../parser/parserTypes';
import {
    MCNPFileSummaryPanel,
    ParsedMCNPFileSummaryPanelState,
    type ParsedMCNPFileSummaryPanelProps,
} from './MCNPFileSummaryPanel';

export interface ParsedMCNPInputFileSummaryPanelProps
    extends Omit<
        ParsedMCNPFileSummaryPanelProps,
        'parsed' | 'direction' | 'title' | 'eyebrow' | 'description' | 'cards' | 'preferredCardIds'
    > {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly cards?: readonly ParsedSummaryCard[];
    readonly preferredCardIds?: readonly string[];
    readonly children?: ReactNode;
}

export const ParsedMCNPInputFileSummaryPanelState = Object.freeze({
    direction: 'input' as const,
    defaultTitle: 'MCNP Input Deck Summary',
    defaultEyebrow: 'MCNP input summary',
    defaultDescription:
        'Review the high-level MCNP input deck summary: geometry cards, material cards, source setup, tally definitions, importances, and mode settings.',
    preferredCardIds: ParsedMCNPFileSummaryPanelState.inputPreferredCardIds,
});

export function ParsedMCNPInputFileSummaryPanel({
    description = ParsedMCNPInputFileSummaryPanelState.defaultDescription,
    eyebrow = ParsedMCNPInputFileSummaryPanelState.defaultEyebrow,
    preferredCardIds = ParsedMCNPInputFileSummaryPanelState.preferredCardIds,
    title = ParsedMCNPInputFileSummaryPanelState.defaultTitle,
    ...props
}: ParsedMCNPInputFileSummaryPanelProps) {
    return (
        <MCNPFileSummaryPanel
            {...props}
            description={description}
            direction={ParsedMCNPInputFileSummaryPanelState.direction}
            eyebrow={eyebrow}
            preferredCardIds={preferredCardIds}
            title={title}
        />
    );
}