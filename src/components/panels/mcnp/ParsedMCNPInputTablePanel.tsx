

import {ReactNode} from 'react';
import type {ParsedFileViewModel, ParsedTable} from '../../../parser/parserTypes';
import {
    ParsedMCNPTablePanel,
    type ParsedMCNPTablePanelProps,
} from './ParsedMCNPTablePanel';

export interface ParsedMCNPInputTablePanelProps
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

export const ParsedMCNPInputTablePanelState = Object.freeze({
    direction: 'input' as const,
    defaultTitle: 'MCNP Input Deck Tables',
    defaultEyebrow: 'MCNP input structure',
    defaultDescription:
        'Review the parsed MCNP input deck tables: cells, surfaces, materials, tallies, sources, distributions, and transforms.',
    preferredTableIds: [
        'cells',
        'surfaces',
        'materials',
        'tallies',
        'sources',
        'distributions',
        'transforms',
    ] as const,
});

export function ParsedMCNPInputTablePanel({
    description = ParsedMCNPInputTablePanelState.defaultDescription,
    eyebrow = ParsedMCNPInputTablePanelState.defaultEyebrow,
    title = ParsedMCNPInputTablePanelState.defaultTitle,
    ...props
}: ParsedMCNPInputTablePanelProps) {
    return (
        <ParsedMCNPTablePanel
            {...props}
            description={description}
            direction={ParsedMCNPInputTablePanelState.direction}
            eyebrow={eyebrow}
            preferredTableIds={ParsedMCNPInputTablePanelState.preferredTableIds}
            title={title}
        />
    );
}