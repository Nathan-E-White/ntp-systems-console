import {ReactNode} from 'react';
import {
    MCNPFileViewer,
    MCNPFileViewerState,
    useMCNPFileViewerContext,
    type MCNPFileViewerProps,
} from './MCNPFileViewer';

const defaultMcnpOutputText = `MCNP output scratchpad

Paste or upload an MCNP output file here.
Typical output content includes run termination status, tally results, statistical checks, k-effective estimates, particle balance, and timing summaries.
`;

export interface MCNPOutputFileViewerProps extends Omit<MCNPFileViewerProps, 'direction' | 'title' | 'description'> {
    readonly title?: string;
    readonly description?: string;
    readonly children?: ReactNode;
}

export const MCNPOutputFileViewerState = Object.freeze({
    family: MCNPFileViewerState.family,
    direction: 'output' as const,
    displayName: 'MCNP output',
    acceptedExtensions: ['.out', '.o', '.txt'] as const,
    defaultFilename: 'mcnp-output.out',
    defaultTitle: 'MCNP Output File Viewer',
    defaultDescription:
        'Inspect MCNP output files with emphasis on run status, tally results, statistical checks, criticality summaries, particle balance, and timing diagnostics.',
    defaultText: defaultMcnpOutputText,
});

export function MCNPOutputFileViewerHeader() {
    const viewer = useMCNPFileViewerContext();

    return (
        <section className="section-panel" aria-labelledby="mcnp-output-viewer-header-title">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">
                        {MCNPOutputFileViewerState.displayName} · {MCNPOutputFileViewerState.direction}
                    </p>
                    <h3 id="mcnp-output-viewer-header-title">{viewer.title}</h3>
                </div>
                <span className="posture-badge posture-badge--nominal">
                    {viewer.displayName}
                </span>
            </div>
            <p>{viewer.description}</p>
            <p>
                Accepted extensions:{' '}
                <strong>{viewer.acceptedExtensions.join(', ')}</strong>
            </p>
        </section>
    );
}

export function MCNPOutputFileViewer({
    children,
    description = MCNPOutputFileViewerState.defaultDescription,
    initialFilename = MCNPOutputFileViewerState.defaultFilename,
    initialText = MCNPOutputFileViewerState.defaultText,
    title = MCNPOutputFileViewerState.defaultTitle,
}: MCNPOutputFileViewerProps) {
    return (
        <MCNPFileViewer
            description={description}
            direction={MCNPOutputFileViewerState.direction}
            initialFilename={initialFilename}
            initialText={initialText}
            title={title}
        >
            {children ?? <MCNPOutputFileViewerHeader/>}
        </MCNPFileViewer>
    );
}