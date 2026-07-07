

import {ReactNode} from 'react';
import type {ParsedFileViewModel, ParsedSection} from '../../../parser/parserTypes';
import {
    ParsedMCNPSectionsPanel,
    ParsedMCNPSectionsPanelState,
    type ParsedMCNPSectionsPanelProps,
} from './ParsedMCNPSectionsPanel';

export interface ParsedMCNPOutputSectionsPanelProps
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

export const ParsedMCNPOutputSectionsPanelState = Object.freeze({
    direction: 'output' as const,
    defaultTitle: 'MCNP Output Sections',
    defaultEyebrow: 'MCNP output sections',
    defaultDescription:
        'Review the parsed MCNP output sections: run summary, criticality, particle balance, and performance records.',
    preferredSectionIds: ParsedMCNPSectionsPanelState.outputPreferredSectionIds,
});

export function ParsedMCNPOutputSectionsPanel({
    description = ParsedMCNPOutputSectionsPanelState.defaultDescription,
    eyebrow = ParsedMCNPOutputSectionsPanelState.defaultEyebrow,
    preferredSectionIds = ParsedMCNPOutputSectionsPanelState.preferredSectionIds,
    title = ParsedMCNPOutputSectionsPanelState.defaultTitle,
    ...props
}: ParsedMCNPOutputSectionsPanelProps) {
    return (
        <ParsedMCNPSectionsPanel
            {...props}
            description={description}
            direction={ParsedMCNPOutputSectionsPanelState.direction}
            eyebrow={eyebrow}
            preferredSectionIds={preferredSectionIds}
            title={title}
        />
    );
}