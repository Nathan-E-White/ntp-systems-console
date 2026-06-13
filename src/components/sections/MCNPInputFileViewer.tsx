
import {ReactNode} from 'react';
import {
    MCNPFileViewer,
    MCNPFileViewerState,
    useMCNPFileViewerContext,
    type MCNPFileViewerProps,
} from './MCNPFileViewer';

const defaultMcnpInputText = `c MCNP input deck scratchpad
c Paste or upload an MCNP input deck here.
c Typical cards: cell cards, surface cards, material cards, MODE, SDEF, and tallies.

c Example title line
NTP MCNP input deck viewer
`;

export interface MCNPInputFileViewerProps extends Omit<MCNPFileViewerProps, 'direction' | 'title' | 'description'> {
    readonly title?: string;
    readonly description?: string;
    readonly children?: ReactNode;
}

export const MCNPInputFileViewerState = Object.freeze({
    family: MCNPFileViewerState.family,
    direction: 'input' as const,
    displayName: 'MCNP input',
    acceptedExtensions: ['.inp', '.i', '.txt'] as const,
    defaultFilename: 'mcnp-input-deck.inp',
    defaultTitle: 'MCNP Input File Viewer',
    defaultDescription:
        'Inspect MCNP input decks with emphasis on cell cards, surface cards, material definitions, source definitions, and tally setup.',
    defaultText: defaultMcnpInputText,
});

export function MCNPInputFileViewerHeader() {
    const viewer = useMCNPFileViewerContext();

    return (
        <section className="section-panel" aria-labelledby="mcnp-input-viewer-header-title">
            <div className="section-panel__header">
                <div>
                    <p className="section-panel__eyebrow">
                        {MCNPInputFileViewerState.displayName} · {MCNPInputFileViewerState.direction}
                    </p>
                    <h3 id="mcnp-input-viewer-header-title">{viewer.title}</h3>
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

export function MCNPInputFileViewer({
    children,
    description = MCNPInputFileViewerState.defaultDescription,
    initialFilename = MCNPInputFileViewerState.defaultFilename,
    initialText = MCNPInputFileViewerState.defaultText,
    title = MCNPInputFileViewerState.defaultTitle,
}: MCNPInputFileViewerProps) {
    return (
        <MCNPFileViewer
            description={description}
            direction={MCNPInputFileViewerState.direction}
            initialFilename={initialFilename}
            initialText={initialText}
            title={title}
        >
            {children ?? <MCNPInputFileViewerHeader/>}
        </MCNPFileViewer>
    );
}