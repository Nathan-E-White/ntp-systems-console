

import {ReactNode} from 'react';
import type {ParsedFileViewModel, ParsedTable} from '../../../parser/parserTypes';
import {
    ParsedMCNPTablePanel,
    type ParsedMCNPTablePanelProps,
} from './ParsedMCNPTablePanel';

export interface ParsedMCNPOutputTablePanelProps
    extends Omit<
        ParsedMCNPTablePanelProps,
        'parsed' | 'direction' | 'preferredTableIds' | 'title' | 'eyebrow' | 'description' | 'tables'
    > {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly tables?: readonly ParsedTable[];
    readonly children?: ReactNode;
}

export const ParsedMCNPOutputTablePanelState = Object.freeze({
    direction: 'output' as const,
    defaultTitle: 'MCNP Output Tables',
    defaultEyebrow: 'MCNP output results',
    defaultDescription:
        'Review parsed MCNP output tables: tally results, statistical checks, cell populations, heating or energy deposition, and warnings.',
    preferredTableIds: [
        'tallies',
        'statistical-checks',
        'cell-populations',
        'heating',
        'warnings',
    ] as const,
});

export function ParsedMCNPOutputTablePanel({
    description = ParsedMCNPOutputTablePanelState.defaultDescription,
    eyebrow = ParsedMCNPOutputTablePanelState.defaultEyebrow,
    title = ParsedMCNPOutputTablePanelState.defaultTitle,
    ...props
}: ParsedMCNPOutputTablePanelProps) {
    return (
        <ParsedMCNPTablePanel
            {...props}
            description={description}
            direction={ParsedMCNPOutputTablePanelState.direction}
            eyebrow={eyebrow}
            preferredTableIds={ParsedMCNPOutputTablePanelState.preferredTableIds}
            title={title}
        />
    );
}