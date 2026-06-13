

import {ReactNode} from 'react';
import type {ParsedFileViewModel} from '../../../parser/parserTypes';
import {
    ParsedMCNPRawJSONPanel,
    ParsedMCNPRawJSONPanelState,
    type ParsedMCNPRawJSONPanelProps,
} from './ParsedMCNPRawJSONPanel';

export interface ParsedMCNPRawOutputJSONPanelProps
    extends Omit<
        ParsedMCNPRawJSONPanelProps,
        'parsed' | 'direction' | 'title' | 'eyebrow' | 'description' | 'value'
    > {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly value?: unknown;
    readonly children?: ReactNode;
}

export const ParsedMCNPRawOutputJSONPanelState = Object.freeze({
    direction: 'output' as const,
    defaultTitle: ParsedMCNPRawJSONPanelState.outputTitle,
    defaultEyebrow: ParsedMCNPRawJSONPanelState.outputEyebrow,
    defaultDescription: ParsedMCNPRawJSONPanelState.outputDescription,
});

export function ParsedMCNPRawOutputJSONPanel({
    description = ParsedMCNPRawOutputJSONPanelState.defaultDescription,
    eyebrow = ParsedMCNPRawOutputJSONPanelState.defaultEyebrow,
    title = ParsedMCNPRawOutputJSONPanelState.defaultTitle,
    ...props
}: ParsedMCNPRawOutputJSONPanelProps) {
    return (
        <ParsedMCNPRawJSONPanel
            {...props}
            description={description}
            direction={ParsedMCNPRawOutputJSONPanelState.direction}
            eyebrow={eyebrow}
            title={title}
        />
    );
}