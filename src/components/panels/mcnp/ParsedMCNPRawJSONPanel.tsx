

import {ReactNode} from 'react';
import type {ParsedFileViewModel, ParserDirection} from '../../../parser/parserTypes';
import {
    ParsedRawJSONPanel,
    ParsedRawJSONPanelCodeBlock,
    ParsedRawJSONPanelHeader,
    ParsedRawJSONPanelProvider,
    ParsedRawJSONPanelScope,
    type ParsedRawJSONPanelProps,
} from '../ParsedRawJSONPanel';

export interface ParsedMCNPRawJSONPanelProps
    extends Omit<ParsedRawJSONPanelProps, 'parsed' | 'title' | 'eyebrow' | 'description' | 'value'> {
    readonly parsed: ParsedFileViewModel;
    readonly direction?: ParserDirection;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly value?: unknown;
    readonly children?: ReactNode;
}

export const ParsedMCNPRawJSONPanelState = Object.freeze({
    expectedFamily: 'mcnp' as const,
    defaultTitle: 'MCNP Raw Parsed JSON',
    defaultEyebrow: 'MCNP debug view',
    defaultDescription:
        'Inspect the raw MCNP parser and adapter payload for debugging, validation, and downstream panel development.',
    inputTitle: 'MCNP Input Raw Parsed JSON',
    inputEyebrow: 'MCNP input debug view',
    inputDescription:
        'Inspect the raw MCNP input parser and adapter payload: cells, surfaces, materials, source cards, tallies, and control cards.',
    outputTitle: 'MCNP Output Raw Parsed JSON',
    outputEyebrow: 'MCNP output debug view',
    outputDescription:
        'Inspect the raw MCNP output parser and adapter payload: run status, tallies, statistics, criticality records, warnings, and timing data.',
});

const isExpectedMCNPFile = (parsed: ParsedFileViewModel, direction?: ParserDirection): boolean => {
    if (parsed.family !== ParsedMCNPRawJSONPanelState.expectedFamily) {
        return false;
    }

    return !direction || parsed.direction === direction;
};

const defaultTitleForDirection = (direction?: ParserDirection): string => {
    if (direction === 'input') {
        return ParsedMCNPRawJSONPanelState.inputTitle;
    }

    if (direction === 'output') {
        return ParsedMCNPRawJSONPanelState.outputTitle;
    }

    return ParsedMCNPRawJSONPanelState.defaultTitle;
};

const defaultEyebrowForDirection = (direction?: ParserDirection): string => {
    if (direction === 'input') {
        return ParsedMCNPRawJSONPanelState.inputEyebrow;
    }

    if (direction === 'output') {
        return ParsedMCNPRawJSONPanelState.outputEyebrow;
    }

    return ParsedMCNPRawJSONPanelState.defaultEyebrow;
};

const defaultDescriptionForDirection = (direction?: ParserDirection): string => {
    if (direction === 'input') {
        return ParsedMCNPRawJSONPanelState.inputDescription;
    }

    if (direction === 'output') {
        return ParsedMCNPRawJSONPanelState.outputDescription;
    }

    return ParsedMCNPRawJSONPanelState.defaultDescription;
};

export function ParsedMCNPRawJSONPanelGuard({
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
                    <p className="section-panel__eyebrow">MCNP raw JSON panel</p>
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

export function ParsedMCNPRawJSONPanel({
    children,
    description,
    direction,
    eyebrow,
    parsed,
    title,
    value,
    ...rawJSONPanelProps
}: ParsedMCNPRawJSONPanelProps) {
    if (!isExpectedMCNPFile(parsed, direction)) {
        return <ParsedMCNPRawJSONPanelGuard direction={direction} parsed={parsed}/>;
    }

    const resolvedTitle = title ?? defaultTitleForDirection(direction);
    const resolvedEyebrow = eyebrow ?? defaultEyebrowForDirection(direction);
    const resolvedDescription = description ?? defaultDescriptionForDirection(direction);
    const resolvedValue = value ?? parsed.rawParsed;

    if (children) {
        return (
            <ParsedRawJSONPanelProvider
                {...rawJSONPanelProps}
                description={resolvedDescription}
                eyebrow={resolvedEyebrow}
                parsed={parsed}
                title={resolvedTitle}
                value={resolvedValue}
            >
                <ParsedRawJSONPanelScope>
                    <ParsedRawJSONPanelHeader/>
                    {children}
                </ParsedRawJSONPanelScope>
            </ParsedRawJSONPanelProvider>
        );
    }

    return (
        <ParsedRawJSONPanel
            {...rawJSONPanelProps}
            description={resolvedDescription}
            eyebrow={resolvedEyebrow}
            parsed={parsed}
            title={resolvedTitle}
            value={resolvedValue}
        >
            <ParsedRawJSONPanelCodeBlock/>
        </ParsedRawJSONPanel>
    );
}