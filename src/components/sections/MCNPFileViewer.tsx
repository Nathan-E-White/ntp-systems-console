import {ReactNode, createContext, useContext, useMemo} from 'react';
import type {ParserDirection} from '../../parser/parserTypes';
import {
    FileParserWorkbench,
    useFileParserWorkbenchContext,
} from '../panels/FileParserWorkbench';
import {MCNPDiagnosticsPanel} from '../panels/mcnp/MCNPDiagnosticsPanel';
import {ParsedMCNPInputDiagnosticsPanel} from '../panels/mcnp/ParsedMCNPInputDiagnosticsPanel';
import {ParsedMCNPInputFileSummaryPanel} from '../panels/mcnp/ParsedMCNPInputFileSummaryPanel';
import {ParsedMCNPInputSectionsPanel} from '../panels/mcnp/ParsedMCNPInputSectionsPanel';
import {ParsedMCNPInputTablePanel} from '../panels/mcnp/ParsedMCNPInputTablePanel';
import {ParsedMCNPOutputDiagnosticsPanel} from '../panels/mcnp/ParsedMCNPOutputDiagnosticsPanel';
import {ParsedMCNPOutputFileSummaryPanel} from '../panels/mcnp/ParsedMCNPOutputFileSummaryPanel';
import {ParsedMCNPOutputSectionsPanel} from '../panels/mcnp/ParsedMCNPOutputSectionsPanel';
import {ParsedMCNPOutputTablePanel} from '../panels/mcnp/ParsedMCNPOutputTablePanel';
import {ParsedMCNPRawInputJSONPanel} from '../panels/mcnp/ParsedMCNPRawInputJSONPanel';
import {ParsedMCNPRawJSONPanel} from '../panels/mcnp/ParsedMCNPRawJSONPanel';
import {ParsedMCNPRawOutputJSONPanel} from '../panels/mcnp/ParsedMCNPRawOutputJSONPanel';

export interface MCNPFileViewerProps {
    readonly title?: string;
    readonly description?: string;
    readonly direction?: ParserDirection;
    readonly initialFilename?: string;
    readonly initialText?: string;
    readonly children?: ReactNode;
}

export interface MCNPFileViewerContextValue {
    readonly family: 'mcnp';
    readonly direction?: ParserDirection;
    readonly displayName: string;
    readonly acceptedExtensions: readonly string[];
    readonly title: string;
    readonly description: string;
    readonly initialFilename: string;
    readonly initialText: string;
}

interface MCNPFileViewerBoundaryProps {
    readonly children: ReactNode;
    readonly fallback?: ReactNode;
}

const defaultMcnpText = `c MCNP file viewer scratchpad
c Paste or upload an MCNP input deck or output file here.

MCNP file viewer
`;

export const MCNPFileViewerState = Object.freeze({
    family: 'mcnp' as const,
    displayName: 'MCNP',
    acceptedExtensions: ['.inp', '.i', '.out', '.o', '.txt'] as const,
    defaultFilename: 'mcnp-file.txt',
    defaultTitle: 'MCNP File Viewer',
    defaultDescription: 'Inspect MCNP input decks and output files through the shared engineering-file parser pipeline.',
    parserTitle: 'MCNP engineering file parser',
});

const MCNPFileViewerReactContext = createContext<MCNPFileViewerContextValue>({
    family: MCNPFileViewerState.family,
    displayName: MCNPFileViewerState.displayName,
    acceptedExtensions: MCNPFileViewerState.acceptedExtensions,
    title: MCNPFileViewerState.defaultTitle,
    description: MCNPFileViewerState.defaultDescription,
    initialFilename: MCNPFileViewerState.defaultFilename,
    initialText: defaultMcnpText,
});

export function MCNPFileViewerBoundary({children}: MCNPFileViewerBoundaryProps) {
    return <>{children}</>;
}

export function MCNPFileViewerScope({children}: { readonly children: ReactNode }) {
    return (
        <section aria-label="MCNP file viewer" data-file-family={MCNPFileViewerState.family}>
            {children}
        </section>
    );
}

export function useMCNPFileViewerContext(): MCNPFileViewerContextValue {
    return useContext(MCNPFileViewerReactContext);
}

export function MCNPFileViewerProvider({
                                           children,
                                           description = MCNPFileViewerState.defaultDescription,
                                           direction,
                                           initialFilename = MCNPFileViewerState.defaultFilename,
                                           initialText = defaultMcnpText,
                                           title = MCNPFileViewerState.defaultTitle,
                                       }: MCNPFileViewerProps) {
    const value = useMemo<MCNPFileViewerContextValue>(
        () => ({
            family: MCNPFileViewerState.family,
            direction,
            displayName: MCNPFileViewerState.displayName,
            acceptedExtensions: MCNPFileViewerState.acceptedExtensions,
            title,
            description,
            initialFilename,
            initialText,
        }),
        [description, direction, initialFilename, initialText, title],
    );

    return (
        <MCNPFileViewerReactContext.Provider value={value}>
            {children}
        </MCNPFileViewerReactContext.Provider>
    );
}

function MCNPParsedPresentationPanels() {
    const {artifact, expectedDirection} = useFileParserWorkbenchContext();
    const parsed = artifact.parsed;

    if (!parsed || parsed.family !== MCNPFileViewerState.family) {
        return null;
    }

    if (expectedDirection && parsed.direction !== expectedDirection) {
        return null;
    }

    if (parsed.direction === 'input') {
        return (
            <>
                <ParsedMCNPInputFileSummaryPanel parsed={parsed}/>
                <ParsedMCNPInputDiagnosticsPanel parsed={parsed}/>
                <ParsedMCNPInputSectionsPanel parsed={parsed}/>
                <ParsedMCNPInputTablePanel parsed={parsed}/>
                <ParsedMCNPRawInputJSONPanel parsed={parsed}/>
            </>
        );
    }

    if (parsed.direction === 'output') {
        return (
            <>
                <ParsedMCNPOutputFileSummaryPanel parsed={parsed}/>
                <ParsedMCNPOutputDiagnosticsPanel parsed={parsed}/>
                <ParsedMCNPOutputSectionsPanel parsed={parsed}/>
                <ParsedMCNPOutputTablePanel parsed={parsed}/>
                <ParsedMCNPRawOutputJSONPanel parsed={parsed}/>
            </>
        );
    }

    return (
        <>
            <MCNPDiagnosticsPanel parsed={parsed}/>
            <ParsedMCNPRawJSONPanel parsed={parsed}/>
        </>
    );
}

function MCNPFileParserWorkbench() {
    const viewer = useMCNPFileViewerContext();

    return (
        <FileParserWorkbench
            allowedDirection={viewer.direction}
            allowedFamily={viewer.family}
            description={viewer.description}
            initialFilename={viewer.initialFilename}
            initialText={viewer.initialText}
            showRawOutputFixture={false}
            title={MCNPFileViewerState.parserTitle}
        >
            <MCNPParsedPresentationPanels/>
        </FileParserWorkbench>
    );
}

export function MCNPFileViewer(props: MCNPFileViewerProps) {
    return (
        <MCNPFileViewerBoundary>
            <MCNPFileViewerProvider {...props}>
                <MCNPFileViewerScope>
                    {props.children}
                    <MCNPFileParserWorkbench/>
                </MCNPFileViewerScope>
            </MCNPFileViewerProvider>
        </MCNPFileViewerBoundary>
    );
}