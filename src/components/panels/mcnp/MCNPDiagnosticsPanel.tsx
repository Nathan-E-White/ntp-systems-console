

import {ReactNode, useMemo} from 'react';
import type {ParsedFileViewModel, ParserDiagnostic, ParserDirection} from '../../../parser/parserTypes';
import {
    ParsedDiagnosticsPanel,
    ParsedDiagnosticsPanelHeader,
    ParsedDiagnosticsPanelList,
    ParsedDiagnosticsPanelProvider,
    ParsedDiagnosticsPanelScope,
    ParsedDiagnosticsPanelSummary,
    type ParsedDiagnosticsPanelProps,
} from '../ParsedDiagnosticsPanel';

export interface ParsedMCNPDiagnosticsPanelProps
    extends Omit<ParsedDiagnosticsPanelProps, 'parsed' | 'diagnostics' | 'title' | 'eyebrow' | 'description'> {
    readonly parsed: ParsedFileViewModel;
    readonly direction?: ParserDirection;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly diagnostics?: readonly ParserDiagnostic[];
    readonly children?: ReactNode;
}

export const ParsedMCNPDiagnosticsPanelState = Object.freeze({
    expectedFamily: 'mcnp' as const,
    defaultTitle: 'MCNP Diagnostics',
    defaultEyebrow: 'MCNP parser diagnostics',
    defaultDescription:
        'Review parser diagnostics, warnings, errors, and file-family mismatch information for parsed MCNP files.',
    inputTitle: 'MCNP Input Diagnostics',
    inputEyebrow: 'MCNP input diagnostics',
    inputDescription:
        'Review diagnostics related to MCNP input deck parsing, including unsupported cards, malformed blocks, and adapter warnings.',
    outputTitle: 'MCNP Output Diagnostics',
    outputEyebrow: 'MCNP output diagnostics',
    outputDescription:
        'Review diagnostics related to MCNP output parsing, including warnings, convergence notes, tally parsing issues, and run-status messages.',
});

const isExpectedMCNPFile = (parsed: ParsedFileViewModel, direction?: ParserDirection): boolean => {
    if (parsed.family !== ParsedMCNPDiagnosticsPanelState.expectedFamily) {
        return false;
    }

    return !direction || parsed.direction === direction;
};

const defaultTitleForDirection = (direction?: ParserDirection): string => {
    if (direction === 'input') {
        return ParsedMCNPDiagnosticsPanelState.inputTitle;
    }

    if (direction === 'output') {
        return ParsedMCNPDiagnosticsPanelState.outputTitle;
    }

    return ParsedMCNPDiagnosticsPanelState.defaultTitle;
};

const defaultEyebrowForDirection = (direction?: ParserDirection): string => {
    if (direction === 'input') {
        return ParsedMCNPDiagnosticsPanelState.inputEyebrow;
    }

    if (direction === 'output') {
        return ParsedMCNPDiagnosticsPanelState.outputEyebrow;
    }

    return ParsedMCNPDiagnosticsPanelState.defaultEyebrow;
};

const defaultDescriptionForDirection = (direction?: ParserDirection): string => {
    if (direction === 'input') {
        return ParsedMCNPDiagnosticsPanelState.inputDescription;
    }

    if (direction === 'output') {
        return ParsedMCNPDiagnosticsPanelState.outputDescription;
    }

    return ParsedMCNPDiagnosticsPanelState.defaultDescription;
};

const selectMcnpDiagnostics = (
    parsed: ParsedFileViewModel,
    diagnostics?: readonly ParserDiagnostic[],
): readonly ParserDiagnostic[] => diagnostics ?? parsed.diagnostics;

export function ParsedMCNPDiagnosticsPanelGuard({
    direction,
    parsed,
}: {
    readonly direction?: ParserDirection;
    readonly parsed: ParsedFileViewModel;
}) {
    if (isExpectedMCNPFile(parsed, direction)) {
        return null;
    }

    const expected = direction ? `MCNP · ${direction}` : 'MCNP';

    return (
        <section className="section-panel" role="alert" aria-live="polite">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">MCNP diagnostics panel</p>
                    <h3>Unexpected parsed file type</h3>
                </div>
            </div>
            <p>
                This panel expects <strong>{expected}</strong> data, but the supplied parsed file is{' '}
                <strong>{parsed.family.toUpperCase()} · {parsed.direction}</strong>.
            </p>
        </section>
    );
}

export function MCNPDiagnosticsPanel({
    children,
    description,
    diagnostics,
    direction,
    eyebrow,
    parsed,
    title,
    ...diagnosticsPanelProps
}: ParsedMCNPDiagnosticsPanelProps) {
    const selectedDiagnostics = useMemo(
        () => selectMcnpDiagnostics(parsed, diagnostics),
        [diagnostics, parsed],
    );

    if (!isExpectedMCNPFile(parsed, direction)) {
        return <ParsedMCNPDiagnosticsPanelGuard direction={direction} parsed={parsed}/>;
    }

    const resolvedTitle = title ?? defaultTitleForDirection(direction);
    const resolvedEyebrow = eyebrow ?? defaultEyebrowForDirection(direction);
    const resolvedDescription = description ?? defaultDescriptionForDirection(direction);

    if (children) {
        return (
            <ParsedDiagnosticsPanelProvider
                {...diagnosticsPanelProps}
                description={resolvedDescription}
                diagnostics={selectedDiagnostics}
                eyebrow={resolvedEyebrow}
                parsed={parsed}
                title={resolvedTitle}
            >
                <ParsedDiagnosticsPanelScope>
                    <ParsedDiagnosticsPanelHeader/>
                    <ParsedDiagnosticsPanelSummary/>
                    {children}
                </ParsedDiagnosticsPanelScope>
            </ParsedDiagnosticsPanelProvider>
        );
    }

    return (
        <ParsedDiagnosticsPanel
            {...diagnosticsPanelProps}
            description={resolvedDescription}
            diagnostics={selectedDiagnostics}
            eyebrow={resolvedEyebrow}
            parsed={parsed}
            title={resolvedTitle}
        >
            <ParsedDiagnosticsPanelList/>
        </ParsedDiagnosticsPanel>
    );
}