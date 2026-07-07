

import {ReactNode} from 'react';
import type {ParsedFileViewModel, ParserDiagnostic} from '../../../parser/parserTypes';
import {
    MCNPDiagnosticsPanel,
    ParsedMCNPDiagnosticsPanelState,
    type ParsedMCNPDiagnosticsPanelProps,
} from './MCNPDiagnosticsPanel';

export interface ParsedMCNPInputDiagnosticsPanelProps
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

export const ParsedMCNPInputDiagnosticsPanelState = Object.freeze({
    direction: 'input' as const,
    defaultTitle: ParsedMCNPDiagnosticsPanelState.inputTitle,
    defaultEyebrow: ParsedMCNPDiagnosticsPanelState.inputEyebrow,
    defaultDescription: ParsedMCNPDiagnosticsPanelState.inputDescription,
});

export function ParsedMCNPInputDiagnosticsPanel({
    description = ParsedMCNPInputDiagnosticsPanelState.defaultDescription,
    eyebrow = ParsedMCNPInputDiagnosticsPanelState.defaultEyebrow,
    title = ParsedMCNPInputDiagnosticsPanelState.defaultTitle,
    ...props
}: ParsedMCNPInputDiagnosticsPanelProps) {
    return (
        <MCNPDiagnosticsPanel
            {...props}
            description={description}
            direction={ParsedMCNPInputDiagnosticsPanelState.direction}
            eyebrow={eyebrow}
            title={title}
        />
    );
}