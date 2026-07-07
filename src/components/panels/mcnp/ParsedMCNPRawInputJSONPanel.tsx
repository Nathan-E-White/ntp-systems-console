

import {ReactNode} from 'react';
import type {ParsedFileViewModel} from '../../../parser/parserTypes';
import {
    ParsedMCNPRawJSONPanel,
    ParsedMCNPRawJSONPanelState,
    type ParsedMCNPRawJSONPanelProps,
} from './ParsedMCNPRawJSONPanel';

export interface ParsedMCNPRawInputJSONPanelProps
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

export const ParsedMCNPRawInputJSONPanelState = Object.freeze({
    direction: 'input' as const,
    defaultTitle: ParsedMCNPRawJSONPanelState.inputTitle,
    defaultEyebrow: ParsedMCNPRawJSONPanelState.inputEyebrow,
    defaultDescription: ParsedMCNPRawJSONPanelState.inputDescription,
});

export function ParsedMCNPRawInputJSONPanel({
    description = ParsedMCNPRawInputJSONPanelState.defaultDescription,
    eyebrow = ParsedMCNPRawInputJSONPanelState.defaultEyebrow,
    title = ParsedMCNPRawInputJSONPanelState.defaultTitle,
    ...props
}: ParsedMCNPRawInputJSONPanelProps) {
    return (
        <ParsedMCNPRawJSONPanel
            {...props}
            description={description}
            direction={ParsedMCNPRawInputJSONPanelState.direction}
            eyebrow={eyebrow}
            title={title}
        />
    );
}