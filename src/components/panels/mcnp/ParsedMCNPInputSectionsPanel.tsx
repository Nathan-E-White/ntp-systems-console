

import {ReactNode} from 'react';
import type {ParsedFileViewModel, ParsedSection} from '../../../parser/parserTypes';
import {
    ParsedMCNPSectionsPanel,
    ParsedMCNPSectionsPanelState,
    type ParsedMCNPSectionsPanelProps,
} from './ParsedMCNPSectionsPanel';

export interface ParsedMCNPInputSectionsPanelProps
    extends Omit<
        ParsedMCNPSectionsPanelProps,
        'parsed' | 'direction' | 'title' | 'eyebrow' | 'description' | 'sections' | 'preferredSectionIds'
    > {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly sections?: readonly ParsedSection[];
    readonly preferredSectionIds?: readonly string[];
    readonly children?: ReactNode;
}

export const ParsedMCNPInputSectionsPanelState = Object.freeze({
    direction: 'input' as const,
    defaultTitle: 'MCNP Input Deck Sections',
    defaultEyebrow: 'MCNP input sections',
    defaultDescription:
        'Review the parsed MCNP input deck sections: problem summary, mode, source, criticality, geometry, and materials.',
    preferredSectionIds: ParsedMCNPSectionsPanelState.inputPreferredSectionIds,
});

export function ParsedMCNPInputSectionsPanel({
    description = ParsedMCNPInputSectionsPanelState.defaultDescription,
    eyebrow = ParsedMCNPInputSectionsPanelState.defaultEyebrow,
    preferredSectionIds = ParsedMCNPInputSectionsPanelState.preferredSectionIds,
    title = ParsedMCNPInputSectionsPanelState.defaultTitle,
    ...props
}: ParsedMCNPInputSectionsPanelProps) {
    return (
        <ParsedMCNPSectionsPanel
            {...props}
            description={description}
            direction={ParsedMCNPInputSectionsPanelState.direction}
            eyebrow={eyebrow}
            preferredSectionIds={preferredSectionIds}
            title={title}
        />
    );
}