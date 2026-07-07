

import {ReactNode, createContext, useContext, useMemo} from 'react';
import type {ParsedFileViewModel} from '../../parser/parserTypes';
import {StructuredCodeViewer} from '../StructuredCodeViewer';

export interface ParsedRawJSONPanelProps {
    readonly parsed: ParsedFileViewModel;
    readonly title?: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly value?: unknown;
    readonly maxHeight?: number;
    readonly children?: ReactNode;
}

export interface ParsedRawJSONPanelContextValue {
    readonly parsed: ParsedFileViewModel;
    readonly title: string;
    readonly eyebrow: string;
    readonly description?: string;
    readonly value: unknown;
    readonly serializedValue: string;
    readonly maxHeight: number;
}

export const ParsedRawJSONPanelState = Object.freeze({
    defaultTitle: 'Raw parsed JSON',
    defaultEyebrow: 'Debug view',
    defaultDescription: 'Inspect the normalized parsed object produced by the parser and adapter pipeline.',
    defaultMaxHeight: 520,
});

const ParsedRawJSONPanelReactContext = createContext<ParsedRawJSONPanelContextValue | undefined>(undefined);

const serializeJSON = (value: unknown): string => {
    try {
        return JSON.stringify(value, null, 2);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        return JSON.stringify(
            {
                serializationError: message,
            },
            null,
            2,
        );
    }
};

export function useParsedRawJSONPanelContext(): ParsedRawJSONPanelContextValue {
    const context = useContext(ParsedRawJSONPanelReactContext);

    if (!context) {
        throw new Error('useParsedRawJSONPanelContext must be used inside ParsedRawJSONPanelProvider.');
    }

    return context;
}

export function ParsedRawJSONPanelProvider({
    children,
    description = ParsedRawJSONPanelState.defaultDescription,
    eyebrow = ParsedRawJSONPanelState.defaultEyebrow,
    maxHeight = ParsedRawJSONPanelState.defaultMaxHeight,
    parsed,
    title = ParsedRawJSONPanelState.defaultTitle,
    value,
}: ParsedRawJSONPanelProps) {
    const resolvedValue = value ?? parsed.rawParsed;
    const serializedValue = useMemo(() => serializeJSON(resolvedValue), [resolvedValue]);

    const contextValue = useMemo<ParsedRawJSONPanelContextValue>(
        () => ({
            parsed,
            title,
            eyebrow,
            description,
            value: resolvedValue,
            serializedValue,
            maxHeight,
        }),
        [description, eyebrow, maxHeight, parsed, resolvedValue, serializedValue, title],
    );

    return (
        <ParsedRawJSONPanelReactContext.Provider value={contextValue}>
            {children}
        </ParsedRawJSONPanelReactContext.Provider>
    );
}

export function ParsedRawJSONPanelBoundary({children}: {readonly children: ReactNode}) {
    return <>{children}</>;
}

export function ParsedRawJSONPanelScope({children}: {readonly children: ReactNode}) {
    const {parsed} = useParsedRawJSONPanelContext();

    return (
        <section
            className="section-panel section-panel--wide"
            aria-labelledby={`${parsed.id}-raw-json-title`}
            data-file-family={parsed.family}
            data-file-direction={parsed.direction}
        >
            {children}
        </section>
    );
}

export function ParsedRawJSONPanelHeader() {
    const {description, eyebrow, parsed, title} = useParsedRawJSONPanelContext();

    return (
        <div className="section-panel__header">
            <div>
                <p className="section-panel__eyebrow">
                    {eyebrow} · {parsed.family.toUpperCase()} · {parsed.direction}
                </p>
                <h3 id={`${parsed.id}-raw-json-title`}>{title}</h3>
                {description ? <p>{description}</p> : null}
            </div>
            <span className="posture-badge posture-badge--nominal">JSON</span>
        </div>
    );
}

export function ParsedRawJSONPanelCodeBlock() {
    const {maxHeight, serializedValue} = useParsedRawJSONPanelContext();

    return (
        <StructuredCodeViewer
            ariaLabel="Parsed raw JSON"
            className="parsed-json-panel"
            content={serializedValue}
            direction={undefined}
            family={undefined}
            language="json"
            maxHeight={maxHeight}
        />
    );
}

export function ParsedRawJSONPanel(props: ParsedRawJSONPanelProps) {
    return (
        <ParsedRawJSONPanelBoundary>
            <ParsedRawJSONPanelProvider {...props}>
                <ParsedRawJSONPanelScope>
                    <ParsedRawJSONPanelHeader/>
                    {props.children ?? <ParsedRawJSONPanelCodeBlock/>}
                </ParsedRawJSONPanelScope>
            </ParsedRawJSONPanelProvider>
        </ParsedRawJSONPanelBoundary>
    );
}
