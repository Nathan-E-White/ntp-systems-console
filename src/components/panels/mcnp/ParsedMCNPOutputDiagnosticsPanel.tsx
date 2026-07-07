

import {ReactNode} from 'react';
import type {ParsedFileViewModel, ParserDiagnostic} from '../../../parser/parserTypes';
import {
    MCNPDiagnosticsPanel,
    ParsedMCNPDiagnosticsPanelState,
    type ParsedMCNPDiagnosticsPanelProps,
} from './MCNPDiagnosticsPanel';

export interface ParsedMCNPOutputDiagnosticsPanelProps
    extends Omit<
        ParsedMCNPDiagnosticsPanelProps,
        'parsed' | 'direction' | 'title' | 'eyebrow' | 'description' | 'diagnostics'
    > {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly diagnostics?: readonly ParserDiagnostic[];
    readonly children?: ReactNode;
}

export const ParsedMCNPOutputDiagnosticsPanelState = Object.freeze({
    direction: 'output' as const,
    defaultTitle: ParsedMCNPDiagnosticsPanelState.outputTitle,
    defaultEyebrow: ParsedMCNPDiagnosticsPanelState.outputEyebrow,
    defaultDescription: ParsedMCNPDiagnosticsPanelState.outputDescription,
});

export function ParsedMCNPOutputDiagnosticsPanel({
    description = ParsedMCNPOutputDiagnosticsPanelState.defaultDescription,
    eyebrow = ParsedMCNPOutputDiagnosticsPanelState.defaultEyebrow,
    title = ParsedMCNPOutputDiagnosticsPanelState.defaultTitle,
    ...props
}: ParsedMCNPOutputDiagnosticsPanelProps) {
    return (
        <MCNPDiagnosticsPanel
            {...props}
            description={description}
            direction={ParsedMCNPOutputDiagnosticsPanelState.direction}
            eyebrow={eyebrow}
            title={title}
        />
    );
}