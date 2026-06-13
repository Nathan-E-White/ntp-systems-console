

import {ReactNode} from 'react';
import type {ParsedFileViewModel, ParsedSummaryCard} from '../../../parser/parserTypes';
import {
    MCNPFileSummaryPanel,
    ParsedMCNPFileSummaryPanelState,
    type ParsedMCNPFileSummaryPanelProps,
} from './MCNPFileSummaryPanel';

export interface ParsedMCNPOutputFileSummaryPanelProps
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

export const ParsedMCNPOutputFileSummaryPanelState = Object.freeze({
    direction: 'output' as const,
    defaultTitle: 'MCNP Output File Summary',
    defaultEyebrow: 'MCNP output summary',
    defaultDescription:
        'Review the high-level MCNP output summary: run status, tally results, criticality estimates, source histories, timing, lost particles, and warnings.',
    preferredCardIds: ParsedMCNPFileSummaryPanelState.outputPreferredCardIds,
});

export function ParsedMCNPOutputFileSummaryPanel({
    description = ParsedMCNPOutputFileSummaryPanelState.defaultDescription,
    eyebrow = ParsedMCNPOutputFileSummaryPanelState.defaultEyebrow,
    preferredCardIds = ParsedMCNPOutputFileSummaryPanelState.preferredCardIds,
    title = ParsedMCNPOutputFileSummaryPanelState.defaultTitle,
    ...props
}: ParsedMCNPOutputFileSummaryPanelProps) {
    return (
        <MCNPFileSummaryPanel
            {...props}
            description={description}
            direction={ParsedMCNPOutputFileSummaryPanelState.direction}
            eyebrow={eyebrow}
            preferredCardIds={preferredCardIds}
            title={title}
        />
    );
}